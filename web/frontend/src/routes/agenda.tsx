import { createFileRoute } from "@tanstack/react-router"

import { AgendaPage } from "@/components/agenda/agenda-page"

export const Route = createFileRoute("/agenda")({
  component: AgendaPage,
})
