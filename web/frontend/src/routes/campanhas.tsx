import { createFileRoute } from "@tanstack/react-router"

import { CampanhasPage } from "@/components/campanhas/campanhas-page"

export const Route = createFileRoute("/campanhas")({
  component: CampanhasPage,
})
