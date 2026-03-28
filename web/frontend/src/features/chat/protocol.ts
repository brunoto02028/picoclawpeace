import { toast } from "sonner"

import { normalizeUnixTimestamp } from "@/features/chat/state"
import { getChatState, updateChatStore, type LiveLogEntry } from "@/store/chat"

export interface PicoMessage {
  type: string
  id?: string
  session_id?: string
  timestamp?: number | string
  payload?: Record<string, unknown>
}

export function handlePicoMessage(
  message: PicoMessage,
  expectedSessionId: string,
) {
  if (message.session_id && message.session_id !== expectedSessionId) {
    return
  }

  const payload = message.payload || {}

  switch (message.type) {
    case "message.create": {
      const content = (payload.content as string) || ""
      const messageId = (payload.message_id as string) || `pico-${Date.now()}`
      const timestamp =
        message.timestamp !== undefined &&
        Number.isFinite(Number(message.timestamp))
          ? normalizeUnixTimestamp(Number(message.timestamp))
          : Date.now()

      const isPlaceholder = content === "…" || content === "" || content === "..."

      updateChatStore((prev) => {
        const elapsed = prev.agentBusyStartMs
          ? Math.round((Date.now() - prev.agentBusyStartMs) / 1000)
          : 0
        if (!isPlaceholder && elapsed >= 10) {
          toast.success(`✅ Tarefa concluída em ${elapsed < 60 ? elapsed + "s" : Math.round(elapsed / 60) + "min"}.`, {
            duration: 6000,
          })
        }
        return {
          messages: [
            ...prev.messages,
            { id: messageId, role: "assistant", content, timestamp },
          ],
          isTyping: isPlaceholder,
          currentTool: isPlaceholder ? prev.currentTool : null,
          agentBusyStartMs: isPlaceholder ? (prev.agentBusyStartMs ?? Date.now()) : null,
          toolHistory: isPlaceholder ? prev.toolHistory : [],
          liveLog: isPlaceholder ? prev.liveLog : [],
        }
      })
      break
    }

    case "message.update": {
      const content = (payload.content as string) || ""
      const messageId = payload.message_id as string
      if (!messageId) {
        break
      }

      const hasRealContent = content.length > 0 && content !== "\u2026" && content !== "..."
      const isReasoningStream = content.startsWith("\uD83D\uDCAD ") // "💭 " — intermediate reasoning tokens
      const isFinalContent = hasRealContent && !isReasoningStream

      updateChatStore((prev) => {
        const elapsed = prev.agentBusyStartMs
          ? Math.round((Date.now() - prev.agentBusyStartMs) / 1000)
          : 0
        if (isFinalContent && elapsed >= 10 && prev.agentBusyStartMs && !prev.currentTool) {
          toast.success(`\u2705 Tarefa conclu\u00edda em ${elapsed < 60 ? elapsed + "s" : Math.round(elapsed / 60) + "min"}.`, {
            duration: 6000,
          })
        }
        return {
          messages: prev.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg,
          ),
          isTyping: false,
          currentTool: isFinalContent && !prev.currentTool ? null : prev.currentTool,
          agentBusyStartMs: isFinalContent && !prev.currentTool ? null : prev.agentBusyStartMs,
          liveLog: isFinalContent && !prev.currentTool ? [] : prev.liveLog,
          toolHistory: isFinalContent && !prev.currentTool ? [] : prev.toolHistory,
        }
      })
      break
    }

    case "message.delete": {
      const messageId = payload.message_id as string
      if (!messageId) break
      updateChatStore((prev) => ({
        messages: prev.messages.filter((msg) => msg.id !== messageId),
      }))
      break
    }

    case "typing.start": {
      const wasIdle = !getChatState().agentBusyStartMs
      updateChatStore({
        isTyping: true,
        currentTool: null,
        agentBusyStartMs: wasIdle ? Date.now() : getChatState().agentBusyStartMs,
        toolHistory: wasIdle ? [] : getChatState().toolHistory,
        liveLog: wasIdle ? [] : getChatState().liveLog,
      })
      break
    }

    case "typing.stop": {
      updateChatStore({ isTyping: false })
      break
    }

    case "tool.exec.start": {
      const tool = (payload.tool as string) || "unknown"
      const arg = (payload.arg as string) || ""
      const entryId = Date.now()
      const entry: LiveLogEntry = { id: entryId, tool, arg, startMs: entryId }
      updateChatStore((prev) => ({
        currentTool: tool,
        agentBusyStartMs: prev.agentBusyStartMs ?? Date.now(),
        liveLog: [...prev.liveLog.slice(-49), entry],
      }))
      break
    }

    case "tool.exec.end": {
      const finishedTool = (payload.tool as string) || getChatState().currentTool || ""
      const isError = (payload.is_error as boolean) || false
      const nowMs = Date.now()
      updateChatStore((prev) => ({
        currentTool: null,
        toolHistory: finishedTool
          ? [...prev.toolHistory, finishedTool]
          : prev.toolHistory,
        liveLog: prev.liveLog.map((e) =>
          e.tool === finishedTool && !e.endMs
            ? { ...e, endMs: nowMs, isError }
            : e
        ),
      }))
      break
    }

    case "error": {
      console.error("Pico error:", payload)
      const state = getChatState()
      if (state.agentBusyStartMs) {
        toast.error("❌ Erro durante a execução da tarefa.", { duration: 6000 })
      }
      updateChatStore({ isTyping: false, currentTool: null, agentBusyStartMs: null, toolHistory: [] })
      break
    }

    case "pong":
      updateChatStore({ lastPongAt: Date.now() })
      break

    default:
      console.log("Unknown pico message type:", message.type)
  }
}
