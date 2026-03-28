#!/bin/bash
# PicoClaw — Instalador para Linux
set -e
INSTALL_DIR="$HOME/PicoClaw"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        PicoClaw — Instalação no Linux            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

mkdir -p "$INSTALL_DIR/bin"
cp "$SCRIPT_DIR/bin/picoclaw-launcher" "$INSTALL_DIR/bin/"
cp "$SCRIPT_DIR/bin/picoclaw"          "$INSTALL_DIR/bin/"
chmod +x "$INSTALL_DIR/bin/"*
rsync -a --exclude='sessions/' "$SCRIPT_DIR/workspace/" "$INSTALL_DIR/workspace/"
[ -f "$SCRIPT_DIR/.env" ] && cp "$SCRIPT_DIR/.env" "$INSTALL_DIR/"

cat > "$INSTALL_DIR/start.sh" << 'STARTSCRIPT'
#!/bin/bash
DIR="$HOME/PicoClaw"
pkill -f "picoclaw-launcher" 2>/dev/null || true
sleep 0.5
[ -f "$DIR/.env" ] && set -o allexport && source "$DIR/.env" && set +o allexport
"$DIR/bin/picoclaw-launcher" --port 18800 --workspace "$DIR/workspace" >> "$DIR/picoclaw.log" 2>&1 &
echo "PicoClaw iniciado em http://localhost:18800"
STARTSCRIPT
chmod +x "$INSTALL_DIR/start.sh"

# Criar .desktop para ambientes com interface gráfica
mkdir -p "$HOME/.local/share/applications"
cat > "$HOME/.local/share/applications/picoclaw.desktop" << EOF
[Desktop Entry]
Name=PicoClaw
Comment=PicoClaw AI System
Exec=bash $INSTALL_DIR/start.sh
Terminal=true
Type=Application
Categories=Utility;
EOF

log ""
log "✅ Instalado em $INSTALL_DIR"
log "   Para iniciar: bash ~/PicoClaw/start.sh"
log "   URL: http://localhost:18800"
