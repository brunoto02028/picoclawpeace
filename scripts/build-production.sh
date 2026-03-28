#!/bin/bash
# PicoClaw — Build de Produção Multi-Plataforma
#
# Uso:
#   ./scripts/build-production.sh                  # Mac atual
#   ./scripts/build-production.sh mac-arm64         # Mac Apple Silicon (M1/M2/M3)
#   ./scripts/build-production.sh mac-amd64         # Mac Intel
#   ./scripts/build-production.sh windows-amd64     # PC Windows (64-bit)
#   ./scripts/build-production.sh linux-amd64       # Linux (servidor/PC)
#   ./scripts/build-production.sh all               # Todos os alvos

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

TARGET="${1:-native}"
log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "=== PicoClaw — Build de Produção ==="
log "Projeto: $PROJECT_DIR  |  Alvo: $TARGET"

# ── Verificações ──────────────────────────────────────────────────────────────
command -v go   >/dev/null || { log "ERRO: Go não encontrado → https://go.dev"; exit 1; }
command -v pnpm >/dev/null || { log "ERRO: pnpm não encontrado → npm i -g pnpm"; exit 1; }

# ── Build frontend (uma vez — é embutido em todos os binários) ────────────────
log "Compilando frontend React (embutido)..."
cd "$PROJECT_DIR/web/frontend"
pnpm install --frozen-lockfile --silent
pnpm build:backend
log "Frontend compilado OK."

# ── Função de build ───────────────────────────────────────────────────────────
build_target() {
    local GOOS="$1"
    local GOARCH="$2"
    local LABEL="$3"
    local OUT_DIR="$PROJECT_DIR/web/build/$LABEL"
    local EXT=""
    [ "$GOOS" = "windows" ] && EXT=".exe"

    mkdir -p "$OUT_DIR"
    log "→ Compilando para $LABEL ($GOOS/$GOARCH)..."

    # picoclaw-launcher (servidor web + frontend embutido)
    cd "$PROJECT_DIR/web"
    GOOS="$GOOS" GOARCH="$GOARCH" CGO_ENABLED=0 \
        go build -tags stdjson -ldflags "-s -w" \
        -o "$OUT_DIR/picoclaw-launcher$EXT" ./backend/

    # picoclaw (gateway de IA)
    cd "$PROJECT_DIR"
    GOOS="$GOOS" GOARCH="$GOARCH" CGO_ENABLED=0 \
        go build -tags stdjson -ldflags "-s -w" \
        -o "$OUT_DIR/picoclaw$EXT" ./cmd/picoclaw/

    log "   ✅ $LABEL → $OUT_DIR"
}

# ── Selecionar alvo(s) ────────────────────────────────────────────────────────
case "$TARGET" in
    native)
        HOST_OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
        HOST_ARCH="$(uname -m)"
        [ "$HOST_ARCH" = "x86_64" ] && HOST_ARCH="amd64"
        [ "$HOST_ARCH" = "arm64"  ] && HOST_ARCH="arm64"
        LABEL="${HOST_OS}-${HOST_ARCH}"
        build_target "$HOST_OS" "$HOST_ARCH" "$LABEL"
        ;;
    mac-arm64)      build_target darwin  arm64  mac-arm64        ;;
    mac-amd64)      build_target darwin  amd64  mac-amd64        ;;
    windows-amd64)  build_target windows amd64  windows-amd64    ;;
    linux-amd64)    build_target linux   amd64  linux-amd64      ;;
    all)
        build_target darwin  arm64  mac-arm64
        build_target darwin  amd64  mac-amd64
        build_target windows amd64  windows-amd64
        build_target linux   amd64  linux-amd64
        ;;
    *)
        log "ERRO: Alvo desconhecido '$TARGET'"
        log "Opções: native | mac-arm64 | mac-amd64 | windows-amd64 | linux-amd64 | all"
        exit 1
        ;;
esac

log ""
log "✅ Build concluído! Binários em: web/build/"
log "Próximo passo: ./scripts/package-transfer.sh $TARGET"
