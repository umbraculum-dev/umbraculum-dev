# Testing strategy (umbraculum-dev)

This is the single source of truth for "what do I test, where, and how" in this monorepo. Read it before adding a new test or asking the agent to add one. Pair with [TESTING-DECISION.md](TESTING-DECISION.md) (decision tree) if you can't decide which layer applies.

**Status:** v1.14 (test-coverage hardening pass — Phase 1 + Phase 2 + Phase 3 + Phase 4a + **all 5 Phase 4b sub-phases** + **Phase 5a (`packages/core` L1 audit + gap-fix)** + **all 5 Phase 5b sub-phases (waterCalc L1: 9 files — `saltAdditions`, `residualAlkalinity`, `mashPhEstimateV1`, `mashPhEstimate`, `mashAcidificationManual`, `mashAcidificationTargetMashPh`, `spargeAcidification`, `spargeAcidificationManual`, `overall`)** landed 2026-05-17/18; see [Coverage audit + hardening pass](#coverage-audit--hardening-pass-2026-05-17) below). **🎉 The test-coverage hardening slice is now COMPLETE** for all non-deferred phases. Phase 4d (role-based ACL coverage) remains deferred pending the ACL-wiring architectural decision. The foundation-hardening pass ahead of the H1 2027 public-AGPLv3 flip ([`docs/ROADMAP.md`](ROADMAP.md)) has four slices: lint ✅ landed, **tests ✅ landed (Phases 1-5)**, types ✅ **Phases 1 + 2 + 3a + 3b + 4 + 5 + 6a + 6b + 6c + 6e + 6f + 6g + 6h landed 2026-05-18 — slice feature-complete: all 6 candidate strict flags (`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`) now enabled across all 13 CI-gated workspaces** (see [`docs/TYPING.md`](TYPING.md) — baselined `tsc --noEmit` across all 15 workspaces via the canonical one-off `node:20-slim` container method matching the existing `apps/native` CI gate; **13 clean, 2 failing with 610 errors total — all in the Tamagui-accepted class** (apps/web 585, packages/ui 25 per TAMAGUI.md). Phase 3a fixed 5 errors I authored during the test-coverage hardening pass (Phases 5b/5b-5) that vitest didn't catch because esbuild transpiles without type-checking — pinning the corollary that **the L1+L2 test layers are not a substitute for `tsc --noEmit`**. Phase 3b fixed the remaining 14 services/api production-code errors across 4 issue classes (Prisma `Json` typing, Prisma `Where` unification, transaction-lambda de-narrowing, `UnitConversionWarning` shape) — **and uncovered a latent cross-workspace data-leak bug in `/ingredients/*` search** that the type-driven refactor also fixed (the original spread-based `where` silently overwrote the workspace-scoping `OR` with the search-query `OR` when both were present). All 400 services/api vitest tests stayed green. Phase 4 added the `typecheck` npm script to `apps/web/package.json` and pinned the explicit apps/web accept-vs-fix decision: apps/web stays OUT of the Phase 5 CI typecheck gate (the 585 errors are all Tamagui-class noise per TAMAGUI.md; gating them produces no signal and locks in the noise count, harming future Tamagui upgrades). Phase 5 added `.github/workflows/typecheck.yml` — a single-job CI workflow that runs `tsc --noEmit` across the 13 clean workspaces inside one `node:20-slim` container (canonical method); sequential per-workspace invocation with explicit pass/fail aggregation so all 13 results are reported even on early failure; local simulation green, ~33s wall + ~30s `npm install` = ~63s CI total. **The types slice now has the same regression-guard discipline as the lint slice (web-lint.yml) and the test slice (api.yml).** Phase 6a enabled `noImplicitOverride` in all 14 leaf tsconfigs (truly free) + `noPropertyAccessFromIndexSignature` in 7 truly-free workspaces (api-client, i18n, i18n-react, media, navigation, recipes-ui, ui). **The Phase 1 pilot data was wrong for 3 of 4 candidate flags** — pilot sampled only 8 small workspaces and missed index-signature-heavy ones (services/api Fastify, packages/contracts Prisma); corrected canonical baseline now published in TYPING.md. Phases 6b/6c (next: partial rollouts of `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` in their respective truly-free workspaces) + 6e/6f/6g (defer non-free workspace remediation) pending), docs 🟡 not started. The "what to test" framework below is unchanged; the audit + phase log are new.

## Layers (cheapest to most expensive)

| Layer | Tool | Where | When it runs | What it catches |
|---|---|---|---|---|
| L1 Unit | vitest | `packages/contracts`, `packages/core` | every push, < 5s | parser regressions, math regressions, unit conversions |
| L2 API integration | vitest + Prisma + Postgres | `services/api/src/tests/*.test.ts` | every push (CI) | route behavior, ACL, workspace scoping, BeerJSON round-trips |
| L3 Smoke | bash + curl | `scripts/smoke.sh` | pre-push, post-`compose up`, in `@umbraculum/test-mcp` | nginx -> web -> api -> postgres path is alive |
| L4 BeerJSON contract snapshots | vitest (shape-based) | `services/api/src/tests/contracts/*.snap.test.ts` | every push (CI) | native-consumed response shape drift |
| L5 Web E2E (deterministic) | Playwright headless + axe | `apps/web/e2e/` | PR-triggered CI, on demand | UI flows, locale routing, a11y critical violations |
| L6 Agentic browser E2E | Cursor browser-MCP + `@umbraculum/test-mcp` | on demand only | when investigating, exploring, or extending L5 | unknown unknowns, "something feels off" |

Each layer is a **gate** for the one above: don't reach for L6 until L1-L5 are green.

## Verification tiers (T0 / T1 / T2)

Layers describe **what** to test; [VERIFICATION-TIERS.md](VERIFICATION-TIERS.md) describes **how much** to run for a given change:

| Tier | Maps to layers | Entry command |
|------|----------------|---------------|
| T0 | L1, quick API unit | `npm run verify:*` with `--tier T0`, or `docker compose exec api npm run test:unit` |
| T1 | L1–L4 scoped | `npm run verify:from-diff`, `npm run verify:openapi`, etc. |
| T2 | ci-parity + GHA `api.yml` | `npm run verify:pre-push` + **`api-integration-tests-pre-push`** skill |

See [VERIFICATION-TIERS.md](VERIFICATION-TIERS.md) for the full change-surface matrix.

## What goes in each layer

### L1 - Unit (`packages/contracts`, `packages/core`)

Pure functions. No DB, no Fastify, no network. If you add or rename a field in:

- [packages/contracts/src/water/parseComputeAndSave.ts](../packages/contracts/src/water/parseComputeAndSave.ts)
- [packages/contracts/src/water/parseHubSummary.ts](../packages/contracts/src/water/parseHubSummary.ts)
- [packages/contracts/src/analysis/parseGravityAnalysis.ts](../packages/contracts/src/analysis/parseGravityAnalysis.ts)
- [packages/core/src/gravity.js](../packages/core/src/gravity.js) or [packages/core/src/units](../packages/core/src/units)

...you MUST add a vitest case in the same package under `src/**/*.test.ts`.

Run inside Docker (no host npm — see the plugin-shipped `00-shared-node-npm-container-only.mdc` rule).

**Use scoped installs** for L1 (do **not** run a repo-wide
`--workspaces` install from a one-shot `node:20-slim` container): the
default `--workspaces` install reuses the root `package-lock.json` and
will prune a **bind-mounted** api `node_modules` tree. The api service now uses a **named volume** (`umbraculum_api_node_modules`); scoped one-shots should use `./scripts/docker-npm-run.sh -r` so root hoist lands in `umbraculum_root_node_modules`. See [`DEVELOPMENT-NPM-VOLUMES.md`](DEVELOPMENT-NPM-VOLUMES.md). Install only the packages you actually want to
test:

```bash
./scripts/docker-npm-run.sh -r \
  'npm install --no-audit --no-fund --prefer-offline -w @umbraculum/contracts -w @umbraculum/brewery-core --include-workspace-root && \
   npm test -w @umbraculum/contracts && npm test -w @umbraculum/brewery-core'
```

Notes:
- `-w @umbraculum/contracts -w @umbraculum/brewery-core` scopes installation to just
  those two workspaces (plus their hoistable deps) and leaves
  `services/api/node_modules` and `apps/web/node_modules` alone.
- `--include-workspace-root` is required so the root devDependency
  (vitest) is also installed for the workspaces to use.
- If the api container's `node_modules` ever gets pruned anyway (e.g.
  because someone else ran a `--workspaces` install), recover with
  `docker compose exec api npm install --no-audit --no-fund`.

### L2 - API integration

Lives in [services/api/src/tests](../services/api/src/tests). Already has 20+ specs against a real `brewapp_test` Postgres. Use the existing `createSessionForTestUser` helper at [services/api/src/tests/helpers/session.ts](../services/api/src/tests/helpers/session.ts) for auth.

**Unit vs integration split** (T0 fast path — no DB migrate reset):

```bash
docker compose exec api npm run test:unit          # openapi artifact, entitlements, promptComposer, …
docker compose exec api npm run test:integration  # full suite; runs test:db:prepare once via vitest globalSetup
docker compose exec api npm test                  # alias for test:integration (CI-compatible)
```

Scoped integration (T1):

```bash
docker compose exec api ./node_modules/.bin/vitest run src/tests/authSessions.test.ts
npm run verify:openapi
```

Full integration (T2 / CI):

```bash
docker compose exec api npm test
```

### L3 - Smoke

A single bash script at [scripts/smoke.sh](../scripts/smoke.sh) that confirms the stack is reachable end-to-end:

- `GET /api/health` -> 200
- `GET /en/` -> 200
- `POST /api/auth/login/native` with the E2E admin persona -> token
- `GET /api/auth/me` -> has `activeWorkspaceId`
- `POST /api/auth/logout` -> 200

Exit codes: `0` healthy, `1` smoke failure, `2` stack not up.

Run:

```bash
./scripts/smoke.sh                  # default localhost:18080
./scripts/smoke.sh http://other-host:18080
```

### L4 - BeerJSON contract snapshots

Lives in [services/api/src/tests/contracts](../services/api/src/tests/contracts). Each native-consumed endpoint has a `.snap.test.ts` that asserts JSON **shape** (keys + JSON types + presence of `formatHints`), not literal values. Snapshots are checked into git so drift shows up in PR diffs.

If a snapshot diff is expected (you actually changed the contract), update it intentionally:

```bash
docker compose exec api npm run contracts:check -- --update
```

### L5 - Web E2E

Lives in [apps/web/e2e](../apps/web/e2e). Each spec uses the persona fixture; auth is seeded via Prisma rather than re-traversing the login UI on every test. One spec (`auth.spec.ts`) does exercise real login UI.

#### Quick gates before Playwright (repo root)

Run in order; stop on first failure. Skipping these produces misleading auth/timeouts when api/web are unhealthy.

```bash
docker compose up -d api web gotenberg redis   # gotenberg+redis for render/export specs
./scripts/smoke.sh
curl -sf http://localhost:18080/api/health | grep -q '"ok":true' || exit 1
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:18080/en/login | grep -q '^200$' || exit 1
docker compose exec api npm run seed:e2e
```

MRP/CRP export smoke: also see [`docs/design/mrp-crp-alpha-demo-walkthrough.md`](design/mrp-crp-alpha-demo-walkthrough.md) and [`apps/web/e2e/README.md`](../apps/web/e2e/README.md).

Run via a one-shot Docker container (no `docker-compose.yml` edits):

```bash
docker run --rm --network host \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm ci && npx playwright test"
```

#### Known upstream Tamagui debt (consolidated)

##### Accordion: bogus `aria-controls` (axe `aria-valid-attr-value`)

`smoke/dashboard.spec.ts` skips the axe rule `aria-valid-attr-value` because `@tamagui/accordion@2.0.0-rc.17` ships an id-wiring bug: every `Accordion.Trigger` renders `aria-controls="<contentId>"` but the corresponding `Accordion.Content` DOM node never receives that id (the trigger and content sides each call `React.useId()` independently — see `node_modules/@tamagui/accordion/src/Accordion.tsx:407`). The interaction works for keyboard and screen readers (`aria-expanded`, `data-state` are correctly wired), but axe still flags the trigger as critical.

When this rule is retired here:

1. Confirm the bug is fixed in a newer `@tamagui/accordion` release (release notes or a manual repro).
2. Remove the `skipFailures: ["aria-valid-attr-value"]` argument from `apps/web/e2e/smoke/dashboard.spec.ts`.
3. If the violation reappears on a non-Tamagui-Accordion element (i.e. our own code introduces a malformed ARIA value), fix it there — do **not** re-introduce the skip.

If the bug persists past, say, two Tamagui releases, file an upstream issue with the reproducer text already in the dashboard spec's leading comment.

##### RadioGroup: `native={true}` swallows `onValueChange` on web

`@tamagui/radio-group@2.0.0-rc.11`'s "native mode" wraps a real `<input type="radio">` for accessibility, but the change event from that native input does **not** propagate back to the group's `onValueChange` callback. The visible bullet moves on click (because the native input toggles its own `checked` attribute), but React state never flips — so any conditional UI keyed on the selected value (button labels, dependent inputs) stays frozen.

We hit this in `packages/ui/src/primitives/ModeFieldset.tsx`, which used to set `native={isWeb}`. Symptom on the mash/sparge/boil water pages: clicking "Manual acid amount" left the submit button reading "Calculate & save snapshot" and never revealed the "Acid added" input. Fixed by dropping `native={true}` (kept the Tamagui-native render path; ARIA + label wiring is unchanged). Covered by the regression test `apps/web/e2e/smoke/water-calc.spec.ts` → "mash acidification mode radio actually flips React state on web".

If you ever need `RadioGroup native={true}` again (e.g. for a specific browser-autofill story) **and** a newer Tamagui version, first verify the propagation manually: render a controlled `RadioGroup` with a `console.log` in `onValueChange`, click an option, and confirm the log fires. Only then re-enable `native={true}` and remove the regression test guard.

### L6 - Agentic browser E2E

Driven by the Cursor browser MCP, orchestrated through `@umbraculum/test-mcp`. Three named jobs:

- `agenticCreateRecipe`
- `agenticBrewDay`
- `agenticWaterCalcSanity`

Each job writes a run dir under `var/test-runs/<timestamp>/` with screenshots, structured log, and a one-line verdict.

Skill + job catalog split:

- **Protocol / bounds / output contract** (generic): the `agentic-browser-web-app` skill shipped by the `umbraculum-node-react-cursor-assistant` plugin (`skills/agentic-browser-web-app/SKILL.md` in the plugin install).
- **Brewery-specific job catalog** (this repo, committed): [docs/AGENTIC-JOBS.md](AGENTIC-JOBS.md).
- **MCP server** that smooths the non-UI prerequisites (smoke / seed / `loginAs`): [packages/test-mcp](../packages/test-mcp) + the `test-mcp-server` skill shipped by the `umbraculum-node-react-cursor-assistant` plugin (`skills/test-mcp-server/SKILL.md` in the plugin install).

## E2E fixture identities (single source of truth)

These are the personas every E2E layer (L3, L5, L6) shares. Seeded by [services/api/src/cli/seedE2eFixture.ts](../services/api/src/cli/seedE2eFixture.ts) (idempotent — re-run anytime):

| Persona | Email | Password | Role | Workspace(s) |
|---|---|---|---|---|
| e2e-admin | `e2e-admin@brewery.local` | `e2e-admin-pw!` | brewery_admin | E2E Brewery |
| e2e-member | `e2e-member@brewery.local` | `e2e-member-pw!` | member | E2E Brewery |
| e2e-viewer | `e2e-viewer@brewery.local` | `e2e-viewer-pw!` | viewer | E2E Brewery |
| e2e-multi-admin | `e2e-multi-admin@brewery.local` | `e2e-multi-admin-pw!` | brewery_admin | **E2E Brewery + E2E Side Brewery** (added 2026-05-18 as the SelectWorkspace flow fixture — Phase 3b L5 regression-pin) |

Stable IDs (so tests can hardcode):

- User UUIDs: `e2e00000-0000-0000-0000-000000000aaa/bbb/ccc/ddd` (admin / member / viewer / multi-admin)
- Workspace UUIDs: `e2e00000-0000-0000-0000-0000000000aa` (primary) + `e2e00000-0000-0000-0000-0000000000bb` (secondary, multi-admin only)
- Recipe ("E2E Pale Ale") UUID: `e2e00000-0000-0000-0000-000000000abc`
- Water profile UUID: `e2e00000-0000-0000-0000-000000000fff`
- Brew session ("E2E-PA-001") UUID: `e2e00000-0000-0000-0000-000000000bbe`
- Equipment profile ("E2E Alpha Brewhouse") UUID: `e2e00000-0000-0000-0000-000000000e01`
- Automation vessel ("E2E-KETTLE-01") UUID: `e2e00000-0000-0000-0000-000000000e02`
- Brew-session step UUIDs: `e2e00000-0000-0000-0000-000000000e03` (timed mash) + `e2e00000-0000-0000-0000-000000000e04` (missing-duration conflict)

The MRP/CRP Wave 4 deterministic proof intentionally uses these fixture rows to prove read-only projections end to end: brewery remains the source of truth, automation remains the source of truth for the vessel, and no MRP/CRP projection rows are created by the seed.

Seed:

```bash
docker compose exec api npm run seed:e2e
```

Clean (rare, for resetting after destructive tests):

```bash
docker compose exec api npm run seed:e2e -- --clean
```

## "What to do when a test fails" decision tree

1. **L1 (unit) red**: contracts/core changed shape. Fix the parser or update the test to match the intended contract. Don't merge with this red.
2. **L2 (API integration) red**: route logic regressed. Same as L1 — fix code OR update test intentionally. Add a fixture if a new edge case was missed.
3. **L3 (smoke) red, locally**: the stack isn't up cleanly. Check [DEVELOPMENT-LOCAL.md](../DEVELOPMENT-LOCAL.md) sections on 502 Bad Gateway and `.next` corruption. Run `docker compose logs api` and `docker compose logs web`.
4. **L4 (contract snapshot) red**: native-consumed response shape changed. Either:
   - Intentional: regenerate with `npm run contracts:check -- --update`, mention it in the PR.
   - Unintentional: this is exactly the cliff we're protecting against; revert.
5. **L5 (Playwright) red**: open the trace `playwright-report/trace.zip` with `npx playwright show-trace`. 90% of failures are: wrong locator, fixture stale (re-run seeder), or genuine UX regression.
6. **L6 (agentic) verdict negative**: read `var/test-runs/<latest>/log.jsonl` and `verdict.txt`. The agent will already have surfaced the most likely cause.

## Anti-laziness defaults

- For any non-trivial code change, the agent SHOULD propose a test diff alongside the code diff. This is encoded in the plugin-shipped `20-tests-must-follow-changes.mdc` rule.
- "Non-trivial" means: new route, new parser/validator, new derivation, changed payload shape, changed auth/ACL path, changed BeerJSON handling.
- "Trivial" means: typo fixes, comment-only changes, package version bumps without behavior change, pure refactors guarded by existing tests.

## How layers reinforce each other

- L1 protects L2: if a parser regresses, you see it in the unit test before it manifests as a confusing 500 in an integration test.
- L2 protects L4: if a route regresses, you see business behavior fail before snapshot drift.
- L4 protects native: `apps/native` only has typecheck CI; if the API response shape changes, native breaks silently in production. L4 turns that into a PR red.
- L3 + L5 protect L6: never burn agent cycles on a broken stack or a flaky locator — gate the agent on green deterministic layers first.

## Non-goals for this kickoff

- No `apps/native` E2E (Detox/Maestro) until launch.
- No load/performance testing yet.
- No changes to `docker-compose.yml` to host Playwright (we use one-shot `docker run`).
- No new test framework introduced — vitest + Playwright only.

---

## Coverage audit + hardening pass (2026-05-17)

The ESLint HIGH-full slice (landed 2026-05-16) surfaced **two latent UI bugs** that escaped existing tests, which is the cleanest possible signal for which test layers have gaps:

- **Phase 4b — `account → workspace` stale-consumer drift** (commit `4d9ec1e`): four UI consumers in `apps/web` (`apps/web/app/recipes/[id]/water/{mash,sparge,boil}/page.tsx` + `apps/web/app/[locale]/water-profiles/page.tsx`) kept reading `profiles?.account` after the `WaterProfilesResponse.account` → `.workspace` rename in commit `87876d0`. Workspace water profiles silently never appeared in any of the four dropdowns. Should have been caught by **L4 contract snapshot** (would have shown the rename as snapshot drift in the rename PR) and/or **L5 Playwright** (would have caught the UI symptom directly).
- **Phase 5g — untyped render-prop in apps/native** (commit `6445476`): the inline `<RootStack.Screen name="SelectWorkspace">{({ navigation }) => ...}</RootStack.Screen>` render-prop fell back to `any`. Caused no runtime bug (the SelectWorkspace flow works), but the lack of static typing meant a class of regressions in that callback would have shipped silently. Should have been caught by **L1/L5 SelectWorkspace flow** coverage.

### Layer-by-layer coverage at 2026-05-17

Headline numbers measured against master `00025dc` (just after the post-HIGH-full doc consistency pass):

| Layer | What | Count | Coverage assessment | Gap signal |
|---|---|---:|---|---|
| **L1 Unit** — contract parsers | `packages/contracts/src/**/*.test.ts` covering the 8 `parseX(unknown): X` parsers in `packages/contracts` | 8/8 parsers covered (was 5/8 pre-audit) | ✅ **Complete (2026-05-17)** — `parseAuthMeResponse` + `parseWaterProfileItem` + `parseWaterProfilesResponse` added as part of this audit. Total contracts vitest count: 70 tests across 5 suites (was 38 across 3 suites). | — |
| **L1 Unit** — `packages/core` (math + unit conversion) | `packages/core/src/**/*.test.ts` | **47 tests across 4 files (was 26 across 3 files pre-Phase-5a)** | ✅ **Phase 5a complete (2026-05-18)** — all function exports across the 4 source files have unit tests with boundary / type-error / round-trip patterns; the only previously-untested export (`DEFAULT_MASH_TARGET_PH` constant in `water.js`, documented as coupled to the Prisma column default) now has its own test file pinning the value + sensible-window guard. Behavioral contract pins added: negative-value passthrough on `massToKg` / `volumeToLiters`, non-defensive contract of `litersToUsGallons` / `kgToLb`, strict-string matching on `isMassUnitV1` / `isVolumeUnitV1`, JS-spec half-rounding direction for negative `roundTo` inputs, upper-boundary at 100 plato + sub-1.0 SG behavior on the gravity helpers. See [Phase 5a audit + gap-fix](#phase-5a-packagescore-audit--gap-fix-2026-05-18) below. | Phase 5b (deferred): `services/api/src/domain/waterCalc/*` ~1000 LoC of math/derivation code has no direct L1 unit tests (only INDIRECT L4-snapshot coverage). |
| **L2 API integration** | `services/api/src/tests/*.test.ts` (excluding `contracts/**`) | 21 L2 spec files exercising ~97 of ~120 distinct (method, path) routes. **Phase 4b-1** (2026-05-18): `brewSessions.test.ts` has 7 cross-workspace isolation assertions across the 6 highest-risk routes. **Phase 4b-2** (2026-05-18): new `inventory.test.ts` covers all 4 inventory routes across 5 axes (20 tests). **Phase 4b-3** (2026-05-18): new `brewdaySettings.test.ts` covers both GET + PATCH routes across happy / round-trip / auth / cross-workspace isolation (9 tests). **Phase 4b-4** (2026-05-18): `recipeWaterSettings.test.ts` extended with explicit L2 auth-gate pins (8 tests, 4 routes × 2 flavors) for the 3 compute-and-save routes + 1 hub-summary route that previously had L4-only coverage. **Phase 4b-5** (2026-05-18): new `platformAdminRoutes.test.ts` covers all 12 platform-admin routes (`platformAds.ts` 4 + `platformRecipes.ts` 8) with 12 × 401 + 12 × 403 gate pins + 3 admin happy-paths (27 tests). | 🟢 **Audit landed 2026-05-18 (Phase 4a); ALL 5 Phase 4b sub-phases landed 2026-05-18.** See [Phase 4a route surface audit](#phase-4a-route-surface-audit-2026-05-18) below. Only remaining L2 surface with no test: the generic non-Tilt `integrationsGeneric.ts` branches (5 routes — unscheduled, lower priority — surface is auth-gated proxying to external integrations, not workspace-scoped writable data). Role-based ACL (`AclService.requireRole`) **exists but is unwired from all routes** — known v0 state, not a bug; tracked as Phase 4d (deferred). | Phase 4b complete — no remaining sub-phases in the audit's gap-fix backlog. |
| **L4 BeerJSON contract snapshots** | `services/api/src/tests/contracts/*.test.ts` | **15 of ~15 native-consumed endpoints covered (was 2 pre-audit; Phase 2 complete 2026-05-18)**: `recipe.contract.test.ts` (POST /recipes + GET /recipes/:id), `auth.contract.test.ts` (GET /auth/me), `waterProfiles.contract.test.ts` (Phase 4b L4 regression-pin), `recipeWater.contract.test.ts` (GET /water-settings + GET /water-hub-summary), `recipeWaterCompute.contract.test.ts` (POST mash + sparge + boil compute-and-save), `brewSessions.contract.test.ts` (POST create + GET list + GET detail), `inventoryEndpoints.contract.test.ts` (GET equipment-profiles + GET ingredients/{fermentables,hops,yeasts}). | ✅ **Phase 2 complete (2026-05-18)** — full L4 coverage of the native-consumed surface; 7 contract test suites, 16 tests. | Phase 4b pinned at L4; entire water-calc surface has L1+L4 alignment; all primary native screens have snapshot coverage of their consumed endpoints. |
| **L5 Web E2E** | `apps/web/e2e/**/*.spec.ts` | **9 specs** (auth, dashboard, water-calc, **water-profiles** ←Phase 3a 2026-05-18, **select-workspace** ←Phase 3b 2026-05-18, recipe-list, ai-pages, recipe-create, brew-session) | 🟢 **Improving — Phase 3a + Phase 3b landed 2026-05-18** — Phase 4b production-rendering symptom pinned at L5 (`smoke/water-profiles.spec.ts`, 2 tests). Phase 5g SelectWorkspace flow pinned at L5 (`smoke/select-workspace.spec.ts`, 3 tests covering the multi-workspace login redirect, the picker UI, and the `POST /api/auth/active-workspace` handoff + session mutation). Required a new fixture persona `e2e-multi-admin` and a second seed workspace `E2E Side Brewery` to make the SelectWorkspace route reachable from E2E (previously a dead branch since all personas were single-workspace). | Phase 4b ✅ pinned L1+L4+L5; Phase 5g ✅ pinned L5 (apps/web side; native side deferred until apps/native testing infra). |
| **L6 Agentic browser E2E** | `var/test-runs/<timestamp>/` from on-demand runs; named jobs in `docs/AGENTIC-JOBS.md` | 3 named jobs | ⚪ **By design on-demand only** — not part of CI; not a closeable gap (per kickoff non-goals). | — |

### Phase plan (hardening pass)

This audit is **Phase 1 of the test-coverage hardening slice**. Subsequent phases are scoped but not yet landed:

| Phase | Scope | Effort estimate | Status | Tracking |
|---|---|---|:-:|---|
| **Phase 1 — L1 contract parser coverage** | Bring the contract-parser test count from 5/8 to 8/8 by adding `parseAuthMeResponse`, `parseWaterProfileItem`, `parseWaterProfilesResponse` test files. Pin the `account → workspace` dual-key parser behavior (the same dual-key that allowed Phase 4b to be invisible at the wire level) so a future "remove legacy key" PR has an explicit test impact. | ~30 min | ✅ **Landed 2026-05-17** | This doc § above; commit landing the gap fix. |
| **Phase 2 — L4 contract snapshots for the uncovered native-consumed endpoints** | Audit `apps/native/src/**` for `api.{get,post,patch,put,delete}` call sites; cross-reference against existing `*.contract.test.ts` files; author the missing snapshot tests. Split into sub-phases for bounded commits. | ~2-4 hours total | ✅ **Complete (2026-05-18)** — 13 new snapshots across 5 new contract test suites covering all primary native-consumed endpoints. L4 coverage 2/15 → 15/15. See [Phase 2b backlog](#phase-2b-backlog-closure-log) below for the per-endpoint closure log. |
| **Phase 3 — L5 Playwright regression pins for Phase 4b + Phase 5g** | Split into 3a + 3b. **Phase 3a (Phase 4b L5 pin)**: assert workspace water profile appears in the `/en/water-profiles` table + asserts `/api/water-profiles` response carries `body.workspace`. **Phase 3b (Phase 5g SelectWorkspace flow)**: add a spec covering the SelectWorkspace flow (visible to apps/web users with multiple workspaces). | ~2-3 hours total | ✅ **Complete 2026-05-18.** Phase 3a (`apps/web/e2e/smoke/water-profiles.spec.ts`; 2 tests). Phase 3b (`apps/web/e2e/smoke/select-workspace.spec.ts`; 3 tests; required `e2e-multi-admin` persona + `secondaryWorkspaceId` seed extension). Full smoke suite: 15 → 18 tests, all green. | Phase 4b regression-pin trio complete (L1+L4+L5); Phase 5g L5 web pin complete. |
| **Phase 4 — L2 integration coverage gap audit** | Split into 4a (audit-only, doc) + 4b/4c/… (gap-fix implementation sub-phases). **Phase 4a**: inventory routes + L2 tests, map per-route coverage axes (happy / unauth / cross-workspace / role), surface highest-risk gaps. **Phase 4b+**: implement the gap fixes in bounded sub-phases. | Audit ~1h; gap-fix sub-phases vary. | ✅ **Phase 4 complete — landed 2026-05-18.** Phase 4a (audit doc) + Phase 4b-1 through 4b-5 (all 5 gap-fix sub-phases) all shipped on 2026-05-18 — see [Phase 4a route surface audit](#phase-4a-route-surface-audit-2026-05-18) below. Phase 4d (deferred) remains gated on the ACL-wiring architectural decision. | This doc → "Phase 4a route surface audit". |
| **Phase 5a — `packages/core` math/units L1 audit + gap-fix** | Inventory `packages/core/src/{gravity.js,units,water.js}` exported functions; cross-reference with existing tests; fill gaps. Audit found all *function* exports already covered with reasonable depth; only the `DEFAULT_MASH_TARGET_PH` constant and several un-pinned behavioral contracts were gaps. Added new `water.test.js` (2 tests) + extensions to `gravity.test.js` (+5 tests), `units/units.test.js` (+11 tests), `units/rounding.test.js` (+3 tests). Test count 26 → 47. | Smaller; bounded chunk. | ✅ **Landed 2026-05-18** | See [Phase 5a audit + gap-fix](#phase-5a-packagescore-audit--gap-fix-2026-05-18) below. |
| **Phase 5b — `services/api/src/domain/waterCalc/*` L1 unit tests** | Split into 5 bounded sub-phases (5b-1 → 5b-5). Audit identified ~1000 LoC of pure-math/derivation code across 4 substantial files (`mashAcidificationTargetMashPh.ts` 307 LoC, `mashPhEstimateV1.ts` 215 LoC, `saltAdditions.ts` 183 LoC, `spargeAcidification.ts` 313 LoC) + 5 smaller files with no direct L1 unit tests. Currently only INDIRECTLY covered via L4 contract snapshots. **Phase 5b-1 (2026-05-18):** `residualAlkalinity.test.ts` (17 tests) + `saltAdditions.test.ts` (24 tests). **Phase 5b-2 (2026-05-18):** `mashPhEstimateV1.test.ts` (32 tests). **Phase 5b-3 (2026-05-18):** `mashAcidificationManual.test.ts` (12 tests) + `mashAcidificationTargetMashPh.test.ts` (19 tests). **Phase 5b-4 (2026-05-18):** `spargeAcidification.test.ts` (26 tests) + `spargeAcidificationManual.test.ts` (14 tests). **Phase 5b-5 (2026-05-18):** new `overall.test.ts` (20 tests) pinning the bicarb ↔ alkalinity unit-conversion factors (50/61 + 61/50 + round-trip symmetry) + `deriveBicarbonatePpmFromAlkalinityPpmCaCO3` clamp-to-zero (brewing reporting contract) + `combineAfterSaltsAndAcid` composition contract (Ca/Mg/Na unchanged from afterSalts; sulfate + chloride get acid-step deltas added; **bicarbonate is OVERWRITTEN by acidResult.finalAlkalinity, NOT propagated from afterSalts.bicarbonate** — the most subtle invariant); new `mashPhEstimate.test.ts` (3 tests) pinning the 16-LoC wrapper-forwards-verbatim contract via deep-equal comparison with mashPhEstimateV1 + identical error propagation. services/api: 233 → 400 tests across 40 → 49 files. **🎉 Phase 5b complete: every non-trivial waterCalc file (9 of 9) now has direct L1 unit tests.** | ~1-2 days total | ✅ **Landed 2026-05-18** — all 5 sub-phases shipped (see [Phase 5b implementation backlog](#phase-5b-implementation-backlog-watercalc-l1-unit-tests) below for per-sub-phase details). | See [Phase 5b implementation backlog](#phase-5b-implementation-backlog-watercalc-l1-unit-tests) |

**Recommended order:** Phase 2 (L4 snapshots) ✅ done. Phase 3a (Phase 4b L5 pin) ✅ done. Phase 3b (SelectWorkspace L5 web pin for Phase 5g) ✅ done. Phase 4a (L2 route surface audit) ✅ done. Phase 4b-1 through 4b-5 ✅ done — **all 5 Phase 4b sub-phases shipped 2026-05-18**. Phase 5a (`packages/core` audit + gap-fix) ✅ done. **🎉 Phase 5b-1 through 5b-5 ✅ done 2026-05-18 — the test-coverage hardening slice is COMPLETE for all non-deferred phases**: services/api 233 → 400 tests across 40 → 49 files (+167 tests / +12 new files in Phases 4b + 5a + 5b combined; the project was at 162 tests when the hardening pass started on 2026-05-17). Only Phase 4d (deferred role-based ACL coverage) remains, gated on the ACL-wiring architectural decision.

#### Phase 2b backlog (closure log)

All native-consumed endpoints identified in the Phase 1 audit now have L4 snapshot coverage. Kept here as a closure log so a future audit can quickly see which screens / call sites are pinned.

| Endpoint | Native call site (example) | Companion L1 parser test (if any) | Status |
|---|---|---|---|
| ~~POST `/recipes/:id/water-settings/mash/compute-and-save`~~ | `apps/native/src/screens/WaterMashScreen.tsx` | ✅ `packages/contracts/src/water/parseComputeAndSave.test.ts` (mash variant) | ✅ **Landed 2026-05-18** (`recipeWaterCompute.contract.test.ts`). |
| ~~POST `/recipes/:id/water-settings/sparge/compute-and-save`~~ | `apps/native/src/screens/WaterSpargeScreen.tsx` | ✅ same file (sparge variant) | ✅ **Landed 2026-05-18** (same file). |
| ~~POST `/recipes/:id/water-settings/boil/compute-and-save`~~ | `apps/native/src/screens/WaterBoilScreen.tsx` | ✅ same file (boil variant) | ✅ **Landed 2026-05-18** (same file). |
| ~~GET `/recipes/:id/brew-sessions`~~ | `apps/native/src/screens/BrewSessionsListScreen.tsx` | — (no L1 parser yet) | ✅ **Landed 2026-05-18** (`brewSessions.contract.test.ts` — `brewSessions.listForRecipe`). |
| ~~POST `/recipes/:id/brew-sessions`~~ | `apps/native/src/screens/BrewSessionsListScreen.tsx` | — | ✅ **Landed 2026-05-18** (same file — `brewSessions.create`). |
| ~~GET `/brew-sessions/:id`~~ | `apps/native/src/screens/BrewSessionDetailScreen.tsx` | — | ✅ **Landed 2026-05-18** (same file — `brewSessions.detail`; pins 21 fields per `BrewSessionStep` element). |
| ~~GET `/equipment-profiles`~~ | `apps/native/src/screens/EquipmentScreen.tsx` | — | ✅ **Landed 2026-05-18** (`inventoryEndpoints.contract.test.ts` — `equipmentProfiles.list`). |
| ~~GET `/ingredients/fermentables`~~ | `apps/native/src/screens/RecipeEditScreen.tsx` | — | ✅ **Landed 2026-05-18** (same file — `ingredients.fermentables`). |
| ~~GET `/ingredients/hops`~~ | `apps/native/src/screens/RecipeEditScreen.tsx` | — | ✅ **Landed 2026-05-18** (same file — `ingredients.hops`). |
| ~~GET `/ingredients/yeasts`~~ | `apps/native/src/screens/YeastScreen.tsx` + `RecipeEditScreen.tsx` | — | ✅ **Landed 2026-05-18** (same file — `ingredients.yeasts`). |

**Phase 2 closure summary:** 13 new snapshots across 5 new contract test suites in one day. Total contract test surface: **7 suites, 16 tests, all green**.

Future Phase 2c (when prioritised): the integrations endpoints (`/workspaces/:id/integrations/*`, `/brew-sessions/:id/integrations/*`) — these are workspace-scoped device pairing flows that depend on external services. Not in the original native-consumed scope since they're guarded behind device-pairing UI gates and have higher fixture cost (each endpoint typically needs a paired-device mock). Decided out of scope for the initial L4 sweep; revisit when the integrations feature stabilises.

### Phase 4a route surface audit (2026-05-18)

This is the **L2 integration-coverage gap audit** scoped at the kickoff. The goal is not to write any tests in this phase — only to inventory the route surface, map it against the existing 18 L2 test files, and surface the highest-signal gaps so the Phase 4b implementation slice can be bounded and prioritised.

#### Methodology

1. Inventoried every `app.{get,post,put,patch,delete}` call site in `services/api/src/routes/**/*.ts` (~120 distinct `(method, path)` tuples across 28 route files).
2. Inventoried every L2 test file in `services/api/src/tests/*.test.ts` (excluding `contracts/**` which is the L4 layer).
3. For each test file, listed the `app.inject(...url)` call sites to build a route-to-test mapping.
4. Searched for the four coverage axes: **happy path** (200), **unauthenticated** (401), **cross-workspace isolation** (403 from one workspace trying to touch another's data), and **role-based** (viewer/member trying admin actions).
5. Cross-referenced with `services/api/src/services/acl.ts` to determine whether role enforcement is even wired into the routes today.

#### Route surface inventory (by file, coverage at a glance)

Coverage axes legend: ✅ covered · ⚠ partial · ❌ missing · N/A not applicable

| Route file | Routes | Test file(s) | Happy | Unauth (401) | Cross-workspace (403/404) | Role (viewer/member 403) |
|---|---:|---|:-:|:-:|:-:|:-:|
| `auth.ts` | 8 | `authSessions.test.ts` + L4 `auth.contract.test.ts` | ⚠ (6/8) | ✅ | N/A (self-scoped) | N/A |
| `workspaces.ts` | 5 | `accounts.test.ts` | ⚠ (2/5) | ✅ | ❌ (POST /workspaces, PATCH /workspaces/:id/brand untested) | N/A |
| `recipes.ts` | 8 | `recipes.test.ts` + L4 | ✅ | ✅ | ✅ ("does not leak recipes across workspaces") | N/A (v0 no ACL) |
| `brewSessions.ts` | 17 | `brewSessions.test.ts` + L4 + `integrationsTilt.test.ts` (partial) | ✅ | ⚠ | ❌ **High-risk gap — 0 of 17 routes have cross-workspace isolation tests** | N/A (v0 no ACL) |
| `waterProfiles.ts` | 6 | `waterProfiles.test.ts` + L4 | ✅ | ✅ | ✅ (via L4 contract; also viewer-403 admin-action test) | ⚠ (viewer 403 on create only) |
| `recipeWaterSettings.ts` | 2 | `recipeWaterSettings.test.ts` + L4 | ✅ | ✅ | ✅ ("does not leak settings across workspaces") | N/A |
| `recipeWaterComputeAndSave.ts` | 3 | L4 only (`recipeWaterCompute.contract.test.ts`) | ⚠ (L4 only) | ❌ (no L2 401 test) | ❌ | N/A |
| `recipeWaterHubSummary.ts` | 1 | L4 only (`recipeWater.contract.test.ts`) | ⚠ (L4 only) | ❌ | ❌ | N/A |
| `waterCalc.ts` | 10 | `waterCalcMashRoutes.test.ts` + `waterCalcRoutes.test.ts` + `waterCalcSparge.test.ts` + `waterCalcSalts.test.ts` | ⚠ (~7/10) | ✅ | N/A (stateless calc) | N/A |
| `equipmentProfiles.ts` | 4 | `equipmentProfiles.test.ts` + L4 (list only) | ✅ | ✅ | ❌ | ⚠ (explicit "v0: no ACL" comment in test) |
| `ingredients.ts` | 5 | `ingredientsYeasts.test.ts` (yeasts only) + L4 (fermentables+hops+yeasts list only) | ⚠ (yeasts L2; fermentables/hops L4 only; admin sync endpoints untested) | ⚠ | N/A (system-scoped) | ❌ (admin sync routes not gated in test) |
| `inventory.ts` | 4 | (none) | ❌ **No L2 test file** | ❌ | ❌ | N/A |
| `ai.ts` | 4 | `ai/ai.integration.test.ts` + memory + parity | ✅ | ✅ | ⚠ (403 covered for tier gates; cross-workspace settings not isolation-tested) | N/A |
| `billing.ts` | 3 + 2 webhooks | `billing.test.ts` | ✅ | ✅ | ⚠ (403 for tier gates; cross-workspace billing-intent not isolation-tested) | N/A |
| `brewdaySettings.ts` | 2 | (none) | ❌ **No L2 test file** | ❌ | ❌ | N/A |
| `integrationsGeneric.ts` | 5 | (none — Tilt-only is tested in `integrationsTilt.test.ts`) | ❌ for non-Tilt kinds | ❌ | ❌ | N/A |
| `integrationsReveal.ts` | 2 | `integrationsTilt.test.ts` (Tilt reveal only) | ⚠ | ⚠ | ❌ | N/A |
| `integrationsTilt.ts` | 8 | `integrationsTilt.test.ts` (well-covered: 20+ status-code assertions) | ✅ | ✅ | ⚠ | N/A |
| `integrationsTiltIngest.ts` | 1 | `integrationsTilt.test.ts` | ✅ | N/A (token-based) | N/A | N/A |
| `recipesImport.ts` | 4 | `recipesImport.test.ts` | ✅ | ✅ | ⚠ | N/A |
| `recipesExport.ts` | 2 | `recipesExport.test.ts` | ⚠ (single covered; bulk export incompletely covered) | ✅ | ❌ | N/A |
| `styles.ts` | 1 | (none) | ❌ (trivial public GET; low risk) | N/A | N/A | N/A |
| `health.ts` | 1 | (L3 smoke) | ✅ via L3 | N/A | N/A | N/A |
| `ads.ts` | 1 | `adsSlot.test.ts` | ✅ | N/A (public) | N/A | N/A |
| `platformAds.ts` | 4 | (none) | ❌ **No L2 test file** for platform-admin routes | ❌ | N/A (platform-scoped) | ⚠ (platform-admin gate untested) |
| `platformRecipes.ts` | 8 | (none) | ❌ **No L2 test file** for platform-admin routes | ❌ | N/A (platform-scoped) | ⚠ (platform-admin gate untested) |
| `webhooksRevenuecat.ts` | 1 | `billing.test.ts` | ✅ | N/A (signature-based) | N/A | N/A |
| `webhooksStripe.ts` | 1 | `billing.test.ts` | ✅ | N/A (signature-based) | N/A | N/A |

#### Key findings

1. **Cross-workspace isolation gap on the brew-sessions surface (highest-signal gap).** ✅ **Resolved 2026-05-18 by Phase 4b-1.** 17 routes operate on `brewSessionId` path params, and none of them had an explicit cross-workspace isolation test in `brewSessions.test.ts` — the original suite operated on a single workspace throughout. Phase 4b-1 added a new `describe("brew sessions cross-workspace isolation")` block with 7 tests asserting that a second persona/workspace gets 404 (not 200/403) when accessing/mutating another workspace's brew session via GET detail + PATCH date + DELETE + start/pause/stop. Pattern mirrors `recipes.test.ts:230` and `recipeWaterSettings.test.ts:240`. Step-mutating routes share the same `assertMembership` + `findFirst({ where: { workspaceId } })` plumbing, so the 6 pinned routes act as a regression-pin for the full 17-route surface; an explicit Phase 4b-1-bis to pin the step routes is a low-priority follow-on.
2. **Role-based ACL is not enforced in production routes.** `AclService.requireRole(userId, workspaceId, allowed)` exists in `services/api/src/services/acl.ts` but is **never invoked from any route file** (verified via `grep -r 'acl.requireRole\|AclService' services/api/src/routes/` → 0 matches). `equipmentProfiles.test.ts:115` explicitly notes "v0: no ACL". The only "viewer 403" test is `waterProfiles.test.ts:108`. This is a known v0 architectural state, **not a bug**, but it means the "Role (viewer/member 403)" column in the matrix above is mostly N/A by design. When role enforcement gets wired up (post-v0 milestone), every workspace-scoped route will need a viewer/member 403 test added — call this **Phase 4d (deferred)**.
3. **Three workspace-scoped route files have zero L2 tests.** ✅ **Mostly resolved 2026-05-18 by Phase 4b-2 + 4b-3.** `inventory.ts` now fully covered (`services/api/src/tests/inventory.test.ts`, 20 tests across 5 axes); `brewdaySettings.ts` now fully covered (`services/api/src/tests/brewdaySettings.test.ts`, 9 tests across happy / PATCH round-trip / auth / cross-workspace). Still remaining: the generic non-Tilt branches of `integrationsGeneric.ts` (5 routes — currently unscheduled, lower priority because the surface is mostly auth-gated proxying to external integrations rather than workspace-scoped writable data). This last remaining surface is not high-risk in the sense of "data leakage" (it's well-isolated by `requireActiveWorkspace` middleware), but it's medium-risk in the sense of "no regression-catching test exists at all" — any refactor of those route handlers ships with no L2 safety net.
4. **Platform-admin routes are not tested.** ✅ **Resolved 2026-05-18 by Phase 4b-5.** New `services/api/src/tests/platformAdminRoutes.test.ts` pins the `requirePlatformAdmin` gate across all 12 platform-admin routes (4 ads + 8 recipes) with 12 × 401 + 12 × 403 + 3 admin happy-paths = 27 tests. The original concern that "the gate itself (non-admin → 403) is untested" — both halves of the gate (401 `missing_session` from `requireSession` + 403 `not_platform_admin` from `requirePlatformAdmin`) are now explicitly pinned per route. A future regression that drops the gate from any handler, or accidentally flips the `if (!user?.isPlatformAdmin)` check, would fail the corresponding 403 test loudly.
5. **`recipeWaterComputeAndSave.ts` (3 routes) + `recipeWaterHubSummary.ts` (1 route) have L4 contract coverage but no L2 happy-path / unauth tests.** ✅ **Resolved 2026-05-18 by Phase 4b-4.** Added 8 explicit 401 pins (4 routes × 2 unauth flavors) as a sibling `describe` block in `services/api/src/tests/recipeWaterSettings.test.ts`. The original concern was that "a future regression that loosens auth requirements wouldn't fail any test" — now if `requireActiveWorkspace` is removed from any of these 4 handlers, the test fails immediately. The L4 contract tests continue to pin the happy-path response shape; L2 owns the auth-gate pin.

#### Phase 4b implementation backlog

Each sub-phase below is independently shippable and follows the established bounded-chunk discipline (one PR per sub-phase, all suites green before commit).

| Sub-phase | Scope | Why it's the priority | Effort estimate |
|---|---|---|---|
| **Phase 4b-1 — cross-workspace isolation for brew-sessions** ✅ **landed 2026-05-18** | New `describe("brew sessions cross-workspace isolation (Phase 4b-1)")` block in `services/api/src/tests/brewSessions.test.ts` adds 7 tests across the 6 highest-risk routes (GET detail + PATCH date + DELETE + start/pause/stop): baseline 200 + per-route cross-workspace 404. Implementation uses **two independent `createSessionForTestUser(...)` sessions** (no fixture changes needed — the helper already creates an independent workspace per call). `brewSessions.test.ts` test count: 17 (was 10). | The brew-sessions surface was the single largest cross-workspace gap (0/17 isolation tests on workspace-scoped writable data) and has full L4 coverage already, so the L2 cross-workspace assertions complemented an established testing rhythm. | ~1.5h actual (estimated 2-3h) |
| **Phase 4b-2 — L2 tests for `inventory.ts`** ✅ **landed 2026-05-18** | New `services/api/src/tests/inventory.test.ts` covers all 4 routes (GET list + POST + PATCH + DELETE) across 5 axes: happy path (including `?category=` filter + category-conditional metadata round-trip for `fermentable` and `hop`), validation 400s (invalid_category / invalid_unit / invalid_name / invalid_quantity), auth 401s (both `missing_session` and `missing_active_workspace` flavors + a POST write-side pin), and cross-workspace isolation (PATCH + DELETE → 404 + positive "B's list view does not contain A's items" check). 20 tests total; pins the Postgres enum-declaration-order sort behavior on `orderBy: { category: "asc" }` explicitly. | Was the largest "zero coverage" surface that handles workspace-scoped writable data. | ~1.5h actual (estimated 2h) |
| **Phase 4b-3 — L2 tests for `brewdaySettings.ts`** ✅ **landed 2026-05-18** | New `services/api/src/tests/brewdaySettings.test.ts` covers both routes (GET + PATCH) across 4 axes: happy (GET returns `settings: null` for fresh workspace; pinned NOT 404), PATCH round-trip (upsert + GET-after-PATCH; second PATCH replaces previous payload including explicit `notes: null` clearing), auth 401s (both flavors), and cross-workspace isolation (B's GET does not return A's payload after A's PATCH; B's PATCH does not overwrite A's row). 9 tests total. | Smallest surface (2 routes) but was zero-coverage. | ~45min actual (estimated 30-45min) |
| **Phase 4b-4 — L2 auth pins for `recipeWaterComputeAndSave.ts` + `recipeWaterHubSummary.ts`** ✅ **landed 2026-05-18** | Appended sibling `describe("recipe water compute-and-save + hub-summary auth gates")` block to `services/api/src/tests/recipeWaterSettings.test.ts`. 4 routes × 2 unauth flavors = 8 explicit 401 assertions (`missing_session` + `missing_active_workspace` for each of the 3 compute-and-save POST routes + the 1 hub-summary GET route). Pins the `requireActiveWorkspace` gate so a future regression dropping the gate from any of these handlers fails loudly here, even though their L4 contract tests would still pass (L4 always uses an authenticated session). Behavior + response shape continues to be pinned by `services/api/src/tests/contracts/recipeWaterCompute.contract.test.ts` + `recipeWater.contract.test.ts`. | Low cost; complements existing L4 coverage with explicit auth-gate assertions. | ~30min actual (estimated 30min) |
| **Phase 4b-5 — L2 tests for `platformAds.ts` + `platformRecipes.ts` platform-admin gate** ✅ **landed 2026-05-18** | New `services/api/src/tests/platformAdminRoutes.test.ts` (27 tests) covers all 12 platform-admin routes (4 ads + 8 recipes). For each route: 401 `missing_session` without cookie + 403 `not_platform_admin` with a valid-but-non-admin cookie. Plus 3 admin happy-paths (GET /platform/ads list shape + GET /platform/workspaces visibility of both admin-owned and non-admin-owned workspaces + POST /platform/ads create with DB round-trip). Admin user provisioned by calling `createSessionForTestUser` then promoting via direct Prisma update — the standard helper deliberately doesn't accept an `isPlatformAdmin` flag to keep ordinary tests from accidentally promoting users. | Pinned the platform-admin gate (the only path through which one workspace can write into another via the admin import routes) using existing `User.isPlatformAdmin` plumbing. | ~1h actual (estimated 1-1.5h) |
| **Phase 4d (deferred) — role-based ACL coverage** | When `AclService.requireRole` gets wired into routes, every workspace-scoped route will need a viewer/member 403 test. This becomes a separate slice tracked alongside the ACL wiring PR itself rather than this audit. | Out of scope for the Phase 4 hardening pass — it's a follow-on once the ACL wiring decision is made. | N/A (deferred) |

#### Recommended sub-phase order

1. **Phase 4b-1** ✅ **landed 2026-05-18** — cross-workspace isolation on brew-sessions was the highest-signal gap (workspace-scoped writable data, 0 isolation tests, largest route surface).
2. **Phase 4b-2** ✅ **landed 2026-05-18** — `inventory.ts` was the largest zero-coverage workspace-scoped file; now covered across all 5 axes (happy / validation / auth / cross-workspace / list).
3. **Phase 4b-3 + 4b-4** ✅ **landed 2026-05-18** — paired cheap fill-in work; brewday-settings L2 from scratch (9 tests) + water compute-and-save/hub-summary auth pins (8 tests) shipped together as a single PR.
4. **Phase 4b-5** ✅ **landed 2026-05-18** — platform-admin gate pinned across all 12 platform routes (27 tests). Was the final sub-phase in the gap-fix backlog.
5. **Phase 4d** waits for the ACL-wiring architectural decision.

### What this audit deliberately does NOT change

- The **layer-mapping framework** (L1-L6) and the per-layer "what goes in" guidance. That section is solid and pre-dates this audit.
- The **`Anti-laziness defaults`** (`20-tests-must-follow-changes.mdc`, shipped by the plugin pack) — the workflow gate is unchanged.
- The **E2E fixture identities** — still the same personas/IDs.
- The **per-layer run commands** — still the same Docker invocations.

The audit is additive: it documents the gap state at a point in time and lays out the work needed to close it.

### Phase 5a `packages/core` audit + gap-fix (2026-05-18)

The L1 audit for the `packages/core` math/units surface was the optional follow-on to the Phase 4 L2 work. Unlike Phase 4, the `packages/core` surface is small enough that the audit + gap-fix shipped as a single bounded PR rather than being split into audit-only + gap-fix sub-phases.

#### Methodology

1. Inventoried every `.js` source file in `packages/core/src/**` (4 files, ~50 LoC of code).
2. Inventoried every export (functions + constants) from those files via the public surface declared in `packages/core/src/index.d.ts`.
3. Cross-referenced each export against existing `*.test.js` siblings.
4. For each exported function, scanned the existing test file for boundary / type-error / round-trip patterns and noted any gaps in behavioral-contract pinning that a downstream refactor could silently change.

#### Inventory + coverage status (before Phase 5a)

| Source file | Exports | Test file | Function exports tested | Constant exports tested |
|---|---|---|:-:|:-:|
| `src/gravity.js` | `platoToSg`, `sgToPlato` | `src/gravity.test.js` | ✅ Both (boundary at 0, typical range, non-numeric, out-of-range, round-trip) | N/A |
| `src/units/units.js` | `isMassUnitV1`, `isVolumeUnitV1`, `massToKg`, `massToGrams`, `volumeToLiters`, `litersToUsGallons`, `kgToLb` | `src/units/units.test.js` | ✅ All 7 (kg passthrough, g/lb/oz conversion, unknown unit, non-finite, round-trip) | N/A |
| `src/units/rounding.js` | `roundTo` | `src/units/rounding.test.js` | ✅ Decimal precision, default decimals, negative clamp, non-finite | N/A |
| `src/water.js` | `DEFAULT_MASH_TARGET_PH` (constant) | — | N/A | ❌ **Not tested** |

#### Audit findings

1. **Highest-signal gap (closed by Phase 5a): `DEFAULT_MASH_TARGET_PH` was un-pinned.** The constant is documented in `src/water.js` as coupled to the Prisma column default on `recipe_water_settings.mash_target_ph`. Without a test, a future PR that changes the constant in `packages/core` without updating the Prisma migration creates **silent drift** between the core default and the database default. Pinned by new `src/water.test.js` (2 tests).
2. **Medium-signal gaps (closed by Phase 5a): un-pinned behavioral contracts on existing functions.** Several behaviors are part of the implicit current contract but are not explicitly tested, so a future "tighten validation" or "make everything defensive" refactor could silently change downstream behavior. Pinned by extensions to the existing test files:
   - **Negative-value passthrough on `massToKg` / `volumeToLiters`** — current contract validates `Number.isFinite` but NOT sign. Negative mass/volume passes through as a negative number (callers like derivation code that subtracts ingredients may depend on this). Pinned.
   - **Non-defensive contract of `litersToUsGallons` / `kgToLb`** — `massToKg` / `volumeToLiters` are defensive (return `null` for invalid inputs); these two inverse helpers are NOT (they propagate NaN → NaN, Infinity → Infinity, negatives → negatives). Pinned.
   - **Strict-string matching of `isMassUnitV1` / `isVolumeUnitV1`** — the guards use strict `===`; they do NOT lowercase, trim, or accept aliases. A future "case-insensitive units" refactor would silently change accepted payloads if this isn't pinned. Pinned.
   - **JS-spec half-rounding direction on negative `roundTo` inputs** — after the EPSILON nudge, `Math.round(-1.5) === -1` (NOT `-2`). Callers that need symmetric rounding around zero must do it themselves. Pinned.
   - **`platoToSg` upper boundary at 100 plato** — the code accepts plato in `[0, 100]` (exclusive of 0, inclusive of 100). A future range-change would silently shift what extreme-gravity wort the function rejects. Pinned (with companion sub-1.0-SG `platoToSg(0.5)` pin).
   - **`sgToPlato` absence of upper-bound check** — only rejects `sg <= 1` (and non-finite); very-high SG produces a large positive plato rather than `null`. Pinned so a future "reject impossible SG" refactor surfaces explicitly.
3. **Lower-signal finding (deferred to Phase 5b): `services/api/src/domain/waterCalc/*` has ~1000 LoC of pure math/derivation code with no direct L1 unit tests.** Files involved:

   | File | LoC | Existing test |
   |---|---:|---|
   | `mashAcidificationTargetMashPh.ts` | 307 | ❌ |
   | `spargeAcidification.ts` | 313 | ❌ |
   | `mashPhEstimateV1.ts` | 215 | ❌ |
   | `saltAdditions.ts` | 183 | ❌ |
   | `mashAcidificationManual.ts` | 136 | ❌ |
   | `spargeAcidificationManual.ts` | 145 | ❌ |
   | `residualAlkalinity.ts` | 62 | ❌ |
   | `overall.ts` | 51 | ❌ |
   | `mashPhEstimate.ts` | 16 | ❌ |
   | `mashPhDefaultsV1.ts` | 163 | ✅ (`mashPhDefaultsV1.test.ts`, 67 LoC) |
   | `recipeAnalysis/gravityAnalysis.ts` | 932 | ✅ (`gravityAnalysis.test.ts`, 536 LoC — substantial direct coverage) |

   Net uncovered: **~1431 LoC** of pure-ish math/derivation across 9 files. They have **indirect** coverage via L4 contract snapshots (e.g. `services/api/src/tests/contracts/recipeWaterCompute.contract.test.ts`), so a regression that changes the snapshot output would still surface. But individual function-level edge cases (e.g. "what does `saltAdditions.ts` return for a profile with all-zero ions?", "what does `mashPhEstimateV1.ts` return when no fermentables are present?", "what does `spargeAcidification.ts` return when target mash pH is outside the typical 5.0–5.8 window?") are not pinned. **Deferred as Phase 5b** because it's a meaningfully larger PR (~1-2 days) than Phase 5a; surfaced here so it's not forgotten.

#### Phase 5a deliverables

| File | Change | New test count |
|---|---|:-:|
| `packages/core/src/water.test.js` | **New** — pins `DEFAULT_MASH_TARGET_PH` value + sensible-window guard (5.0–5.8). Comment in test points reviewers at the Prisma migration as the linked change. | +2 |
| `packages/core/src/gravity.test.js` | Extended with `describe("platoToSg upper boundary (Phase 5a)")` (3 tests) + `describe("sgToPlato upper-bound behavior (Phase 5a)")` (2 tests). | +5 |
| `packages/core/src/units/units.test.js` | Extended with `describe("Phase 5a contract pins")` (4 nested describes, 11 tests total covering negative passthrough, non-defensive helpers, strict-string matching, non-string unit guards). | +11 |
| `packages/core/src/units/rounding.test.js` | Extended with 3 new pins (negative half-rounding direction, negative higher-decimal precision, zero-input behavior). | +3 |
| **Total** | | **+21 tests** |

**Test count before**: 26 across 3 files. **Test count after**: 47 across 4 files. All green.

#### Phase 5b implementation backlog (waterCalc L1 unit tests)

Phase 5b was originally scoped as deferred but is being executed incrementally in 5 bounded sub-phases (1 PR per sub-phase, all suites green before commit). The split groups files by their stoichiometric / mash-pH / sparge-acidification domains so each PR has cohesive scope:

| Sub-phase | Files | Approach | Status |
|---|---|---|:-:|
| **Phase 5b-1** — stoichiometry + alkalinity primitives | `saltAdditions.ts` (183 LoC) + `residualAlkalinity.ts` (62 LoC) | New `saltAdditions.test.ts` (24 tests) covers stoichiometry per-salt (gypsum, CaCl2·2H2O, epsom, NaCl, NaHCO3 with literature-comparable ppm values), linearity (2x grams → 2x ppm), inverse volume scaling (2x volume → ½ ppm), multi-salt accumulation, breakdown shape invariants (per-ion sum = overall delta), and all validation error paths (non-finite volume, ≤0 volume, non-finite base ion, unknown saltKey, null addition, non-numeric / NaN / negative grams). New `residualAlkalinity.test.ts` (17 tests) covers Kolbach coefficients (0.713 Ca, 0.588 Mg), the clamp-to-zero on effective alkalinity, defaults-to-zero for missing Ca/Mg, all non-finite throw paths, and symmetry between the standalone helper and the embedded calculation inside `effectiveAlkalinityPpmCaCO3FromCaMg`. | ✅ **Landed 2026-05-18** |
| **Phase 5b-2** — mash-pH estimator | `mashPhEstimateV1.ts` (215 LoC) | New `mashPhEstimateV1.test.ts` (32 tests, 6 describe blocks): baseline + boundary outputs pinning the 4 hand-computed reference cases (empty grist + zero alk → 5.76; empty grist + alk=50 → 5.93; single base-malt zero-everything → diPh; mild TA=5 mEq/kg → 5.63); model-constants pin (`baselineDiMashPh: 5.76`, `slope: -0.17`, `baselineRatioQtPerLb: 1.5`, `lPerKg_to_qtPerLb: 0.4792`); 5 monotonic sensitivity checks (alkalinity ↑ → pH ↑; Ca ↑ → effAlk ↓ → pH ↓; Mg ↑ → pH ↓; acidulated TA ↑ → pH ↓; acidAdded ↑ → pH ↓); thicker-mash amplifies alkalinity; overrides + missing row counts (override precedence, missingDiPhRowCount, missingTaRowCount, amountKg≤0 skip, perRow shape); invariants (volume-grist proportional scaling preserves pH; effAlk wiring; massive acid load → clamped="low" at 0.1); all 12 validation throw paths. **Note:** `mashPhEstimate.ts` (16 LoC trivial wrapper) deferred to 5b-5. | ✅ **Landed 2026-05-18** |
| **Phase 5b-3** — mash acidification (target + manual) | `mashAcidificationTargetMashPh.ts` (307 LoC) + `mashAcidificationManual.ts` (136 LoC) | New `mashAcidificationManual.test.ts` (12 tests, 4 describe blocks): bracket clamps (zero-acid → "high" at pH=8.0; very-large-acid → "low" at pH=3.0); bisection (iterations > 0; clamped="none" for mid-range; monotonic more-acid → lower achievedPh); inverse-symmetry round-trip with `spargeAcidification` (sparge solves "X ml achieves pH=5.5" → manual({acidAddedMl: X}) → achievedPh ≈ 5.5); acid-type differentiation (lactic vs phosphoric); solid-strength branch (uses acidAddedGrams not acidAddedMl); validation throws (missing acidAddedMl/acidAddedGrams; negative; NaN). New `mashAcidificationTargetMashPh.test.ts` (19 tests, 5 describe blocks): happy-path bisection convergence with probe-verified inputs (alk=100, target=6.0 → 1.95 ml, iters=7, estimatedFinal ≈ 6.0); liquid result-shape (ml+tsp populated, grams+kg null, tsp/ml = 0.2029 conversion); solid result-shape (grams+kg populated, kg/grams = 0.001 conversion); early-return when estimateAtZero ≤ target (returns 0 acid + clamped="low" + estimateAtZero === estimateAtSolution); 3-point monotonic target (targets 6.15, 6.10, 6.00 — all converge cleanly); 3-point monotonic alkalinity (alk 80, 100, 120 at target=6.05 — all converge); maltClass → modelKey wiring (roast + acidulated reduce estimateAtZero; pinned via estimateAtZero comparison rather than acidRequiredMl to avoid clamping fragility when the model's reachable-pH range is exceeded); debug payload shape (estimateAtZero + estimateAtSolution + bracket); 9 validation throws. **Important model constraint pinned:** the `mashAcidificationManual` water-pH=3 inverse clamp bounds how much acid effect the model can register (`acidAdded_mEqPerL` is capped at whatever water-acid-demand at pH=3 reports). This makes the function's reachable mash-pH range narrow (typically ~0.2 pH units around estimateAtZero); the test inputs are deliberately chosen to land inside this range. | ✅ **Landed 2026-05-18** |
| **Phase 5b-4** — sparge acidification (the BrunWater carbonate solver + its manual-mode inverter) | `spargeAcidification.ts` (313 LoC) + `spargeAcidificationManual.ts` (145 LoC) | New `spargeAcidification.test.ts` (26 tests, 5 describe blocks): happy paths (positive finite acidRequiredMl; tsp/ml = 0.2029; BrunWater B11 identity finalAlk = effAlk − acidReq · 50); strength-kind output shape (4 variants — percent populates ml + tsp + sg_mgPerMl; normality populates ml + tsp, no sg; molarity populates ml + tsp, no sg; solid populates grams + kg, no ml + tsp; even liquid acids with strength.kind="solid" force the solid shape); sulfate/chloride additions (sulfuric → sulfateAddedPpm = mMRequired × 96; hydrochloric → chlorideAddedPpm = mMRequired × 35.5; lactic + phosphoric + acetic + citric + tartaric + malic → both 0); monotonic sensitivities (higher alk → more acid; lower targetPh → more acid; more Ca → less acid; more Mg → less acid; doubling volume doubles acidRequiredMl with mEq/L invariant; different acid types at same strength produce different acidRequiredMl + different frac_equivalentsPerMole); 10 validation throws (non-finite startingAlk + startingPh + targetPh + volumeLiters + Ca + Mg; negative Ca + Mg; percent ≤ 0; normality ≤ 0; molarity ≤ 0). New `spargeAcidificationManual.test.ts` (14 tests, 4 describe blocks): mirrors the mash counterpart — bracket clamps (zero acid → "high" at 8.0; large acid → "low" at 3.0); bisection (mid-range converges; monotonic more-acid → lower achievedPh; inverse-symmetry round-trip with `spargeAcidification`; different-acid-type differentiation); Ca/Mg pass-through to the inner sparge solver (Ca reduces effective alkalinity → same acid pushes pH lower); solid-strength branch; validation throws including Ca/Mg propagation through the inner call. | ✅ **Landed 2026-05-18** |
| **Phase 5b-5** — overall + small helpers (closing the audit) | `overall.ts` (51 LoC) + `mashPhEstimate.ts` (16 LoC) | New `overall.test.ts` (20 tests, 5 describe blocks): `bicarbonatePpmToAlkalinityPpmCaCO3` factor 50/61 (≈ 0.8197) + zero passthrough + negative-bicarb non-defensive passthrough + non-finite throw; `alkalinityPpmCaCO3ToBicarbonatePpm` factor 61/50 (≈ 1.22) + round-trip symmetry (alk → bicarb → alk returns original for {0, 1, 50, 100, 250.5}) + non-finite throw; `deriveBicarbonatePpmFromAlkalinityPpmCaCO3` same formula but with negative-alkalinity → 0 clamp (the brewing reporting contract: "reported bicarbonate concentration cannot be negative" — matters because the acid step can drive finalAlkalinity below 0 mathematically); `combineAfterSaltsAndAcid` 7 invariants (Ca/Mg/Na unchanged from afterSalts; sulfate + chloride get acid-step deltas ADDED; **bicarbonate is OVERWRITTEN by acidResult.finalAlkalinity, NOT propagated from afterSalts.bicarbonate** — pins that the acid step is the final source of truth for alkalinity; negative finalAlk → bicarb clamped to 0; 3 validation throws for non-finite acid-result fields); `alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult` bridge from saltAdditions step to acid step. New `mashPhEstimate.test.ts` (3 tests): forwards verbatim to `mashPhEstimateV1` via deep-equal comparison on a realistic input + an empty-grist input + identical error propagation (no wrapping). | ✅ **Landed 2026-05-18** |

**Phase 5b-1 deliverables in detail:**

Files added:
- `services/api/src/domain/waterCalc/saltAdditions.test.ts` (24 tests across 3 describe blocks: happy paths / invariants + breakdown shape / validation errors)
- `services/api/src/domain/waterCalc/residualAlkalinity.test.ts` (17 tests across 2 describe blocks: `alkalinityReductionFromCaMgPpmCaCO3` / `effectiveAlkalinityPpmCaCO3FromCaMg`)

Reference numerics pinned by `saltAdditions.test.ts` (cross-checked against the Bru'n Water convention of "1g salt per US gallon"):

| Salt | 1g in 20L → ppm delta | Literature equivalent (1g/gal scaled to /20L = ×3.785/20 = ×0.18925) |
|---|---|---|
| Gypsum (CaSO4·2H2O) | Ca: 11.64 / SO4: 27.9 | ~62 Ca / ~147 SO4 per gallon → ~11.73 / 27.81 per 20L (✓ within precision) |
| CaCl2·2H2O | Ca: 13.63 / Cl: 24.11 | ~72 Ca / ~127 Cl per gallon → ~13.63 / 24.04 per 20L (✓) |
| Epsom (MgSO4·7H2O) | Mg: 4.93 / SO4: 19.49 | ~26 Mg / ~103 SO4 per gallon → ~4.92 / 19.49 per 20L (✓) |
| NaCl | Na: 19.67 / Cl: 30.33 | ~104 Na / ~160 Cl per gallon → ~19.68 / 30.28 per 20L (✓) |
| NaHCO3 | Na: 13.68 / HCO3: 36.32 | ~72 Na / ~192 HCO3 per gallon → ~13.62 / 36.33 per 20L (✓) |

All 5 salts and both ions per salt are within the chosen `toBeCloseTo(value, 1)` (i.e. 0.1 ppm) precision. Future "coefficient drift" PRs will fail these tests loudly with a clear diff against literature values.

**Phase 5b approach for the remaining sub-phases (5b-2 through 5b-5):**

1. **Inventory per-function call sites first.** Before writing tests for `mashPhEstimateV1.ts`, etc., grep the routes (`services/api/src/routes/recipeWaterComputeAndSave.ts`) for the input shapes that actually get passed in production. This avoids spending time testing dead branches.
2. **Author one `.test.ts` sibling per non-trivial source file** (skip the 16-LoC trivial wrapper if its only role is re-export).
3. **Focus on:**
   - Boundary inputs (zero ions, zero fermentables, empty mash, etc.)
   - Monotonic sensitivity checks (more X → more/less Y, in the direction the underlying chemistry dictates)
   - Sentinel/error-path behavior (NaN, negative, undefined optional fields)
   - Symmetric round-trip checks where applicable (compute → derive → re-compute, or target-mode acid amount fed back into manual-mode → matches predicted pH)
4. **Keep the L4 contract snapshots as-is.** They pin wire format; L1 owns per-function math. These layers are complementary, not redundant.
5. **Estimate (remaining)**: ~1 day total across sub-phases 5b-2 through 5b-5 (~3-4 hours each, plus the smaller 5b-5).
