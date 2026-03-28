import { IconMail, IconMailCheck, IconMailX, IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export interface EmailDraft {
  to: string
  subject: string
  body: string
  draftId: string
}

interface EmailDraftCardProps {
  draft: EmailDraft
  onApprove: (draft: EmailDraft) => void
  onDiscard: (draftId: string) => void
  onRewrite: (draftId: string) => void
  status?: "pending" | "approved" | "discarded"
}

export function EmailDraftCard({
  draft,
  onApprove,
  onDiscard,
  onRewrite,
  status = "pending",
}: EmailDraftCardProps) {
  return (
    <div className="border-border bg-card mt-3 w-full overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted/50 border-border flex items-center gap-2 border-b px-4 py-2.5">
        <IconMail className="text-muted-foreground size-4" />
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Rascunho de Email — aguardando aprovação
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-1">
          <span className="text-muted-foreground text-xs font-medium">Para</span>
          <span className="text-sm">{draft.to}</span>
        </div>
        <div className="grid gap-1">
          <span className="text-muted-foreground text-xs font-medium">Assunto</span>
          <span className="text-sm font-medium">{draft.subject}</span>
        </div>
        <div className="grid gap-1">
          <span className="text-muted-foreground text-xs font-medium">Mensagem</span>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{draft.body}</p>
        </div>
      </div>

      {status === "pending" && (
        <div className="border-border flex items-center gap-2 border-t px-4 py-3">
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-green-600 text-white hover:bg-green-700"
            onClick={() => onApprove(draft)}
          >
            <IconMailCheck className="size-3.5" />
            Enviar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5"
            onClick={() => onRewrite(draft.draftId)}
          >
            <IconRefresh className="size-3.5" />
            Reescrever
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive h-8 gap-1.5"
            onClick={() => onDiscard(draft.draftId)}
          >
            <IconMailX className="size-3.5" />
            Descartar
          </Button>
        </div>
      )}

      {status === "approved" && (
        <div className="border-border flex items-center gap-2 border-t px-4 py-3">
          <IconMailCheck className="size-4 text-green-600" />
          <span className="text-sm text-green-600">Email enviado.</span>
        </div>
      )}

      {status === "discarded" && (
        <div className="border-border flex items-center gap-2 border-t px-4 py-3">
          <IconMailX className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-sm">Rascunho descartado.</span>
        </div>
      )}
    </div>
  )
}

/**
 * Parses an assistant message looking for [EMAIL_DRAFT]...[/EMAIL_DRAFT] blocks.
 * Returns the parsed draft or null if no draft is found.
 */
export function parseEmailDraft(content: string): EmailDraft | null {
  const match = content.match(/\[EMAIL_DRAFT\]([\s\S]*?)\[\/EMAIL_DRAFT\]/i)
  if (!match) return null

  const block = match[1]

  const to = block.match(/^To:\s*(.+)$/im)?.[1]?.trim() ?? ""
  const subject = block.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ?? ""
  const bodyMatch = block.match(/^Body:\s*([\s\S]+)$/im)
  const body = bodyMatch?.[1]?.trim() ?? ""
  const draftId =
    block.match(/^DraftId:\s*(.+)$/im)?.[1]?.trim() ??
    `draft-${Date.now()}`

  if (!to && !subject && !body) return null

  return { to, subject, body, draftId }
}
