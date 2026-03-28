# PicoClaw — Progresso de Desenvolvimento

## Sessão: Melhorias de Responsividade do Agente
**Data:** 28/03/2026

---

## Objetivo
Melhorar a responsividade do agente no frontend (chat Pico), garantindo feedback em tempo real durante geração LLM e execução de ferramentas.

---

## O que foi implementado

### 1. Backend — Streaming de LLM (`pkg/channels/pico/pico.go`)
- Implementada interface `StreamingCapable` no `PicoChannel`
- `BeginStream`: cria placeholder "…" e retorna `picoStreamer`
- `picoStreamer.Update`: envia `TypeMessageUpdate` com throttle de 150ms
- `picoStreamer.Finalize`: envia conteúdo final
- `picoStreamer.Cancel`: limpa placeholder

### 2. Backend — Protocolo (`pkg/channels/pico/protocol.go`)
- Adicionado `TypeMessageDelete = "message.delete"` para remover placeholders

### 3. Backend — Agent Loop (`pkg/agent/loop.go`)
- `runTurn` agora usa `ChatStream` quando o provider implementa `StreamingProvider`
- Streaming ativo mesmo quando há tool definitions (MiniMax suporta)
- Cancela streamer em retry, finaliza após resposta bem-sucedida sem tool calls

### 4. Backend — Streaming de Reasoning (`pkg/providers/openai_compat/provider.go`)
- `parseStreamResponse` agora captura `delta.reasoning_content`
- Emite tokens de reasoning via `onChunk("💭 " + reasoning)` durante fase de pensamento
- Quando conteúdo real chega, onChunk emite só o conteúdo (substitui reasoning no placeholder)
- `reasoningContent` acumulado fora do loop

### 5. Frontend — Protocolo (`web/frontend/src/features/chat/protocol.ts`)
- `message.update`: limpa `agentBusyStartMs`, `currentTool`, `liveLog`, `toolHistory` quando chega conteúdo real e não há tool ativa
- `message.delete`: remove mensagem do store pelo `message_id`

### 6. Frontend — Live Log (`web/frontend/src/features/chat/protocol.ts`)
- `tool.exec.start`: adiciona entrada no `liveLog` com nome da tool e argumento principal
- `tool.exec.end`: atualiza entrada com duração

### 7. Config (`~/.picoclaw/config.json`)
- Modelo padrão: `MiniMax-M2.7`
- Groq disponível como `model_name: "groq"` (chave configurada em `~/.picoclaw/config.json`)
- Groq model: `groq/qwen/qwen3-32b` (atualizado após modelos decommissioned)

---

## Estado atual
- Backend compilado em `web/build/picoclaw-web` e `web/build/picoclaw` (gateway)
- Servidor rodando na porta 18800 (reiniciado 28/03/2026 08:32 UTC)
- **Pendente de teste**: verificar se reasoning tokens do MiniMax aparecem em tempo real no chat com `💭`

---

## Sessão: Bug Fixes (28/03/2026)

### Bugs corrigidos

#### Bug 1 — `pkg/tools/shell.go`: timeout por chamada ignorado
- **Root cause**: `executeRun` nunca lia o argumento `timeout` dos args; `runSync` usava só `t.timeout` (config global, default 0 = sem timeout)
- **Fix**: extrai `timeout` dos args (float64 ou int) em `executeRun`, computa `effectiveTimeout` e passa para `runSync(ctx, cmd, cwd, timeout)`
- **Impacto**: sem este fix, `exec({timeout:60})` do LLM era ignorado → agente travado por horas

#### Bug 2 — `pkg/providers/openai_compat/provider.go`: `ReasoningContent` não retornado
- **Root cause**: `parseStreamResponse` acumulava `reasoningContent` mas não incluía no `LLMResponse` retornado
- **Fix**: adicionado `ReasoningContent: reasoningContent.String()` no return
- **Impacto**: `has_reasoning` sempre `false` nos logs; campo ignorado em análise de resposta

#### Bug 3 — `pkg/channels/pico/pico.go`: `Cancel` deixava mensagem fantasma vazia
- **Root cause**: `picoStreamer.Cancel` chamava `EditMessage("…", "")` → message.update com content="" → bubble vazia persistia no chat
- **Fix**: `Cancel` agora chama `DeleteMessage` → message.delete remove o bubble
- **Impacto**: após tool calls, placeholder de streaming deixava mensagem vazia visível

#### Bug 4 — `web/frontend/src/features/chat/protocol.ts`: toast e `agentBusyStartMs` limpos prematuramente
- **Root cause**: `message.update` tratava reasoning stream ("💭 ...") como conteúdo final → `agentBusyStartMs` zerado, toast disparado antes da resposta final
- **Fix**: adicionada detecção `isReasoningStream = content.startsWith("💭 ")`; `agentBusyStartMs` e toast só limpam para `isFinalContent` (non-reasoning)
- **Impacto**: TypingIndicator desaparecia cedo e toast "Tarefa concluída" disparava durante reasoning

---

## Comandos úteis
```bash
# Build backend
cd /Users/brunotoaz/Downloads/DESENVOLVIMENTO/Bruno/Widsurf/picoclaw
go build -tags stdjson -ldflags "-s -w" -o web/build/picoclaw-web ./web/backend/

# Restart servidor
pkill -f "picoclaw-web"; sleep 1 && /Users/brunotoaz/Downloads/DESENVOLVIMENTO/Bruno/Widsurf/picoclaw/web/build/picoclaw-web --port 18800 >> /tmp/picoclaw-web.log 2>&1 & sleep 2 && curl -s -X POST http://localhost:18800/api/gateway/start

# Status
curl -s http://localhost:18800/api/gateway/status

# Logs
tail -f /tmp/picoclaw-web.log
```

---

## Arquivos modificados
| Arquivo | Mudança |
|---|---|
| `pkg/channels/pico/pico.go` | BeginStream, picoStreamer, DeleteMessage |
| `pkg/channels/pico/protocol.go` | TypeMessageDelete |
| `pkg/agent/loop.go` | ChatStream integration, streamer lifecycle |
| `pkg/providers/openai_compat/provider.go` | reasoning_content streaming |
| `web/frontend/src/features/chat/protocol.ts` | message.delete, message.update cleanup, live log |
| `web/frontend/src/store/chat.ts` | liveLog state |
| `web/frontend/src/components/chat/chat-page.tsx` | TypingIndicator com liveLog e agentBusyStartMs |
| `~/.picoclaw/config.json` | modelo padrão, chave Groq |
