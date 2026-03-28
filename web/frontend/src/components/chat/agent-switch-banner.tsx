import { IconRobot } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

interface AgentSwitchBannerProps {
  suggestedLabel: string
  suggestedName: string
  currentLabel: string
  onConfirm: () => void
  onDismiss: () => void
}

export function AgentSwitchBanner({
  suggestedLabel,
  currentLabel,
  onConfirm,
  onDismiss,
}: AgentSwitchBannerProps) {
  return (
    <div className="border-border/60 bg-muted/60 mx-auto mb-3 flex w-full max-w-[1000px] items-center gap-3 rounded-xl border px-4 py-3">
      <IconRobot className="text-muted-foreground size-4 shrink-0" />
      <p className="text-muted-foreground flex-1 text-sm">
        Parece uma tarefa para o{" "}
        <span className="text-foreground font-semibold">{suggestedLabel}</span>.
        Mudar de{" "}
        <span className="font-medium">{currentLabel}</span> para{" "}
        <span className="text-foreground font-semibold">{suggestedLabel}</span>?
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-3 text-xs"
          onClick={onDismiss}
        >
          Não, manter
        </Button>
        <Button
          size="sm"
          className="h-7 bg-violet-500 px-3 text-xs text-white hover:bg-violet-600"
          onClick={onConfirm}
        >
          Sim, mudar e enviar
        </Button>
      </div>
    </div>
  )
}
