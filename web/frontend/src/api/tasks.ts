export type TaskStatus = "backlog" | "in_progress" | "pending_approval" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  agent_id?: string
  assignee: string
  due_date_ms?: number
  priority: TaskPriority
  created_at_ms: number
  updated_at_ms: number
}

export const ASSIGNEES = [
  { id: "ceo",  label: "CEO" },
  { id: "cto",  label: "CTO" },
  { id: "cmo",  label: "CMO" },
  { id: "me",   label: "Eu (Bruno)" },
]

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function getTasks(): Promise<Task[]> {
  const data = await req<{ tasks: Task[] }>("/api/tasks")
  return data.tasks ?? []
}

export async function createTask(
  input: Partial<Omit<Task, "id" | "created_at_ms" | "updated_at_ms">>,
): Promise<Task> {
  return req<Task>("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function updateTask(id: string, input: Partial<Task>): Promise<Task> {
  return req<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function deleteTask(id: string): Promise<void> {
  return req<void>(`/api/tasks/${id}`, { method: "DELETE" })
}

export const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "backlog", label: "📋 A Fazer", color: "border-border" },
  { status: "in_progress", label: "⚡ Em Progresso", color: "border-blue-400" },
  { status: "pending_approval", label: "⏳ Aguardando Aprovação", color: "border-amber-400" },
  { status: "done", label: "✅ Concluído", color: "border-green-500" },
]
