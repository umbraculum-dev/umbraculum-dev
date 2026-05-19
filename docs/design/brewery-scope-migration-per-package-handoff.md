# `@brewery/*` → `@umbraculum/*` per-package handoff checklist

**Tier:** Public
**Status:** Active 2026-05-19 — slots 1–8 done (1: `test-mcp` worked example, 2: `media`, 3: `navigation`, 4: `automation-contracts`, 5: `ui` — heavy 69-file slot held cleanly on first attempt under the slot-4-corrected recipe, 6: `brewery-core` — ⚠ TRAP slot held cleanly on first attempt under the §1.3 classification gate, 7: `i18n` — first slot with a controlled **transient cross-scope state**, 8: `i18n-react` — closed slot 7's transient cross-scope state and validated the no-root-install / named-volume native-typecheck pattern as the slot-5-GOTCHA-free default) + **post-slot-7 CI hygiene fix #2** (interlude, plan doc §6.7): isolated three independent local-vs-CI divergence mechanisms (gitignored cross-references, nested-workspace install drift, stale-node_modules bind-mount shadowing) and introduced `scripts/ci-parity-check.sh` so slot operators can reproduce CI's static-analysis jobs in a clean `git archive HEAD` snapshot before pushing — codified into umbraculum-toolset as rule `72-ci-parity-local-vs-ci-divergence.mdc` + skill `ci-parity-local-reproduction` (umbraculum-toolset commit `5748c5b`). **All slot operators starting slot 8 onward should run `bash scripts/ci-parity-check.sh` as the last step before `git push` — see plan doc §6.7.** Slots 9–14 pending serial execution. **Slot 4 corrected the slot-3 recipe**: the real devDep pruner is the build script's `npm ci`, not any restart. Step 5 is now a STOP-build-install-START sequence (see plan doc §4 step 5); step 4b's per-container api install was REMOVED (web-only now). **Slot 5 added two further awarenesses to step 6**: (a) `apps/web` typecheck is excluded from CI and currently produces ~1073 accepted-cost `TS2322` errors — do not treat as a regression; (b) running native typecheck via host one-shot `docker run -v "$PWD:/repo" ... npm install` prunes api devDeps the same way the build script does — recovery is STOP-install-START (no rebuild). **Slot 6 added four further refinements**: (a) root `package.json` `test:packages` is a HARD STOP analog of `build:packages` — preflight skill grew Command 6; (b) `.github/workflows/api.yml` workflow step `name:` display strings are a separate HARD STOP class (path globs in `on.push.paths` use filesystem paths — no change; step display names use npm names — must change); (c) slot-5 gotcha refined — only `npm install` (not `npm run <script>`) prunes the api bind-mount; (d) bulk sed should exclude the just-edited `packages/<name>/package.json` whenever step 1's description deliberately contains a historical reference to the old name (TRAP-slot pattern). **Slot 7 added three further refinements**: (a) **NEW HARD STOP** — bulk sed must also exclude the plan doc + handoff doc themselves; (b) the "transient cross-scope state" for split packages is precisely the **workspace name** of the downstream package; (c) **substring collision safety re-verified** under the `[^a-zA-Z0-9_-]` regex tail. **Slot 8 added two further refinements**: (a) **NEW PREFERRED PATTERN** — native typecheck via the no-root-install / named-volume mount (`docker run -v "$PWD:/repo" -v brewery_app_root_node_modules:/repo/node_modules -w /repo/apps/native node:20-slim sh -c 'PATH="/repo/node_modules/.bin:$PATH" npm run typecheck'`) AVOIDS the slot-5 GOTCHA entirely — ~6s instead of ~60s, and api is provably unaffected; the older `cd /repo && npm install ...` pattern stays as a cold-start fallback; (b) **substring-collision sanity check expanded from 2-cousin to 4-cousin** — explicit verbiage in plan doc §4 step 3 now covers longer-prefix + shorter-prefix + just-renamed-sibling-in-new-scope + export-subpath cousins. Net effect across slots 1–8: the recipe is now substantially shorter and more robust than the post-slot-3 version, and is proven robust under heavy slot loads (slot 5), TRAP slot loads (slot 6), and controlled cross-scope transients (slots 7 + 8).
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
- [x] [`docs/architecture-Rev02.md`](../architecture-Rev02.md) (5 mentions across implementation log).

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
- [x] `docs/{PLATFORM-ARCHITECTURE,CODING-STANDARDS,LINTING,REACT-NATIVE-KICKOFF-READINESS,TAMAGUI,DEVELOPMENT-NATIVE-LOCAL,architecture-Rev02}.md`, `docs/archive/architecture-Rev01.md`, `docs/integrations/FLOATING-HYDROMETERS.md`, `docs/rfcs/0002-canonical-module-physical-layout.md`.

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
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/architecture-Rev02.md`](../architecture-Rev02.md), [`docs/rfcs/0002-canonical-module-physical-layout.md`](../rfcs/0002-canonical-module-physical-layout.md).
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
- [x] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](../REACT-NATIVE-KICKOFF-READINESS.md), [`docs/architecture-Rev02.md`](../architecture-Rev02.md), [`docs/MODULES.md`](../MODULES.md), [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md).

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

**Status:** Pending.

**Target + classification.** Platform. Generic auth/me DTO + AI-tool contract types. Heaviest slot in the migration (122 occurrences across 75 files).

**Hard stops.**

- **`apps/web/next.config.js`** has `transpilePackages: [..., "@brewery/contracts", ...]` — must update.
- This slot is the predecessor for slot 10 (`api-client`) and slot 11 (`module-sdk`) — both have `@brewery/contracts` as a dep.
- After this slot ships, EVERY contract test in `services/api/src/tests/contracts/` will need its imports updated. The test names themselves stay the same; only the import paths change.
- AI tool registrations in [`services/api/src/services/ai/tools/`](../../services/api/src/services/ai/tools/) all use `@brewery/contracts` types — every tool file needs updating.
- Likely its own session given the scale.

**File inventory.** (Abbreviated — the full grep from plan doc §4 step 3 will surface everything. Below is the structural overview.)

Workspace name + own files:
- [ ] [`packages/contracts/package.json`](../../packages/contracts/package.json).
- [ ] [`packages/contracts/README.md`](../../packages/contracts/README.md).
- [ ] [`packages/contracts/src/ai/aiTool.ts`](../../packages/contracts/src/ai/aiTool.ts) — internal references.

Consumer `package.json` deps:
- [ ] [`apps/web/package.json`](../../apps/web/package.json).
- [ ] [`apps/native/package.json`](../../apps/native/package.json).
- [ ] [`services/api/package.json`](../../services/api/package.json).
- [ ] [`packages/api-client/package.json`](../../packages/api-client/package.json) — dep entry.
- [ ] [`packages/module-sdk/package.json`](../../packages/module-sdk/package.json) — dep entry.

Build configs:
- [ ] [`apps/web/next.config.js`](../../apps/web/next.config.js) `transpilePackages` (HARD STOP if missed).
- [ ] [`docker-compose.yml`](../../docker-compose.yml).

Source imports — group by directory and execute the grep+replace:
- [ ] All `apps/web/app/**/*.ts{,x}` matching the grep (auth pages, equipment, recipes, water).
- [ ] All `apps/native/src/**/*.ts{,x}` matching the grep (~10 screens + lib/typeGuards.ts).
- [ ] All `services/api/src/**/*.ts` matching the grep — routes, services, AI tools, orchestrator, settings.
- [ ] All `services/api/src/tests/**/*.test.ts` and `**/*.contract.test.ts` matching the grep.
- [ ] [`packages/module-sdk/src/types.ts`](../../packages/module-sdk/src/types.ts).

CI:
- [ ] [`.github/workflows/api.yml`](../../.github/workflows/api.yml).

Cross-package README references:
- [ ] [`packages/api-client/README.md`](../../packages/api-client/README.md), [`packages/contracts/README.md`](../../packages/contracts/README.md), [`packages/i18n/README.md`](../../packages/i18n/README.md), [`packages/media/README.md`](../../packages/media/README.md), [`packages/navigation/README.md`](../../packages/navigation/README.md), [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`services/api/README.md`](../../services/api/README.md).

Handoff docs (pre-existing, still relevant historical context):
- [ ] [`docs/design/pr1-contracts-migration-handoff.md`](./pr1-contracts-migration-handoff.md) — update references.
- [ ] [`docs/design/pr3-routes-migration-handoff.md`](./pr3-routes-migration-handoff.md) — update references.

Doc references:
- [ ] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/LINTING.md`](../LINTING.md), [`docs/TESTING.md`](../TESTING.md), [`docs/TYPING.md`](../TYPING.md), [`docs/ROADMAP.md`](../ROADMAP.md).
- [ ] [`internal/working-notes/TODOs.md`](../../internal/working-notes/TODOs.md).

**Verification + commit.** Plan doc §4 steps 4–7. Note: this slot's commit will be the largest single diff in sub-plan #9 — expect ~75 files touched, but the changes are uniform (only import paths). Reviewer attention focused on Step 2 (Classification gate — confirm target is `@umbraculum/contracts`, not accidentally something else) and Step 4 (lockfile diff scoped to contracts).

---

## Slot 10 — `@brewery/api-client` → `@umbraculum/api-client`

**Status:** Pending. **Depends on slot 9.**

**Target + classification.** Platform. Generic fetch + auth boundary (cookie web, bearer native).

**Hard stops.**

- Predecessor: slot 9 must have shipped (api-client lists `@brewery/contracts` as a dep).
- Consumed primarily by `apps/native` (AuthProvider + screens); minimal `apps/web` consumption.

**File inventory.**

Workspace name + own files:
- [ ] [`packages/api-client/package.json`](../../packages/api-client/package.json) — `name`; description; dep on `@brewery/contracts` (now `@umbraculum/contracts`).
- [ ] [`packages/api-client/README.md`](../../packages/api-client/README.md).

Consumer `package.json` deps:
- [ ] [`apps/native/package.json`](../../apps/native/package.json).

Source imports — native:
- [ ] [`apps/native/src/auth/AuthProvider.tsx`](../../apps/native/src/auth/AuthProvider.tsx).
- [ ] [`apps/native/src/components/AdSlot.tsx`](../../apps/native/src/components/AdSlot.tsx).
- [ ] [`apps/native/src/navigation/openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts).
- [ ] All `apps/native/src/screens/*.tsx` matching the grep (BrewdayStepsSettings, BrewSessionDetail, BrewSessionsList, Dashboard, Equipment, FermDataIntegration, RecipeEdit, RecipesList, SelectWorkspace, WaterBoil, WaterHub, WaterMash, WaterProfiles, WaterSparge, Yeast).

Cross-package README references:
- [ ] [`packages/api-client/README.md`](../../packages/api-client/README.md), [`packages/contracts/README.md`](../../packages/contracts/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md), [`services/api/README.md`](../../services/api/README.md).

Doc references:
- [ ] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md), [`docs/architecture-Rev02.md`](../architecture-Rev02.md).
- [ ] [`internal/working-notes/TODOs.md`](../../internal/working-notes/TODOs.md).

**Verification + commit.** Plan doc §4 steps 4–7. Native typecheck especially important here since native is the dominant consumer.

---

## Slot 11 — `@brewery/module-sdk` → `@umbraculum/module-sdk`

**Status:** Pending. **Depends on slot 9.**

**Target + classification.** Platform. `registerModule()` contract + `ValidatedSchema<T>` interface. Already self-declares end-state name in `package.json` description.

**Hard stops.**

- Predecessor: slot 9 must have shipped (module-sdk lists `@brewery/contracts` as a dep).
- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) F5 explicitly tracks this rename as a coordination point — update the F5 row to mark this slot done.
- [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) references `ValidatedSchema<T>` from `@brewery/module-sdk` — update.

**File inventory.**

Workspace name + own files:
- [ ] [`packages/module-sdk/package.json`](../../packages/module-sdk/package.json) — `name`; clean up "End-state" sentence in description (now reflects current state).
- [ ] [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md) — heading + all examples.
- [ ] [`packages/module-sdk/src/types.ts`](../../packages/module-sdk/src/types.ts) — internal references.

Consumer `package.json` deps:
- [ ] [`services/api/package.json`](../../services/api/package.json).

Source imports:
- [ ] [`services/api/src/app.ts`](../../services/api/src/app.ts) (comment reference).
- [ ] [`services/api/src/modules/automation/index.ts`](../../services/api/src/modules/automation/index.ts).
- [ ] [`services/api/src/tests/vitest.setup.ts`](../../services/api/src/tests/vitest.setup.ts).

Other:
- [ ] [`docker-compose.yml`](../../docker-compose.yml) — comment references.

Doc references:
- [ ] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md).
- [ ] [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) — F5 row + any inline references; mark slot 11 done in F5.
- [ ] [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) — ValidatedSchema reference.
- [ ] [`docs/design/canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) — references in B-1 closure note.

**Verification + commit.** Plan doc §4 steps 4–7. Slot-specific verification:
- [ ] Confirm `services/api` boots clean (registerModule wiring is the hot path).
- [ ] Update [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) F5 row to mark "rename complete" alongside the same commit.

---

## Slot 12 — `@brewery/beerjson` → `@umbraculum/brewery-beerjson`

**Status:** Pending. **Depends on slot 6.**

**Target + classification.** **Brewery-vertical.** BeerJSON brewing-specific interchange schema. Target name carries `brewery-` prefix.

**Hard stops.**

- Predecessor: slot 6 must have shipped (beerjson lists `@brewery/core` as a dep — after slot 6 it lists `@umbraculum/brewery-core`).
- Add classifying description: `"Brewery-vertical BeerJSON schema layer. End-state npm scope: @umbraculum/brewery-beerjson per sub-plan #9."`

**File inventory.**

Workspace name + own files:
- [ ] [`packages/beerjson/package.json`](../../packages/beerjson/package.json) — `name`; description.
- [ ] [`packages/beerjson/README.md`](../../packages/beerjson/README.md).
- [ ] [`packages/beerjson/src/index.ts`](../../packages/beerjson/src/index.ts) — internal references.

Consumer `package.json` deps:
- [ ] [`apps/web/package.json`](../../apps/web/package.json).
- [ ] [`apps/native/package.json`](../../apps/native/package.json).
- [ ] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json) — recipes-ui dep.

Source imports:
- [ ] [`apps/native/src/screens/RecipeEditScreen.tsx`](../../apps/native/src/screens/RecipeEditScreen.tsx).
- [ ] [`apps/native/src/screens/WaterMashScreen.tsx`](../../apps/native/src/screens/WaterMashScreen.tsx).
- [ ] [`apps/native/src/screens/YeastScreen.tsx`](../../apps/native/src/screens/YeastScreen.tsx).
- [ ] [`apps/web/app/recipes/_lib/beerjsonRecipe.ts`](../../apps/web/app/recipes/_lib/beerjsonRecipe.ts).
- [ ] [`packages/recipes-ui/src/mash/MashStepsEditor.tsx`](../../packages/recipes-ui/src/mash/MashStepsEditor.tsx).

Cross-package README references:
- [ ] [`packages/beerjson/README.md`](../../packages/beerjson/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [ ] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/LINTING.md`](../LINTING.md), [`docs/TYPING.md`](../TYPING.md), [`docs/NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md), [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../DEVELOPMENT-NATIVE-LOCAL.md), [`docs/ROADMAP.md`](../ROADMAP.md), [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md).

**Verification + commit.** Plan doc §4 steps 4–7. Commit message notes the brewery-vertical classification: `"@umbraculum/brewery-beerjson (brewery-vertical, BeerJSON spec)"`.

---

## Slot 13 — `@brewery/recipes-ui` → `@umbraculum/brewery-recipes-ui`

**Status:** Pending. **Depends on slots 5, 8, 12.**

**Target + classification.** **Brewery-vertical.** Recipes, mash, water, yeast UIs (brewery domain). Target name carries `brewery-` prefix.

**Hard stops.**

- Predecessors: slots 5 (`ui`), 8 (`i18n-react`), 12 (`beerjson`) must all have shipped — recipes-ui depends on all three.
- **`apps/native/metro.config.js`** has `extraNodeModules: { "@brewery/recipes-ui": ... }` — must update. This is the only `metro.config.js` extraNodeModules pin in the repo.
- Add classifying description: `"Brewery-vertical domain UI (recipes, mash, water, yeast). End-state npm scope: @umbraculum/brewery-recipes-ui per sub-plan #9."`
- This is the final package-rename slot — after this ships, only slot 14 (application workspaces) remains.

**File inventory.**

Workspace name + own files:
- [ ] [`packages/recipes-ui/package.json`](../../packages/recipes-ui/package.json) — `name`; description; deps on `beerjson`, `i18n-react`, `ui` already updated to `@umbraculum/*` via prior slots.
- [ ] [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md).
- [ ] All internal `packages/recipes-ui/src/**/*.tsx` files matching the grep — already updated to point at `@umbraculum/beerjson`, `@umbraculum/i18n-react`, `@umbraculum/ui` if predecessors shipped.

Consumer `package.json` deps:
- [ ] [`apps/web/package.json`](../../apps/web/package.json).
- [ ] [`apps/native/package.json`](../../apps/native/package.json).

Build configs:
- [ ] [`apps/native/metro.config.js`](../../apps/native/metro.config.js) — `extraNodeModules` pin (HARD STOP — the only metro pin in the repo).

Source imports — web:
- [ ] [`apps/web/app/_components/RecipeTitleWithMeta.tsx`](../../apps/web/app/_components/RecipeTitleWithMeta.tsx).
- [ ] [`apps/web/app/recipes/[id]/edit/page.tsx`](../../apps/web/app/recipes/[id]/edit/page.tsx).
- [ ] [`apps/web/app/recipes/[id]/water/boil/page.tsx`](../../apps/web/app/recipes/[id]/water/boil/page.tsx).
- [ ] [`apps/web/app/recipes/[id]/water/mash/page.tsx`](../../apps/web/app/recipes/[id]/water/mash/page.tsx).
- [ ] [`apps/web/app/recipes/[id]/water/page.tsx`](../../apps/web/app/recipes/[id]/water/page.tsx).
- [ ] [`apps/web/app/recipes/[id]/water/sparge/page.tsx`](../../apps/web/app/recipes/[id]/water/sparge/page.tsx).
- [ ] [`apps/web/app/recipes/[id]/yeast/page.tsx`](../../apps/web/app/recipes/[id]/yeast/page.tsx).

Source imports — native:
- [ ] [`apps/native/src/screens/RecipeEditScreen.tsx`](../../apps/native/src/screens/RecipeEditScreen.tsx).
- [ ] [`apps/native/src/screens/WaterBoilScreen.tsx`](../../apps/native/src/screens/WaterBoilScreen.tsx).
- [ ] [`apps/native/src/screens/WaterHubScreen.tsx`](../../apps/native/src/screens/WaterHubScreen.tsx).
- [ ] [`apps/native/src/screens/WaterMashScreen.tsx`](../../apps/native/src/screens/WaterMashScreen.tsx).
- [ ] [`apps/native/src/screens/WaterSpargeScreen.tsx`](../../apps/native/src/screens/WaterSpargeScreen.tsx).
- [ ] [`apps/native/src/screens/YeastScreen.tsx`](../../apps/native/src/screens/YeastScreen.tsx).

Cross-package README references:
- [ ] [`packages/beerjson/README.md`](../../packages/beerjson/README.md), [`packages/contracts/README.md`](../../packages/contracts/README.md), [`packages/i18n-react/README.md`](../../packages/i18n-react/README.md), [`packages/media/README.md`](../../packages/media/README.md), [`packages/navigation/README.md`](../../packages/navigation/README.md), [`packages/recipes-ui/README.md`](../../packages/recipes-ui/README.md), [`packages/ui/README.md`](../../packages/ui/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`apps/web/README.md`](../../apps/web/README.md).

Doc references:
- [ ] [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md), [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md), [`docs/architecture-Rev02.md`](../architecture-Rev02.md), [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../DEVELOPMENT-NATIVE-LOCAL.md), [`docs/NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md), [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md).

