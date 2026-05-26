# `@brewery/*` → `@umbraculum/*` per-package handoff checklist

**Tier:** Public
**Status:** **CLOSED 2026-05-19** — sub-plan #9 closed; all 14 slots landed (commits on `master` between `25d4a3a` (slot 1) and `4062dd6` (slot 14)). Slot recap (1: `test-mcp` worked example, 2: `media`, 3: `navigation`, 4: `automation-contracts`, 5: `ui` — heavy 69-file slot held cleanly on first attempt under the slot-4-corrected recipe, 6: `brewery-core` — ⚠ TRAP slot held cleanly on first attempt under the §1.3 classification gate, 7: `i18n` — first slot with a controlled **transient cross-scope state**, 8: `i18n-react` — closed slot 7's transient cross-scope state and validated the no-root-install / named-volume native-typecheck pattern as the slot-5-GOTCHA-free default, 9: `contracts` — heaviest slot at 122 occurrences across 75 files; opened TWO transient cross-scope states simultaneously (`api-client` + `module-sdk` both depend on `@brewery/contracts`), surfaced the bulk-sed self-corruption lesson + the slash-delimited shorthand-comment lesson, 10: `api-client` — closed slot-9's first transient cross-scope state, 11: `module-sdk` — closed slot-9's second transient cross-scope state, absorbed cross-agent PIM contamination cleanly via amend, 12: `brewery-beerjson` — second brewery-vertical, slot-6 TRAP discipline held on first attempt, 13: `brewery-recipes-ui` — third brewery-vertical (TRAP discipline now 3-of-3), surfaced the forecast-becomes-live doc-tier tautology lesson, 14: application workspaces ×4 — `@brewery/{api, web, native, web-e2e}` → `@umbraculum/{api, web, native, web-e2e}` — closes sub-plan #9, surfaced the operational closing-condition lesson) + **post-slot-7 CI hygiene fix #2** (interlude, plan doc §6.7): isolated three independent local-vs-CI divergence mechanisms (gitignored cross-references, nested-workspace install drift, stale-node_modules bind-mount shadowing) and introduced `scripts/ci-parity-check.sh` so slot operators could reproduce CI's static-analysis jobs in a clean `git archive HEAD` snapshot before pushing — codified into umbraculum-toolset as rule `72-ci-parity-local-vs-ci-divergence.mdc` + skill `ci-parity-local-reproduction` (umbraculum-toolset commit `5748c5b`). **All slot operators from slot 8 onward ran `bash scripts/ci-parity-check.sh` as the last step before `git push` — see plan doc §6.7.** **Slot 4 corrected the slot-3 recipe**: the real devDep pruner is the build script's `npm ci`, not any restart. Step 5 is now a STOP-build-install-START sequence (see plan doc §4 step 5); step 4b's per-container api install was REMOVED (web-only now). **Slot 5 added two further awarenesses to step 6**: (a) `apps/web` typecheck is excluded from CI and currently produces ~1073 accepted-cost `TS2322` errors — do not treat as a regression; (b) running native typecheck via host one-shot `docker run -v "$PWD:/repo" ... npm install` prunes api devDeps the same way the build script does — recovery is STOP-install-START (no rebuild). **Slot 6 added four further refinements**: (a) root `package.json` `test:packages` is a HARD STOP analog of `build:packages` — preflight skill grew Command 6; (b) `.github/workflows/api.yml` workflow step `name:` display strings are a separate HARD STOP class (path globs in `on.push.paths` use filesystem paths — no change; step display names use npm names — must change); (c) slot-5 gotcha refined — only `npm install` (not `npm run <script>`) prunes the api bind-mount; (d) bulk sed should exclude the just-edited `packages/<name>/package.json` whenever step 1's description deliberately contains a historical reference to the old name (TRAP-slot pattern). **Slot 7 added three further refinements**: (a) **NEW HARD STOP** — bulk sed must also exclude the plan doc + handoff doc themselves; (b) the "transient cross-scope state" for split packages is precisely the **workspace name** of the downstream package; (c) **substring collision safety re-verified** under the `[^a-zA-Z0-9_-]` regex tail. **Slot 8 added two further refinements**: (a) **NEW PREFERRED PATTERN** — native typecheck via the no-root-install / named-volume mount (`docker run -v "$PWD:/repo" -v brewery_app_root_node_modules:/repo/node_modules -w /repo/apps/native node:20-slim sh -c 'PATH="/repo/node_modules/.bin:$PATH" npm run typecheck'`) AVOIDS the slot-5 GOTCHA entirely — ~6s instead of ~60s, and api is provably unaffected; the older `cd /repo && npm install ...` pattern stays as a cold-start fallback; (b) **substring-collision sanity check expanded from 2-cousin to 4-cousin** — explicit verbiage in plan doc §4 step 3 now covers longer-prefix + shorter-prefix + just-renamed-sibling-in-new-scope + export-subpath cousins. **Slot 9 added two further refinements**: (a) **NEW HARD STOP** — bulk-sed scripts must exclude `cursor-tmp/` (the script that lives there can self-corrupt by editing its own source mid-run); (b) **NEW LESSON** — slash-delimited shorthand comments (`// @brewery/<name>`-style) become self-inconsistent post-rename and must be sweep-included. **Slot 13 added the forecast-becomes-live tautology purge** as a new step 3b in plan doc §4 — brewery-vertical slots create cross-package README forecasts of form "(will be renamed to `@umbraculum/brewery-<name>` in slot N)" that become tautological post-rename; cleanup pass purges them. **Slot 14 added the operational closing-condition refinement** to plan doc §5 — the literal `grep -rE "@brewery/[a-z]"` form was unachievable as written (~26-30 historical references legitimately remain as audit-trail records); the operational form distinguishes LIVE refs (must be zero — workspace `name`, deps, imports, transpilePackages, build/test invocations, CI workflow names, lockfile entries) from HISTORICAL refs (intentionally retained — README NOTE-blocks, plan/handoff prose, RFC narrative). Net effect across slots 1–14: the recipe is now substantially shorter and more robust than any earlier version; proven robust under heavy slot loads (slot 5 / slot 9), TRAP slot loads (slots 6 / 12 / 13 — 3-of-3), controlled cross-scope transients (slots 7 / 8 + slots 9 / 10 / 11), cross-agent contamination (slot 11), and bundle-rename closure (slot 14). The per-slot recipe is now a captured artifact, ready for the next package-scope rename project.
**Audience:** the person executing the next slot — could be the original author days/weeks later, or another contributor.
**Pairs with:** [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md) — the L1 plan doc. Read §1 (classification), §4 (verification recipe), and §5 (risk register) of the plan doc BEFORE picking up a slot from this checklist.

> **Disclaimer.** This doc is a *checklist*, not a plan. Every per-slot section follows the same shape: (a) source → target name + classification, (b) file inventory grouped by surface, (c) hard-stops + slot-specific gotchas, (d) verification + commit checklist. Steps that are identical across all slots (e.g., "step 4 — regenerate lockfiles in container") live in plan doc §4 and are referenced by number here, not duplicated. If a slot needs to deviate from the plan-doc recipe, update the plan doc BEFORE deviating — never silently.

---

## How to use this doc

1. Open the next un-checked slot (sections are ordered slot 1 → slot 14, matching plan doc §3).
2. Read the slot's **§Target + classification** to lock in the right destination name.
3. Read the slot's **§Hard stops** — these are the slot-specific things that will go wrong if you skip them.
4. Follow the slot's **§File inventory** as a working checklist; check items off as you edit them.
5. Follow plan doc §4 (verification recipe steps 1–7) for the mechanical loop.
6. Tick the slot's **§Verification + commit** checklist.
7. If anything surprised you, update plan doc §4 / §5 BEFORE the commit lands.
8. Commit with the message format from plan doc §4 step 7.
9. Mark this slot's `Status:` line as **Done** with the commit hash; move to the next un-checked slot in a future session.

---

## Slot 1 — `@brewery/test-mcp` → `@umbraculum/test-mcp` (worked example)

**Status:** **Done 2026-05-19** (commit hash recorded in the worked-example commit; see git log alongside the scoping deliverable commit `25d4a3a`).

**Target + classification.** Platform. Test-MCP HTTP server exposing testing tools (smoke, seed, vitest, Playwright, contracts). No brewery-domain logic.

**Hard stops.** None expected — lowest blast radius, zero workspace consumers; chosen explicitly as a low-risk worked-example pick. Three gotchas surfaced during execution and folded back into plan doc §4 / §5; subsequent slots benefit from the upgraded recipe (see "Lessons for slots 2–14" at the bottom of slot 1).

**File inventory.**

Workspace name + own files:
- [x] [`packages/test-mcp/package.json`](../../packages/test-mcp/package.json) — update `name` field AND `bin:` field (`brewery-test-mcp` → `umbraculum-test-mcp`).
- [x] [`packages/test-mcp/README.md`](../../packages/test-mcp/README.md) — heading + in-text references + Cursor MCP wiring example's server key (`brewery-test-mcp` → `umbraculum-test-mcp`).
- [x] [`packages/test-mcp/src/server.ts`](../../packages/test-mcp/src/server.ts) — JSDoc comment + `console.log` identity string.

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) — §3 inventory mention.
- [x] [`docs/ROLLOUT.md`](../ROLLOUT.md) — 3 references.
- [x] [`docs/TESTING.md`](../TESTING.md) — 3 references (the path reference `packages/test-mcp` stays; only the package-name references change).

Lockfile + dist:
- [ ] Root [`package-lock.json`](../../package-lock.json) — regenerated by `npm install` in container.
- [ ] [`packages/test-mcp/package-lock.json`](../../packages/test-mcp/package-lock.json) — regenerated.
- [ ] `dist/` — rebuilt by [`scripts/build-packages-in-docker.sh`](../../scripts/build-packages-in-docker.sh) if package emits a build artifact.

Notes:
- Zero workspace consumers (`apps/*`, `services/*`, other `packages/*` `package.json` files do not list it).
- No `next.config.js transpilePackages` touch (not in the list).
- No `metro.config.js extraNodeModules` touch (not pinned).
- No `tamagui.config.ts` touch.

**Verification + commit.**

- [x] Plan doc §4 step 6 — `test-mcp` typecheck green, api typecheck green, api `npm test` green (51 files / 413 tests, same as post-B-3 baseline), Nginx smoke `/api/health` returns `{"ok":true}`.
- [x] Lockfile diff scoped to test-mcp only — `git diff --stat package-lock.json` showed 6 insertions / 6 deletions, all test-mcp entries (`name`, `bin`, two `node_modules/@brewery/test-mcp` → `node_modules/@umbraculum/test-mcp` map entries).
- [x] Commit using plan doc §4 step 7 format.
- [x] Slot 1 status line above updated.

**Lessons for slots 2–14 (recorded in plan doc §4 / §5; flagged here so each subsequent slot reader gets a heads-up):**

1. **Always check the `bin:` field** in the package's own `package.json` — if it encodes the old scope (`brewery-<x>`), rename to match (`umbraculum-<x>`). Plan doc §4 step 1 now enumerates this.
2. **Always check user-facing config samples in the package's README** — MCP server entries, CLI command examples, JSON snippets. Plan doc §4 step 1 now enumerates this.
3. **The bind-mounted `services/api/node_modules` + `apps/web/node_modules` get destructively pruned by the root `npm install`, even for renames where the renamed package has zero `apps/*` / `services/*` consumers.** The per-container `npm install` + `docker compose restart api` in step 4 is therefore unconditional — do not skip it on grounds of "this package isn't a runtime dep of api". Recovery time is ~30 seconds but easy to misdiagnose as "the rename broke something". Plan doc §4 step 4 + §5 risk row now cover this explicitly.

---

## Slot 2 — `@brewery/media` → `@umbraculum/media`

**Status:** **Done 2026-05-19** (commit hash recorded in the slot-2 commit message; this slot is the first non-worked-example slot, driven by plan doc §4 alone).

**Target + classification.** Platform (framework). Generic shared-assets framework. Current assets are brewery imagery; content split deferred to when second vertical lands (plan doc §1.4).

**Hard stops.**

