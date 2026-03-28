package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// TaskStatus represents the Kanban column a task lives in.
type TaskStatus string

const (
	TaskStatusBacklog         TaskStatus = "backlog"
	TaskStatusInProgress      TaskStatus = "in_progress"
	TaskStatusPendingApproval TaskStatus = "pending_approval"
	TaskStatusDone            TaskStatus = "done"
)

// Task is a single Kanban card.
type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	Status      TaskStatus `json:"status"`
	AgentID     string     `json:"agent_id,omitempty"`
	Assignee    string     `json:"assignee,omitempty"`    // who will execute (e.g. "ceo", "cto", "me")
	DueDateMS   int64      `json:"due_date_ms,omitempty"` // unix ms deadline
	Priority    string     `json:"priority,omitempty"`    // low | medium | high
	CreatedAtMS int64      `json:"created_at_ms"`
	UpdatedAtMS int64      `json:"updated_at_ms"`
}

type taskStore struct {
	Version int    `json:"version"`
	Tasks   []Task `json:"tasks"`
}

var (
	tasksMu    sync.RWMutex
	tasksCache *taskStore
)

func tasksFilePath(configPath string) string {
	dir := filepath.Dir(configPath)
	return filepath.Join(dir, "workspace", "tasks.json")
}

func loadTasks(configPath string) (*taskStore, error) {
	tasksMu.RLock()
	if tasksCache != nil {
		defer tasksMu.RUnlock()
		return tasksCache, nil
	}
	tasksMu.RUnlock()

	tasksMu.Lock()
	defer tasksMu.Unlock()

	path := tasksFilePath(configPath)
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		tasksCache = &taskStore{Version: 1, Tasks: []Task{}}
		return tasksCache, nil
	}
	if err != nil {
		return nil, err
	}

	var store taskStore
	if err := json.Unmarshal(data, &store); err != nil {
		return nil, err
	}
	tasksCache = &store
	return tasksCache, nil
}

func saveTasks(configPath string, store *taskStore) error {
	path := tasksFilePath(configPath)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

func generateTaskID() string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return "task-" + hex.EncodeToString(b)
}

// registerTaskRoutes mounts /api/tasks endpoints.
func (h *Handler) registerTaskRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.handleListTasks(w, r)
		case http.MethodPost:
			h.handleCreateTask(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/tasks/", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/api/tasks/")
		if id == "" {
			http.Error(w, "missing task id", http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodPut:
			h.handleUpdateTask(w, r, id)
		case http.MethodDelete:
			h.handleDeleteTask(w, r, id)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
}

func (h *Handler) handleListTasks(w http.ResponseWriter, _ *http.Request) {
	store, err := loadTasks(h.configPath)
	if err != nil {
		http.Error(w, "failed to load tasks", http.StatusInternalServerError)
		return
	}
	tasksMu.RLock()
	tasks := store.Tasks
	if tasks == nil {
		tasks = []Task{}
	}
	tasksMu.RUnlock()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"tasks": tasks})
}

func (h *Handler) handleCreateTask(w http.ResponseWriter, r *http.Request) {
	var input Task
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(input.Title) == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	now := time.Now().UnixMilli()
	input.ID = generateTaskID()
	input.CreatedAtMS = now
	input.UpdatedAtMS = now
	if input.Status == "" {
		input.Status = TaskStatusBacklog
	}
	if input.Priority == "" {
		input.Priority = "medium"
	}
	if input.Assignee == "" {
		input.Assignee = "ceo"
	}

	store, err := loadTasks(h.configPath)
	if err != nil {
		http.Error(w, "failed to load tasks", http.StatusInternalServerError)
		return
	}

	tasksMu.Lock()
	store.Tasks = append(store.Tasks, input)
	_ = saveTasks(h.configPath, store)
	tasksMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(input)
}

func (h *Handler) handleUpdateTask(w http.ResponseWriter, r *http.Request, id string) {
	var input Task
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	store, err := loadTasks(h.configPath)
	if err != nil {
		http.Error(w, "failed to load tasks", http.StatusInternalServerError)
		return
	}

	tasksMu.Lock()
	defer tasksMu.Unlock()

	found := false
	for i := range store.Tasks {
		if store.Tasks[i].ID == id {
			if strings.TrimSpace(input.Title) != "" {
				store.Tasks[i].Title = input.Title
			}
			if input.Description != "" {
				store.Tasks[i].Description = input.Description
			}
			if input.Status != "" {
				store.Tasks[i].Status = input.Status
			}
			if input.Priority != "" {
				store.Tasks[i].Priority = input.Priority
			}
			if input.AgentID != "" {
				store.Tasks[i].AgentID = input.AgentID
			}
			if input.Assignee != "" {
				store.Tasks[i].Assignee = input.Assignee
			}
			if input.DueDateMS != 0 {
				store.Tasks[i].DueDateMS = input.DueDateMS
			}
			store.Tasks[i].UpdatedAtMS = time.Now().UnixMilli()
			input = store.Tasks[i]
			found = true
			break
		}
	}

	if !found {
		http.Error(w, "task not found", http.StatusNotFound)
		return
	}

	_ = saveTasks(h.configPath, store)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(input)
}

func (h *Handler) handleDeleteTask(w http.ResponseWriter, r *http.Request, id string) {
	store, err := loadTasks(h.configPath)
	if err != nil {
		http.Error(w, "failed to load tasks", http.StatusInternalServerError)
		return
	}

	tasksMu.Lock()
	defer tasksMu.Unlock()

	newTasks := make([]Task, 0, len(store.Tasks))
	found := false
	for _, t := range store.Tasks {
		if t.ID == id {
			found = true
			continue
		}
		newTasks = append(newTasks, t)
	}

	if !found {
		http.Error(w, "task not found", http.StatusNotFound)
		return
	}

	store.Tasks = newTasks
	_ = saveTasks(h.configPath, store)

	w.WriteHeader(http.StatusNoContent)
}
