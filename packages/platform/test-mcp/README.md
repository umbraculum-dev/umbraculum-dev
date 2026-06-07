# @umbraculum/test-mcp

Small HTTP server exposing testing tools as JSON endpoints. Modeled on the same one-call JSON endpoint pattern used by agentic browser-MCP tooling (HTTP POST per tool + optional CLI), scoped to this repo's stack.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. This package landed under the new `@umbraculum/*` scope as the worked-example slot of sub-plan #9 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../../docs/design/brewery-scope-migration-plan.md) for the migration plan.

## What this is

A developer-tooling HTTP server (and matching CLI) that wraps a fixed set of testing primitives — stack smoke, fixture seed, vitest runner, contracts-check runner, Playwright runner, login-as-persona — into one-call endpoints. The primary consumer is the agentic browser-MCP layer (the agent driving the integrated Chrome) which calls these endpoints to set deterministic state before/after a UI run; the secondary consumer is CI / shell users who want the same primitives without HTTP. Every subprocess-spawning tool emits a deterministic run-dir under `var/test-runs/<ISO-timestamp>-<tool>/` whose layout matches the contract documented by the `agentic-browser-web-app` skill shipped with `umbraculum-node-react-cursor-assistant`, so MCP-driven and agent-driven artifacts land in the same place.

## Scope

- **Contains**: an HTTP server (port `MCP_PORT`, default `8932`) and a CLI mode (`--cli <tool>`) wrapping a fixed set of testing primitives — stack smoke, fixture seed, vitest runner, contracts-check runner, Playwright runner, login-as-persona — each emitting a deterministic run-dir under `var/test-runs/`.
- **Does not contain**: agent / browser-MCP layer code (that lives in the plugin-shipped `agentic-browser-web-app` skill); production-traffic primitives (this server is for *testing* tools and never authenticates — do not expose beyond localhost); the Playwright suite itself (lives in `apps/web/e2e/`).

## Why

- The agentic browser-MCP layer (me, driving the integrated Chrome) needs a few deterministic primitives it can call before/after a UI run: smoke, seed, run vitest, run Playwright, log in. Wrapping each as one HTTP route makes those one-line tool calls.
- Same primitives are CLI-callable (`tsx src/server.ts --cli <tool>`), so CI and shell users can use them without HTTP.
- The output contract under `var/test-runs/<ts>-<tool>/` is shared with the plugin-shipped `agentic-browser-web-app` skill so the agent and Playwright land artifacts in the same place. Brewery-specific job catalog: [`docs/AGENTIC-JOBS.md`](../../../docs/AGENTIC-JOBS.md).

## Tools

| Tool | Args | What it does |
|---|---|---|
| `smokeStack` | `{ baseUrl? }` | In-process port of `scripts/smoke.sh` (5 checks via `fetch()`). No `curl`/`jq` dependency, so it runs in any Node >=18 container (including `node:20-slim` and the api container). Writes the same `verdict.txt`/`log.jsonl` plus a per-check `summary.json`. The shell `scripts/smoke.sh` is retained for CI/ops; both implementations must stay semantically equivalent — if you add/remove a check in one, mirror it in the other. |
| `seedE2eFixture` | `{ clean? }` | Runs `docker compose exec api npm run seed:e2e [-- --clean]` |
| `runApiTests` | `{ filter? }` | Runs `docker compose exec api npm test` (vitest filter via `-t`) |
| `runContractsCheck` | `{ update? }` | Runs `npm run contracts:check` (or `contracts:update`) in the api container |
| `runPlaywrightSmoke` | `{ baseUrl? }` | Runs the Playwright `platform` project in a one-shot container |
| `runPlaywrightSpec` | `{ spec, baseUrl? }` | Runs a single Playwright spec (e.g. `platform/b2b-registered-auth.spec.ts`) |
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
docker compose exec api npx tsx /repo/packages/platform/test-mcp/src/server.ts
# (or run from host:)
docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/platform/test-mcp node:20-slim \
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
  --data '{"spec":"platform/b2b-registered-auth.spec.ts"}'

