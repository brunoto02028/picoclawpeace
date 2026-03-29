# PicoClaw — Guia de Instalação Rápida

Este guia explica como compilar e executar o PicoClaw no **Windows (PC)** e no **macOS (Mac)**.

---

## Pré-requisitos (ambas as plataformas)

- [Go 1.22+](https://go.dev/dl/)
- [Git](https://git-scm.com/)
- [GitHub CLI (`gh`)](https://cli.github.com/) — para acesso a repositórios
- Chave de API do Groq (ou outro provedor configurado)

---

## 🪟 Windows (PC)

### 1. Clonar o repositório

```powershell
git clone https://github.com/brunoto02028/picoclawpeace
cd picoclawpeace
```

### 2. Compilar o binário

```powershell
$env:CGO_ENABLED='0'
go build -tags "goolm,stdjson" -o picoclaw.exe ./cmd/picoclaw
```

### 3. Configurar

Copie o arquivo de exemplo e edite com suas chaves:

```powershell
Copy-Item config\config.example.json "$env:USERPROFILE\.picoclaw\config.json"
```

Abra `%USERPROFILE%\.picoclaw\config.json` e configure:

```json
{
  "agents": {
    "defaults": {
      "workspace": "C:\\caminho\\para\\picoclawpeace\\workspace",
      "model_name": "groq-llama-3.3-70b"
    }
  },
  "model_list": [
    {
      "model_name": "groq-llama-3.3-70b",
      "model": "llama-3.3-70b-versatile",
      "api_key": "SUA_CHAVE_GROQ_AQUI",
      "api_base": "https://api.groq.com/openai/v1"
    }
  ]
}
```

> **Dica:** use a interface web (Models → Credentials) para adicionar chaves sem editar o JSON manualmente.

### 4. Autenticar o GitHub CLI

```powershell
gh auth login
```

### 5. Iniciar o servidor

```powershell
.\picoclaw.exe gateway
```

O servidor sobe em `http://127.0.0.1:18790`.

### 6. Acessar a interface

Abra o browser em `http://127.0.0.1:18800` (se estiver rodando o launcher web) ou conecte via WebSocket direto.

---

## 🍎 macOS (Mac)

### 1. Instalar dependências

```bash
# Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Go, Git e GitHub CLI
brew install go git gh
```

### 2. Clonar o repositório

```bash
git clone https://github.com/brunoto02028/picoclawpeace
cd picoclawpeace
```

### 3. Compilar o binário

```bash
CGO_ENABLED=0 go build -tags "goolm,stdjson" -o picoclaw ./cmd/picoclaw
```

Ou usando o Makefile (recomendado):

```bash
make build
# binário gerado em: build/picoclaw-darwin-arm64 (Apple Silicon) ou build/picoclaw-darwin-amd64 (Intel)
```

### 4. Configurar

```bash
mkdir -p ~/.picoclaw
cp config/config.example.json ~/.picoclaw/config.json
```

Edite `~/.picoclaw/config.json` e aponte o workspace para a pasta do projeto:

```json
{
  "agents": {
    "defaults": {
      "workspace": "/Users/SEU_USUARIO/caminho/para/picoclawpeace/workspace",
      "model_name": "groq-llama-3.3-70b"
    }
  },
  "model_list": [
    {
      "model_name": "groq-llama-3.3-70b",
      "model": "llama-3.3-70b-versatile",
      "api_key": "SUA_CHAVE_GROQ_AQUI",
      "api_base": "https://api.groq.com/openai/v1"
    }
  ]
}
```

> **Importante:** o `workspace` deve apontar para a pasta `workspace/` do repositório clonado — onde ficam `AGENT.md`, `SOUL.md`, `USER.md` e as skills.

### 5. Autenticar o GitHub CLI

```bash
gh auth login
```

### 6. Iniciar o servidor

```bash
./picoclaw gateway
# ou se usou make build:
./build/picoclaw-darwin-arm64 gateway   # Apple Silicon
./build/picoclaw-darwin-amd64 gateway   # Intel
```

O servidor sobe em `http://127.0.0.1:18790`.

### 7. Acessar a interface

Abra o browser em `http://127.0.0.1:18800`.

---

## ⚙️ Configuração mínima do `config.json`

Campos obrigatórios para funcionar:

| Campo | Descrição |
|-------|-----------|
| `agents.defaults.workspace` | Caminho absoluto para a pasta `workspace/` do projeto |
| `agents.defaults.model_name` | Nome do modelo padrão (ex: `groq-llama-3.3-70b`) |
| `model_list[].api_key` | Chave de API do provedor (Groq, OpenAI, etc.) |
| `channels.pico.enabled` | `true` para ativar o canal web |

---

## 🔄 Atualizando o projeto

Para atualizar para a versão mais recente do GitHub:

```bash
# Windows
git pull origin main
$env:CGO_ENABLED='0'; go build -tags "goolm,stdjson" -o picoclaw.exe ./cmd/picoclaw

# macOS
git pull origin main
CGO_ENABLED=0 go build -tags "goolm,stdjson" -o picoclaw ./cmd/picoclaw
# ou: make build
```

---

## 📁 Estrutura do Projeto

```
picoclawpeace/
├── cmd/picoclaw/        # Entrypoint principal
├── pkg/                 # Lógica do backend (agent loop, providers, channels)
├── web/frontend/        # Interface React (pnpm dev → localhost:5173)
├── workspace/           # Configuração do agente
│   ├── AGENT.md         # Instruções e permissões do agente
│   ├── SOUL.md          # Personalidade e valores
│   ├── USER.md          # Perfil do usuário
│   ├── skills/          # Skills disponíveis (marketing, coding, etc.)
│   └── cron/            # Tarefas agendadas
└── config/
    └── config.example.json  # Exemplo de configuração
```

---

## ❓ Problemas comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Agente responde "sou um modelo de linguagem" | `workspace` errado no config | Aponte `workspace` para a pasta com `AGENT.md` |
| Erro 429 (rate limit) | Múltiplos agentes usando o mesmo modelo | Mude agentes secundários para outro provedor (ex: Cerebras) |
| `build constraints exclude all Go files` | Faltam build tags | Use `-tags "goolm,stdjson"` no comando de build |
| `gh: command not found` | GitHub CLI não instalado | `brew install gh` (Mac) ou baixe em cli.github.com (Windows) |
