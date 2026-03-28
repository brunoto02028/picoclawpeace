#!/bin/bash
# PicoClaw — Dev Launcher
# Inicia o backend e o frontend em modo de desenvolvimento

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$PROJECT_DIR/picoclaw-dev.log"
BACKEND_PORT=18800
FRONTEND_PORT=5173

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

echo "" >> "$LOG"
log "=========================================="
log "  PicoClaw DEV iniciando..."
log "=========================================="

# Mata instâncias existentes
pkill -f "picoclaw-web" 2>/dev/null && log "Backend anterior parado." || true
pkill -f "vite"         2>/dev/null && log "Frontend anterior parado." || true
sleep 0.5

# Garante Go no PATH (homebrew / asdf)
export PATH="/usr/local/go/bin:/opt/homebrew/bin:$HOME/go/bin:$PATH"

# Compila o backend
log "Compilando backend..."
cd "$PROJECT_DIR"
if go build -o /tmp/picoclaw-web ./web/backend/ >> "$LOG" 2>&1; then
  log "Backend compilado com sucesso."
else
  log "ERRO: falha ao compilar o backend. Veja $LOG"
  osascript -e 'display alert "PicoClaw" message "Erro ao compilar o backend. Veja picoclaw-dev.log no projeto." as critical'
  exit 1
fi

# Inicia backend
/tmp/picoclaw-web --port "$BACKEND_PORT" >> "$LOG" 2>&1 &
BACKEND_PID=$!
log "Backend iniciado (PID $BACKEND_PID, porta $BACKEND_PORT)"

# Inicia frontend (Vite dev server)
cd "$PROJECT_DIR/web/frontend"
export PATH="/usr/local/bin:$PATH"  # pnpm location
pnpm dev >> "$LOG" 2>&1 &
FRONTEND_PID=$!
log "Frontend iniciado (PID $FRONTEND_PID, porta $FRONTEND_PORT)"

# Aguarda o frontend estar pronto (máx 30s)
log "Aguardando serviços ficarem prontos..."
READY=0
for i in $(seq 1 30); do
  if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -eq 1 ]; then
  log "Serviços prontos! Abrindo browser..."
  open "http://localhost:$FRONTEND_PORT"
  osascript -e 'display notification "PicoClaw está rodando em localhost:5173" with title "✅ PicoClaw" sound name "Glass"'
else
  log "AVISO: Timeout aguardando frontend. Tentando abrir assim mesmo..."
  open "http://localhost:$FRONTEND_PORT"
fi

# Guarda PIDs para o script de parada
echo "$BACKEND_PID $FRONTEND_PID" > /tmp/picoclaw.pids
log "PIDs salvos: Backend=$BACKEND_PID Frontend=$FRONTEND_PID"
log ""
log "Sistema rodando. Feche esta janela para PARAR tudo."
log "Logs em: $LOG"
log "Dashboard: http://localhost:$FRONTEND_PORT"
log ""

# Mantém script vivo; mata processos filhos ao fechar o terminal
trap 'log "Parando PicoClaw..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; log "Parado."; exit 0' INT TERM EXIT

wait $FRONTEND_PID
