# Skill: Clarity Integration

## Purpose
Send code proposals from PicoCloud to Clarity & Co (clarityco.co.uk) for human review and approval.
PicoCloud analyses the codebase locally, proposes improvements, and submits them via API.
Bruno reviews and approves proposals in the Clarity HQ dashboard.

## Target repository (Clarity codebase)
The repository to analyse and send proposals for is:
- **GitHub:** `https://github.com/brunoto02028/homeledge`
- **Live site:** `https://clarityco.co.uk`
- Clone locally with: `gh repo clone brunoto02028/homeledge ~/repos/homeledge`

Do NOT confuse this with other repos (e.g. `clinic`, `picoclawpeace`).
Only analyse `homeledge` when the user asks for Clarity-related proposals.

## Authentication — IMPORTANT
**There is NO `clarity login` command. Do NOT ask Bruno for credentials.**
The API key is already configured and ready to use in:
`C:\Bruno Projetos\picoclawpeace\workspace\clarity-config.json`

Read it with:
```bash
type "C:\Bruno Projetos\picoclawpeace\workspace\clarity-config.json"
```
Or on Linux/Mac:
```bash
cat ~/workspace/clarity-config.json
```

The `apiKey` field in that file is the Bearer token for all API calls.
Pass it as: `Authorization: Bearer <value of apiKey field>`

## Config file
Location: `C:\Bruno Projetos\picoclawpeace\workspace\clarity-config.json` (gitignored, never commit real keys)

```json
{
  "baseUrl": "https://clarityco.co.uk",
  "apiKey": "clr_live_picocloud_...",
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

## STRICT: Anti-hallucination rules (MUST follow)
- **NEVER claim a proposal was submitted** unless the `curl` command actually ran and returned a real `proposal_id` (e.g. `prop_xxx`) in the JSON response. Show the raw response to Bruno.
- **NEVER claim you pushed to GitHub** as part of this workflow. This skill does NOT involve `git push` or any GitHub commit. Proposals go to the Clarity API only.
- **NEVER write a .md file and call it a "proposal"**. A proposal only exists when the Clarity API returns an `id`. A local file is not a proposal.
- If the API call fails or returns an unexpected response (e.g. HTML, redirect, error), report the exact HTTP status and body to Bruno — do not pretend it succeeded.
- If `clarity-config.json` is missing or the `apiKey` is still `picocloud_XXXXXXXXX`, stop and ask Bruno to configure the key before proceeding.
