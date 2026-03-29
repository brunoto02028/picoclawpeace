import { IconPlus, IconRefresh } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ASSIGNEES, COLUMNS, type Task, type TaskStatus, createTask, deleteTask, getTasks, updateTask } from "@/api/tasks"
import { TaskCard } from "@/components/kanban/task-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FORM_STORAGE_KEY = "picoclaw:task-draft"

function loadDraft() {
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { title: string; desc: string; priority: "low" | "medium" | "high"; assignee: string; dueDate: string }
  } catch {
    return null
  }
}

function saveDraft(title: string, desc: string, priority: "low" | "medium" | "high", assignee: string, dueDate: string) {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ title, desc, priority, assignee, dueDate }))
  } catch { /* ignore */ }
}

function clearDraft() {
  try { localStorage.removeItem(FORM_STORAGE_KEY) } catch { /* ignore */ }
}

export function KanbanBoard() {
  const draft = loadDraft()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState(draft?.title ?? "")
  const [newDesc, setNewDesc] = useState(draft?.desc ?? "")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(draft?.priority ?? "medium")
  const [newAssignee, setNewAssignee] = useState(draft?.assignee ?? "ceo")
  const [newDueDate, setNewDueDate] = useState(draft?.dueDate ?? "")
  const [showForm, setShowForm] = useState(!!draft?.title)
  const [creating, setCreating] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch {
      toast.error("Erro ao carregar tarefas.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const handleMove = async (id: string, status: TaskStatus) => {
    try {
      const updated = await updateTask(id, { status })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch {
      toast.error("Erro ao mover tarefa.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success("Tarefa removida.")
    } catch {
      toast.error("Erro ao remover tarefa.")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const updated = await updateTask(id, { status: "in_progress" })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      toast.success("Tarefa aprovada — em progresso.")
    } catch {
      toast.error("Erro ao aprovar tarefa.")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const updated = await updateTask(id, { status: "backlog" })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      toast.success("Tarefa rejeitada — voltou para A Fazer.")
    } catch {
      toast.error("Erro ao rejeitar tarefa.")
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const task = await createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        priority: newPriority,
        assignee: newAssignee,
        due_date_ms: newDueDate ? new Date(newDueDate).getTime() : undefined,
        status: "backlog",
      })
      setTasks((prev) => [task, ...prev])
      setNewTitle("")
      setNewDesc("")
      setNewPriority("medium")
      setNewAssignee("ceo")
      setNewDueDate("")
      setShowForm(false)
      clearDraft()
      toast.success("Tarefa criada.")
    } catch {
      toast.error("Erro ao criar tarefa.")
    } finally {
      setCreating(false)
    }
  }

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Tasks">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-xl hover:bg-purple-500/10"
          onClick={() => void loadTasks()}
          title="Atualizar"
        >
          <IconRefresh className="size-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-sm shadow-purple-500/30 transition-all hover:scale-105 hover:from-purple-600 hover:to-fuchsia-600"
          onClick={() => setShowForm((v) => !v)}
        >
          <IconPlus className="size-4" />
          Nova tarefa
        </Button>
      </PageHeader>

      {showForm && (
        <div className="mx-4 mt-4 rounded-3xl border border-white/50 bg-white/60 p-5 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:mx-8">
          <h3 className="mb-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent">
            Nova Tarefa
          </h3>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:bg-white/10"
              placeholder="Título da tarefa..."
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); saveDraft(e.target.value, newDesc, newPriority, newAssignee, newDueDate) }}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate() }}
            />
            <textarea
              className="max-h-32 min-h-[60px] resize-none rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:bg-white/10"
              placeholder="Descrição (opcional)..."
              value={newDesc}
              onChange={(e) => { setNewDesc(e.target.value); saveDraft(newTitle, e.target.value, newPriority, newAssignee, newDueDate) }}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Prioridade</label>
                <select
                  className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
                  value={newPriority}
                  onChange={(e) => { const v = e.target.value as "low"|"medium"|"high"; setNewPriority(v); saveDraft(newTitle, newDesc, v, newAssignee, newDueDate) }}
                >
                  <option value="low">🟢 Baixa</option>
                  <option value="medium">🟡 Média</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Responsável</label>
                <select
                  className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
                  value={newAssignee}
                  onChange={(e) => { setNewAssignee(e.target.value); saveDraft(newTitle, newDesc, newPriority, e.target.value, newDueDate) }}
                >
                  {ASSIGNEES.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Prazo</label>
                <input
                  type="date"
                  className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
                  value={newDueDate}
                  onChange={(e) => { setNewDueDate(e.target.value); saveDraft(newTitle, newDesc, newPriority, newAssignee, e.target.value) }}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  className="h-9 flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-sm shadow-purple-500/30 transition-all hover:scale-105"
                  onClick={() => void handleCreate()}
                  disabled={!newTitle.trim() || creating}
                >
                  {creating ? "Criando..." : "Criar"}
                </Button>
                <Button size="sm" variant="ghost" className="h-9 rounded-xl" onClick={() => { setShowForm(false); clearDraft(); setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setNewAssignee("ceo"); setNewDueDate("") }}>
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-auto p-4 md:p-8">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/60 px-6 py-4 shadow-lg backdrop-blur-xl">
              <IconRefresh className="size-4 animate-spin text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Carregando tarefas...</span>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-w-[800px] gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.status)
              return (
                <div key={col.status} className="flex w-72 shrink-0 flex-col gap-3">
                  <div className={cn(
                    "flex items-center justify-between rounded-2xl border px-3 py-2.5",
                    "border-white/50 bg-white/60 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
                    col.color
                  )}>
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm dark:bg-white/10">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto pb-4">
                    {colTasks.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-white/40 px-3 py-8 text-center dark:border-white/10">
                        <p className="text-xs text-muted-foreground/60">Nenhuma tarefa</p>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onMove={(id, status) => void handleMove(id, status)}
                          onDelete={(id) => void handleDelete(id)}
                          onApprove={(id) => void handleApprove(id)}
                          onReject={(id) => void handleReject(id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
