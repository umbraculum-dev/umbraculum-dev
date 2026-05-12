# Web E2E (Playwright)

Deterministic, headless E2E for `apps/web`. Run via the official Playwright Docker image so we never depend on host npm or system Chromium.

## Quick start

Prereqs (do these in order from repo root):

1. Stack up: `docker compose up -d`
2. Smoke gate: `./scripts/smoke.sh` (must exit 0)
3. Seed fixture (idempotent): `docker compose exec api npm run seed:e2e`

Run the suite from repo root:

```bash
docker run --rm --network host \
  -e E2E_BASE_URL=http://localhost:18080 \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm install --no-audit --no-fund && npx playwright test"
```

Single project (smoke only):

```bash
docker run --rm --network host \
  -e E2E_BASE_URL=http://localhost:18080 \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm install --no-audit --no-fund && npx playwright test --project=smoke"
```

Open the HTML report (after a run):

```bash
docker run --rm --network host \
  -v "$PWD/apps/web/e2e:/e2e" -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  npx playwright show-report
```

## Layout

| Path | Purpose |
|---|---|
| `playwright.config.ts` | projects (`smoke`, `brewday`), reporters, trace/screenshot policy |
| `personas.json` | single source of truth for E2E personas + fixture IDs (mirrors `services/api/src/cli/seedE2eFixture.ts`) |
| `support/personas.ts` | persona loader + storage-state path |
| `support/locators.ts` | centralized role/label locators (per a11y mandate) |
| `support/auth-fixture.ts` | per-persona `authenticatedContext` / `authenticatedPage` Playwright fixture |
| `support/axe.ts` | axe-core helper: `expectNoCriticalA11yViolations` |
| `smoke/*.spec.ts` | smoke flows (Phase 4b) |
| `brewday/*.spec.ts` | brew-day flows (Phase 4c) |
| `.auth/<persona>.json` | persisted storageState per persona (gitignored) |

## Notes

- `docker-compose.yml` is NOT modified (rule `00-shared-no-unilateral-runner-compose-changes.mdc`). We run a one-shot Playwright container against the existing dev stack via `--network host`.
- Persona passwords default to the values in `personas.json`; override via `E2E_ADMIN_PASSWORD` / `E2E_MEMBER_PASSWORD` / `E2E_VIEWER_PASSWORD` env vars.
- If a spec fails, open `test-results/<test-name>/trace.zip` with `npx playwright show-trace`.
