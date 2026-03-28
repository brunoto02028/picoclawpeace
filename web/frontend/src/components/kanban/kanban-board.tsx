import { IconPlus, IconRefresh } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ASSIGNEES, COLUMNS, type Task, type TaskStatus, createTask, deleteTask, getTasks, updateTask } from "@/api/tasks"
import { TaskCard } from "@/components/kanban/task-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [newAssignee, setNewAssignee] = useState("ceo")
  const [newDueDate, setNewDueDate] = useState("")
  const [showForm, setShowForm] = useState(false)
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
          className="size-8"
          onClick={() => void loadTasks()}
          title="Atualizar"
        >
          <IconRefresh className="size-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-violet-500 text-white hover:bg-violet-600"
          onClick={() => setShowForm((v) => !v)}
        >
          <IconPlus className="size-4" />
          Nova tarefa
        </Button>
      </PageHeader>

      {showForm && (
        <div className="border-border/60 bg-card mx-4 mt-4 rounded-xl border p-4 shadow-sm md:mx-8">
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              className="bg-background placeholder:text-muted-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Título da tarefa..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate() }}
            />
            <textarea
              className="bg-background placeholder:text-muted-foreground max-h-32 min-h-[60px] resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Descrição (opcional)..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-muted-foreground text-xs">Prioridade</label>
                <select
                  className="bg-background rounded-lg border px-3 py-2 text-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                >
                  <option value="low">🟢 Baixa</option>
                  <option value="medium">🟡 Média</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-muted-foreground text-xs">Responsável</label>
                <select
                  className="bg-background rounded-lg border px-3 py-2 text-sm"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                >
                  {ASSIGNEES.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-muted-foreground text-xs">Prazo</label>
                <input
                  type="date"
                  className="bg-background rounded-lg border px-3 py-2 text-sm"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  className="h-9 flex-1 bg-violet-500 text-white hover:bg-violet-600"
                  onClick={() => void handleCreate()}
                  disabled={!newTitle.trim() || creating}
                >
                  {creating ? "Criando..." : "Criar"}
                </Button>
                <Button size="sm" variant="ghost" className="h-9" onClick={() => setShowForm(false)}>
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
            <div className="text-muted-foreground text-sm">Carregando tarefas...</div>
          </div>
        ) : (
          <div className="flex h-full min-w-[800px] gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.status)
              return (
                <div key={col.status} className="flex w-72 shrink-0 flex-col gap-3">
                  <div className={cn("flex items-center justify-between rounded-xl border-2 px-3 py-2", col.color)}>
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto pb-4">
                    {colTasks.length === 0 ? (
                      <div className="border-border/40 rounded-xl border-2 border-dashed px-3 py-8 text-center">
                        <p className="text-muted-foreground text-xs">Nenhuma tarefa</p>
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