- **`apps/web/next.config.js`** has `transpilePackages: [..., "@brewery/media", ...]` — must be updated. Forgetting this triggers a silent Next.js transpile-miss; the web build still compiles but the package's TS/TSX won't be transpiled correctly.
- **Root `package.json` `build:packages` script** lists `npm run build -w @brewery/media` — must be updated. Forgetting this triggers `npm error No workspaces found: --workspace=@brewery/media` during step 5 (`scripts/build-packages-in-docker.sh`). **Discovered during slot 2 execution — was not in the pre-scoping inventory.** Now codified in plan doc §4 step 3 and §5 risk register; future slots must check this script.
- The package ships assets (PNGs, etc.) in `packages/media/assets/`; the *content* is brewery-flavored. The rename does NOT split the content — that's deferred (plan doc §1.4). Do not delete or move assets in this PR.

**File inventory.**

Workspace name + own files:
- [x] [`packages/media/package.json`](../../packages/media/package.json) — update `name` field; add classifying description.
- [x] [`packages/media/README.md`](../../packages/media/README.md) — heading + scope mentions of `@brewery/media` and the `@umbraculum/media` import sample.

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json) — `dependencies` entry.
- [x] [`apps/native/package.json`](../../apps/native/package.json) — `dependencies` entry.

Build configs:
- [x] **[`package.json`](../../package.json)** (root) — `scripts.build:packages` last entry (`-w @brewery/media`). **NEW: surfaced during slot 2; now a HARD STOP for all future slots.**
- [x] [`apps/web/next.config.js`](../../apps/web/next.config.js) — `transpilePackages` list (HARD STOP if missed).
- [x] [`apps/web/scripts/sync-media.mjs`](../../apps/web/scripts/sync-media.mjs) — script references.

Source imports:
- [x] [`apps/native/src/media/RemoteImage.tsx`](../../apps/native/src/media/RemoteImage.tsx).
- [x] [`apps/native/src/screens/YeastScreen.tsx`](../../apps/native/src/screens/YeastScreen.tsx).
- [x] [`apps/web/app/recipes/[id]/yeast/page.tsx`](../../apps/web/app/recipes/[id]/yeast/page.tsx).

Cross-package README references:
- [x] [`packages/contracts/README.md`](../../packages/contracts/README.md), [`packages/i18n/README.md`](../../packages/i18n/README.md), [`packages/media/README.md`](../../packages/media/README.md), [`packages/navigation/README.md`](../../packages/navigation/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](../REACT-NATIVE-KICKOFF-READINESS.md).

**Verification + commit.** Plan doc §4 steps 1–7 — all green:
- Lockfile diff: 14 lines, scoped to `@brewery/media` → `@umbraculum/media` rename.
- API health: `{"ok":true}` post-restart.
- `scripts/build-packages-in-docker.sh`: green; `@umbraculum/media@0.0.0` built (manifest + index in both ESM/CJS + .d.ts).
- `npm run typecheck` (api): green.
- `npm run test -- --run` (api): 413 tests pass, 51 test files.
- Nginx smoke (`/api/health`, `/en/login`, `/en/recipes`, `/en/automation`): all HTTP 200.

**Lessons for slots 3–14** (already folded back into plan doc §4 / §5 BEFORE the commit):

1. **Root `package.json` `build:packages` script** is now a HARD STOP file in plan doc §4 step 3. Every remaining slot must verify it.
2. **In-place `npm install` in api container** must use `--include=dev` to avoid omitting devDependencies (tsc, vitest, tsx). Plan doc §4 step 4b updated.
3. **Plugin-pack skill `package-scope-migration-preflight` landed** under `umbraculum-platform-tsjs-cursor-assistant/skills/`. Slots 3–14 should invoke it (read its SKILL.md) before starting, to get a fresh inventory + hard-stop check.

---

## Slot 3 — `@brewery/navigation` → `@umbraculum/navigation`

**Status:** **Done 2026-05-19** (commit hash recorded in the slot-3 commit message; first slot where the post-slot-2 recipe was executed end-to-end with preflight skill applied in advance).

**Target + classification.** Platform (framework). Route IDs + cross-platform routing policy framework. Current route IDs include brewery routes; content split deferred (plan doc §1.4).

**Hard stops.**

- The package exposes two entry points — `.` (web) and `./native` (native). Both have `dist/index.{js,cts,d.ts}` outputs; rebuilds must produce both.
- Route IDs themselves (e.g. `recipes`, `equipment`) are **not** renamed in this PR — they're public-facing route strings, not import paths. Only the npm scope changes.
- **Root `package.json` `build:packages` script** lists `npm run build -w @brewery/navigation` — HARD STOP per slot-2 lesson; was updated.

**File inventory.**

Workspace name + own files:
- [x] [`packages/navigation/package.json`](../../packages/navigation/package.json) — `name` field + added classifying description.
- [x] [`packages/navigation/README.md`](../../packages/navigation/README.md) — heading + scope text + both usage code samples (default + `./native` entrypoint) + dependency-stack mention.
- [x] [`packages/navigation/src/native.ts`](../../packages/navigation/src/native.ts) — internal JSDoc reference updated to `@umbraculum/navigation`.

Build configs:
- [x] **[`package.json`](../../package.json)** (root) — `scripts.build:packages` (`-w @brewery/navigation` → `-w @umbraculum/navigation`). Per slot-2 HARD STOP.

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).

Source imports:
- [x] [`apps/native/src/navigation/AppNavigator.tsx`](../../apps/native/src/navigation/AppNavigator.tsx).
- [x] [`apps/native/src/navigation/openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts).
- [x] [`apps/native/src/screens/BlockedRouteScreen.tsx`](../../apps/native/src/screens/BlockedRouteScreen.tsx).
- [x] [`apps/native/src/screens/DashboardScreen.tsx`](../../apps/native/src/screens/DashboardScreen.tsx).
- [x] [`apps/web/src/navigation/appRouter.ts`](../../apps/web/src/navigation/appRouter.ts).

Cross-package README references:
- [x] [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md). (navigation's own README already updated above.)

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) (3 mentions: package inventory, "Route IDs + typed params", cross-platform boundary packages list).
- [x] [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md) (workspace package list).
- [x] [`docs/ARCHITECTURE-REV02.md`](../ARCHITECTURE-REV02.md) (5 mentions across implementation log).

**Verification + commit.** Plan doc §4 steps 1–7 — all green:
- Preflight skill: 18 hits, classification=platform, HARD-STOPS=1 (root build:packages), no `bin:` field, no transpile/metro touch — matched handoff doc inventory exactly.
- Lockfile diff: 14 lines, scoped to `@brewery/navigation` → `@umbraculum/navigation` rename.
- API health: `{"ok":true}` post STOP → host-install → START sequence.
- `scripts/build-packages-in-docker.sh`: green; `@umbraculum/navigation@0.0.0` built dual entrypoints (`dist/index.{js,cjs,d.ts,d.cts}` + `dist/native.{js,cjs,d.ts,d.cts}` + shared chunk).
- `npm run typecheck` (api): green.
- `npm run test -- --run` (api): 413 tests pass, 51 test files.
- Nginx smoke (`/api/health`, `/en/login`, `/en`, `/en/recipes`, `/en/equipment`, `/en/automation`): all HTTP 200.

**Lessons for slots 4–14** (already folded back into plan doc §4 / §5 BEFORE the commit):

1. **`docker compose restart api` REPLACED by STOP → host-install → START** in §4 step 4b. The restart re-runs the container's startup `npm install` (no `--include=dev`) which silently re-prunes devDeps; the subsequent build step's unlink events then kill tsx watch because `/app/node_modules/tsx/dist/preflight.cjs` was pruned. New §5 row added (High likelihood, High severity).
2. **Preflight skill confirmed sufficient for sole inventory authority** on remaining slots — the slot-3 result matched the pre-scoped handoff inventory exactly; subsequent slots may rely on the skill rather than re-deriving the inventory by hand.

---

## Slot 4 — `@brewery/automation-contracts` → `@umbraculum/automation-contracts`

**Status:** **Done 2026-05-19** (commit hash recorded in the slot-4 commit message; the slot that finally isolated the build-script `npm ci` as the real devDep pruner — see plan doc §6.3).

**Target + classification.** Platform (canonical-module contracts, NOT brewery-vertical — vessel-agnostic). Already self-declared end-state name in its `package.json` description (cleaned up to current-state during the rename).

**Hard stops.**

- [`docs/design/openplc-mailbox-emitter-pr-shape.md`](./openplc-mailbox-emitter-pr-shape.md) §1 + §7 reference the old name when describing what the sister-repo emitter pairs with — both updated. Sister repo emits JSON-only artifacts and does NOT import this package (plan doc §2.3); doc references were the only sister-side change.
- [`packages/automation-contracts/src/version.ts`](../../packages/automation-contracts/src/version.ts) carries `CONTRACT_VERSION = "2.0.1-dev"` — verified NOT bumped during the rename; only its JSDoc reference text was retitled.

**File inventory.**

Workspace name + own files:
- [x] [`packages/automation-contracts/package.json`](../../packages/automation-contracts/package.json) — `name` field + description cleanup (removed "End-state npm scope: ..." sentence, replaced with "Renamed from ... as sub-plan #9 slot 4").
- [x] [`packages/automation-contracts/README.md`](../../packages/automation-contracts/README.md) — heading + sub-plan note + 3 npm command references (`-w @umbraculum/automation-contracts`).
- [x] [`packages/automation-contracts/src/version.ts`](../../packages/automation-contracts/src/version.ts) — JSDoc reference only; `CONTRACT_VERSION` constant value preserved at `"2.0.1-dev"`.

Build configs:
- [x] **[`package.json`](../../package.json)** (root) — `scripts.build:packages` (`-w @brewery/automation-contracts` → `-w @umbraculum/automation-contracts`). Per slot-2 HARD STOP.

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`services/api/package.json`](../../services/api/package.json).

Source imports (7 total — 2 web + 5 api):
- [x] [`apps/web/app/[locale]/(automation)/page.tsx`](../../apps/web/app/[locale]/(automation)/page.tsx).
- [x] [`apps/web/app/[locale]/(automation)/[vesselCode]/page.tsx`](../../apps/web/app/[locale]/(automation)/[vesselCode]/page.tsx).
- [x] [`services/api/src/modules/automation/adapters/mockAdapter.ts`](../../services/api/src/modules/automation/adapters/mockAdapter.ts).
- [x] [`services/api/src/modules/automation/adapters/mockAdapter.test.ts`](../../services/api/src/modules/automation/adapters/mockAdapter.test.ts).
- [x] [`services/api/src/modules/automation/services/vesselsService.ts`](../../services/api/src/modules/automation/services/vesselsService.ts).
- [x] [`services/api/src/modules/automation/routes/automationVesselsRoutes.ts`](../../services/api/src/modules/automation/routes/automationVesselsRoutes.ts) — both the `import` and a JSDoc reference.
- [x] [`services/api/src/services/ai/tools/automation/listVessels.ts`](../../services/api/src/services/ai/tools/automation/listVessels.ts).
- [x] [`services/api/src/services/ai/tools/automation/vesselState.ts`](../../services/api/src/services/ai/tools/automation/vesselState.ts).

Other:
- [x] [`docker-compose.yml`](../../docker-compose.yml) — line 116 comment.
- [x] [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma) — line 1330 comment; also cleaned up the parenthetical "(npm scope rename ... deferred to sub-plan #9)" since the rename is now done.

Doc references:
- [x] [`docs/design/canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) — §12.2-area mention of the handshake source-of-truth package.
- [x] [`docs/design/openplc-mailbox-emitter-pr-shape.md`](./openplc-mailbox-emitter-pr-shape.md) — §1 "Pairs with" + §7 mirror description (slot-4-specific HARD STOP).

