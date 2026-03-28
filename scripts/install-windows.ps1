# PicoClaw — Instalador para Windows
# Execute no PowerShell como administrador (botão direito → "Executar como Administrador")
# Ou: clique direito no arquivo → "Executar com PowerShell"

$ErrorActionPreference = "Stop"
$InstallDir = "$env:USERPROFILE\PicoClaw"
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path

function Log($msg) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" }

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗"
Write-Host "║       PicoClaw — Instalação no Windows           ║"
Write-Host "╚══════════════════════════════════════════════════╝"
Write-Host ""

# ── Verificar .env ────────────────────────────────────────────────────────────
if (-not (Test-Path "$ScriptDir\.env") -and (Test-Path "$ScriptDir\.env.example")) {
    Write-Host "⚠️  Arquivo .env não encontrado."
    Write-Host "   Configure '.env.example' com suas chaves de API e renomeie para '.env'"
    Write-Host ""
    $resp = Read-Host "Continuar mesmo assim? (s/N)"
    if ($resp -notmatch "^[sS]$") { Log "Instalação cancelada."; exit 0 }
}

# ── Criar pasta de instalação ─────────────────────────────────────────────────
Log "Instalando em: $InstallDir"
New-Item -ItemType Directory -Force -Path "$InstallDir\bin"      | Out-Null
New-Item -ItemType Directory -Force -Path "$InstallDir\workspace" | Out-Null

# ── Copiar binários ───────────────────────────────────────────────────────────
Log "Copiando binários..."
Copy-Item "$ScriptDir\bin\picoclaw.exe"          "$InstallDir\bin\" -Force
Copy-Item "$ScriptDir\bin\picoclaw-launcher.exe" "$InstallDir\bin\" -Force

# Desbloquear executáveis baixados da internet
Unblock-File "$InstallDir\bin\picoclaw.exe"          -ErrorAction SilentlyContinue
Unblock-File "$InstallDir\bin\picoclaw-launcher.exe" -ErrorAction SilentlyContinue
Log "Binários instalados."

# ── Copiar workspace ──────────────────────────────────────────────────────────
Log "Copiando workspace (skills, cron, tarefas, memória)..."
Copy-Item "$ScriptDir\workspace\*" "$InstallDir\workspace\" -Recurse -Force

# ── Copiar .env ───────────────────────────────────────────────────────────────
if (Test-Path "$ScriptDir\.env") {
    Copy-Item "$ScriptDir\.env" "$InstallDir\" -Force
    Log "Arquivo .env copiado."
}

# ── Criar script de inicialização .bat ────────────────────────────────────────
Log "Criando launcher..."
$batContent = @'
@echo off
title PicoClaw
cd /d "%USERPROFILE%\PicoClaw"

echo [PicoClaw] Parando instancias anteriores...
taskkill /f /im picoclaw-launcher.exe 2>nul
timeout /t 1 /nobreak >nul

echo [PicoClaw] Carregando configuracao...
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" if not "%%A:~0,1%"=="#" set "%%A=%%B"
    )
)

echo [PicoClaw] Iniciando servidor...
start /b "" "bin\picoclaw-launcher.exe" --port 18800 --workspace "%USERPROFILE%\PicoClaw\workspace" > picoclaw.log 2>&1

echo [PicoClaw] Aguardando servidor...
:WAIT
timeout /t 2 /nobreak >nul
curl -s http://localhost:18800 >nul 2>&1
if errorlevel 1 goto WAIT

echo [PicoClaw] Pronto! Abrindo browser...
start http://localhost:18800
echo.
echo Sistema rodando em http://localhost:18800
echo Feche esta janela para PARAR o PicoClaw.
echo.
pause
taskkill /f /im picoclaw-launcher.exe 2>nul
'@
$batContent | Out-File -FilePath "$InstallDir\PicoClaw.bat" -Encoding ascii
Log "PicoClaw.bat criado em $InstallDir"

# ── Criar atalho na Área de Trabalho ─────────────────────────────────────────
Log "Criando atalho na Área de Trabalho..."
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\PicoClaw.lnk")
$Shortcut.TargetPath  = "$InstallDir\PicoClaw.bat"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "Iniciar PicoClaw"
$Shortcut.WindowStyle = 1
$Shortcut.Save()
Log "Atalho criado na Área de Trabalho."

# ── Adicionar ao PATH (opcional) ──────────────────────────────────────────────
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$InstallDir\bin*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$InstallDir\bin", "User")
    Log "Pasta bin adicionada ao PATH do usuário."
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗"
Write-Host "║          ✅ Instalação concluída!                ║"
Write-Host "╚══════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "  📁 Instalado em:  $InstallDir"
Write-Host "  🖱️  Atalho:        Área de Trabalho → PicoClaw"
Write-Host "  🌐 URL:           http://localhost:18800"
Write-Host ""
Write-Host "  Clique duas vezes em 'PicoClaw' na Área de Trabalho para iniciar."
Write-Host ""
