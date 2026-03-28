---
name: deploy
description: "Deploy web applications via Netlify CLI or Windsurf. Supports React, Next.js, Vite, and static sites. Requires NETLIFY_AUTH_TOKEN in environment."
metadata: {"nanobot":{"emoji":"🚀","requires":{"bins":["netlify","git"]},"install":[{"id":"brew","kind":"npm","package":"netlify-cli","bins":["netlify"],"label":"Install Netlify CLI (npm)"}]}}
---

# Deploy Skill

Realiza deploys de aplicações web via Netlify CLI ou outros provedores.

## Pré-requisitos

Configure no arquivo `.env` do PicoClaw:
```bash
NETLIFY_AUTH_TOKEN=nfp_xxx   # Token da Netlify
NETLIFY_SITE_ID=xxx          # ID do site (opcional, se já existir)
```

Obter token em: https://app.netlify.com/user/applications/personal

## Verificar autenticação

```bash
netlify status
```

## Deploy de um repositório local

```bash
cd ~/repos/NOME-DO-REPO

# Instalar dependências
npm install   # ou: pnpm install / yarn install

# Build
npm run build   # ou: pnpm build

# Deploy preview (testar antes)
netlify deploy --dir=dist

# Deploy em produção
netlify deploy --dir=dist --prod
```

## Criar novo site e fazer deploy

```bash
cd ~/repos/NOME-DO-REPO
netlify deploy --dir=dist --prod --site-name=meu-projeto
```

## Listar sites na Netlify

```bash
netlify sites:list
```

## Vincular repo GitHub a um site Netlify (deploy automático por push)

```bash
cd ~/repos/NOME-DO-REPO
netlify link --id <SITE_ID>
netlify env:set VARIAVEL valor   # configurar variáveis de ambiente
```

## Ver logs do último deploy

```bash
netlify deploy:list
netlify open:admin   # abre painel no browser
```

## Workflow completo: correção → deploy

1. Clonar o repo (usar skill github)
2. Fazer as correções no código
3. Commitar e fazer push para o GitHub
4. Deploy:

```bash
cd ~/repos/NOME-DO-REPO
npm install && npm run build
netlify deploy --dir=dist --prod
```

## Deploy via GitHub Actions (automático)

Se o repositório tiver GitHub Actions configurado:
```bash
# Após fazer push da correção
gh run list --repo OWNER/REPO --limit 3
gh run watch   # acompanhar o deploy em tempo real
```

## Verificar resultado do deploy

```bash
netlify open:site   # abre o site no browser
netlify status       # mostra URL e status do site
```