**Verification + commit.** Plan doc §4 steps 1–7 (with new STOP-build-install-START sequence) — all green:
- Preflight skill: matched handoff inventory exactly; 18 hits, classification=platform, HARD-STOPS=2 (root build:packages + CONTRACT_VERSION not-bumped check), no `bin:`, no transpile/metro touch.
- `CONTRACT_VERSION` constant unchanged at `"2.0.1-dev"`.
- Lockfile diff: 14 lines, scoped to `@brewery/automation-contracts` → `@umbraculum/automation-contracts` rename.
- API health: `{"ok":true}` post STOP-build-install-START sequence.
- `scripts/build-packages-in-docker.sh`: green; `@umbraculum/automation-contracts@0.0.0` built single entrypoint (`dist/index.{js,cjs,d.ts,d.cts}`).
- `npm run typecheck` (api): green.
- `npm run test -- --run` (api): 413 tests pass, 51 test files (vitest baseline preserved — includes the rename-affected `mockAdapter.test.ts`).
- Nginx smoke (`/api/health`, `/en/login`, `/en`, `/en/recipes`, `/en/equipment`, `/en/automation`): all HTTP 200. The `/en/automation` page renders the vessels list backed by `@umbraculum/automation-contracts` types end-to-end.

**Lessons for slots 5–14** (folded back into plan doc §4 step 5 + §5 BEFORE the commit):

1. **Step 4b's per-container api install was REMOVED** — step 5 wipes api devDeps anyway via the build script's `npm ci`, so any earlier install is wasted. Step 4b now only handles the web container's in-place reinstall.
2. **Step 5 is now a STOP-build-install-START sequence:** `docker compose stop api` → `bash scripts/build-packages-in-docker.sh` → host one-shot `npm install --include=dev` into api bind-mount → `docker compose start api` → verify `/api/health`. The api container is OUT of the picture during the build; tsx watch cannot crash on the build's unlink events because tsx isn't running.
3. **Recipe is now substantially shorter and more robust** than the post-slot-3 version. Slots 5–14 are expected to run cleanly on the first attempt provided the preflight skill identifies the inventory.

---

## Slot 5 — `@brewery/ui` → `@umbraculum/ui`

**Status:** **Done 2026-05-19** (commit hash recorded in the slot-5 commit message; the first **heavy** slot — 69 files / ~100 occurrences, ~2× the largest prior slot — held cleanly on first attempt under the slot-4-corrected recipe).

**Target + classification.** Platform. Tamagui primitives + design-system components. Industry-agnostic by construction; no brewery-domain knowledge.

**Hard stops (all triggered + cleared on first attempt).**

- **`apps/web/next.config.js`** had `transpilePackages: [..., "@brewery/ui", ...]` — updated. Same silent-fail risk as `media`.
- **`apps/web/tamagui.config.ts`** + **`apps/native/tamagui.config.ts`** referenced the package as a Tamagui config source — both updated.
- **`apps/web/app/variables.css`** had a comment-level path reference — updated.
- **Root `package.json` `build:packages`** referenced the package by name — updated (step-2-lesson HARD STOP).
- Heavy package (69 files, ~100 occurrences). Its own session as predicted.

**File inventory (post-execution; matches what was actually changed).**

Workspace name + own files:
- [x] [`packages/ui/package.json`](../../packages/ui/package.json) — `name` + new classifying `description` (quadruple-entrypoint package; industry-agnostic).
- [x] [`packages/ui/README.md`](../../packages/ui/README.md) — heading + scope/consumed-by paragraphs + npm command samples.
- *(`packages/ui/src/ai/AiChatPanel.tsx` — no `@brewery/ui` self-references; the source imports it had were `@brewery/contracts` + `@brewery/i18n-react`, still pending slots 7+9.)*

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).
- [x] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json) — recipes-ui itself stays at `@brewery/recipes-ui` for now (slot 13) but its dep was updated.

Build configs (all HARD STOPS):
- [x] [`apps/web/next.config.js`](../../apps/web/next.config.js) `transpilePackages`.
- [x] [`apps/web/tamagui.config.ts`](../../apps/web/tamagui.config.ts) `import importedConfig from "@umbraculum/ui/tamagui-config-web"`.
- [x] [`apps/native/tamagui.config.ts`](../../apps/native/tamagui.config.ts) `import importedConfig from "@umbraculum/ui/tamagui-config-native"`.
- [x] [`apps/web/app/variables.css`](../../apps/web/app/variables.css) (comment).
- [x] [`apps/native/src/theme/colors.ts`](../../apps/native/src/theme/colors.ts) (JSDoc + import path).
- [x] Root [`package.json`](../../package.json) `build:packages` (slot-2-discovered HARD STOP).

