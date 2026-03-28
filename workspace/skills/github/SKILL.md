---
name: github
description: "Full GitHub workflow: clone repos, read/edit files, commit, push, open PRs, check CI. Uses `gh` CLI and `git`. GITHUB_TOKEN must be set in .env."
metadata: {"nanobot":{"emoji":"🐙","requires":{"bins":["gh","git"]},"install":[{"id":"brew","kind":"brew","formula":"gh","bins":["gh"],"label":"Install GitHub CLI (brew)"}]}}
---

# GitHub Skill

Usa o `gh` CLI e `git` para interagir com repositórios do usuário.
O token de acesso deve estar configurado via `gh auth login` ou `GITHUB_TOKEN` no ambiente.

## Listar repositórios do usuário

```bash
gh repo list --limit 50 --json name,url,description,updatedAt \
  --jq '.[] | "\(.name) — \(.description // "sem descrição")"'
```

## Clonar um repositório

```bash
# Clona na pasta ~/repos/<nome>
gh repo clone OWNER/REPO ~/repos/REPO
cd ~/repos/REPO
```

## Ler arquivo de um repositório (sem clonar)

```bash
gh api repos/OWNER/REPO/contents/path/to/file \
  --jq '.content' | base64 -d
```

## Fazer correções e commit

```bash
cd ~/repos/REPO

# Criar branch para a correção
git checkout -b fix/nome-da-correcao

# Editar arquivo
# (use ferramentas de edição de arquivo do agente)

# Verificar o que mudou
git diff

# Commitar
git add -A
git commit -m "fix: descrição da correção"

# Enviar para o GitHub
git push origin fix/nome-da-correcao
```

## Abrir Pull Request

```bash
gh pr create \
  --title "fix: descrição da correção" \
  --body "Correção aplicada pelo agente PicoClaw." \
  --repo OWNER/REPO
```

## Verificar status de CI

```bash
gh pr checks <PR_NUMBER> --repo OWNER/REPO
gh run list --repo OWNER/REPO --limit 5
gh run view <run-id> --repo OWNER/REPO --log-failed
```

## Issues

```bash
# Listar issues abertas
gh issue list --repo OWNER/REPO --state open

# Criar issue
gh issue create --title "Título" --body "Descrição" --repo OWNER/REPO
```

## API direta

```bash
gh api repos/OWNER/REPO/pulls/55 --jq '.title, .state, .user.login'
gh issue list --repo OWNER/REPO --json number,title --jq '.[] | "\(.number): \(.title)"'
```

## Autenticação

Se o `gh` não estiver autenticado:
```bash
gh auth login
# ou configure GITHUB_TOKEN no arquivo .env do PicoClaw
```

## Workflow completo para correção

1. Listar repos: `gh repo list`
2. Clonar o repo: `gh repo clone OWNER/REPO ~/repos/REPO`
3. Criar branch: `git checkout -b fix/descricao`
4. Editar os arquivos necessários
5. Verificar: `git diff`
6. Commit e push: `git add -A && git commit -m "fix: ..." && git push origin fix/descricao`
7. Abrir PR: `gh pr create --title "..." --body "..."`