**Verification + commit.** Plan doc §4 steps 4–7. Closing the package set — final commit message: `"sub-plan #9 slot 13 of 14 — closes the package rename set; only application workspace names (slot 14) remain"`.

---

## Slot 14 — Application workspace names (×4)

**Status:** Pending. **Depends on slot 13** (so all package renames complete first, ensuring no in-flight package PR has lockfile collision with workspace `name`-field changes).

**Target + classification.** Platform — all four application workspaces.

| Source | Target |
|---|---|
| `@brewery/api` | `@umbraculum/api` |
| `@brewery/web` | `@umbraculum/web` |
| `@brewery/native` | `@umbraculum/native` |
| `@brewery/web-e2e` | `@umbraculum/web-e2e` |

**Hard stops.**

- These workspaces are not consumed by any other workspace (zero `dependencies` pointers to them). Renames are limited to the workspace's own `package.json` + lockfile entries that carry the workspace's reverse `name` field.
- Bundle as ONE PR (not four) — there is no inter-dependency or partial-state risk.
- After this slot ships, `grep -rE "@brewery/[a-z]"` (excluding node_modules/dist/lockfiles) must return zero results. This is the closing condition for sub-plan #9.

**File inventory.**

Workspace `name` fields:
- [ ] [`services/api/package.json`](../../services/api/package.json) — `name`: `@brewery/api` → `@umbraculum/api`.
- [ ] [`apps/web/package.json`](../../apps/web/package.json) — `name`: `@brewery/web` → `@umbraculum/web`.
- [ ] [`apps/native/package.json`](../../apps/native/package.json) — `name`: `@brewery/native` → `@umbraculum/native`.
- [ ] [`apps/web/e2e/package.json`](../../apps/web/e2e/package.json) — `name`: `@brewery/web-e2e` → `@umbraculum/web-e2e`.