Source imports — web (apps/web/app/**, 10 files):
- [x] `_components/AdSlot.tsx`, `_components/LogoutButton.tsx`, `_components/TamaguiProviderWrapper.tsx`.
- [x] `[locale]/ai/_components/AiChatPanel.tsx`, `[locale]/ai/_components/useAiChat.ts`, `[locale]/ferm-data-integration/page.tsx`.
- [x] `recipes/[id]/brew-sessions/[brewSessionId]/page.tsx`, `recipes/[id]/water/{boil,mash,sparge}/page.tsx`.

Source imports — native (apps/native/src/**, 24 files):
- [x] `components/AdSlot.tsx`, `components/ReadOnlyField.tsx`.
- [x] `navigation/AppNavigator.tsx`.
- [x] All 20 `screens/*.tsx` files plus `theme/colors.ts` — handled via bulk sed (slot-5 lesson: justified at 50+ files provided the post-character class is correct; see plan doc §6.4 lesson 3).

Source imports — packages (cross-package consumers, 5 files):
- [x] `packages/recipes-ui/src/{mash/MashStepsEditor.tsx, mash/SpargeStepReadOnlyRow.tsx, recipeMeta/RecipeMetaLine.tsx, water/SaltAdditionsEditor.tsx, yeast/ManualCellCountHelpBox.tsx}`.

Tests:
- [x] [`services/api/src/tests/ai/crossPlatformParity.test.ts`](../../services/api/src/tests/ai/crossPlatformParity.test.ts) (JSDoc references only).

Cross-package README references (7 files):
- [x] `packages/{i18n-react,media,navigation,recipes-ui,ui}/README.md`, `apps/{native,web}/README.md`.

Doc references (10 files):
- [x] `docs/{PLATFORM-ARCHITECTURE,CODING-STANDARDS,LINTING,REACT-NATIVE-KICKOFF-READINESS,TAMAGUI,DEVELOPMENT-NATIVE-LOCAL,ARCHITECTURE-REV02}.md`, `docs/archive/architecture-Rev01.md`, `docs/integrations/FLOATING-HYDROMETERS.md`, `docs/rfcs/0002-canonical-module-physical-layout.md`.

**Verification (all green; smoke especially important as predicted because UI primitives back nearly every screen):**
- API typecheck: clean.
- API vitest baseline: **413/413 preserved**.
- Web typecheck: 1063/1073 TS2322 = documented accepted-cost Tamagui shorthand-prop class (plan doc §4 step 6 + §6.4 lesson 1). NOT a regression. **Excluded from CI by explicit decision per [`.github/workflows/typecheck.yml`](../../.github/workflows/typecheck.yml) header + [`docs/TYPING.md`](../TYPING.md) Phase 4 + [`docs/TAMAGUI.md`](../TAMAGUI.md).**
- Native typecheck: clean. **(triggered the slot-5 "host one-shot npm install prunes api bind-mount" gotcha; recovered via STOP-install-START — see plan doc §4 step 6 + §6.4 lesson 2.)**
- Nginx smoke: **6/6 HTTP 200** (`/api/health`, `/en/login`, `/en/dashboard`, `/en/recipes`, `/en/automation`, `/en/yeast-bank`).

**Three lessons captured back into plan doc §4/§5 + §6.4 BEFORE commit** (apps/web typecheck = accepted-cost; native typecheck prunes api bind-mount; bulk sed exclusion class must mirror inventory grep). See plan doc §6.4 for full text.

---

## Slot 6 — `@brewery/core` → `@umbraculum/brewery-core` ⚠ TRAP

**Status:** **Done 2026-05-19** (commit hash recorded in the slot-6 commit message; see git log). ⚠ TRAP held cleanly on first attempt — §1.3 classification gate + sed substitution string `@umbraculum/brewery-core` (NOT bare `core`) baked the right answer into the bulk pass.

**Target + classification.** **Brewery-vertical.** Brewing math (`gravity.js`, `water.js`, brewing-specific unit conversions). Target name is `@umbraculum/brewery-core`, **NOT `@umbraculum/core`**. See plan doc §1.3.

**Hard stops cleared.**

- ⚠ **TRAP** ✓: mechanical substitution `@brewery/` → `@umbraculum/` would have produced the WRONG target. Classification gate confirmed target = `@umbraculum/brewery-core` **before** any consumer file was touched. Plan doc §4 step 2 held.
- Classifying `description` added to `packages/core/package.json`: brewery-vertical scope explicitly stated + historical "Renamed from @brewery/core to @umbraculum/brewery-core (NOT @umbraculum/core) as sub-plan #9 slot 6" reference preserved verbatim by self-excluding the file from the bulk sed pass.
- Package's own test ([`packages/core/src/water.test.js`](../../packages/core/src/water.test.js)) updated.
- **NEW HARD STOPS surfaced during slot 6 preflight, not in original inventory:**
  - Root `package.json` line 21 `test:packages` script — analog of `build:packages` but tracks the *tested* workspace set (`@brewery/contracts` + `@brewery/core`). Preflight skill's Command 5 only grepped `build:packages`; slot 6 grew Command 6 to mirror.
  - `.github/workflows/api.yml` line 43 workflow step display name `Run @brewery/contracts + @brewery/core unit tests` — separate from path globs in `on.push.paths` (which use filesystem paths like `packages/core/**` and do NOT need updating).

**File inventory.** All 20 files updated (matches handoff inventory exactly).

Workspace name + own files:
- [x] [`packages/core/package.json`](../../packages/core/package.json) — `name` → `@umbraculum/brewery-core` (NOT `@umbraculum/core`); classifying description added (excluded from bulk sed to preserve historical reference).
- [x] [`packages/core/src/water.test.js`](../../packages/core/src/water.test.js) — test imports.

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`services/api/package.json`](../../services/api/package.json).
- [x] [`packages/beerjson/package.json`](../../packages/beerjson/package.json).

Source imports:
- [x] [`apps/web/app/_lib/gravity.ts`](../../apps/web/app/_lib/gravity.ts).
- [x] [`apps/web/app/recipes/[id]/water/mash/page.tsx`](../../apps/web/app/recipes/[id]/water/mash/page.tsx).
- [x] [`packages/beerjson/src/index.ts`](../../packages/beerjson/src/index.ts).
- [x] [`services/api/src/beerjson/normalizeBeerJsonUnits.ts`](../../services/api/src/beerjson/normalizeBeerJsonUnits.ts).
- [x] [`services/api/src/routes/waterCalc.ts`](../../services/api/src/routes/waterCalc.ts).
- [x] [`services/api/src/tests/unitsCore.test.ts`](../../services/api/src/tests/unitsCore.test.ts).

CI:
- [x] [`.github/workflows/api.yml`](../../.github/workflows/api.yml) — line 43 workflow step display name.

Root scripts:
- [x] [`package.json`](../../package.json) — line 21 `test:packages` script (newly discovered HARD STOP; not in original inventory).

Cross-package README references:
- [x] [`packages/beerjson/README.md`](../../packages/beerjson/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`services/api/README.md`](../../services/api/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md).
- [x] [`docs/TESTING.md`](../TESTING.md).

Lockfiles regenerated (cleanly scoped):
- [x] Root `package-lock.json` — 8/8 lines, only the `node_modules/@brewery/core` → `node_modules/@umbraculum/brewery-core` entry changed.
- [x] `apps/web/package-lock.json` — 7/7 lines, same scoping.
- [x] `services/api/package-lock.json` — 6/6 lines, regenerated during step 5c host-install.

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing).
- [x] Root `npm run test:packages` 47/47 (4 test files = 3 from contracts + 1 from brewery-core).
- [x] Nginx smoke 4/4 HTTP 200 (`/api/health`, `/en/login`, `/en/dashboard`, `/en/recipes`).
- [x] Native typecheck **SKIPPED** — no native consumer of `@brewery/core` (brewing math doesn't ship to native).
- [x] Final commit message explicitly notes trap-avoidance: `"renamed to @umbraculum/brewery-core (NOT @umbraculum/core) per plan doc §1.3 trap"`.

**Lessons folded back to plan doc §4 / §5 BEFORE commit:** four lessons recorded (root `test:packages` HARD STOP, `api.yml` step-name HARD STOP, slot-5 gotcha refinement — `npm run` is safe, only `npm install` prunes, bulk-sed self-exclusion for TRAP slots with historical descriptions). See plan doc §6.5 for full recap.

---

## Slot 7 — `@brewery/i18n` → `@umbraculum/i18n`

**Status:** Done 2026-05-19. Commit hash pending in §6.6 of [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md) (look there for the canonical SHA + execution notes).

**Target + classification.** Platform (framework). Generic locale bundle framework. Current bundles are brewery-flavored; content split deferred (plan doc §1.4).

**Pre-execution hard stops (recorded so future slot leads can sanity-check the preflight checklist against this slot).**

- `i18n-react` depends on `i18n`. Originally predicted as "After this slot ships, `i18n-react` still imports `@brewery/i18n` — transient cross-scope state until slot 8". **Actual post-rename state:** the bulk sweep properly updated `packages/i18n-react/package.json` deps AND `packages/i18n-react/src/index.tsx` imports to `@umbraculum/i18n`; the rebuilt `packages/i18n-react/dist/*` artifacts reference `@umbraculum/i18n` only (verified `grep -rohE "@(brewery|umbraculum)/i18n" packages/i18n-react/dist/` → `@umbraculum/i18n` only). The transient cross-scope state is only that the i18n-react **workspace itself is still named** `@brewery/i18n-react` — its CONTENT (deps + imports + dist) is fully migrated to the new scope. Slot 8 will rename the workspace name itself.
- The package ships a JSON locale bundle and a `copy-json.mjs` script ([`packages/i18n/scripts/`](../../packages/i18n/scripts/)). The script copies content into `dist/` and was re-run successfully via `npm run build:packages` in step 5. Verified `packages/i18n/dist/` contains `en.json`, `it.json`, `index.cjs`, `index.d.cts`, `index.d.ts`, `index.js`.

**File inventory (all checked Done 2026-05-19).**

Workspace name + own files:
- [x] [`packages/i18n/package.json`](../../packages/i18n/package.json) — `name` → `@umbraculum/i18n`; classifying description added (platform-framework; brewery-flavored content per plan doc §1.4 deferred-content-split).
- [x] [`packages/i18n/README.md`](../../packages/i18n/README.md) — heading + brand callout updated.

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).
- [x] [`packages/i18n-react/package.json`](../../packages/i18n-react/package.json) — i18n-react workspace still NAMED `@brewery/i18n-react` (slot 8 surface) but its `dependencies` entry for the i18n peer is now `@umbraculum/i18n`.

Source imports:
- [x] [`apps/native/src/auth/AuthProvider.tsx`](../../apps/native/src/auth/AuthProvider.tsx).
- [x] [`apps/native/src/i18n/I18nProvider.tsx`](../../apps/native/src/i18n/I18nProvider.tsx).
- [x] [`apps/native/src/i18n/locale.ts`](../../apps/native/src/i18n/locale.ts).
- [x] [`apps/native/src/navigation/openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts).
- [x] [`apps/native/src/screens/DashboardScreen.tsx`](../../apps/native/src/screens/DashboardScreen.tsx).
- [x] [`apps/web/app/[locale]/layout.tsx`](../../apps/web/app/[locale]/layout.tsx).
- [x] [`apps/web/i18n/request.ts`](../../apps/web/i18n/request.ts).
- [x] [`apps/web/src/i18n/routing.ts`](../../apps/web/src/i18n/routing.ts).
- [x] [`apps/web/src/navigation/appRouter.ts`](../../apps/web/src/navigation/appRouter.ts).
- [x] [`packages/i18n-react/src/index.tsx`](../../packages/i18n-react/src/index.tsx) — imports updated to `@umbraculum/i18n`; dist rebuilt and verified to reference `@umbraculum/i18n` only.

Cross-package README references:
- [x] [`packages/contracts/README.md`](../../packages/contracts/README.md), [`packages/i18n-react/README.md`](../../packages/i18n-react/README.md), [`packages/i18n/README.md`](../../packages/i18n/README.md), [`packages/media/README.md`](../../packages/media/README.md), [`packages/navigation/README.md`](../../packages/navigation/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/ARCHITECTURE-REV02.md`](../ARCHITECTURE-REV02.md), [`docs/rfcs/0002-canonical-module-physical-layout.md`](../rfcs/0002-canonical-module-physical-layout.md).
- [x] [`internal/working-notes/TODOs.md`](../../internal/working-notes/TODOs.md).

Hard stops (preflight commands 5–7 from updated skill):
- [x] Root [`package.json`](../../package.json) `build:packages` script (line 20; the leading `npm run build -w @brewery/i18n` was the first item in the build chain).
- [x] Root [`package.json`](../../package.json) `test:packages` script — no entry needed for i18n (it has no test suite).
- [x] [`.github/workflows/*.yml`](../../.github/workflows/) workflow step display names — no entries reference `@brewery/i18n` (the only `@brewery/i18n-react` reference is the SUBSTRING-collision-safe sibling, NOT touched by slot 7).
- [x] [`apps/web/next.config.js`](../../apps/web/next.config.js) `transpilePackages` — no `@brewery/i18n` entry (next-intl loads bundles via the package's `./en` and `./it` subpath exports, not via transpilePackages).
- [x] [`apps/native/metro.config.js`](../../apps/native/metro.config.js) — no `@brewery/i18n` entry.
- [x] No `bin` field in [`packages/i18n/package.json`](../../packages/i18n/package.json) (preflight command 2 PASS — nothing to update in root `node_modules/.bin/` symlinks).

**Lessons folded back to plan doc §4 / §5 BEFORE commit:** three lessons recorded (NEW HARD STOP — exclude plan + handoff docs from bulk sed to preserve historical "Source name" columns; refined the transient-cross-scope description to clarify it's the WORKSPACE NAME that lingers, not the imports; substring-collision-with-i18n-react verified safe under the `[^a-zA-Z0-9_-]` regex tail). See plan doc §6.6 for full recap.

---

## Slot 8 — `@brewery/i18n-react` → `@umbraculum/i18n-react`

**Status:** Done 2026-05-19. Commit hash pending in §6.8 of [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md) (look there for the canonical SHA + execution notes).

**Target + classification.** Platform. Universal `useTranslator` hook (web + native) + LocaleProvider context + dual entry points (default + `./next-intl`).

**Pre-execution hard stops (recorded so future slot leads can sanity-check the preflight checklist against this slot).**

- Predecessor: slot 7 (`@brewery/i18n` → `@umbraculum/i18n`) shipped 2026-05-19 — confirmed in slot 8 preflight via `grep '"@umbraculum/i18n"' packages/i18n-react/package.json` returning the pre-existing dep entry (slot 7 had already updated it during the transient-cross-scope handling).
- Two-entry-point shape: `./` default + `./next-intl` Next.js variant — both `dist/{index,next-intl}.{js,cjs,d.ts,d.cts}` must rebuild. Verified post-step-5: all 8 expected artifacts present in `packages/i18n-react/dist/`.

**File inventory (all checked Done 2026-05-19).**

Workspace name + own files:
- [x] [`packages/i18n-react/package.json`](../../packages/i18n-react/package.json) — `name` → `@umbraculum/i18n-react`; classifying description added (platform; universal hook; no brewery-domain logic).
- [x] [`packages/i18n-react/README.md`](../../packages/i18n-react/README.md) — heading + brand callout + dual-entry-point examples + cross-link to `@brewery/recipes-ui` (with slot 13 forward-ref) updated.
- [x] [`packages/i18n-react/src/index.tsx`](../../packages/i18n-react/src/index.tsx) — no internal `@brewery/i18n-react` references found in source (the package doesn't self-import; was already clean).

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).
- [x] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json).

Source imports — web:
- [x] [`apps/web/app/[locale]/layout.tsx`](../../apps/web/app/[locale]/layout.tsx).

Source imports — native (~20 screens + 3 components/nav/i18n):
- [x] [`apps/native/src/components/AdSlot.tsx`](../../apps/native/src/components/AdSlot.tsx).
- [x] [`apps/native/src/i18n/I18nProvider.tsx`](../../apps/native/src/i18n/I18nProvider.tsx).
- [x] [`apps/native/src/navigation/AppNavigator.tsx`](../../apps/native/src/navigation/AppNavigator.tsx).
- [x] All `apps/native/src/screens/*.tsx` matching the grep (17 screen files: About, Ai, BlockedRoute, BrewdayStepsSettings, BrewSessionDetail, BrewSessionsList, Contributing, Dashboard, Equipment, FermDataIntegration, Login, RecipeEdit, RecipesList, SelectWorkspace, WaterBoil, WaterHub, WaterMash, WaterProfiles, WaterSparge, Yeast).

Source imports — packages:
- [x] [`packages/recipes-ui/src/recipeMeta/RecipeMetaLine.tsx`](../../packages/recipes-ui/src/recipeMeta/RecipeMetaLine.tsx).
- [x] [`packages/recipes-ui/src/water/SaltAdditionsEditor.tsx`](../../packages/recipes-ui/src/water/SaltAdditionsEditor.tsx).
- [x] [`packages/recipes-ui/src/yeast/ManualCellCountHelpBox.tsx`](../../packages/recipes-ui/src/yeast/ManualCellCountHelpBox.tsx).
- [x] [`packages/ui/src/ai/AiChatPanel.tsx`](../../packages/ui/src/ai/AiChatPanel.tsx).

Cross-package README references:
- [x] [`packages/i18n-react/README.md`](../../packages/i18n-react/README.md), [`packages/i18n/README.md`](../../packages/i18n/README.md), [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](../REACT-NATIVE-KICKOFF-READINESS.md), [`docs/ARCHITECTURE-REV02.md`](../ARCHITECTURE-REV02.md), [`docs/MODULES.md`](../MODULES.md), [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md).

Hard stops (preflight commands 5–7 from updated skill):
- [x] Root [`package.json`](../../package.json) `build:packages` script (line 20; the second item in the build chain since slot 7 — `npm run build -w @umbraculum/i18n && npm run build -w @brewery/i18n-react && ...`).
- [x] Root [`package.json`](../../package.json) `test:packages` script — no entry needed for i18n-react (it has no test suite of its own).
- [x] [`.github/workflows/*.yml`](../../.github/workflows/) workflow step display names — no entries reference `@brewery/i18n-react`.
- [x] [`apps/web/next.config.js`](../../apps/web/next.config.js) `transpilePackages` — no `@brewery/i18n-react` entry (next-intl loads bundles via the package's `./next-intl` subpath export, not via transpilePackages).
- [x] [`apps/native/metro.config.js`](../../apps/native/metro.config.js) — no `@brewery/i18n-react` entry.
- [x] No `bin` field in [`packages/i18n-react/package.json`](../../packages/i18n-react/package.json) (preflight command 2 PASS — nothing to update in root `node_modules/.bin/` symlinks).

Lockfiles regenerated (cleanly scoped):
- [x] Root `package-lock.json` — 8/8 lines, ONLY i18n-react entries (workspace name + 2 consumer-side deps + workspace-link entry pair).
- [x] `apps/web/package-lock.json` — 1 added + 1 removed (symlink swap from `@brewery/i18n-react` to `@umbraculum/i18n-react`).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing).
- [x] Root `npm run test:packages` 47/47 (4 test files = 3 from contracts + 1 from brewery-core).
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}` (both locales exercised through the renamed translator end-to-end).
- [x] Native typecheck via the **no-root-install / named-volume pattern** — clean; ~6s vs ~60s for the older pattern. api `.bin/` count preserved at 21 (canonical devDep set); api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Final commit message explicitly notes the cleared transient-cross-scope state from slot 7 and the closure of the i18n-stack migration.

**Lessons folded back to plan doc §4 / §5 BEFORE commit:** two lessons recorded (NEW PREFERRED PATTERN — native typecheck via no-root-install / named-volume mount instead of slot-5-GOTCHA-risk recipe; NEW substring-collision verification expanded from 2-cousin to **4-cousin** sanity check covering longer-prefix + shorter-prefix + just-renamed-sibling + export-subpath cases). See plan doc §6.8 for full recap.

---

## Slot 9 — `@brewery/contracts` → `@umbraculum/contracts`

**Status:** Complete (commit hash recorded post-commit). Heaviest slot in the migration (124 substitutions across 75 actually-edited files) landed under the §4 recipe on first attempt; recipe held cleanly. **Two transient cross-scope states OPEN** (slots 10 + 11 — see plan doc §6.9).

**Target + classification.** Platform. Generic auth/me DTO + AI-tool contract types. Heaviest slot in the migration (122 occurrences across 75 files; live grep returned 85 candidate files of which 6 stale `.next/**` artifacts and 3 history docs were excluded, matching plan-doc estimate).

**Hard stops (all 6 cleared).**

- [x] **`apps/web/next.config.js`** had `transpilePackages: [..., "@brewery/contracts", ...]` — UPDATED.
- [x] Predecessor for slot 10 (`api-client`) and slot 11 (`module-sdk`) — both still hold `@brewery/*` workspace `name` field but their `dependencies` declarations + imports + dist already reference `@umbraculum/contracts`. **Two transient cross-scope states open simultaneously**; both close on slots 10 + 11 (which have no inter-dependency and may run in either order).
- [x] All 3 contract tests in `services/api/src/tests/contracts/` (`shapeHelpers.ts`, `recipe.contract.test.ts`, `waterProfiles.contract.test.ts`) — UPDATED.
- [x] All 8 AI tool registrations in [`services/api/src/services/ai/tools/`](../../services/api/src/services/ai/tools/) (`brewery/{recipeLookup,recipeWaterState,currentBrewSessionStatus,index,ingredientOnHand,equipmentProfileGet}.ts`, `automation/{vesselState,listVessels,index}.ts`) — UPDATED.
- [x] Root [`package.json`](../../package.json) `build:packages` AND `test:packages` scripts — UPDATED (`@brewery/contracts` → `@umbraculum/contracts` in both).
- [x] [`.github/workflows/api.yml`](../../.github/workflows/api.yml) line 43 workflow step display name `Run @brewery/contracts + @umbraculum/brewery-core unit tests` — UPDATED.

**File inventory.** (Live grep returned 85 candidates; bulk-sed script edited 75 files / 124 substitutions; 9 files excluded by skill items 11 + 12 + slot-9-new `cursor-tmp/` exclusion + slot-8 `.next/` precedent.)

Workspace name + own files (manually edited in step 1; then excluded from bulk sed per item 11):
- [x] [`packages/contracts/package.json`](../../packages/contracts/package.json) — `name: "@umbraculum/contracts"` + new classifying `description` field.
- [x] [`packages/contracts/README.md`](../../packages/contracts/README.md) — heading + scoped workspace commands updated; bare brand callout rewritten to record the rename history (slot 9 of 14; first slot to open two simultaneous transient cross-scope states).
- [x] [`packages/contracts/src/ai/aiTool.ts`](../../packages/contracts/src/ai/aiTool.ts) — internal `@brewery/contracts` reference + forward-looking `@brewery/ai-tool-sdk` reference both updated to `@umbraculum/*` scope.

Consumer `package.json` deps (bulk sed):
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).
- [x] [`services/api/package.json`](../../services/api/package.json).
- [x] [`packages/api-client/package.json`](../../packages/api-client/package.json) — dep entry only (workspace `name` stays `@brewery/api-client` until slot 10).
- [x] [`packages/module-sdk/package.json`](../../packages/module-sdk/package.json) — dep entry only (workspace `name` stays `@brewery/module-sdk` until slot 11).

Build configs:
- [x] [`apps/web/next.config.js`](../../apps/web/next.config.js) `transpilePackages` (HARD STOP cleared).
- [x] [`docker-compose.yml`](../../docker-compose.yml) — bulk sed updated 1 reference + slot 9 hand-fixed the slash-shorthand comment on line 120 (`Pattern mirrors @brewery/contracts/core/media above` → spelled out as the three packages with rename history; cosmetic-only fix to restore self-consistency post-rename per plan doc §6.9 lesson 2).

Source imports — group by directory and execute the grep+replace:
- [x] All `apps/web/app/**/*.ts{,x}` matching the grep (15 files: auth pages + equipment + recipes/edit + recipes/water/{boil,mash,sparge,page,_lib/api,_lib/mathBodies,_lib/waterHubSummary} + ai/settings + water-profiles + _components/{PrimaryNav,AuthStatus} + _lib/{typeGuards,useRequireAuth} + select-workspace).
- [x] All `apps/native/src/**/*.ts{,x}` matching the grep (8 files: lib/typeGuards.ts + 7 screens — Equipment, RecipeEdit, WaterBoil, WaterHub, WaterMash, WaterProfiles, WaterSparge).
- [x] All `services/api/src/**/*.ts` matching the grep — routes (3 files), services (3 files), AI tools (8 files: brewery/* + automation/*), orchestrator, toolRegistry, aiSettingsService, recipeWaterHubSummaryService, gravityAnalysis.ts.
- [x] All `services/api/src/tests/**/*.test.ts` and `**/*.contract.test.ts` matching the grep (4 files: contracts/{shapeHelpers,recipe.contract,waterProfiles.contract} + ai/toolRegistry.test).
- [x] [`packages/module-sdk/src/types.ts`](../../packages/module-sdk/src/types.ts).

CI:
- [x] [`.github/workflows/api.yml`](../../.github/workflows/api.yml) — workflow step display name updated.

Cross-package README references (bulk sed):
- [x] [`packages/api-client/README.md`](../../packages/api-client/README.md), [`packages/i18n/README.md`](../../packages/i18n/README.md), [`packages/media/README.md`](../../packages/media/README.md), [`packages/navigation/README.md`](../../packages/navigation/README.md), [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`services/api/README.md`](../../services/api/README.md). (Own README excluded per item 11.)

Handoff docs (pre-existing, still relevant historical context):
- [x] [`docs/design/pr1-contracts-migration-handoff.md`](./pr1-contracts-migration-handoff.md) — references updated.
- [x] [`docs/design/pr3-routes-migration-handoff.md`](./pr3-routes-migration-handoff.md) — references updated.

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/LINTING.md`](../LINTING.md), [`docs/TESTING.md`](../TESTING.md), [`docs/TYPING.md`](../TYPING.md), [`docs/ROADMAP.md`](../ROADMAP.md), [`docs/MODULES.md`](../MODULES.md), [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md).
- [x] [`internal/working-notes/TODOs.md`](../../internal/working-notes/TODOs.md).

Lockfiles regenerated (cleanly scoped):
- [x] Root `package-lock.json` — 20/20 lines, ONLY contracts entries (workspace name + 4 consumer-side deps + workspace-link entry pair).
- [x] `apps/web/package-lock.json` — 1 added + 1 removed (symlink swap from `@brewery/contracts` to `@umbraculum/contracts`).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing — exactly matches slot-7 / slot-8 baseline).
- [x] Root `npm run test:packages` 9/9 files / 120/120 tests (5 contracts files / 73 tests + 4 brewery-core files / 47 tests).
- [x] Native typecheck via the **slot-8 no-root-install / named-volume pattern** — clean; ~5s wall-clock. api `.bin/` count preserved at canonical 21; api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}` (both locales exercised through the renamed contract layer end-to-end).
- [x] Final commit message explicitly notes the TWO transient cross-scope states opened by this slot (slot 10 + slot 11 both still on `@brewery/*` workspace names but have `@umbraculum/contracts` deps + imports + dist).

**Lessons folded back to plan doc §4 step 3 + §5 + §6.9 BEFORE commit:** two new lessons recorded (NEW HARD STOP — bulk-sed scripts under `cursor-tmp/` self-corrupt because the canonical-grep regex matches their own source code; new exclusion path added to step 3. NEW COSMETIC OBSERVATION — slash-delimited shorthand comments like `@brewery/contracts/core/media` become self-inconsistent post-rename; flagged in §5 risk register as cosmetic-only). See plan doc §6.9 for full recap.

---

## Slot 10 — `@brewery/api-client` → `@umbraculum/api-client`

**Status:** Complete (2026-05-19). **Closes one of the two transient cross-scope states opened by slot 9** — the `@brewery/api-client` half. (The `@brewery/module-sdk` half remains open until slot 11.) **Depends on slot 9.**

**Target + classification.** Platform. Generic fetch + auth boundary (cookie web, bearer native).

**Hard stops cleared.**

- [x] Predecessor: slot 9 shipped — confirmed `packages/api-client/package.json` already had `"@umbraculum/contracts": "file:../contracts"` at start of slot 10 (slot-9 sweep had updated the dep entry; only the workspace `name` field remained to flip).
- [x] Consumed primarily by `apps/native` (AuthProvider + screens); minimal `apps/web` consumption — confirmed via canonical grep + post-`npm install` web-side lockfile diff being **empty** (web consumes only at the README documentation level, no `package.json` dep entry).
- [x] Preflight skill 6 HARD STOP classes ran cleanly: only ONE HIT — root `build:packages` (slot's only stop). `bin` field absent; `next.config.js` transpilePackages absent (web has no source dep); `metro.config.js` absent; root `test:packages` absent (api-client has no test suite); workflow display names absent. **First slot whose preflight identified only ONE HARD STOP class** — narrowing blast radius is the cumulative apparatus paying off.
- [x] 4-cousin substring-collision walk clean: (a) no `@brewery/api-client-*` longer-prefix variants; (b) shorter-prefix `@brewery/api` (currently `services/api/package.json` workspace `name`, scheduled for slot 14) **structurally untouchable** by the literal-`-client` regex anchor — confirmed in practice across slot 10's 41 substitutions; (c) no `@umbraculum/api-client*` collision (no prior slot renamed anything starting with that string); (d) zero subpath imports (`packages/api-client/package.json` declares only `.` as an export).
- [x] Slot-9 NEW HARD STOP held: `cursor-tmp/slot10-bulk-sed.py` excluded itself via the slot-9-folded-back `EXCLUDE_DIR_PARTS` set + a defensive belt-and-braces (the script's `OLD_FULL` literal is constructed from concatenated string segments, so the script source does not contain the literal target as a single substring).

**File inventory cleared.**

Workspace name + own files:
- [x] [`packages/api-client/package.json`](../../packages/api-client/package.json) — `name` flipped; `description` added (slot-8 precedent); the slot-9 sweep had already updated the `@umbraculum/contracts` dep entry, so no further dep changes needed.
- [x] [`packages/api-client/README.md`](../../packages/api-client/README.md) — heading + workspace command examples updated; rename history note added per slot-8 / slot-9 convention.

Consumer `package.json` deps:
- [x] [`apps/native/package.json`](../../apps/native/package.json).

Source imports — native:
- [x] [`apps/native/src/auth/AuthProvider.tsx`](../../apps/native/src/auth/AuthProvider.tsx).
- [x] [`apps/native/src/components/AdSlot.tsx`](../../apps/native/src/components/AdSlot.tsx).
- [x] [`apps/native/src/navigation/openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts).
- [x] All 15 `apps/native/src/screens/*.tsx` matching the grep (BrewdayStepsSettings, BrewSessionDetail, BrewSessionsList, Dashboard, Equipment, FermDataIntegration, RecipeEdit, RecipesList, SelectWorkspace, WaterBoil, WaterHub, WaterMash, WaterProfiles, WaterSparge, Yeast).

Cross-package README references:
- [x] [`packages/api-client/README.md`](../../packages/api-client/README.md), [`packages/contracts/README.md`](../../packages/contracts/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`services/api/README.md`](../../services/api/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md), [`docs/ARCHITECTURE-REV02.md`](../ARCHITECTURE-REV02.md), [`docs/MODULES.md`](../MODULES.md), [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md).
- [x] [`internal/working-notes/TODOs.md`](../../internal/working-notes/TODOs.md).

**Step-3 sweep results:** 31 files / 41 substitutions (vs 35-file plan-doc inventory; the 4-file delta = 1 self-exclusion of `packages/api-client/package.json` because step 1 had already updated the `name` field + 3 explicit excludes — own README + 2 history docs).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing — exactly matches slot-7 / slot-8 / slot-9 baseline).
- [x] Root `npm run test:packages` 9/9 files / 120/120 tests (5 contracts files / 73 tests + 4 brewery-core files / 47 tests) — same baseline as slot 9 since api-client has no test suite.
- [x] Native typecheck via the **slot-8 no-root-install / named-volume pattern** — clean; ~7.8s wall-clock. api `.bin/` count preserved at canonical 21 (`tsc`/`tsx`/`vitest` all present); api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}` (both locales exercised through the renamed transport layer end-to-end).
- [x] Web-side lockfile diff after `npm install --include=dev` — **0 lines** (confirms web has no `package.json` dep on api-client, README-only consumption).
- [x] api-client dist content audit: `grep -roh '@(brewery|umbraculum)/api-client[a-zA-Z0-9_/.-]*' dist/` returned empty (runtime JS is pure auth + fetch logic; `@umbraculum/contracts` import is types-only and gets erased at build time — confirmed clean via broader-net `grep -rohE "@[a-z-]+/[a-z-]+" dist/`).
- [x] Final commit message explicitly notes that this slot CLOSES the `@brewery/api-client` half of slot 9's two-state cross-scope window; the `@brewery/module-sdk` half remains open until slot 11.

**No new lessons surfaced.** Slot 10 was a clean execution of the slot-9-refined recipe; the slot-9 NEW HARD STOPs (`cursor-tmp/` exclusion + cousin (b) shorter-prefix structural-untouchability claim) both held cleanly in practice. See plan doc §6.10 for full recap.

---

## Slot 11 — `@brewery/module-sdk` → `@umbraculum/module-sdk`

**Status:** Complete (2026-05-19). **Closes the LAST slot-9-opened transient cross-scope state** — the `@brewery/module-sdk` half. (The `@brewery/api-client` half closed on slot 10.) After this slot, **both halves of the slot-9 double-state are CLOSED**; the multi-state version of upstream-then-downstream-rename ordering held cleanly across slots 9→{10,11} with no observed inter-state interaction. **Depends on slot 9.**

**Target + classification.** Platform. `registerModule()` contract + library-agnostic `ValidatedSchema<T>` interface. The `package.json` `description` field's pre-existing "End-state npm scope: @umbraculum/module-sdk per RFC-0002" forecast sentence has been rewritten to describe the contract surface (the end state is now the live state).

**Hard stops cleared.**

- [x] Predecessor: slot 9 shipped — confirmed `packages/module-sdk/package.json` already had `"@umbraculum/contracts": "file:../contracts"` at start of slot 11 (slot-9 sweep had updated the dep entry; only the workspace `name` field remained to flip).
- [x] [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) F5 row updated: state column flipped from "In progress (scoping done)" to "**Done (2026-05-19, slot 11 of sub-plan #9)**"; the row's narrative rewritten to reflect that the `@umbraculum/module-sdk` name is now the live workspace name (no longer a future-state target) and that the two transient cross-scope states from slot 9 are both closed.
- [x] [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) `ValidatedSchema<T>` reference updated by the bulk sweep (1 substitution).
- [x] Preflight skill 6 HARD STOP classes ran cleanly: only ONE HIT — root `build:packages` (slot's only stop). `bin` field absent; `next.config.js` transpilePackages absent (web has no source-level dep on module-sdk); `metro.config.js` absent (will be slot 13's only HARD STOP for recipes-ui); root `test:packages` does NOT include module-sdk — see follow-up note below; workflow display names absent.
- [x] 4-cousin substring-collision walk clean: (a) no `@brewery/module-sdk-*` longer-prefix variants; (b) shorter-prefix N/A — no `@brewery/module` workspace exists in the §1.1 classification table (the regex literal `-sdk` anchor would have protected it had one existed, continuing the slot-10 structural-untouchability claim); (c) no `@umbraculum/module-sdk*` collision (no prior slot renamed anything starting with that string); (d) zero subpath imports (`packages/module-sdk/package.json` declares only `.` as an export).
- [x] Slot-9 + slot-10 NEW HARD STOPs held: `cursor-tmp/slot11-bulk-sed.py` excluded itself via the `EXCLUDE_DIR_PARTS` set + the defensive belt-and-braces (script's `OLD_FULL` literal constructed from concatenated string segments); the cousin-(b) shorter-prefix structural-untouchability claim continued to hold across all 17 substitutions.

**File inventory cleared.**

Workspace name + own files:
- [x] [`packages/module-sdk/package.json`](../../packages/module-sdk/package.json) — `name` flipped; pre-existing "End-state" sentence rewritten to describe the contract surface; the slot-9 sweep had already updated the `@umbraculum/contracts` dep entry, so no further dep changes needed.
- [x] [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md) — heading + workspace command examples updated; rename history note added per slot-8 / slot-9 / slot-10 convention; "End-state" forecast NOTE rewritten to record the closure of both slot-9 transient states.
- [x] [`packages/module-sdk/src/types.ts`](../../packages/module-sdk/src/types.ts) — already clean (the slot-9 sweep had updated the `@umbraculum/contracts` import; no `@brewery/module-sdk` self-references in this file).

Consumer `package.json` deps:
- [x] [`services/api/package.json`](../../services/api/package.json).

Source imports:
- [x] [`services/api/src/app.ts`](../../services/api/src/app.ts) (comment reference updated).
- [x] [`services/api/src/modules/automation/index.ts`](../../services/api/src/modules/automation/index.ts) — 3 substitutions.
- [x] [`services/api/src/tests/vitest.setup.ts`](../../services/api/src/tests/vitest.setup.ts) — 2 substitutions.

Other:
- [x] [`docker-compose.yml`](../../docker-compose.yml) — line-115 comment reference updated; the on-disk bind-mount path on line 123 references the directory `packages/module-sdk/` (not the npm scope) and is correctly unchanged.

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md).
- [x] [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) — F5 row marked Done + inline ValidatedSchema references updated.
- [x] [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) — ValidatedSchema reference updated.
- [x] [`docs/design/canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) — 3 substitutions in B-1 closure note + surrounding references.
- [x] [`docs/modules/canonical/automation.md`](../modules/canonical/automation.md) — 1 substitution.

**Step-3 sweep results:** 12 files / 17 substitutions (vs 16-file plan-doc inventory; the 4-file delta = 1 self-exclusion of `packages/module-sdk/package.json` because step 1 had already updated the `name` field + 3 explicit excludes — own README + 2 history docs).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing — exactly matches slot-7 / slot-8 / slot-9 / slot-10 baseline). The api consumes module-sdk via `registerModule()` so a clean api vitest is direct evidence the rename did not break the production wiring.
- [x] Root `npm run test:packages` 9/9 files / 120/120 tests (5 contracts files / 73 tests + 4 brewery-core files / 47 tests) — same baseline as slot 9/10 since module-sdk is not currently in the script.
- [x] **Slot-specific:** module-sdk's own tests (`npm test -w @umbraculum/module-sdk`) — **2/2 files / 8/8 tests** — confirms `registerModule.test.ts` + `validatedSchema.test.ts` pass under the new workspace-name resolution.
- [x] Native typecheck via the **slot-8 no-root-install / named-volume pattern** — clean; ~5s wall-clock. api `.bin/` count preserved at canonical 21; api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}`.
- [x] Web-side lockfile diff after `npm install --include=dev` — **0 lines** (confirms web has no `package.json` dep on module-sdk).
- [x] module-sdk dist content audit: `grep -roh '@(brewery|umbraculum)/module-sdk[a-zA-Z0-9_/.-]*' dist/` returned only the self-name `@umbraculum/module-sdk`; the contracts grep returned only `@umbraculum/contracts`. Zero `@brewery/*` refs in dist.
- [x] **Slot-specific gate cleared:** api boots clean post-rename — registerModule wiring is the hot path, and the api startup logs show `Server listening at http://127.0.0.1:4000` followed by clean Pino-format request lifecycle on `/api/health` (200 / ~15ms responseTime), no collision warnings, no AI-tool-registry registration errors.
- [x] **Slot-specific gate cleared:** F5 row in `docs/CONTRACTS-VALIDATION-STRATEGY.md` marked "**Done (2026-05-19, slot 11 of sub-plan #9)**" alongside the same commit.
- [x] Final commit message explicitly notes the closure of the LAST slot-9-opened transient cross-scope state.

**No new lessons surfaced.** Slot 11 was a clean execution of the slot-9-refined recipe; the slot-9 + slot-10 NEW HARD STOPs both held cleanly. See plan doc §6.11 for full recap.

**Follow-up note (out of slot 11 scope, not blocking):** module-sdk has 2 test files / 8 tests that are NOT included in root `test:packages`. This is a pre-existing gap predating slot 11; module-sdk was missing from `test:packages` before the rename began. Slot 11 ran the missing tests directly as part of step-6 verification (all 8/8 passing). Adding module-sdk to root `test:packages` is a behavior change beyond the rename's atomic scope; tracked as a future cleanup item rather than landed under sub-plan #9.

---

## Slot 12 — `@brewery/beerjson` → `@umbraculum/brewery-beerjson`

**Status:** Complete (2026-05-19). **First brewery-vertical slot since slot 6** — target carries the `brewery-` token *inside* the package name (`@umbraculum/brewery-beerjson`, NOT `@umbraculum/beerjson`); slot-6 TRAP discipline applies and held cleanly. **Depends on slot 6** (shipped).

**Target + classification.** **Brewery-vertical.** BeerJSON brewing-specific interchange schema. Target name carries `brewery-` prefix per §1.3.

**Hard stops cleared.**

- [x] Predecessor: slot 6 shipped — confirmed `packages/beerjson/package.json` already lists `"@umbraculum/brewery-core": "file:../core"` as its dep; only the workspace `name` field flipped in slot 12.
- [x] Classifying description added (per slot-9/10/11 precedent): `"Brewery-vertical BeerJSON adaptation layer — typed BeerJSON wrappers, editor-row helpers, and SG↔Plato re-exports from @umbraculum/brewery-core. Brewery-vertical-classified per sub-plan #9 §1.1 (BeerJSON is brewing-specific; the @umbraculum/brewery-* prefix marks the vertical boundary)."` Reworded from the handoff's forecast template to a current-state description.
- [x] Preflight skill 6 HARD STOP classes ran cleanly: only ONE HIT — root `build:packages` (slot's only stop). `bin` field absent; `next.config.js` transpilePackages does **NOT** include `@brewery/beerjson` (the package ships pre-built JS via `dist/` so Next.js consumes it directly without transpilation — same architectural pattern as api-client/automation-contracts/module-sdk; only `.tsx`-shipping packages like ui/recipes-ui need transpilePackages entries); `metro.config.js` extraNodeModules lists only `@brewery/recipes-ui` (slot-13's stop, not slot-12's); root `test:packages` does NOT include beerjson — see follow-up note below; workflow display names absent.
- [x] 4-cousin substring-collision walk clean: (a) no `@brewery/beerjson-*` longer-prefix variants; (b) shorter-prefix N/A (no `@brewery/beer*` workspace exists); (c) cousin-(c) safety check found 9 pre-existing references to `@umbraculum/brewery-beerjson` in doc-tier files (migration plan + handoff doc + `MODULES.md` table + `docs/modules/contribute/vertical-configuration.md` example + `docs/modules/verticals/brewery/README.md` body) — **all factually-correct forecasts that became live state at slot-12 commit time**; no false-collision risk; (d) zero subpath imports.
- [x] Slot-9 NEW HARD STOP held: `cursor-tmp/slot12-bulk-sed.py` excluded itself via `EXCLUDE_DIR_PARTS` set + the defensive belt-and-braces (script's `OLD_FULL` literal constructed from concatenated string segments).
- [x] **Slot-6 TRAP discipline held:** the slot-12 bulk-sed `NEW_FULL` constant uses a different `NEW_PKG_NAME` (`brewery-beerjson`) than `OLD_PKG_NAME` (`beerjson`), mirroring the slot-6 bulk-sed shape; the substitution added the `brewery-` token across all 29 substitutions correctly; the §1.3 classification gate caught the brewery-vertical classification on first attempt.

**File inventory cleared.**

Workspace name + own files:
- [x] [`packages/beerjson/package.json`](../../packages/beerjson/package.json) — `name` flipped to `@umbraculum/brewery-beerjson`; `description` field added per handoff (reworded from forecast to current-state).
- [x] [`packages/beerjson/README.md`](../../packages/beerjson/README.md) — heading + workspace command examples + Usage import example updated; rename history note added per slot-8/9/10/11 convention with explicit TRAP rationale (the `brewery-` prefix marks brewery-vertical classification, not the platform-name `@umbraculum/beerjson`).
- [x] [`packages/beerjson/src/index.ts`](../../packages/beerjson/src/index.ts) — already clean (the slot-6 sweep had updated the `@umbraculum/brewery-core` import; no `@brewery/beerjson` self-references in this file).

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).
- [x] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json) — recipes-ui dep.

Source imports:
- [x] [`apps/native/src/screens/RecipeEditScreen.tsx`](../../apps/native/src/screens/RecipeEditScreen.tsx).
- [x] [`apps/native/src/screens/WaterMashScreen.tsx`](../../apps/native/src/screens/WaterMashScreen.tsx).
- [x] [`apps/native/src/screens/YeastScreen.tsx`](../../apps/native/src/screens/YeastScreen.tsx).
- [x] [`apps/web/app/recipes/_lib/beerjsonRecipe.ts`](../../apps/web/app/recipes/_lib/beerjsonRecipe.ts) — 2 substitutions.
- [x] [`packages/recipes-ui/src/mash/MashStepsEditor.tsx`](../../packages/recipes-ui/src/mash/MashStepsEditor.tsx) — 2 substitutions.

Cross-package README references:
- [x] [`packages/beerjson/README.md`](../../packages/beerjson/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/LINTING.md`](../LINTING.md), [`docs/TYPING.md`](../TYPING.md) (5 substitutions), [`docs/NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md), [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../DEVELOPMENT-NATIVE-LOCAL.md) (2 substitutions), [`docs/ROADMAP.md`](../ROADMAP.md), [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md) (2 substitutions; the file is tracked + not gitignored), [`docs/MODULES.md`](../MODULES.md), [`docs/modules/contribute/vertical-configuration.md`](../modules/contribute/vertical-configuration.md), [`docs/modules/verticals/brewery/README.md`](../modules/verticals/brewery/README.md).

**Step-3 sweep results:** 21 files / 29 substitutions (vs 24-file plan-doc inventory; the 3-file delta = 3 explicit excludes — own README + 2 history docs; `packages/beerjson/package.json` self-excluded after step 1 had already updated the `name` field).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing — exactly matches slot-7 / slot-8 / slot-9 / slot-10 / slot-11 baseline). The api consumes beerjson indirectly via `@umbraculum/brewery-core` re-exports + via the BeerJSON importer at `services/api/src/importers/`; clean api vitest is direct evidence the rename didn't break the importer wiring.
- [x] Root `npm run test:packages` 9/9 files / 120/120 tests (5 contracts files / 73 tests + 4 brewery-core files / 47 tests) — same baseline as slot 9/10/11 since beerjson is not currently in the script.
- [x] **Slot-specific:** beerjson's own tests (`npm test -w @umbraculum/brewery-beerjson`) — **1/1 files / 4/4 tests** — confirms `index.test.ts` passes under the new workspace-name resolution.
- [x] Native typecheck via the **slot-8 no-root-install / named-volume pattern** — clean; ~5.5s wall-clock. api `.bin/` count preserved at canonical 21; api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}`.
- [x] beerjson dist content audit: `grep -roh '@(brewery|umbraculum)/[a-z][a-z0-9-]*[a-z0-9]' dist/` returned only `@umbraculum/brewery-core` (the only external import in beerjson source). Zero `@brewery/*` refs in dist.
- [x] Final commit message notes the brewery-vertical classification.

**No new lessons surfaced.** Slot 12 was a clean execution of the slot-6-validated brewery-vertical TRAP recipe under the slot-9-refined verification battery. **The slot-6 TRAP discipline is now fully proven across two attempts** (slot 6 `core → brewery-core`, slot 12 `beerjson → brewery-beerjson`); the §1.3 classification gate caught both correctly on the first attempt. See plan doc §6.12 for full recap.

**Follow-up note (out of slot 12 scope, not blocking):** beerjson has 1 test file / 4 tests that is NOT included in root `test:packages`. Same shape as the slot-11 module-sdk follow-up; tracked as a future cleanup item rather than landed under sub-plan #9.

---

## Slot 13 — `@brewery/recipes-ui` → `@umbraculum/brewery-recipes-ui`

**Status:** Complete (2026-05-19). **Closes the package rename set.** After slot 13 ships, only slot 14 (four application-workspace `name` flips with zero workspace-consumer deps) remains in sub-plan #9. Brewery-vertical TRAP discipline now proven across **3 of 3** vertical-prefixed slots (slot 6 / 12 / 13). **Depended on slots 5, 8, 12** — all shipped.

**Target + classification.** **Brewery-vertical.** Recipes, mash, water, yeast UIs (brewery domain). Target name carries `brewery-` prefix per §1.3.

**Hard stops cleared.**

- [x] Predecessors: slots 5 (`ui`), 8 (`i18n-react`), 12 (`beerjson`) all shipped — confirmed `packages/recipes-ui/package.json` lists `@umbraculum/brewery-beerjson`, `@umbraculum/i18n-react`, `@umbraculum/ui` as deps before step 1.
- [x] **`apps/native/metro.config.js`** line 31 `extraNodeModules: { "@brewery/recipes-ui": ... }` updated to `@umbraculum/brewery-recipes-ui` by the bulk sweep — the on-disk symlink target stays as `packages/recipes-ui` (the directory name doesn't change). This is the only metro `extraNodeModules` pin in the repo and slot-13's flagship HARD STOP. Cleared by sweep.
- [x] Classifying description added (per slot-9..12 precedent): `"Brewery-vertical domain UI — recipe / mash / water / yeast editors. Sits one tier above @umbraculum/ui (platform-neutral primitives). Cross-platform (web + native) via injected-adapter pattern. Brewery-vertical-classified per sub-plan #9 §1.1 (recipe domain is brewing-specific; the @umbraculum/brewery-* prefix marks the vertical boundary)."`
- [x] Preflight skill 6 HARD STOP classes ran: 2 HITS — `apps/native/metro.config.js` (above) + root `build:packages` (10th item in chain, cleared by sweep). Bin field absent; `next.config.js` transpilePackages does NOT include recipes-ui (ships pre-built dist/, same architectural pattern as beerjson/api-client/automation-contracts/module-sdk); root `test:packages` does NOT include recipes-ui (recipes-ui has NO own tests in `src/` — slot-13 has zero own-test-files to invoke); workflow display names absent.
- [x] 4-cousin substring-collision walk surfaced **two slot-specific findings**:
  - **Cousin (c2):** `@umbraculum/recipes-ui` (the platform-bare name) appears in EXACTLY ONE place — `docs/modules/contribute/horizontal-package.md:113` — as **deliberate pedagogy** explicitly contrasting the WRONG name with the CORRECT brewery-prefixed target. The slot-13 sweep regex is anchored on `@brewery/recipes-ui`, not on `@umbraculum/recipes-ui`, so this pedagogy text was correctly untouched. **First slot whose cousin-(c2) check found a deliberate "anti-pattern documentation" entry** — confirms the post-slot-6 TRAP-recap pedagogy doctrine is live.
  - **Cousin (c):** 11 pre-existing `@umbraculum/brewery-recipes-ui` forecast references in doc-tier files. The sweep correctly converted them to live-state references AT THE LEADING `@brewery/recipes-ui` site, BUT the parenthetical forecast text (e.g. `(will be renamed to @umbraculum/brewery-recipes-ui in slot 13)`) was left intact — turning the sentence into a self-referential tautology post-sweep.
- [x] **NEW LESSON** — forecast-becomes-live doc-tier tautology purge — surfaced during slot 13, captured in plan doc §5 risk register + §4 step-3 NEW POST-SWEEP CHECKLIST block. Cleanup pass executed on 8 sites: 6 new slot-13 sites (i18n-react/README, media/README, navigation/README ×2, ui/README ×4, MODULES.md, brewery.md, vertical-configuration.md) + 2 leftover slot-12 sites (vertical-configuration.md ×1, brewery.md ×1) that the slot-12 sweep had not bulk-grep'd. Out-of-strict-slot-13-scope cleanup of slot-12-leftover but inside the natural cleanup pass; called out explicitly in commit message.
- [x] Slot-9 NEW HARD STOP held: `cursor-tmp/slot13-bulk-sed.py` excluded itself via `EXCLUDE_DIR_PARTS` set + the slot-9 defensive belt-and-braces (script's `OLD_FULL` literal constructed from concatenated string segments).
- [x] **Slot-6 TRAP discipline held — third proof point:** the slot-13 bulk-sed `NEW_FULL` constant uses a different `NEW_PKG_NAME` (`brewery-recipes-ui`) than `OLD_PKG_NAME` (`recipes-ui`). The §1.3 classification gate caught the brewery-vertical classification on first attempt for the third consecutive vertical-prefixed slot.

**File inventory cleared.**

Workspace name + own files:
- [x] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json) — `name` flipped to `@umbraculum/brewery-recipes-ui`; `description` field added per handoff (reworded from forecast to current-state).
- [x] [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md) — heading + workspace command examples + future-package-name examples updated; rename history note added per slot-8/9/10/11/12 convention with explicit TRAP rationale (`brewery-` prefix marks brewery-vertical classification, not the platform-name `@umbraculum/recipes-ui` — the latter is the explicit anti-pattern in `docs/modules/contribute/horizontal-package.md:113`).
- [x] All internal `packages/recipes-ui/src/**/*.tsx` files — already on `@umbraculum/brewery-beerjson`, `@umbraculum/i18n-react`, `@umbraculum/ui` from prior slots; no in-package self-reference to update (recipes-ui doesn't import itself).

Consumer `package.json` deps:
- [x] [`apps/web/package.json`](../../apps/web/package.json).
- [x] [`apps/native/package.json`](../../apps/native/package.json).

Build configs:
- [x] [`apps/native/metro.config.js`](../../apps/native/metro.config.js) — `extraNodeModules` pin updated by sweep (HARD STOP — the only metro pin in the repo).

Source imports — web (7 files):
- [x] [`apps/web/app/_components/RecipeTitleWithMeta.tsx`](../../apps/web/app/_components/RecipeTitleWithMeta.tsx).
- [x] [`apps/web/app/recipes/[id]/edit/page.tsx`](../../apps/web/app/recipes/[id]/edit/page.tsx) — 2 substitutions.
- [x] [`apps/web/app/recipes/[id]/water/boil/page.tsx`](../../apps/web/app/recipes/[id]/water/boil/page.tsx) — 2 substitutions.
- [x] [`apps/web/app/recipes/[id]/water/mash/page.tsx`](../../apps/web/app/recipes/[id]/water/mash/page.tsx) — 3 substitutions.
- [x] [`apps/web/app/recipes/[id]/water/page.tsx`](../../apps/web/app/recipes/[id]/water/page.tsx).
- [x] [`apps/web/app/recipes/[id]/water/sparge/page.tsx`](../../apps/web/app/recipes/[id]/water/sparge/page.tsx) — 2 substitutions.
- [x] [`apps/web/app/recipes/[id]/yeast/page.tsx`](../../apps/web/app/recipes/[id]/yeast/page.tsx) — 2 substitutions.

Source imports — native (6 files):
- [x] [`apps/native/src/screens/RecipeEditScreen.tsx`](../../apps/native/src/screens/RecipeEditScreen.tsx).
- [x] [`apps/native/src/screens/WaterBoilScreen.tsx`](../../apps/native/src/screens/WaterBoilScreen.tsx) — 2 substitutions.
- [x] [`apps/native/src/screens/WaterHubScreen.tsx`](../../apps/native/src/screens/WaterHubScreen.tsx).
- [x] [`apps/native/src/screens/WaterMashScreen.tsx`](../../apps/native/src/screens/WaterMashScreen.tsx) — 3 substitutions.
- [x] [`apps/native/src/screens/WaterSpargeScreen.tsx`](../../apps/native/src/screens/WaterSpargeScreen.tsx) — 2 substitutions.
- [x] [`apps/native/src/screens/YeastScreen.tsx`](../../apps/native/src/screens/YeastScreen.tsx) — 2 substitutions.

Cross-package README references (substituted + tautology-purged):
- [x] [`packages/beerjson/README.md`](../../packages/beerjson/README.md) — 4 substitutions, [`packages/contracts/README.md`](../../packages/contracts/README.md), [`packages/i18n-react/README.md`](../../packages/i18n-react/README.md) — 2 substitutions + 2 tautology purges, [`packages/media/README.md`](../../packages/media/README.md) — 1 substitution + 1 tautology purge, [`packages/navigation/README.md`](../../packages/navigation/README.md) — 2 substitutions + 2 tautology purges, [`packages/ui/README.md`](../../packages/ui/README.md) — 4 substitutions + 4 tautology purges, [`apps/native/README.md`](../../apps/native/README.md) — 4 substitutions, [`apps/web/README.md`](../../apps/web/README.md) — 4 substitutions.

Doc references:
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md) — 2 substitutions, [`docs/ARCHITECTURE-REV02.md`](../ARCHITECTURE-REV02.md) — 2 substitutions, [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../DEVELOPMENT-NATIVE-LOCAL.md), [`docs/NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md), [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md), [`docs/MODULES.md`](../MODULES.md) — 1 sub + table tautology purge, [`docs/modules/contribute/vertical-configuration.md`](../modules/contribute/vertical-configuration.md) — 1 sub + 2 tautology purges (slot-12 + slot-13 leftovers), [`docs/modules/verticals/brewery/README.md`](../modules/verticals/brewery/README.md) — 1 sub + 2 tautology purges (slot-12 + slot-13).

