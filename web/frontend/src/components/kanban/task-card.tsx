import { IconCalendar, IconCheck, IconTrash, IconUser, IconX } from "@tabler/icons-react"

import type { Task, TaskStatus } from "@/api/tasks"
import { ASSIGNEES } from "@/api/tasks"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

function formatDate(ms: number): string {
  const d = new Date(ms)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function isOverdue(ms: number): boolean {
  return ms > 0 && ms < Date.now()
}

function assigneeLabel(id: string): string {
  return ASSIGNEES.find((a) => a.id === id)?.label ?? id
}

interface TaskCardProps {
  task: Task
  onMove: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function TaskCard({ task, onMove, onDelete, onApprove, onReject }: TaskCardProps) {
  const isPendingApproval = task.status === "pending_approval"
  const isDone = task.status === "done"

  return (
    <div
      className={cn(
        "bg-card border-border group relative flex flex-col gap-2 rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md",
        isDone && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm font-medium leading-snug", isDone && "line-through")}>{task.title}</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(task.id)}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>

      {task.description && (
        <p className="text-muted-foreground text-xs leading-relaxed">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {task.priority && (
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", PRIORITY_COLORS[task.priority] ?? "")}>
            {task.priority}
          </span>
        )}
        {task.assignee && (
          <span className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]">
            <IconUser className="size-2.5" />
            {assigneeLabel(task.assignee)}
          </span>
        )}
      </div>

      {task.due_date_ms && task.due_date_ms > 0 && (
        <div className={cn(
          "flex items-center gap-1 text-[11px]",
          isOverdue(task.due_date_ms) ? "text-red-500 font-medium" : "text-muted-foreground",
        )}>
          <IconCalendar className="size-3" />
          {isOverdue(task.due_date_ms) ? "⚠ " : ""}
          {formatDate(task.due_date_ms)}
        </div>
      )}

      {isPendingApproval && (
        <div className="mt-1 flex gap-2">
          <Button
            size="sm"
            className="h-7 flex-1 gap-1 bg-green-600 text-xs text-white hover:bg-green-700"
            onClick={() => onApprove(task.id)}
          >
            <IconCheck className="size-3" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive h-7 flex-1 gap-1 text-xs"
            onClick={() => onReject(task.id)}
          >
            <IconX className="size-3" />
            Rejeitar
          </Button>
        </div>
      )}

      {!isPendingApproval && !isDone && (
        <div className="mt-1">
          <select
            className="bg-muted text-muted-foreground w-full rounded-lg border-0 px-2 py-1 text-xs"
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as TaskStatus)}
          >
            <option value="backlog">📋 A Fazer</option>
            <option value="in_progress">⚡ Em Progresso</option>
            <option value="pending_approval">⏳ Aguardando Aprovação</option>
            <option value="done">✅ Concluído</option>
          </select>
        </div>
      )}
    </div>
  )
}
