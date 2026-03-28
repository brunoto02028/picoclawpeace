#!/bin/bash
# PicoClaw — Empacotador para Transferência
#
# Uso:
#   ./scripts/package-transfer.sh                  # Mac atual
#   ./scripts/package-transfer.sh mac-arm64         # Mac Apple Silicon
#   ./scripts/package-transfer.sh mac-amd64         # Mac Intel
#   ./scripts/package-transfer.sh windows-amd64     # PC Windows
#   ./scripts/package-transfer.sh linux-amd64       # Linux

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

TARGET="${1:-native}"
if [ "$TARGET" = "native" ]; then
    HOST_OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    HOST_ARCH="$(uname -m)"
    [ "$HOST_ARCH" = "x86_64" ] && HOST_ARCH="amd64"
    TARGET="${HOST_OS}-${HOST_ARCH}"
fi

PACKAGE_NAME="picoclaw-$TARGET-$(date '+%Y%m%d')"
PACKAGE_DIR="/tmp/$PACKAGE_NAME"
OUTPUT_ZIP="$PROJECT_DIR/$PACKAGE_NAME.zip"
BIN_DIR="$PROJECT_DIR/web/build/$TARGET"

log() { echo "[$(date '+%H:%M:%S')] $*"; }
log "=== PicoClaw — Empacotador  |  Alvo: $TARGET ==="

# ── Verificar binários ────────────────────────────────────────────────────────
EXT=""; [[ "$TARGET" == windows* ]] && EXT=".exe"
if [ ! -f "$BIN_DIR/picoclaw-launcher$EXT" ] || [ ! -f "$BIN_DIR/picoclaw$EXT" ]; then
    log "ERRO: Binários para '$TARGET' não encontrados em web/build/$TARGET/"
    log "Execute primeiro: ./scripts/build-production.sh $TARGET"
    exit 1
fi

# ── Criar estrutura do pacote ─────────────────────────────────────────────────
log "Criando pacote em $PACKAGE_DIR..."
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/bin"

# Binários
log "Copiando binários ($TARGET)..."
cp "$BIN_DIR/picoclaw-launcher$EXT" "$PACKAGE_DIR/bin/"
cp "$BIN_DIR/picoclaw$EXT"          "$PACKAGE_DIR/bin/"
[[ "$TARGET" != windows* ]] && chmod +x "$PACKAGE_DIR/bin/"*

# Workspace (skills, cron, memory, tasks — sem sessions nem logs)
log "Copiando workspace..."
rsync -a --exclude='sessions/' --exclude='*.log' \
    "$PROJECT_DIR/workspace/" "$PACKAGE_DIR/workspace/"

# .env (API keys)
if [ -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "$PACKAGE_DIR/"
    log "Arquivo .env incluído."
else
    cp "$PROJECT_DIR/.env.example" "$PACKAGE_DIR/.env.example"
    log "AVISO: .env não encontrado. Inclua suas chaves de API antes de instalar."
fi

# Ícone
cp "$PROJECT_DIR/scripts/icon.icns" "$PACKAGE_DIR/" 2>/dev/null || true

# ── Instaladores por plataforma ───────────────────────────────────────────────
case "$TARGET" in
    mac-*)
        cp "$PROJECT_DIR/scripts/install-new-mac.sh" "$PACKAGE_DIR/"
        chmod +x "$PACKAGE_DIR/install-new-mac.sh"
        ;;
    windows-*)
        cp "$PROJECT_DIR/scripts/install-windows.ps1" "$PACKAGE_DIR/"
        ;;
    linux-*)
        cp "$PROJECT_DIR/scripts/install-linux.sh" "$PACKAGE_DIR/" 2>/dev/null || true
        ;;
esac

# ── README ────────────────────────────────────────────────────────────────────
case "$TARGET" in
    mac-*)    INSTALL_CMD="bash install-new-mac.sh" ;;
    windows-*) INSTALL_CMD="Clique direito em install-windows.ps1 → Executar com PowerShell" ;;
    linux-*)  INSTALL_CMD="bash install-linux.sh" ;;
    *)        INSTALL_CMD="ver LEIA-ME.txt" ;;
esac

cat > "$PACKAGE_DIR/LEIA-ME.txt" << EOF
╔══════════════════════════════════════════════════╗
║     PicoClaw — Pacote de Instalação ($TARGET)
╚══════════════════════════════════════════════════╝

COMO INSTALAR:
───────────────
1. Extraia este ZIP numa pasta conveniente
2. Configure o arquivo .env com suas chaves de API
3. Execute: $INSTALL_CMD

CHAVES DE API (.env):
──────────────────────
Edite o arquivo .env (ou .env.example → renomeie para .env)
e adicione pelo menos uma chave de modelo de IA:
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...
  OPENROUTER_API_KEY=sk-or-...

DEPOIS DE INSTALAR:
────────────────────
URL do sistema: http://localhost:18800
EOF

# ── Criar ZIP ─────────────────────────────────────────────────────────────────
log "Comprimindo..."
cd /tmp
zip -r "$OUTPUT_ZIP" "$PACKAGE_NAME" -x "*.DS_Store" -x "__MACOSX/*"
rm -rf "$PACKAGE_DIR"

log ""
log "✅ Pacote criado: $(basename "$OUTPUT_ZIP")"
log "   Caminho:  $OUTPUT_ZIP"
log "   Tamanho:  $(du -sh "$OUTPUT_ZIP" | cut -f1)"
log ""
case "$TARGET" in
    mac-*)    log "Transferir: AirDrop, iCloud ou pendrive. No destino: bash install-new-mac.sh" ;;
    windows-*) log "Transferir: pendrive ou WeTransfer. No destino: install-windows.ps1 (PowerShell)" ;;
    linux-*)  log "Transferir: scp/rsync/pendrive. No destino: bash install-linux.sh" ;;
esac
