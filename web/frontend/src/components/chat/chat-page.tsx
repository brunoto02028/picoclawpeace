import { IconPlus, IconRefresh, IconWifi, IconWifiOff } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { AgentSwitchBanner } from "@/components/chat/agent-switch-banner"
import { AssistantMessage } from "@/components/chat/assistant-message"
import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatEmptyState } from "@/components/chat/chat-empty-state"
import { type EmailDraft } from "@/components/chat/email-draft-card"
import { ModelSelector } from "@/components/chat/model-selector"
import { SessionHistoryMenu } from "@/components/chat/session-history-menu"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { UserMessage } from "@/components/chat/user-message"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { connectChat } from "@/features/chat/controller"
import { detectBestAgent, AGENT_PROFILES } from "@/features/chat/agent-detector"
import { useChatModels } from "@/hooks/use-chat-models"
import { useGateway } from "@/hooks/use-gateway"
import { usePicoChat } from "@/hooks/use-pico-chat"
import { useSessionHistory } from "@/hooks/use-session-history"

export function ChatPage() {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [input, setInput] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [pendingSend, setPendingSend] = useState<{ text: string; images: string[] } | null>(null)
  const [suggestedAgent, setSuggestedAgent] = useState<{ name: string; label: string } | null>(null)
  const [lastUserMsg, setLastUserMsg] = useState<{ text: string; images: string[]; sentAt: number } | null>(null)
  const [silenceWarning, setSilenceWarning] = useState(false)

  const {
    messages,
    connectionState,
    isTyping,
    currentTool,
    toolHistory,
    liveLog,
    agentBusyStartMs,
    activeSessionId,
    hasHydratedActiveSession,
    sendMessage,
    switchSession,
    newChat,
  } = usePicoChat()

  const isLoadingHistory = !hasHydratedActiveSession

  const { state: gwState } = useGateway()
  const isGatewayRunning = gwState === "running"
  const isChatConnected = connectionState === "connected"

  const {
    defaultModelName,
    hasConfiguredModels,
    apiKeyModels,
    oauthModels,
    localModels,
    handleSetDefault,
  } = useChatModels({ isConnected: isGatewayRunning })
  const canSend = isChatConnected && Boolean(defaultModelName) && !isLoadingHistory

  const {
    sessions,
    hasMore,
    loadError,
    loadErrorMessage,
    observerRef,
    loadSessions,
    handleDeleteSession,
  } = useSessionHistory({
    activeSessionId,
    onDeletedActiveSession: newChat,
  })

  const syncScrollState = (element: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = element
    setHasScrolled(scrollTop > 0)
    setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 10)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    syncScrollState(e.currentTarget)
  }

  useEffect(() => {
    if (scrollRef.current) {
      if (isAtBottom) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
      syncScrollState(scrollRef.current)
    }
  }, [messages, isTyping, isAtBottom])

  // Silence detector: se o agente não responder em 20s após mensagem do usuário, avisa
  useEffect(() => {
    if (!lastUserMsg) return
    if (isTyping || !!currentTool || !!agentBusyStartMs) {
      setSilenceWarning(false)
      return
    }
    const lastAssistantTs = [...messages].reverse().find((m) => m.role === "assistant")?.timestamp
    const agentRespondedAfter = lastAssistantTs ? Number(lastAssistantTs) : null
    if (agentRespondedAfter && agentRespondedAfter > lastUserMsg.sentAt) {
      setSilenceWarning(false)
      setLastUserMsg(null)
      return
    }
    const timer = setTimeout(() => setSilenceWarning(true), 20_000)
    return () => clearTimeout(timer)
  }, [lastUserMsg, isTyping, currentTool, agentBusyStartMs, messages])

  const handleSend = () => {
    if ((!input.trim() && images.length === 0) || !canSend) return

    const suggestion = detectBestAgent(input, defaultModelName)
    if (suggestion) {
      const profile = AGENT_PROFILES.find((p) => p.name === suggestion.agentName)
      if (profile) {
        setPendingSend({ text: input.trim(), images })
        setSuggestedAgent({ name: suggestion.agentName, label: suggestion.agentLabel })
        return
      }
    }

    const text = input.trim()
    const imgs = images
    if (sendMessage(text, imgs)) {
      setInput("")
      setImages([])
      setLastUserMsg({ text, images: imgs, sentAt: Date.now() })
      setSilenceWarning(false)
    }
  }

  const handleConfirmAgentSwitch = async () => {
    if (!suggestedAgent || !pendingSend) return
    await handleSetDefault(suggestedAgent.name)
    sendMessage(pendingSend.text, pendingSend.images)
    setInput("")
    setImages([])
    setPendingSend(null)
    setSuggestedAgent(null)
  }

  const handleDismissAgentSwitch = () => {
    if (!pendingSend) return
    sendMessage(pendingSend.text, pendingSend.images)
    setInput("")
    setImages([])
    setPendingSend(null)
    setSuggestedAgent(null)
  }

  const handleDraftAction = (_draft: EmailDraft, replyText: string) => {
    sendMessage(replyText, [])
  }

  return (
    <div className="bg-background/95 flex h-full flex-col">
      <PageHeader
        title={t("navigation.chat")}
        className={`transition-shadow ${
          hasScrolled ? "shadow-sm" : "shadow-none"
        }`}
        titleExtra={
          hasConfiguredModels && (
            <ModelSelector
              defaultModelName={defaultModelName}
              apiKeyModels={apiKeyModels}
              oauthModels={oauthModels}
              localModels={localModels}
              onValueChange={handleSetDefault}
            />
          )
        }
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={newChat}
          className="h-9 gap-2"
        >
          <IconPlus className="size-4" />
          <span className="hidden sm:inline">{t("chat.newChat")}</span>
        </Button>

        <SessionHistoryMenu
          sessions={sessions}
          activeSessionId={activeSessionId}
          hasMore={hasMore}
          loadError={loadError}
          loadErrorMessage={loadErrorMessage}
          observerRef={observerRef}
          onOpenChange={(open) => {
            if (open) {
              void loadSessions(true)
            }
          }}
          onSwitchSession={switchSession}
          onDeleteSession={handleDeleteSession}
        />
      </PageHeader>

      {/* ── Banner de status de conexão ── */}
      {connectionState !== "connected" && (
        <div className={`flex items-center justify-between gap-3 px-4 py-2 text-xs ${
          connectionState === "connecting" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
        }`}>
          <div className="flex items-center gap-2">
            {connectionState === "connecting"
              ? <IconWifi className="size-3.5 animate-pulse" />
              : <IconWifiOff className="size-3.5" />}
            <span>
              {connectionState === "connecting" ? "Reconectando ao servidor…" : "Sem conexão com o servidor."}
            </span>
          </div>
          {connectionState !== "connecting" && (
            <button
              onClick={() => void connectChat()}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium hover:bg-red-500/10"
            >
              <IconRefresh className="size-3" />
              Reconectar
            </button>
          )}
        </div>
      )}

      {/* ── Banner de silêncio do agente ── */}
      {silenceWarning && connectionState === "connected" && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 px-4 py-2 text-xs text-amber-600">
          <span>⏳ O agente não respondeu ainda. Pode estar processando em background.</span>
          <div className="flex gap-2">
            {lastUserMsg && (
              <button
                onClick={() => {
                  if (lastUserMsg && sendMessage(lastUserMsg.text, lastUserMsg.images)) {
                    setLastUserMsg({ ...lastUserMsg, sentAt: Date.now() })
                    setSilenceWarning(false)
                  }
                }}
                className="rounded px-2 py-0.5 font-medium hover:bg-amber-500/10"
              >
                Reenviar mensagem
              </button>
            )}
            <button
              onClick={() => setSilenceWarning(false)}
              className="rounded px-2 py-0.5 opacity-60 hover:opacity-100"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-24 xl:px-48"
      >
        <div className="mx-auto flex w-full max-w-250 flex-col gap-8 pb-8">
          {isLoadingHistory && (
            <div className="flex w-full flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                  <div className="bg-muted h-10 rounded-xl" style={{ width: `${45 + i * 12}%` }} />
                </div>
              ))}
            </div>
          )}

          {!isLoadingHistory && messages.length === 0 && !isTyping && (
            <ChatEmptyState
              hasConfiguredModels={hasConfiguredModels}
              defaultModelName={defaultModelName}
              isConnected={isGatewayRunning}
            />
          )}

          {!isLoadingHistory && messages.map((msg) => (
            <div key={msg.id} className="flex w-full">
              {msg.role === "assistant" ? (
                <AssistantMessage
                  content={msg.content}
                  timestamp={msg.timestamp}
                  onSendDraft={handleDraftAction}
                />
              ) : (
                <UserMessage content={msg.content} media={msg.media} />
              )}
            </div>
          ))}

          {(isTyping || !!currentTool || !!agentBusyStartMs) && (
            <TypingIndicator
              currentTool={currentTool}
              busyStartMs={agentBusyStartMs}
              toolHistory={toolHistory}
              liveLog={liveLog}
            />
          )}
        </div>
      </div>

      {suggestedAgent && (
        <AgentSwitchBanner
          suggestedLabel={suggestedAgent.label}
          suggestedName={suggestedAgent.name}
          currentLabel={defaultModelName}
          onConfirm={() => void handleConfirmAgentSwitch()}
          onDismiss={handleDismissAgentSwitch}
        />
      )}

      <ChatComposer
        input={input}
        onInputChange={setInput}
        images={images}
        onImagesChange={setImages}
        onSend={handleSend}
        isConnected={isChatConnected}
        hasDefaultModel={Boolean(defaultModelName)}
      />
    </div>
  )
}