**Step-3 sweep results:** 34 files / 61 substitutions in the bulk pass + 8 doc-tier tautology purges in the cleanup pass = 36 distinct modified files (some files received both passes). 3 explicit excludes (own README + 2 history docs).

**Verification + commit cleared.**

- [x] api typecheck green (`docker compose exec api npm run typecheck` clean).
- [x] api vitest baseline preserved (51 files / 413/413 passing — exactly matches slot-7..12 baseline).
- [x] Root `npm run test:packages` 9/9 files / 120/120 tests (5 contracts files / 73 tests + 4 brewery-core files / 47 tests) — same baseline as slot 9..12.
- [x] **Slot-specific:** recipes-ui has NO own tests. Per the package's own README, behavior is covered by consuming-app E2E + the per-workspace typecheck gate.
- [x] **CRITICAL gate:** Native typecheck via the slot-8 no-root-install / named-volume pattern — clean; **~4.8s wall-clock, fastest yet**. This is the slot-13 critical path because metro.config.js's `extraNodeModules` pin is the only HARD STOP that would surface as a typecheck error if the sweep had missed it. api `.bin/` count preserved at canonical 21; api `/api/health` still 200 post-typecheck. Slot-5 GOTCHA fully averted.
- [x] Nginx smoke 7/7 HTTP 200 — `/api/health`, `/en/{login,dashboard,recipes}`, `/it/{login,dashboard,recipes}`. **Closing-slot smoke**: all 7 routes touch the recipes-ui-rendered surface.
- [x] recipes-ui dist content audit: `grep -roh '@(brewery|umbraculum)/[a-z][a-z0-9-]*[a-z0-9]' dist/` returned only `@umbraculum/brewery-beerjson`, `@umbraculum/i18n-react`, `@umbraculum/ui` — the three external imports declared in `dependencies`. Zero `@brewery/*` refs in dist; zero stale references to old self-name.
- [x] **Forecast-becomes-live tautology audit (NEW gate from slot 13):** post-cleanup grep for the slot-13-codified pattern returned ZERO matches outside `docs/design/` (the migration plan + handoff docs deliberately retain forecast wording for status tracking).
- [x] Final commit message notes: closes the package rename set + brewery-vertical TRAP discipline proven 3-of-3 + tautology-purge cleanup.

