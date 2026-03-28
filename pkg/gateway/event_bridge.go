package gateway

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/sipeed/picoclaw/pkg/agent"
	picochan "github.com/sipeed/picoclaw/pkg/channels/pico"
)

// extractMainArg returns a short human-readable preview of the most relevant
// argument for the given tool call, used for the frontend live log display.
func extractMainArg(args map[string]any) string {
	if len(args) == 0 {
		return ""
	}
	// Priority order of argument keys per tool type
	priority := []string{"command", "cmd", "path", "file", "url", "query", "q", "text", "content"}
	for _, key := range priority {
		if v, ok := args[key]; ok {
			s := fmt.Sprintf("%v", v)
			if len(s) > 120 {
				s = s[:120] + "…"
			}
			return s
		}
	}
	// Fallback: use the first string value found
	for _, v := range args {
		s := fmt.Sprintf("%v", v)
		if strings.TrimSpace(s) != "" {
			if len(s) > 120 {
				s = s[:120] + "…"
			}
			return s
		}
	}
	return ""
}

// watchAndForwardAgentEvents subscribes to agent-loop events and forwards
// tool execution start/end events to the relevant pico WebSocket session.
func watchAndForwardAgentEvents(ctx context.Context, agentLoop *agent.AgentLoop, pc *picochan.PicoChannel) {
	sub := agentLoop.SubscribeEvents(64)
	defer agentLoop.UnsubscribeEvents(sub.ID)

	// Map turnID → pico sessionID so tool events can be routed to the right client.
	var mu sync.Mutex
	turnSessions := make(map[string]string)

	for {
		select {
		case <-ctx.Done():
			return
		case evt, ok := <-sub.C:
			if !ok {
				return
			}

			switch evt.Kind {
			case agent.EventKindTurnStart:
				p, ok := evt.Payload.(*agent.TurnStartPayload)
				if !ok {
					break
				}
				// chatID for pico channel is "pico:<sessionID>"
				if strings.HasPrefix(p.ChatID, "pico:") {
					sessionID := strings.TrimPrefix(p.ChatID, "pico:")
					mu.Lock()
					turnSessions[evt.Meta.TurnID] = sessionID
					mu.Unlock()
				}

			case agent.EventKindTurnEnd:
				mu.Lock()
				delete(turnSessions, evt.Meta.TurnID)
				mu.Unlock()

			case agent.EventKindToolExecStart:
				p, ok := evt.Payload.(*agent.ToolExecStartPayload)
				if !ok {
					break
				}
				mu.Lock()
				sessionID := turnSessions[evt.Meta.TurnID]
				mu.Unlock()
				if sessionID == "" {
					break
				}
				pc.ForwardAgentEvent(sessionID, picochan.TypeToolExecStart, map[string]any{
					"tool": p.Tool,
					"arg":  extractMainArg(p.Arguments),
				})

			case agent.EventKindToolExecEnd:
				p, ok := evt.Payload.(*agent.ToolExecEndPayload)
				if !ok {
					break
				}
				mu.Lock()
				sessionID := turnSessions[evt.Meta.TurnID]
				mu.Unlock()
				if sessionID == "" {
					break
				}
				pc.ForwardAgentEvent(sessionID, picochan.TypeToolExecEnd, map[string]any{
					"tool":        p.Tool,
					"duration_ms": p.Duration.Milliseconds(),
					"is_error":    p.IsError,
				})
			}
		}
	}
}
