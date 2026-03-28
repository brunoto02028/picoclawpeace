---
name: apple-mail
description: >
  Skill for reading, replying, organizing, and managing emails in Apple Mail
  using AppleScript via the exec tool.
---

# Apple Mail Skill

You have full access to the user's Apple Mail via AppleScript (osascript).
Use the `exec` tool with `action: "run"` and `command: "osascript -e '...'"` for all Mail operations.

## IMPORTANT — macOS Permissions
If Mail is not open, open it first:
```
osascript -e 'tell application "Mail" to activate'
```
If permission is denied, tell the user to go to:
**System Preferences → Privacy & Security → Automation** → enable picoclaw to control Mail.

---

## Read Unread Emails
```applescript
osascript <<'EOF'
tell application "Mail"
  set unreadMessages to (messages of inbox whose read status is false)
  set output to ""
  repeat with i from 1 to count of unreadMessages
    set msg to item i of unreadMessages
    set output to output & "From: " & (sender of msg) & return
    set output to output & "Subject: " & (subject of msg) & return
    set output to output & "Date: " & ((date received of msg) as string) & return
    set output to output & "---" & return
  end repeat
  return output
end tell
EOF
```

## Read Full Email Content
```applescript
osascript <<'EOF'
tell application "Mail"
  set msg to first message of inbox
  set msgContent to content of msg
  set msgFrom to sender of msg
  set msgSubject to subject of msg
  return "From: " & msgFrom & return & "Subject: " & msgSubject & return & return & msgContent
end tell
EOF
```

## List All Mailboxes/Folders
```applescript
osascript -e 'tell application "Mail" to get name of every mailbox'
```

## Create a New Mailbox (Folder)
```applescript
osascript -e 'tell application "Mail" to make new mailbox with properties {name:"NomeDaPasta"}'
```

## Move Email to Folder
```applescript
osascript <<'EOF'
tell application "Mail"
  set targetMailbox to mailbox "NomeDaPasta"
  set msg to first message of inbox
  move msg to targetMailbox
end tell
EOF
```

## Move All Emails Matching Subject to Folder
```applescript
osascript <<'EOF'
tell application "Mail"
  set targetMailbox to mailbox "Promoções"
  set msgs to (messages of inbox whose subject contains "Promoção")
  repeat with msg in msgs
    move msg to targetMailbox
  end repeat
end tell
EOF
```

## Reply to an Email
```applescript
osascript <<'EOF'
tell application "Mail"
  set msg to first message of inbox
  set replyMsg to reply msg opening window yes
  tell replyMsg
    set content to "Olá, obrigado pelo contato. Responderei em breve."
  end tell
  send replyMsg
end tell
EOF
```

## Send a New Email
```applescript
osascript <<'EOF'
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"Assunto aqui", content:"Corpo do email aqui", visible:true}
  tell newMsg
    make new to recipient at end of to recipients with properties {address:"destino@email.com"}
  end tell
  send newMsg
end tell
EOF
```

## Mark All as Read
```applescript
osascript <<'EOF'
tell application "Mail"
  set read status of (messages of inbox whose read status is false) to true
end tell
EOF
```

## Delete an Email
```applescript
osascript <<'EOF'
tell application "Mail"
  set msg to first message of inbox
  delete msg
end tell
EOF
```

## Search Emails by Sender
```applescript
osascript <<'EOF'
tell application "Mail"
  set matches to (messages of inbox whose sender contains "exemplo@gmail.com")
  set output to (count of matches) & " emails found" as string
  return output
end tell
EOF
```

## Get Emails from Last 7 Days
```applescript
osascript <<'EOF'
tell application "Mail"
  set cutoff to (current date) - (7 * days)
  set recentMsgs to (messages of inbox whose date received >= cutoff)
  set output to (count of recentMsgs) & " emails nos últimos 7 dias" as string
  return output
end tell
EOF
```

---

## Workflow: Organize Inbox by Category
1. Create folders (Trabalho, Pessoal, Promoções, Newsletters, etc.)
2. list emails from inbox
3. For each email, analyze sender/subject and move to appropriate folder
4. Mark newsletters/promos as read

Always confirm with the user before deleting emails.
Always ask before sending/replying on behalf of the user.
