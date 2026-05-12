# @brewery/test-mcp

Small HTTP server exposing brewery-app testing tools as JSON endpoints. Modeled on the agentic MCP server in `~/dkprojects/thesiteup/e2e/e2e-app/playwright-suite/scripts/agentic/mcp-server.ts`, scoped to this repo's stack.

## Why

- The agentic browser-MCP layer (me, driving the integrated Chrome) needs a few deterministic primitives it can call before/after a UI run: smoke, seed, run vitest, run Playwright, log in. Wrapping each as one HTTP route makes those one-line tool calls.
- Same primitives are CLI-callable (`tsx src/server.ts --cli <tool>`), so CI and shell users can use them without HTTP.
- The output contract under `var/test-runs/<ts>-<tool>/` is shared with `.cursor/skills/agentic-browser-web-app.md` (upstream skill) so the agent and Playwright land artifacts in the same place. Brewery-specific job catalog: [`docs/agentic-jobs.md`](../../docs/agentic-jobs.md).

## Tools

| Tool | Args | What it does |
|---|---|---|
| `smokeStack` | `{ baseUrl? }` | In-process port of `scripts/smoke.sh` (5 checks via `fetch()`). No `curl`/`jq` dependency, so it runs in any Node >=18 container (including `node:20-slim` and the api container). Writes the same `verdict.txt`/`log.jsonl` plus a per-check `summary.json`. The shell `scripts/smoke.sh` is retained for CI/ops; both implementations must stay semantically equivalent — if you add/remove a check in one, mirror it in the other. |
| `seedE2eFixture` | `{ clean? }` | Runs `docker compose exec api npm run seed:e2e [-- --clean]` |
| `runApiTests` | `{ filter? }` | Runs `docker compose exec api npm test` (vitest filter via `-t`) |
| `runContractsCheck` | `{ update? }` | Runs `npm run contracts:check` (or `contracts:update`) in the api container |
| `runPlaywrightSmoke` | `{ baseUrl? }` | Runs the Playwright `smoke` project in a one-shot container |
| `runPlaywrightSpec` | `{ spec, baseUrl? }` | Runs a single Playwright spec (e.g. `smoke/auth.spec.ts`) |
| `loginAs` | `{ persona?, baseUrl? }` | Hits `POST /api/auth/login/native`, returns `{ token, cookie, activeWorkspaceId }` |

Plus the read-only convenience endpoint:

- `GET /lastRunArtifacts?tool=<tool>` -> `{ runDir, verdict, logLines, files }` for the most recent run.

### Response shape

POST responses from any subprocess/fetch-based tool are enriched server-side with the run-dir summary, so a caller does not need a second round trip to know whether the run passed semantically:

```json
{
  "ok": true,
  "runDir": "/repo/var/test-runs/<ts>-smoke",
  "exitCode": 0,
  "stdoutTail": "...",
  "stderrTail": "...",
  "verdict": "pass",
  "logLines": 2,
  "files": ["verdict.txt", "log.jsonl", "stdout.log", "stderr.log", "summary.json"]
}
```

`loginAs` does not produce a run-dir, so its response is unchanged (`{ ok, token, cookie, activeWorkspaceId }`). The CLI mode (`--cli <tool>`) emits the same enriched JSON to stdout.

## HTTP usage

```bash
# Start the server
docker compose exec api npx tsx /repo/packages/test-mcp/src/server.ts
# (or run from host:)
docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/test-mcp node:20-slim \
  bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts"

# Smoke
curl -fsS -X POST http://localhost:8932/smokeStack -d '{}' -H 'content-type: application/json'

# Login as e2e-admin
curl -fsS -X POST http://localhost:8932/loginAs \
  -H 'content-type: application/json' \
  --data '{"persona":"e2e-admin"}'

# Run a single Playwright spec
curl -fsS -X POST http://localhost:8932/runPlaywrightSpec \
  -H 'content-type: application/json' \
  --data '{"spec":"smoke/auth.spec.ts"}'

# What did the last smoke run produce?
curl -fsS "http://localhost:8932/lastRunArtifacts?tool=smoke"
```

## CLI usage

```bash
docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/test-mcp node:20-slim \
  bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts --cli smokeStack"

docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/test-mcp node:20-slim \
  bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts --cli runPlaywrightSpec --json '{\"spec\":\"smoke/auth.spec.ts\"}'"
```

## Cursor MCP wiring (manual; we don't touch your global config from this repo)

Add this entry to your Cursor MCP user config (typically `~/.cursor/mcp.json` or via Cursor Settings -> Tools & MCP -> Add MCP):

```json
{
  "mcpServers": {
    "brewery-test-mcp": {
      "command": "tsx",
      "args": [
        "/home/rf/dkprojects/rfapps/brewery-app/packages/test-mcp/src/server.ts"
      ]
    }
  }
}
```

(Adjust the absolute path to your local checkout. Per the no-host-npm rule, run via `docker run ... node:20-slim` if you don't have tsx available on the host.)

## Output contract

Every subprocess-spawning tool writes to:

```
var/test-runs/<ISO-timestamp>-<tool>/
  verdict.txt     # "pass" or "fail: <reason>"
  log.jsonl       # structured per-step log
  stdout.log
  stderr.log
  summary.json    # smokeStack only: per-check status and details
```

This matches the run-dir layout documented in [.cursor/skills/agentic-browser-web-app.md](../../.cursor/skills/agentic-browser-web-app.md) (upstream skill), so artifacts from MCP-driven runs and agent-driven browser runs land in the same place. The brewery-specific job catalog lives in [docs/agentic-jobs.md](../../docs/agentic-jobs.md).

## Safety / bounds

- No tool writes outside `var/test-runs/` (which is in `.gitignore` already).
- No tool ever modifies `docker-compose.yml` (per rule `00-shared-no-unilateral-runner-compose-changes.mdc`).
- The HTTP server binds to `MCP_PORT` (default `8932`). It does not authenticate; do NOT expose it beyond localhost.
