import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import type { LiveLogEntry } from "@/store/chat"

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getToolIcon(tool: string): string {
  const icons: Record<string, string> = {
    shell: "❯", exec: "❯", bash: "❯", run: "❯",
    read_file: "📄", write_file: "✏️", edit_file: "✏️", create_file: "📝",
    search: "🔍", web_search: "🌐", fetch: "🌐",
    email: "✉️", task: "📋", cron: "⏰", memory: "🧠",
    git: "🐙", github: "🐙", deploy: "🚀",
  }
  return icons[tool] ?? "⚡"
}

function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    shell: "Terminal", exec: "Terminal", bash: "Terminal", run: "Terminal",
    read_file: "Lendo", write_file: "Escrevendo", edit_file: "Editando", create_file: "Criando",
    search: "Pesquisando", web_search: "Web", fetch: "Buscando",
    email: "Email", task: "Tarefas", cron: "Agendando", memory: "Memória",
    git: "Git", github: "GitHub", deploy: "Deploy",
  }
  return labels[tool] ?? tool.replace(/_/g, " ")
}

function getHeartbeatMessage(elapsed: number): { text: string; color: string } | null {
  if (elapsed < 30) return null
  if (elapsed < 60)  return { text: "Ainda trabalhando, aguarde…", color: "text-muted-foreground" }
  if (elapsed < 120) return { text: "Isso pode levar alguns minutos.", color: "text-amber-500/80" }
  if (elapsed < 300) return { text: "⏳ Levando mais tempo que o esperado…", color: "text-amber-500" }
  if (elapsed < 600) return { text: "⚠️ Tarefa longa em progresso. Aguarde.", color: "text-orange-500" }
  return { text: "🔄 Executando há " + formatElapsed(elapsed) + ". Ainda ativo.", color: "text-red-500" }
}

interface TypingIndicatorProps {
  currentTool?: string | null
  busyStartMs?: number | null
  toolHistory?: string[]
  liveLog?: LiveLogEntry[]
}

export function TypingIndicator({ currentTool, busyStartMs, liveLog }: TypingIndicatorProps) {
  const { t } = useTranslation()
  const thinkingSteps = [
    t("chat.thinking.step1"),
    t("chat.thinking.step2"),
    t("chat.thinking.step3"),
    t("chat.thinking.step4"),
  ]
  const [stepIndex, setStepIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(busyStartMs ?? Date.now())
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startRef.current = busyStartMs ?? Date.now()
    setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    const stepsCount = thinkingSteps.length
    const stepInterval = setInterval(() => setStepIndex((p) => (p + 1) % stepsCount), 3000)
    const timerInterval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => { clearInterval(stepInterval); clearInterval(timerInterval) }
  }, [busyStartMs, thinkingSteps.length])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [liveLog?.length])

  const heartbeat = getHeartbeatMessage(elapsed)
  const hasLog = liveLog && liveLog.length > 0

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="text-muted-foreground flex items-center gap-2 px-1 text-xs opacity-70">
        <span>PicoClaw</span>
      </div>

      <div className="bg-card inline-flex w-fit max-w-lg flex-col gap-0 rounded-xl border overflow-hidden">
        {/* Header com timer */}
        <div className="flex items-center justify-between gap-4 px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 animate-bounce rounded-full bg-violet-400/70 [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-violet-400/70 [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-violet-400/70" />
          </div>
          <div className="flex items-center gap-2">
            {currentTool && (
              <span className="text-amber-400 text-[10px] font-medium animate-pulse">
                {getToolIcon(currentTool)} {getToolLabel(currentTool)}
              </span>
            )}
            {elapsed > 0 && (
              <span className="text-muted-foreground/60 tabular-nums text-xs font-medium">
                {formatElapsed(elapsed)}
              </span>
            )}
          </div>
        </div>

        {/* Barra de progresso animada */}
        <div className="bg-muted mx-4 mb-3 h-0.5 overflow-hidden rounded-full">
          <div className="h-full animate-[shimmer_2s_infinite] rounded-full bg-gradient-to-r from-violet-500/60 via-violet-400/80 to-violet-500/60 bg-[length:200%_100%]" />
        </div>

        {/* Status se não há log */}
        {!hasLog && (
          <p
            key={stepIndex}
            className="text-muted-foreground animate-[fadeSlideIn_0.4s_ease-out] px-4 pb-3 text-xs"
          >
            {thinkingSteps[stepIndex]}
          </p>
        )}

        {/* Live log — painel estilo terminal */}
        {hasLog && (
          <div className="border-border/40 border-t bg-black/20 max-h-52 overflow-y-auto">
            <div className="flex flex-col gap-0 p-3 font-mono">
              {liveLog!.map((entry) => {
                const done = !!entry.endMs
                const duration = done ? entry.endMs! - entry.startMs : null
                return (
                  <div key={entry.id} className="flex items-start gap-1.5 py-0.5">
                    <span className={`mt-0.5 shrink-0 text-[11px] ${
                      !done
                        ? "text-amber-400 animate-pulse"
                        : entry.isError
                          ? "text-red-400"
                          : "text-green-400"
                    }`}>
                      {!done ? "▶" : entry.isError ? "✗" : "✓"}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-semibold shrink-0 ${
                          !done ? "text-amber-300" : entry.isError ? "text-red-300" : "text-green-300"
                        }`}>
                          {getToolLabel(entry.tool)}
                        </span>
                        {entry.arg && (
                          <span className="text-[11px] text-zinc-400 truncate max-w-xs">
                            {entry.arg}
                          </span>
                        )}
                      </div>
                      {done && duration !== null && (
                        <span className="text-[10px] text-zinc-600">
                          {entry.isError ? "erro" : formatMs(duration)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* Heartbeat para tarefas longas */}
        {heartbeat && (
          <p className={`px-4 py-2 text-[11px] border-t border-border/30 ${heartbeat.color}`}>
            {heartbeat.text}
          </p>
        )}
      </div>
    </div>
  )
}
