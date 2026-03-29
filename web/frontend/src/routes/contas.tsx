import { createFileRoute } from "@tanstack/react-router"

import { ContasPage } from "@/components/contas/contas-page"

export const Route = createFileRoute("/contas")({
  component: ContasPage,
})