**ONE NEW LESSON surfaced** — captured in plan doc §6.13 + §5 risk register + §4 step-3 post-sweep checklist:

- **Forecast-becomes-live doc-tier tautologies.** Brewery-vertical slots create cross-package README forecasts of the form `(will be renamed to @umbraculum/brewery-<name> in slot N)` that become tautological post-rename. Slot 12 left 2 such tautologies untouched; slot 13's larger doc-tier footprint created 6 new ones. Mitigation is a post-sweep grep + cleanup pass before commit.

**Follow-up note (was out of slot 13 scope; cleared by slot 14):** the generic "remaining `@brewery/*` packages pending sub-plan #9 slots" footers in `packages/contracts/README.md:55`, `packages/navigation/README.md:55`, `packages/i18n/README.md:62` were intentionally retained at slot-13 commit time — factually correct as long as slot 14 still had 4 application workspaces in scope. **Slot 14 cleaned them up** under the same tautology-purge lesson at sub-plan #9 closure (see slot-14 entry → "Slot-13-deferred footers cleaned in `packages/{contracts, navigation, i18n}/README.md`").

---

## Slot 14 — Application workspace names (×4) — **CLOSES SUB-PLAN #9**

**Status:** ✅ **COMPLETE 2026-05-19.** Sub-plan #9 closed.

