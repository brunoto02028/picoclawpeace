---
name: email-workflow
description: Monitora emails do macOS Mail, analisa mensagens e prepara rascunhos aguardando aprovação do usuário antes de enviar.
---

# Workflow de Email — macOS Mail

## Como ler emails não lidos via AppleScript

Use a ferramenta `exec` para rodar AppleScript:

```bash
osascript << 'EOF'
tell application "Mail"
  set unreadMessages to {}
  repeat with acc in every account
    repeat with mb in every mailbox of acc
      set msgs to (messages of mb whose read status is false)
      repeat with m in msgs
        set msgInfo to {subject:(subject of m), sender:(sender of m), dateSent:(date sent of m), content:(content of m)}
        set end of unreadMessages to msgInfo
      end repeat
    end repeat
  end repeat
  return unreadMessages
end tell
EOF
```

## Como preparar um rascunho de resposta

Quando encontrar um email que precisa de resposta, use OBRIGATORIAMENTE este formato para apresentar ao usuário:

```
[EMAIL_DRAFT]
To: <endereço do remetente>
Subject: Re: <assunto original>
Body: <corpo da resposta redigida>
DraftId: draft-<timestamp>
[/EMAIL_DRAFT]
```

**REGRA**: Nunca envie o email diretamente. Sempre apresente o rascunho neste formato e aguarde o usuário clicar em "Enviar". Quando o usuário aprovar, use AppleScript para enviar:

```bash
osascript << 'EOF'
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"ASSUNTO", content:"CORPO"}
  tell newMsg
    make new to recipient at end of to recipients with properties {address:"DESTINATARIO"}
  end tell
  send newMsg
end tell
EOF
```

## Como configurar verificação horária (7h às 22h)

Use a ferramenta `cron` para agendar a verificação:
- Expressão cron: `0 7-22 * * *` (todo dia das 7h às 22h, na hora certa)
- Mensagem de trigger: "Verificar emails não lidos no macOS Mail, analisar e preparar rascunhos de resposta para emails importantes."

## Critérios para emails "importantes" que precisam de resposta

Considere importante se:
- Tem uma pergunta direta endereçada ao usuário
- Pede uma decisão ou aprovação
- Menciona urgência, prazo ou data limite
- É de um cliente, parceiro ou contato de negócios
- Tem assunto relacionado a projetos em andamento

## Conta de email padrão

- Conta iCloud: brunoazenhatonheta@icloud.com
- Verificar TODAS as contas configuradas no macOS Mail
