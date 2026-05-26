# Agentic browser jobs (umbraculum-dev)

Project-local catalog of jobs the agent can drive against the running umbraculum-dev stack via Cursor's integrated browser. This file is the single source of truth for `<JOB>` values referenced by the generic `agentic-browser-web-app` skill shipped by `umbraculum-node-react-cursor-assistant`.

Use this file with:

- the generic `agentic-browser-web-app` plugin skill — gives you the protocol/bounds/output contract,
- the `test-mcp-server` plugin skill — gives you the non-UI prerequisites (`smokeStack`, `seedE2eFixture`, `loginAs`),
- [`docs/TESTING.md`](TESTING.md) — gives you the deterministic layers (L1-L5) that must be green before invoking any agentic job.

Treat agentic jobs as **L6 / signal-only**. Never invoke a job if L3 smoke is red.

## Shared prerequisites for every job

- Stack is up: `docker compose ps` shows `web`, `api`, `nginx`, `postgres`, `redis` healthy.
- L3 smoke is green: `./scripts/smoke.sh` exit 0.
- E2E fixture is seeded: `docker compose exec api npm run seed:e2e` (idempotent).
- Persona: `e2e-admin` (`e2e-admin@brewery.local` / `e2e-admin-pw!`). See [`docs/TESTING.md`](TESTING.md) "E2E fixture identities" for the full table and the stable UUIDs.
- Output root: `var/test-runs/<UTC-timestamp>-<JOB>/`. Mandatory layout in the upstream skill.

## Jobs

Each job has a deterministic Playwright counterpart. The agentic version **EXPLORES** (free-form, can land on unexpected screens); the Playwright version **LOCKS IN** (one path, one assertion set).

### `agenticCreateRecipe`

- **Goal**: create a new BeerJSON recipe from scratch through the recipe edit UI.
- **Deterministic counterpart**: [`apps/web/e2e/brewday/recipe-create.spec.ts`](../apps/web/e2e/brewday/recipe-create.spec.ts) (API-only round-trip).
- **Steps**:
  1. Land on `/en/recipes`; verify the seeded `E2E Pale Ale` is visible in the list.
  2. Click "New recipe" (or equivalent CTA discovered via `getByRole('button', {name: /new recipe|create/i})`).
  3. Fill: name = `Agentic Test Recipe`, style = `Custom`, batch size = 20 L, one fermentable (Pale malt, 4.5 kg), one hop (Cascade, 30 g, 60 min boil), one culture (US-05).
  4. Save; navigate to the saved recipe; assert the recipe id is now in the URL and the form is prefilled with the values just entered.
  5. Delete the recipe via the UI (cleanup) OR record the id in `<RUN_DIR>/cleanup.txt` for a follow-up.
- **Pass criteria** (`verdict.txt = "pass"`):
  - Recipe detail page reachable after save.
  - Form repopulates with all four fields the agent typed.
  - No console errors with severity `error` while filling the form.

### `agenticBrewDay`

- **Goal**: start a brew session from the seeded recipe and walk it through `draft -> running -> stopped` with at least two step logs in between.
- **Deterministic counterpart**: [`apps/web/e2e/brewday/brew-session.spec.ts`](../apps/web/e2e/brewday/brew-session.spec.ts) (API-only lifecycle).
- **Steps**:
  1. Open the seeded recipe (`E2E Pale Ale`) at `/en/recipes/<fixtureRecipeId>` (see [`docs/TESTING.md`](TESTING.md) for the stable UUID).
  2. Click "Start brew session" (or equivalent CTA).
  3. From the brew session detail page, advance one mash step ("Mash-in") to running, then done.
  4. Advance one boil step ("Knockout") similarly.
  5. Stop the session; assert the brew log shows at least two completed steps with timestamps.
- **Pass criteria**:
  - Session moves from `draft -> running -> stopped` in the UI without manual reload tricks.
  - The two completed steps are visible in the brew log after stop.

### `agenticWaterCalcSanity`

- **Goal**: open the water hub for the seeded recipe and confirm predicted mash pH renders with the rule-of-thumb explainer, even when salt additions change.
- **Deterministic counterpart**: [`apps/web/e2e/smoke/water-calc.spec.ts`](../apps/web/e2e/smoke/water-calc.spec.ts) (page-load smoke + API hub summary).
- **Steps**:
  1. Open `/en/recipes/<fixtureRecipeId>/water` for `E2E Pale Ale`.
  2. Add 1.0 g of gypsum to the mash addition slot.
  3. Wait for the page to recompute; confirm "Predicted mash pH" appears with a numeric value in the 5.2-6.0 range.
  4. Confirm the rule-of-thumb explainer copy is shown (i18n key for the disclaimer).
  5. Change gypsum to 3.0 g; confirm the predicted mash pH delta is < 0.1 (heuristic; spot-checks the recompute pipeline).
- **Pass criteria**:
  - Both predicted mash pH values are finite numbers in `[5.2, 6.0]`.
  - The disclaimer text is visible after each recompute.

## "What to do when..."

- Login form rejected the persona password: re-run `seedE2eFixture` (passwords may have rotated via env vars).
- "E2E Pale Ale" recipe not visible in the list: re-run `seedE2eFixture`.
- Predicted mash pH renders `NaN` or `--`: the water hub backend likely failed; check `docker compose logs --tail=80 api` before retrying.
- Page hangs: stop the run, write `verdict.txt = "hang"`, attach the last screenshot path to the chat output, and let the developer triage.

## Adding a new job

1. Add a `### agenticXxx` section here with **Goal / Deterministic counterpart / Steps / Pass criteria** (mirror the existing three).
2. Ensure a deterministic Playwright counterpart exists or is on the roadmap; agentic-only flows accumulate flake.
3. The job ID is the only thing the agent quotes in chat. Do **not** rename existing jobs without coordinated test updates.
