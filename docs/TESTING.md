# Testing strategy (brewery-app)

This is the single source of truth for "what do I test, where, and how" in this monorepo. Read it before adding a new test or asking the agent to add one. Pair with [TESTING-DECISION.md](TESTING-DECISION.md) (decision tree) if you can't decide which layer applies.

**Status:** v1.2 (test-coverage hardening pass — Phase 1 + Phase 2 + Phase 3a landed 2026-05-17/18; see [Coverage audit + hardening pass](#coverage-audit--hardening-pass-2026-05-17) below). The foundation-hardening pass ahead of the H1 2027 public-AGPLv3 flip ([`docs/ROADMAP.md`](ROADMAP.md)) has four slices: lint ✅ landed, **tests 🟢 in progress (Phase 4b regression-pin trio L1+L4+L5 complete)**, types 🟡 not started, docs 🟡 not started. The "what to test" framework below is unchanged; the audit + phase log are new.

## Layers (cheapest to most expensive)

| Layer | Tool | Where | When it runs | What it catches |
|---|---|---|---|---|
| L1 Unit | vitest | `packages/contracts`, `packages/core` | every push, < 5s | parser regressions, math regressions, unit conversions |
| L2 API integration | vitest + Prisma + Postgres | `services/api/src/tests/*.test.ts` | every push (CI) | route behavior, ACL, workspace scoping, BeerJSON round-trips |
| L3 Smoke | bash + curl | `scripts/smoke.sh` | pre-push, post-`compose up`, in `@brewery/test-mcp` | nginx -> web -> api -> postgres path is alive |
| L4 BeerJSON contract snapshots | vitest (shape-based) | `services/api/src/tests/contracts/*.snap.test.ts` | every push (CI) | native-consumed response shape drift |
| L5 Web E2E (deterministic) | Playwright headless + axe | `apps/web/e2e/` | PR-triggered CI, on demand | UI flows, locale routing, a11y critical violations |
| L6 Agentic browser E2E | Cursor browser-MCP + `@brewery/test-mcp` | on demand only | when investigating, exploring, or extending L5 | unknown unknowns, "something feels off" |

Each layer is a **gate** for the one above: don't reach for L6 until L1-L5 are green.

## What goes in each layer

### L1 - Unit (`packages/contracts`, `packages/core`)

Pure functions. No DB, no Fastify, no network. If you add or rename a field in:

- [packages/contracts/src/water/parseComputeAndSave.ts](../packages/contracts/src/water/parseComputeAndSave.ts)
- [packages/contracts/src/water/parseHubSummary.ts](../packages/contracts/src/water/parseHubSummary.ts)
- [packages/contracts/src/analysis/parseGravityAnalysis.ts](../packages/contracts/src/analysis/parseGravityAnalysis.ts)
- [packages/core/src/gravity.js](../packages/core/src/gravity.js) or [packages/core/src/units](../packages/core/src/units)

...you MUST add a vitest case in the same package under `src/**/*.test.ts`.

Run inside Docker (no host npm — see [.cursor/rules/00-shared-node-npm-container-only.mdc](../.cursor/rules/00-shared-node-npm-container-only.mdc)).

**Use scoped installs** for L1 (do **not** run a repo-wide
`--workspaces` install from a one-shot `node:20-slim` container): the
default `--workspaces` install reuses the root `package-lock.json` and
will prune `services/api/node_modules` to its lockfile baseline, which
breaks the long-running api container until you `docker compose exec
api npm install` again. Install only the packages you actually want to
test:

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim \
  bash -lc "npm install --no-audit --no-fund -w @brewery/contracts -w @brewery/core --include-workspace-root && \
            npm test -w @brewery/contracts && npm test -w @brewery/core"
```

Notes:
- `-w @brewery/contracts -w @brewery/core` scopes installation to just
  those two workspaces (plus their hoistable deps) and leaves
  `services/api/node_modules` and `apps/web/node_modules` alone.
- `--include-workspace-root` is required so the root devDependency
  (vitest) is also installed for the workspaces to use.
- If the api container's `node_modules` ever gets pruned anyway (e.g.
  because someone else ran a `--workspaces` install), recover with
  `docker compose exec api npm install --no-audit --no-fund`.

### L2 - API integration

Lives in [services/api/src/tests](../services/api/src/tests). Already has 20+ specs against a real `brewapp_test` Postgres. Use the existing `createSessionForTestUser` helper at [services/api/src/tests/helpers/session.ts](../services/api/src/tests/helpers/session.ts) for auth.

Run:

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

Driven by the Cursor browser MCP, orchestrated through `@brewery/test-mcp`. Three named jobs:

- `agenticCreateRecipe`
- `agenticBrewDay`
- `agenticWaterCalcSanity`

Each job writes a run dir under `var/test-runs/<timestamp>/` with screenshots, structured log, and a one-line verdict.

Skill + job catalog split:

- **Protocol / bounds / output contract** (generic, shipped upstream by `@rftsu/cursor-rules`): [.cursor/skills/agentic-browser-web-app.md](../.cursor/skills/agentic-browser-web-app.md).
- **Brewery-specific job catalog** (this repo, committed): [docs/agentic-jobs.md](agentic-jobs.md).
- **MCP server** that smooths the non-UI prerequisites (smoke / seed / `loginAs`): [packages/test-mcp](../packages/test-mcp) + upstream skill [.cursor/skills/test-mcp-server.md](../.cursor/skills/test-mcp-server.md).

## E2E fixture identities (single source of truth)

These are the personas every E2E layer (L3, L5, L6) shares. Seeded by [services/api/src/cli/seedE2eFixture.ts](../services/api/src/cli/seedE2eFixture.ts) (idempotent — re-run anytime):

| Persona | Email | Password | Role | Workspace |
|---|---|---|---|---|
| e2e-admin | `e2e-admin@brewery.local` | `e2e-admin-pw!` | brewery_admin | E2E Brewery |
| e2e-member | `e2e-member@brewery.local` | `e2e-member-pw!` | member | E2E Brewery |
| e2e-viewer | `e2e-viewer@brewery.local` | `e2e-viewer-pw!` | viewer | E2E Brewery |

Stable IDs (so tests can hardcode):

- User UUIDs: `e2e0000-0000-0000-0000-00000000aaaa/bbbb/cccc`
- Workspace UUID: `e2e0000-0000-0000-0000-0000000000ws`
- Recipe ("E2E Pale Ale") UUID: `e2e0000-0000-0000-0000-000000000abc`
- Water profile UUID: `e2e0000-0000-0000-0000-000000000fff`

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

- For any non-trivial code change, the agent SHOULD propose a test diff alongside the code diff. This is encoded in [.cursor/rules/20-tests-must-follow-changes.mdc](../.cursor/rules/20-tests-must-follow-changes.mdc).
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
| **L1 Unit** — `packages/core` (math + unit conversion) | `packages/core/src/**/*.test.ts` | TBD (existing suite, not re-measured in this audit) | 🟡 **Audit-deferred** — TESTING.md L1 section explicitly mentions `packages/core/src/gravity.js` + `packages/core/src/units`, but a parser-by-function coverage audit was not done in this round. Recommended next round. | — |
| **L2 API integration** | `services/api/src/tests/*.test.ts` (excluding `contracts/**`) | 26 spec files (~20+ specs per the original kickoff note) | 🟡 **No formal gap audit done yet** — all the major routes (recipes, water-profiles, brewSessions, ai, billing, etc.) have suites, but per-route route-coverage was not measured. The `waterProfiles.test.ts` suite *did* exercise the renamed `body.workspace` field (line 87-88) post-Phase-4b, so L2 was actually aligned with the rename — the bug was strictly UI-consumer drift. | Phase 4b NOT an L2 gap. |
| **L4 BeerJSON contract snapshots** | `services/api/src/tests/contracts/*.test.ts` | **15 of ~15 native-consumed endpoints covered (was 2 pre-audit; Phase 2 complete 2026-05-18)**: `recipe.contract.test.ts` (POST /recipes + GET /recipes/:id), `auth.contract.test.ts` (GET /auth/me), `waterProfiles.contract.test.ts` (Phase 4b L4 regression-pin), `recipeWater.contract.test.ts` (GET /water-settings + GET /water-hub-summary), `recipeWaterCompute.contract.test.ts` (POST mash + sparge + boil compute-and-save), `brewSessions.contract.test.ts` (POST create + GET list + GET detail), `inventoryEndpoints.contract.test.ts` (GET equipment-profiles + GET ingredients/{fermentables,hops,yeasts}). | ✅ **Phase 2 complete (2026-05-18)** — full L4 coverage of the native-consumed surface; 7 contract test suites, 16 tests. | Phase 4b pinned at L4; entire water-calc surface has L1+L4 alignment; all primary native screens have snapshot coverage of their consumed endpoints. |
| **L5 Web E2E** | `apps/web/e2e/**/*.spec.ts` | **8 specs** (auth, dashboard, water-calc, **water-profiles** ←Phase 3a 2026-05-18, recipe-list, ai-pages, recipe-create, brew-session) | 🟢 **Improving — Phase 3a landed 2026-05-18** — the Phase 4b production-rendering symptom is now pinned at L5 (`smoke/water-profiles.spec.ts` asserts the seeded "E2E Tap Water" workspace profile appears in the `/en/water-profiles` table + verifies the `/api/water-profiles` response carries `body.workspace`). Combined with the L1 dual-key parser test + L4 contract snapshot, Phase 4b now has full L1+L4+L5 regression-pin coverage. SelectWorkspace flow (Phase 5g context) remains uncovered → Phase 3b. | Phase 4b ✅ pinned L1+L4+L5; Phase 5g still un-pinned (next: Phase 3b). |
| **L6 Agentic browser E2E** | `var/test-runs/<timestamp>/` from on-demand runs; named jobs in `docs/agentic-jobs.md` | 3 named jobs | ⚪ **By design on-demand only** — not part of CI; not a closeable gap (per kickoff non-goals). | — |

### Phase plan (hardening pass)

This audit is **Phase 1 of the test-coverage hardening slice**. Subsequent phases are scoped but not yet landed:

| Phase | Scope | Effort estimate | Status | Tracking |
|---|---|---|:-:|---|
| **Phase 1 — L1 contract parser coverage** | Bring the contract-parser test count from 5/8 to 8/8 by adding `parseAuthMeResponse`, `parseWaterProfileItem`, `parseWaterProfilesResponse` test files. Pin the `account → workspace` dual-key parser behavior (the same dual-key that allowed Phase 4b to be invisible at the wire level) so a future "remove legacy key" PR has an explicit test impact. | ~30 min | ✅ **Landed 2026-05-17** | This doc § above; commit landing the gap fix. |
| **Phase 2 — L4 contract snapshots for the uncovered native-consumed endpoints** | Audit `apps/native/src/**` for `api.{get,post,patch,put,delete}` call sites; cross-reference against existing `*.contract.test.ts` files; author the missing snapshot tests. Split into sub-phases for bounded commits. | ~2-4 hours total | ✅ **Complete (2026-05-18)** — 13 new snapshots across 5 new contract test suites covering all primary native-consumed endpoints. L4 coverage 2/15 → 15/15. See [Phase 2b backlog](#phase-2b-backlog-l4-snapshots-still-missing) below for the per-endpoint closure log. |
| **Phase 3 — L5 Playwright regression pins for Phase 4b + Phase 5g** | Split into 3a + 3b. **Phase 3a (Phase 4b L5 pin)**: assert workspace water profile appears in the `/en/water-profiles` table + asserts `/api/water-profiles` response carries `body.workspace`. **Phase 3b (Phase 5g SelectWorkspace flow)**: add a spec covering the SelectWorkspace flow (visible to apps/web users with multiple workspaces). | ~2-3 hours total | 🟢 **Phase 3a landed 2026-05-18** (`apps/web/e2e/smoke/water-profiles.spec.ts`; 2 tests, both green). Phase 3b not started. | Phase 4b regression-pin trio now complete (L1+L4+L5). |
| **Phase 4 — L2 integration coverage gap audit** | Per-route audit of `services/api/src/tests/*.test.ts`. Identify routes with thin coverage; add specs for ACL/scope edge cases. | Larger; needs route inventory first. | 🟡 Not started | TBD |
| **Phase 5 (optional) — `packages/core` math/units L1 gap audit** | Inventory `packages/core/src/{gravity.js,units}` exported functions; cross-reference with existing tests; fill gaps. | Smaller; bounded chunk. | 🟡 Not started | TBD |

**Recommended order:** Phase 2 first (L4 snapshots) ✅ done — the cheapest-bug-catching layer given Phase 4b was a "the wire format changed and we never noticed" failure. Phase 3a (Phase 4b L5 pin) ✅ done — closes the regression-pin trio for the original cleanest-signal bug across L1+L4+L5. Phase 3b next (SelectWorkspace L5 — uncovered flow pin for Phase 5g). Phase 4-5 last (they're "no known bug yet" coverage extensions rather than regression pins).

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

### What this audit deliberately does NOT change

- The **layer-mapping framework** (L1-L6) and the per-layer "what goes in" guidance. That section is solid and pre-dates this audit.
- The **`Anti-laziness defaults`** (`.cursor/rules/20-tests-must-follow-changes.mdc`) — the workflow gate is unchanged.
- The **E2E fixture identities** — still the same personas/IDs.
- The **per-layer run commands** — still the same Docker invocations.

The audit is additive: it documents the gap state at a point in time and lays out the work needed to close it.
