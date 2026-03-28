import { createFileRoute } from "@tanstack/react-router"

import { KanbanBoard } from "@/components/kanban/kanban-board"

export const Route = createFileRoute("/tasks")({
  component: KanbanBoard,
})
