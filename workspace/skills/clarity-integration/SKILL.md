# Skill: Clarity Integration

## Purpose
Send code proposals from PicoCloud to Clarity & Co (clarityco.co.uk) for human review and approval.
PicoCloud analyses the codebase locally, proposes improvements, and submits them via API.
Bruno reviews and approves proposals in the Clarity HQ dashboard.

## Config file
Location: `~/workspace/clarity-config.json` (gitignored, never commit real keys)

```json
{
  "baseUrl": "https://clarityco.co.uk",
  "apiKey": "picocloud_XXXXXXXXX",
  "webhookSecret": "XXXXXXXXX"
}
```

Alternatively set env vars: `CLARITY_API_KEY`, `CLARITY_BASE_URL`.

## API Endpoints

### Submit a proposal
```
POST /api/v1/picocloud/propose
Authorization: Bearer <apiKey>
Content-Type: application/json
```
Payload:
```json
{
  "filePath": "app/api/example/route.ts",
  "title": "Fix: short description",
  "reason": "Why this change is needed",
  "originalCode": "// original code",
  "proposedCode": "// improved code",
  "impact": "low | medium | high | critical",
  "source": "picocloud"
}
```
Response: `{ "id": "prop_xxx", "status": "pending", ... }`

### List proposals
```
GET /api/v1/picocloud/proposals
Authorization: Bearer <apiKey>
```

### Get proposal status
```
GET /api/v1/picocloud/proposals/:id
Authorization: Bearer <apiKey>
```
Response statuses: `pending` → `approved` → `deployed` (or `rejected`)

## How to submit a proposal (using exec + curl)

```bash
curl -s -X POST https://clarityco.co.uk/api/v1/picocloud/propose \
  -H "Authorization: Bearer $(jq -r .apiKey ~/workspace/clarity-config.json)" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "path/to/file.ts",
    "title": "Fix: description",
    "reason": "explanation",
    "originalCode": "...",
    "proposedCode": "...",
    "impact": "medium",
    "source": "picocloud"
  }'
```

## How to check proposal status
```bash
PROPOSAL_ID="prop_xxx"
curl -s https://clarityco.co.uk/api/v1/picocloud/proposals/$PROPOSAL_ID \
  -H "Authorization: Bearer $(jq -r .apiKey ~/workspace/clarity-config.json)"
```

## Workflow

1. Analyse the target repo or file locally with `read_file` / `list_dir`
2. Identify improvement (bug, performance, security, readability)
3. Draft the proposed change
4. Show Bruno a `diff`-style summary before submitting
5. Submit via `curl` or the Go client (`pkg/clarity/client.go`)
6. Save the returned `proposal_id` in `workspace/memory/MEMORY.md` under `## Clarity Proposals`
7. Poll status with GET endpoint if Bruno asks for an update
8. When `approved`, Bruno deploys on the Clarity side — no action needed from PicoCloud

## Impact guide
| Impact | When to use |
|--------|-------------|
| `low` | Cosmetic, typos, minor refactor |
| `medium` | Logic improvement, DX, test coverage |
| `high` | Bug fix, security patch, perf gain |
| `critical` | Data loss risk, auth bypass, crash |

## Rules
- Always show Bruno the diff before submitting — never submit without confirmation
- Never include secrets or env values in `originalCode` or `proposedCode`
- One proposal per file per submission (split multi-file changes)
- `source` must always be `"picocloud"`