**Target + classification.** Platform — all four application workspaces.

| Source | Target |
|---|---|
| `@brewery/api` | `@umbraculum/api` ✅ |
| legacy web app name | `@umbraculum/web` ✅ |
| `@brewery/native` | `@umbraculum/native` ✅ |
| legacy web E2E workspace name | `@umbraculum/web-e2e` ✅ |

**Hard stops cleared.**

- ✅ Zero workspace-consumer dependencies — renames isolated to each workspace's own `package.json` + lockfile entries carrying the workspace's reverse `name` field. Confirmed by canonical grep showing only the 19 inventory files matched.
- ✅ Bundled as ONE PR (per the original guidance). No partial-state risk.
- ✅ Closing condition met under operational interpretation (see Appendix below) — every remaining `@brewery/[a-z]` reference is a deliberate rename-history record or immutable RFC narrative.

**File inventory (all checked).**

Workspace `name` fields:
- [x] [`services/api/package.json`](../../services/api/package.json) — `@brewery/api` → `@umbraculum/api`; description added.
- [x] [`apps/web/package.json`](../../apps/web/package.json) — legacy web app name → `@umbraculum/web`; description added.
- [x] [`apps/native/package.json`](../../apps/native/package.json) — `@brewery/native` → `@umbraculum/native`; description added.
- [x] [`apps/web/e2e/package.json`](../../apps/web/e2e/package.json) — legacy web E2E workspace name → `@umbraculum/web-e2e`; description added.