# What did the last smoke run produce?
curl -fsS "http://localhost:8932/lastRunArtifacts?tool=smoke"
```

## CLI usage

```bash
docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/platform/test-mcp node:20-slim \
  bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts --cli smokeStack"

docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/platform/test-mcp node:20-slim \
  bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts --cli runPlaywrightSpec --json '{\"spec\":\"platform/b2b-registered-auth.spec.ts\"}'"
```

## Cursor MCP wiring (manual; we don't touch your global config from this repo)

Add this entry to your Cursor MCP user config (typically `~/.cursor/mcp.json` or via Cursor Settings -> Tools & MCP -> Add MCP):

```json
{
  "mcpServers": {
    "umbraculum-test-mcp": {
      "command": "tsx",
      "args": [
        "/path/to/your/umbraculum-dev/packages/platform/test-mcp/src/server.ts"
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

This matches the run-dir layout documented in the `agentic-browser-web-app` skill shipped by `umbraculum-node-react-cursor-assistant`, so artifacts from MCP-driven runs and agent-driven browser runs land in the same place. The brewery-specific job catalog lives in [docs/AGENTIC-JOBS.md](../../../docs/AGENTIC-JOBS.md).

## Safety / bounds

- No tool writes outside `var/test-runs/` (which is in `.gitignore` already).
- No tool ever modifies `docker-compose.yml` (per the plugin-shipped `00-shared-no-unilateral-runner-compose-changes.mdc` rule).
- The HTTP server binds to `MCP_PORT` (default `8932`). It does not authenticate; do NOT expose it beyond localhost.

## Build / test / lint (local)

This package is invoked at runtime via `tsx` (no separate build step needed for the dev / agentic loop) and runs container-friendly per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`.

- **Run (HTTP server, in-stack)**: `docker compose exec api npx tsx /repo/packages/platform/test-mcp/src/server.ts` — see HTTP usage above for the `node:20-slim` host alternative.
- **Run (single CLI tool, host)**: `docker run --rm --network host -v "$PWD:/repo" -w /repo/packages/platform/test-mcp node:20-slim bash -lc "npm install --no-audit --no-fund && npx tsx src/server.ts --cli <tool>"` — see CLI usage above for full examples.
- **Test**: vitest is not configured in this workspace; the tools are exercised directly by the CI / agentic flows that consume them. See [`docs/TESTING.md`](../../../docs/TESTING.md) §"Layer map".
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed `noUncheckedIndexedAccess` in Phase 6b — fixing 4 latent index-out-of-bounds sites — and carries all 6 candidate strict flags after Phase 6h).

## How it fits in

- **Consumed by**: developer machines running agentic / scripted browser tests (the agent driving the integrated Chrome calls these endpoints to set up state); CI surfaces that need deterministic primitives without reproducing the smoke-script logic in YAML; ad-hoc shell users via `--cli`.
- **Depends on**: a running dev stack (`docker compose up -d`) for tools that exercise the API container (`runApiTests`, `runContractsCheck`, `seedE2eFixture`, `loginAs`); the Playwright Docker image at `mcr.microsoft.com/playwright:v1.60.0-noble` for `runPlaywrightSmoke` / `runPlaywrightSpec`.
- **Container-only**: per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`, all subprocess invocations target containers (`docker compose exec api …`, `docker run … node:20-slim`, Playwright image), never host Node.

## Status

The seven canonical tools (`smokeStack`, `seedE2eFixture`, `runApiTests`, `runContractsCheck`, `runPlaywrightSmoke`, `runPlaywrightSpec`, `loginAs`) are stable. The `lastRunArtifacts` read endpoint is stable. New tools may be added in the same shape (HTTP route + CLI route + run-dir output) without breaking existing callers; the run-dir layout is the contract, not the tool list.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/TESTING.md`](../../../docs/TESTING.md) — platform-wide test layer map
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/AGENTIC-JOBS.md`](../../../docs/AGENTIC-JOBS.md) — brewery-specific agentic job catalog (the plugin-skill caller for many of these tools)
- `agentic-browser-web-app` skill (shipped by `umbraculum-node-react-cursor-assistant`) — generic skill defining the run-dir contract this server implements
