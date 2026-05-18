# @brewery/web-e2e

Deterministic, headless end-to-end tests for `apps/web` (Playwright). Run via the official Playwright Docker image so the suite never depends on host npm or system Chromium.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../../docs/RENAME-DILIGENCE.md). The npm scope `@brewery/*` is parked pending sub-plan #9 ([`RENAME-DILIGENCE.md`](../../../docs/RENAME-DILIGENCE.md) §10); do not rewrite import paths.

## What this is

The web app's end-to-end test suite. It exercises real user flows against a fully-running stack — the `apps/web` Next.js server, the `services/api` Fastify service, and the Postgres primary/replica via pgpool — using deterministic seeded fixtures (`@brewery/web-e2e` shares persona definitions with `services/api/src/cli/seedE2eFixture.ts`). The suite runs in a one-shot Playwright container against the dev stack via `--network host`, which keeps `docker-compose.yml` untouched per the [no-unilateral-runner-compose-changes](../../../.cursor/rules/00-shared-no-unilateral-runner-compose-changes.mdc) rule. See [`docs/TESTING.md`](../../../docs/TESTING.md) for the platform-wide test layer map.

## Scope

- **Contains**: cross-page user-flow specs (smoke + brewday projects), persona-aware Playwright fixtures, centralized role/label locators (per the accessibility mandate in [`docs/DEVELOPMENT-ACCESSIBILITY.md`](../../../docs/DEVELOPMENT-ACCESSIBILITY.md)), axe-core a11y helpers, persisted per-persona storage state, HTML reporter wiring.
- **Does not contain**: API-level integration tests (those live in `services/api/src/tests/`), unit tests (vitest in each workspace), the `services/api` E2E seed itself (lives in `services/api/src/cli/seedE2eFixture.ts` — this suite *consumes* its output), Cypress / Selenium / WebdriverIO harness code (the project standardized on Playwright; see [`docs/TESTING.md`](../../../docs/TESTING.md)).

## Quick start

Prereqs (do these in order from repo root):

1. Stack up: `docker compose up -d`
2. Smoke gate: `./scripts/smoke.sh` (must exit 0)
3. Seed fixture (idempotent): `docker compose exec api npm run seed:e2e`

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
- **Container-only execution**: per the [`node-npm-container-only`](../../../.cursor/skills/node-npm-container-only.md) rule, the suite never runs against host Node / npm / Chromium.

## How it fits in

- **Consumed by**: CI (the typecheck workflow `.github/workflows/typecheck.yml`); developer machines for local regression validation; nightly E2E triage per the [`62-nightly-e2e-unattended`](../../../.cursor/rules/62-nightly-e2e-unattended.mdc) workflow rule.
- **Depends on**: a running dev stack (`docker compose up -d`); the seeded fixture output of `services/api`'s `seed:e2e` script; persona definitions kept in sync with `services/api/src/cli/seedE2eFixture.ts`.
- **Naming convention**: specs follow [`63-e2e-test-naming-convention`](../../../.cursor/rules/63-e2e-test-naming-convention.mdc) (b2c/b2b + guest/registered + action).

## Notes

- `docker-compose.yml` is **not** modified by anything in this suite (the [no-unilateral-runner-compose-changes](../../../.cursor/rules/00-shared-no-unilateral-runner-compose-changes.mdc) rule applies).
- Persona passwords default to the values in `personas.json`; override via `E2E_ADMIN_PASSWORD` / `E2E_MEMBER_PASSWORD` / `E2E_VIEWER_PASSWORD` env vars.
- The suite's tier marker is implicit (Tier: Public via the standard, since the README is part of the public-flip surface — see [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md)).

## Status

The suite carries **smoke** (always-on regression set) and **brewday** (brew-day flow coverage) projects today. Coverage of the AI-consultant surfaces, billing flows, and second-vertical configurations is on the H1 2027 trajectory per [`docs/ROADMAP.md`](../../../docs/ROADMAP.md); the existing harness (personas, fixtures, locators, axe) is shaped to absorb those flows without architectural changes.

## Further reading

- [`docs/TESTING.md`](../../../docs/TESTING.md) — platform-wide test layer map (unit / integration / contract / E2E)
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/DEVELOPMENT-ACCESSIBILITY.md`](../../../docs/DEVELOPMENT-ACCESSIBILITY.md) — accessibility constraints (a11y is a hard requirement; the suite enforces it via `support/axe.ts`)