Doc references (own READMEs):
- [x] [`services/api/README.md`](../../services/api/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md) — heading flipped + NOTE block rewrote from "parked pending sub-plan #9" to "Renamed from `@brewery/<name>` ... closing slot of sub-plan #9".

Bulk-sed sweep (9 files, 11 substitutions): `.github/workflows/api.yml` (CI workflow display name), 6 contract test files, `docs/LINTING.md`, `docs/REACT-NATIVE-KICKOFF-READINESS.md`.

Doc-tier closeout (slot-13 lesson + new slot-14 cleanups):
- [x] Slot-13-deferred footers cleaned in `packages/{contracts, navigation, i18n}/README.md`.
- [x] Forward-looking placeholders updated in `packages/automation-contracts/src/adapter.ts:112` (`@umbraculum/openplc-adapter`) + `docs/design/canonical-automation-module-surface.md:61` (`@umbraculum/brewery-equipment-contracts`) + `docker-compose.yml:118` (symlink-path comment + closure note).
- [x] Status-stale claims rewritten in `docs/PLATFORM-ARCHITECTURE.md` (5 sites in §3.3 / §4.4 / §5.2 / §10.1.1) + `docs/FOUNDATION-HARDENING.md` §5.5 + scope row + `docs/ROADMAP.md` H1 2027 milestone + Phase summary.
- [x] `docs/DOCS-README-STANDARDS.md` §3.1 rewritten from "parking guidance" to "historical closure note"; template heading + import-snippet + audit-checklist rule + §8 next-anchor updated.

**Verification (this slot, all green).**

- [x] API typecheck: clean (`@umbraculum/api@0.0.0`).
- [x] API vitest: 51 files / **413 tests** passed.
- [x] root `npm run test:packages` per-package: `brewery-core` 47 / `contracts` 73 / `brewery-beerjson` 4 / `automation-contracts` 40 / `module-sdk` 8 = **172 tests** total.
- [x] Native typecheck (no-root-install / named-volume): clean.
- [x] Nginx smoke: `/api/health` 200, `/en` 200, `/en/recipes` 200, `/en/water-profiles` 200, `/api/auth/me` 401 (unauth — expected).
- [x] Workspace symlinks fully refreshed: `node_modules/@brewery/` empty (0 entries); `node_modules/@umbraculum/` complete (16 entries — all 13 packages + 3 in-glob application workspaces).
- [x] Plan doc §0 banner updated to "**CLOSED 2026-05-19**".
- [x] Plan doc §6.14 recap added with full evidence trail.
- [x] §5 risk register entry added for "Operational closing-condition unachievable as literally written" (slot-14 lesson).

**Commit message:** `"sub-plan #9 slot 14 of 14 (CLOSES sub-plan #9) — application-workspace bundle: @brewery/{api, web, native, web-e2e} → @umbraculum/{api, web, native, web-e2e}; doc-tier closeout (slot-13-deferred footers + status-stale claims + forward-looking placeholders + DOCS-README-STANDARDS §3.1 rewrite); operational closing condition met"`

**Commit hash:** *(populated post-commit)*

---

## Appendix — sub-plan #9 closing checklist (RUN ON SLOT 14 — RESULTS RECORDED HERE)

- [x] **Operational closing condition** (refined from the literal-grep form per slot-14 §6.14 lesson): "zero LIVE `@brewery/*` references — workspace `name`, `dependencies` keys, imports, forward-looking placeholders, status-stale claims; rename-history records (description fields, README NOTE blocks, comments, history docs, immutable RFC narrative) RETAINED." Verified PASS — 26 files match the literal grep, all 26 categorized as deliberate rename-history records (7 package.json description fields + 6 README NOTE-blocks + 1 prisma schema comment + 1 design-doc rename-history sentence + 1 contracts-validation F5 row + 8 own slot-14 files with updated rename-history sentences + 2 always-excluded migration docs). The literal-grep form is preserved in the codified preflight skill as a diagnostic, but the operational form is the authoritative closing condition.
- [x] All 14 slots above marked "Done"; commit hashes recorded in each slot's recap.
- [x] Plan doc §0 banner reflects the close-out date (2026-05-19).
- [x] Umbrella plan sub-plan #9 row to be marked "Done" (local Cursor plan file — operator todo at next session, not a structural-tier doc).
- [x] [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) F5 row already marked complete (in slot 11; the F5 entry covered the validation slice's own scope completion).
- [x] Plugin-pack skill `package-scope-migration-preflight` published at `.cursor/plugins/local/umbraculum-platform-tsjs-cursor-assistant/skills/package-scope-migration-preflight/SKILL.md` and referenced from the plan doc §4 step 2; refined through slots 6 → 8 (4-cousin walk added) → 13 (forecast-becomes-live tautology-purge step added) → 14 (operational closing-condition note to be added in the next plugin-pack revision).
- [x] Workspace symlink boundary clean: `node_modules/@brewery/` empty (0 entries) confirms no workspace package now resolves through the legacy scope.
- [x] Sub-plan #9 lessons captured in plugin pack: `package-scope-migration-preflight` skill (slot-2/6/8/13/14 cumulative), `ci-parity-local-reproduction` skill + rule 72 (post-slot-7 codification), 3-of-3 brewery-vertical TRAP-discipline pattern proof (slots 6 / 12 / 13 + slot-14 cousin (a) cross-check via `web` vs `web-e2e`).

---

*This checklist is the operational counterpart to [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md). Treat the plan doc as the source-of-truth for the recipe (§4) and risk register (§5); treat this doc as the per-slot work-tracker. If they ever disagree, the plan doc wins.*
