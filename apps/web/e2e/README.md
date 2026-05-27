# @umbraculum/web-e2e

Deterministic, headless end-to-end tests for `apps/web` (Playwright). Run via the official Playwright Docker image so the suite never depends on host npm or system Chromium.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

The web app's end-to-end test suite. It exercises real user flows against a fully-running stack — the `apps/web` Next.js server, the `services/api` Fastify service, and the Postgres primary/replica via pgpool — using deterministic seeded fixtures (`@umbraculum/web-e2e` shares persona definitions with `services/api/src/cli/seedE2eFixture.ts`). The suite runs in a one-shot Playwright container against the dev stack via `--network host`, which keeps `docker-compose.yml` untouched per the plugin-shipped `00-shared-no-unilateral-runner-compose-changes.mdc` rule. See [`docs/TESTING.md`](../../../docs/TESTING.md) for the platform-wide test layer map.

## Scope

- **Contains**: cross-page user-flow specs (smoke + brewday projects), persona-aware Playwright fixtures, centralized role/label locators (per the accessibility mandate in [`docs/DEVELOPMENT-ACCESSIBILITY.md`](../../../docs/DEVELOPMENT-ACCESSIBILITY.md)), axe-core a11y helpers, persisted per-persona storage state, HTML reporter wiring.
- **Does not contain**: API-level integration tests (those live in `services/api/src/tests/`), unit tests (vitest in each workspace), the `services/api` E2E seed itself (lives in `services/api/src/cli/seedE2eFixture.ts` — this suite *consumes* its output), Cypress / Selenium / WebdriverIO harness code (the project standardized on Playwright; see [`docs/TESTING.md`](../../../docs/TESTING.md)).

## Quick gates before Playwright

Run from **repo root** in order before any Playwright invocation (smoke, brewday, MRP/CRP export). Stop on the first failure.

```bash
docker compose up -d api web gotenberg redis   # gotenberg+redis required for export/render specs
./scripts/smoke.sh
curl -sf http://localhost:18080/api/health | grep -q '"ok":true' \
  || { echo "FAIL: API unhealthy (502?)"; exit 1; }
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:18080/en/login | grep -q '^200$' \
  || { echo "FAIL: web login not 200 (500?)"; exit 1; }
docker compose exec api npm run seed:e2e
# After stack recovery: rm -f apps/web/e2e/.auth/e2e-admin.json
```

MRP/CRP export troubleshooting (502/500/seed/password): [`docs/design/mrp-crp-alpha-demo-walkthrough.md`](../../../docs/design/mrp-crp-alpha-demo-walkthrough.md). Platform layer map: [`docs/TESTING.md`](../../../docs/TESTING.md) § L5.

## Quick start

Prereqs: complete [Quick gates](#quick-gates-before-playwright) above.

Run the full suite from repo root:

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
  -e E2E_ADMIN_PASSWORD="${E2E_ADMIN_PASSWORD:-e2e-admin-pw!}" \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm install --no-audit --no-fund && npx playwright test --project=smoke"
```

MRP/CRP export smoke only (`smoke/mrp-crp-export-alpha.spec.ts` — needs **gotenberg** + **redis**):

```bash
docker run --rm --network host \
  -e E2E_BASE_URL=http://localhost:18080 \
  -e E2E_ADMIN_PASSWORD="${E2E_ADMIN_PASSWORD:-e2e-admin-pw!}" \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm install --no-audit --no-fund && npx playwright test --project=smoke smoke/mrp-crp-export-alpha.spec.ts --workers=1"
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
| `support/locators.ts` | centralized role/label locators (per the accessibility mandate) |
| `support/auth-fixture.ts` | per-persona `authenticatedContext` / `authenticatedPage` Playwright fixture |
| `support/axe.ts` | axe-core helper: `expectNoCriticalA11yViolations` |
| `smoke/*.spec.ts` | smoke flows |
| `brewday/*.spec.ts` | brew-day flows |
| `.auth/<persona>.json` | persisted storageState per persona (gitignored) |

## Build / test / lint (local)

- **Test (full suite)**: see Quick start above. Always run from repo root.
- **Test (single spec)**: replace `npx playwright test` with `npx playwright test smoke/auth.spec.ts` in the docker invocation.
- **Trace inspection**: when a spec fails, `test-results/<test-name>/trace.zip` is produced; open with the `playwright show-trace` route in Quick start.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed in Phase 5, commit `aab5b41`).
- **Container-only execution**: per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`, the suite never runs against host Node / npm / Chromium.

## How it fits in

- **Consumed by**: CI (the typecheck workflow `.github/workflows/typecheck.yml`); developer machines for local regression validation; nightly E2E triage per the plugin-shipped `62-nightly-e2e-unattended.mdc` workflow rule.
- **Depends on**: a running dev stack (`docker compose up -d`); the seeded fixture output of `services/api`'s `seed:e2e` script; persona definitions kept in sync with `services/api/src/cli/seedE2eFixture.ts`.
- **Naming convention**: specs follow the plugin-shipped `63-e2e-test-naming-convention.mdc` rule (b2c/b2b + guest/registered + action).

## Notes

- `docker-compose.yml` is **not** modified by anything in this suite (the plugin-shipped `00-shared-no-unilateral-runner-compose-changes.mdc` rule applies).
- Persona passwords default to the values in `personas.json`; override via `E2E_ADMIN_PASSWORD` / `E2E_MEMBER_PASSWORD` / `E2E_VIEWER_PASSWORD` env vars. **The api `seed:e2e` script hashes the same env vars** — if login times out in Playwright, confirm seed ran and pass `-e E2E_ADMIN_PASSWORD=…` into the Playwright `docker run` to match the api container. Delete stale `apps/web/e2e/.auth/<persona>.json` after a password change.
- The suite's tier marker is implicit (Tier: Public via the standard, since the README is part of the public-flip surface — see [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md)).

## Status

The suite carries **smoke** (always-on regression set) and **brewday** (brew-day flow coverage) projects today. Coverage of the AI-consultant surfaces, billing flows, and second-vertical configurations is on the H1 2027 trajectory per [`docs/ROADMAP.md`](../../../docs/ROADMAP.md); the existing harness (personas, fixtures, locators, axe) is shaped to absorb those flows without architectural changes.

## Further reading

- [`docs/TESTING.md`](../../../docs/TESTING.md) — platform-wide test layer map (unit / integration / contract / E2E)
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/DEVELOPMENT-ACCESSIBILITY.md`](../../../docs/DEVELOPMENT-ACCESSIBILITY.md) — accessibility constraints (a11y is a hard requirement; the suite enforces it via `support/axe.ts`)
