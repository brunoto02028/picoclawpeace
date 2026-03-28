package tools

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// TaskStatus for the Kanban board.
type TaskStatus string

const (
	TaskStatusBacklog         TaskStatus = "backlog"
	TaskStatusInProgress      TaskStatus = "in_progress"
	TaskStatusPendingApproval TaskStatus = "pending_approval"
	TaskStatusDone            TaskStatus = "done"
)

type KanbanTask struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	Status      TaskStatus `json:"status"`
	AgentID     string     `json:"agent_id,omitempty"`
	Priority    string     `json:"priority,omitempty"`
	CreatedAtMS int64      `json:"created_at_ms"`
	UpdatedAtMS int64      `json:"updated_at_ms"`
}

type kanbanStore struct {
	Version int          `json:"version"`
	Tasks   []KanbanTask `json:"tasks"`
}

var (
	kanbanMu    sync.RWMutex
	kanbanCache *kanbanStore
	kanbanPath  string
)

func initKanbanStore(workspace string) {
	kanbanMu.Lock()
	defer kanbanMu.Unlock()
	kanbanPath = filepath.Join(workspace, "tasks.json")
	kanbanCache = nil
}

func loadKanbanStore() (*kanbanStore, error) {
	kanbanMu.RLock()
	if kanbanCache != nil {
		defer kanbanMu.RUnlock()
		return kanbanCache, nil
	}
	kanbanMu.RUnlock()

	kanbanMu.Lock()
	defer kanbanMu.Unlock()

	data, err := os.ReadFile(kanbanPath)
	if os.IsNotExist(err) {
		kanbanCache = &kanbanStore{Version: 1, Tasks: []KanbanTask{}}
		return kanbanCache, nil
	}
	if err != nil {
		return nil, err
	}
	var store kanbanStore
	if err := json.Unmarshal(data, &store); err != nil {
		return nil, err
	}
	kanbanCache = &store
	return kanbanCache, nil
}

func saveKanbanStore(store *kanbanStore) error {
	if err := os.MkdirAll(filepath.Dir(kanbanPath), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(kanbanPath, data, 0o644); err != nil {
		return err
	}
	kanbanCache = store
	return nil
}

func genTaskID() string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return "task-" + hex.EncodeToString(b)
}

// TaskTool allows agents to create and update Kanban tasks.
type TaskTool struct {
	workspace string
	agentID   string
}

// NewTaskTool creates a TaskTool bound to a workspace and agent.
func NewTaskTool(workspace, agentID string) *TaskTool {
	initKanbanStore(workspace)
	return &TaskTool{workspace: workspace, agentID: agentID}
}

func (t *TaskTool) Name() string { return "task" }

func (t *TaskTool) Description() string {
	return "Create or update a task on the Kanban board. Use status='pending_approval' when the task needs the user's OK before proceeding. Use status='in_progress' when you are actively working on it. Use status='done' when completed."
}

func (t *TaskTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"action": map[string]any{
				"type":        "string",
				"enum":        []string{"create", "update", "list"},
				"description": "Action to perform.",
			},
			"id": map[string]any{
				"type":        "string",
				"description": "Task ID (required for update).",
			},
			"title": map[string]any{
				"type":        "string",
				"description": "Short title for the task.",
			},
			"description": map[string]any{
				"type":        "string",
				"description": "Detailed description of the task.",
			},
			"status": map[string]any{
				"type":        "string",
				"enum":        []string{"backlog", "in_progress", "pending_approval", "done"},
				"description": "Kanban column.",
			},
			"priority": map[string]any{
				"type":        "string",
				"enum":        []string{"low", "medium", "high"},
				"description": "Task priority.",
			},
		},
		"required": []string{"action"},
	}
}

func (t *TaskTool) Execute(_ context.Context, args map[string]any) (*ToolResult, error) {
	action, _ := args["action"].(string)

	store, err := loadKanbanStore()
	if err != nil {
		return ErrorResult(fmt.Sprintf("failed to load tasks: %v", err)), nil
	}

	switch action {
	case "list":
		data, _ := json.MarshalIndent(store.Tasks, "", "  ")
		return NewToolResult(string(data)), nil

	case "create":
		title, _ := args["title"].(string)
		if strings.TrimSpace(title) == "" {
			return ErrorResult("title is required"), nil
		}
		status := TaskStatus(stringArg(args, "status", "backlog"))
		priority := stringArg(args, "priority", "medium")
		now := time.Now().UnixMilli()
		task := KanbanTask{
			ID:          genTaskID(),
			Title:       title,
			Description: stringArg(args, "description", ""),
			Status:      status,
			AgentID:     t.agentID,
			Priority:    priority,
			CreatedAtMS: now,
			UpdatedAtMS: now,
		}
		kanbanMu.Lock()
		store.Tasks = append(store.Tasks, task)
		_ = saveKanbanStore(store)
		kanbanMu.Unlock()
		return NewToolResult(fmt.Sprintf("Task created: %s (id: %s, status: %s)", task.Title, task.ID, task.Status)), nil

	case "update":
		id, _ := args["id"].(string)
		if id == "" {
			return ErrorResult("id is required for update"), nil
		}
		kanbanMu.Lock()
		defer kanbanMu.Unlock()
		found := false
		for i := range store.Tasks {
			if store.Tasks[i].ID == id {
				if v, ok := args["title"].(string); ok && v != "" {
					store.Tasks[i].Title = v
				}
				if v, ok := args["description"].(string); ok && v != "" {
					store.Tasks[i].Description = v
				}
				if v, ok := args["status"].(string); ok && v != "" {
					store.Tasks[i].Status = TaskStatus(v)
				}
				if v, ok := args["priority"].(string); ok && v != "" {
					store.Tasks[i].Priority = v
				}
				store.Tasks[i].UpdatedAtMS = time.Now().UnixMilli()
				found = true
				_ = saveKanbanStore(store)
				return NewToolResult(fmt.Sprintf("Task updated: %s (status: %s)", store.Tasks[i].Title, store.Tasks[i].Status)), nil
			}
		}
		if !found {
			return ErrorResult(fmt.Sprintf("task %s not found", id)), nil
		}
	}

	return ErrorResult("unknown action: " + action), nil
}

func stringArg(args map[string]any, key, def string) string {
	if v, ok := args[key].(string); ok && v != "" {
		return v
	}
	return def
}