Doc references:
- [ ] [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md) — references the e2e workspace name.
- [ ] [`apps/web/README.md`](../../apps/web/README.md), [`apps/native/README.md`](../../apps/native/README.md), [`services/api/README.md`](../../services/api/README.md) — any workspace-name references.
- [ ] Any remaining `@brewery/*` mentions in `docs/` — final cleanup sweep.

**Verification + commit.**

- [ ] Plan doc §4 steps 4–7.
- [ ] Confirm: `grep -rE "@brewery/[a-z]" --exclude-dir=node_modules --exclude-dir=dist --exclude='package-lock.json' .` returns ZERO results (the closing condition).
- [ ] Update [umbrella plan sub-plan #9 row](#) to "Done" (local Cursor plan file).
- [ ] Plan doc §0 status banner updated to "Sub-plan #9 closed YYYY-MM-DD".
- [ ] Commit message: `"sub-plan #9 slot 14 of 14 — closes sub-plan #9; all @brewery/* workspaces renamed to @umbraculum/*"`.

---

## Appendix — sub-plan #9 closing checklist (run after slot 14)

- [ ] `grep -rE "@brewery/[a-z]" --exclude-dir=node_modules --exclude-dir=dist --exclude='package-lock.json' .` returns zero.
- [ ] All 14 slots above marked "Done" with commit hashes.
- [ ] Plan doc §0 banner reflects the close-out date.
- [ ] Umbrella plan sub-plan #9 row reflects "Done".
- [ ] [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) F5 row marked complete.
- [ ] If plugin-pack skill `package-scope-migration-preflight` was authored mid-migration (at second-package execution per "codify on second use"), confirm it is published in `.cursor/plugins/local/umbraculum-platform-tsjs-cursor-assistant/skills/` and referenced from the plan doc §4 step 2.

---

*This checklist is the operational counterpart to [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md). Treat the plan doc as the source-of-truth for the recipe (§4) and risk register (§5); treat this doc as the per-slot work-tracker. If they ever disagree, the plan doc wins.*
