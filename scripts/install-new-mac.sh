#!/bin/bash
# PicoClaw — Instalador para Novo Mac
# Execute este script após extrair o pacote de transferência

set -e
INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_TARGET="$HOME/PicoClaw"
LOG="$INSTALL_DIR/install.log"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        PicoClaw — Instalação no novo Mac         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Verificar .env ────────────────────────────────────────────────────────────
if [ ! -f "$INSTALL_DIR/.env" ] && [ ! -f "$INSTALL_DIR/.env.example" ]; then
    log "AVISO: Arquivo .env não encontrado."
fi
if [ -f "$INSTALL_DIR/.env.example" ] && [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "⚠️  Arquivo .env não encontrado."
    echo "   Antes de continuar, edite '.env.example' com suas chaves de API"
    echo "   e renomeie para '.env'."
    echo ""
    read -r -p "Deseja continuar mesmo assim? (s/N): " REPLY
    [[ "$REPLY" =~ ^[sS]$ ]] || { log "Instalação cancelada."; exit 0; }
fi

# ── Criar pasta de instalação ─────────────────────────────────────────────────
log "Instalando em: $INSTALL_TARGET"
mkdir -p "$INSTALL_TARGET/bin"

# ── Copiar binários ───────────────────────────────────────────────────────────
log "Copiando binários..."
cp "$INSTALL_DIR/bin/picoclaw"          "$INSTALL_TARGET/bin/"
cp "$INSTALL_DIR/bin/picoclaw-launcher" "$INSTALL_TARGET/bin/"
chmod +x "$INSTALL_TARGET/bin/"*

# Remover quarentena (necessário no macOS para apps baixados)
xattr -cr "$INSTALL_TARGET/bin/picoclaw"          2>/dev/null || true
xattr -cr "$INSTALL_TARGET/bin/picoclaw-launcher" 2>/dev/null || true
log "Quarentena removida dos binários."

# ── Copiar workspace ──────────────────────────────────────────────────────────
log "Copiando workspace (skills, cron, tarefas, memória)..."
rsync -a "$INSTALL_DIR/workspace/" "$INSTALL_TARGET/workspace/"

# ── Copiar .env ───────────────────────────────────────────────────────────────
if [ -f "$INSTALL_DIR/.env" ]; then
    cp "$INSTALL_DIR/.env" "$INSTALL_TARGET/"
    log "Arquivo .env copiado."
fi

# ── Criar script de inicialização ─────────────────────────────────────────────
log "Criando script de inicialização..."
cat > "$INSTALL_TARGET/start.sh" << STARTSCRIPT
#!/bin/bash
PICOCLAW_DIR="\$HOME/PicoClaw"
PORT=18800
LOG="\$PICOCLAW_DIR/picoclaw.log"

log() { echo "[\$(date '+%H:%M:%S')] \$*" | tee -a "\$LOG"; }

pkill -f "picoclaw-launcher" 2>/dev/null && log "Instância anterior parada." || true
sleep 0.5

# Carregar .env
if [ -f "\$PICOCLAW_DIR/.env" ]; then
    set -o allexport
    source "\$PICOCLAW_DIR/.env"
    set +o allexport
fi

log "Iniciando PicoClaw..."
"\$PICOCLAW_DIR/bin/picoclaw-launcher" \\
    --port \$PORT \\
    --workspace "\$PICOCLAW_DIR/workspace" \\
    >> "\$LOG" 2>&1 &
PID=\$!
log "Servidor iniciado (PID \$PID, porta \$PORT)"

for i in \$(seq 1 20); do
    curl -s "http://localhost:\$PORT" >/dev/null 2>&1 && break
    sleep 1
done

open "http://localhost:\$PORT"
osascript -e 'display notification "PicoClaw está rodando em localhost:18800" with title "✅ PicoClaw" sound name "Glass"' 2>/dev/null || true
log "Browser aberto. Sistema rodando."
log "Para parar: pkill -f picoclaw-launcher"
STARTSCRIPT
chmod +x "$INSTALL_TARGET/start.sh"

# ── Criar macOS .app clicável ─────────────────────────────────────────────────
log "Criando PicoClaw.app na Área de Trabalho..."
APP_PATH="$HOME/Desktop/PicoClaw.app"
rm -rf "$APP_PATH"

cat > /tmp/picoclaw-new-mac.applescript << APPLESCRIPT
set startScript to (POSIX path of (path to home folder)) & "PicoClaw/start.sh"
tell application "Terminal"
    activate
    set win to do script "clear && echo '🦀 PicoClaw iniciando...' && bash " & quoted form of startScript
    set custom title of win to "PicoClaw"
end tell
APPLESCRIPT

osacompile -o "$APP_PATH" /tmp/picoclaw-new-mac.applescript
rm /tmp/picoclaw-new-mac.applescript

# Ícone
if [ -f "$INSTALL_DIR/icon.icns" ]; then
    cp "$INSTALL_DIR/icon.icns" "$APP_PATH/Contents/Resources/applet.icns"
fi

# Info.plist
cat > "$APP_PATH/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>applet</string>
    <key>CFBundleIdentifier</key><string>com.picoclaw.launcher</string>
    <key>CFBundleName</key><string>PicoClaw</string>
    <key>CFBundleDisplayName</key><string>PicoClaw</string>
    <key>CFBundleIconFile</key><string>applet</string>
    <key>CFBundlePackageType</key><string>APPL</string>
    <key>CFBundleShortVersionString</key><string>1.0</string>
    <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

xattr -cr "$APP_PATH" 2>/dev/null || true
log "PicoClaw.app criado na Área de Trabalho."

# ── Concluído ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║          ✅ Instalação concluída!                ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  📁 Instalado em:  ~/PicoClaw/"
echo "  🖱️  Launcher:      ~/Desktop/PicoClaw.app"
echo "  🌐 URL:           http://localhost:18800"
echo ""
echo "  Clique duas vezes em PicoClaw.app para iniciar."
echo "  (Na primeira vez: botão direito → Abrir → Abrir)"
echo ""
