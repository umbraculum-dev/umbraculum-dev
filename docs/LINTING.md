# Linting (ESLint)

**Tier:** Public
**Status:** v3.2 — **HIGH-full landed; no warning-level rules remain; `no-unsafe-*` coverage extended to `apps/native` (Phase 5g, 2026-05-16).** Phases 1–6c (HIGH-staged) landed: `packages/platform/contracts/**`, `packages/verticals/brewery/beerjson/**`, `services/api/src/**`, all of `apps/web/app/recipes/**`, the entire `apps/native/src/**`, the `apps/web` non-recipes long tail, and the `no-unused-vars` mop-up. Both `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars` promoted to `error` repo-wide. **HIGH-full Phases 1–5 landed 2026-05-16:** Phase 1 (auto-fix sweep, 64 files, 310 warnings); Phase 2 (Tier A — Promise correctness, 7 type-aware rules at `warn`, 136 sites fixed); Phase 3 (Tier C-narrow — `services/api` `no-unsafe-*`, 777 raw warnings → 0, tsc baseline 19 → 17); Phase 4 (Tier C-wide — `apps/web` `no-unsafe-*`, 304 raw warnings → 0, tsc baseline 590 → 585; the "Tamagui wall" was a phantom — 95% traced to a stale `.account → .workspace` rename in commit `87876d0` that also fixed a long-broken UI feature); **Phase 5 (rule promotions + IDE-config prereq, 2026-05-16): all 12 type-aware rules promoted from `warn` to `error`; the C+A+E+F mitigation stack landed (editor-only `eslint.config.editor.mjs` + `.vscode/settings.json.example` + upstream cursor rule `23a-eslint-fixall-discipline.mdc` synced as of 3.1.11 + this doc's "Recommended editor configuration" section); `lint:packages-strict` script + workflow step dropped as redundant; lone `no-empty-object-type` straggler promoted to `error` in 5f housekeeping (Tamagui-friendly `with-single-extends` allowance preserved).** **`npm run lint` is now the single strict gate** — every rule, including the previously warning-level one, fails CI as an error. Repo-wide lint stays at ~42s wall (CI) / ~7s wall (editor via the stripped editor config). **Zero warnings, zero errors across the whole monorepo.** Detailed phase log in [`HIGH-full upgrade`](#high-full-upgrade) below.
**Audience:** maintainers, contributors, anyone authoring web/native UI code or services
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (Tamagui type-system caveats), `docs/TESTING.md`, `docs/TYPING.md` (the sibling SoT for compile-time strictness; covers the `tsc --noEmit` baseline + stricter-flag rollout — Phase 1 audit landed 2026-05-18), `docs/PLATFORM-ARCHITECTURE.md` §10.1.1 (go-public path), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — Zod/Valibot/TypeBox decision, separate from ESLint scope), `eslint.config.mjs` (this file is also documentation — read the comment headers).

---

## TL;DR

| What | State |
|---|---|
| ESLint runs in CI | ✅ `web-lint` GitHub Action, path-gated |
| Errors block CI | ✅ |
| Warnings tolerated repo-wide | ❌ No — every rule is at `error`. The 12 type-aware rules promoted in HIGH-full Phase 5c (2026-05-16); the lone `no-empty-object-type` straggler promoted later the same day in housekeeping (with the Tamagui-friendly `with-single-extends` allowance preserved). No warning-level rules remain. |
| Strict-gate workflow | ✅ `npm run lint` is the single gate. The previous `lint:packages-strict --max-warnings 0` script was dropped in HIGH-full Phase 5d as redundant — with rules at `error` repo-wide, any new violation fails the main lint step. |
| Editor-only ESLint config | ✅ `eslint.config.editor.mjs` strips the 12 type-aware rules + `parserOptions.projectService` for editor-extension use. Saves ~6× wall time (~42s → ~7s) and mechanically defeats the auto-fix-overreach failure mode. Copy `.vscode/settings.json.example` to `.vscode/settings.json` to opt in. See [Recommended editor configuration](#recommended-editor-configuration). |
| Cross-platform UI primitives enforced | ✅ `no-restricted-imports` on `packages/platform/ui/src/ai/**` and `packages/verticals/brewery/recipes-ui/src/charts/**` |
| Canonical module sibling-import guard | ✅ `eslint-plugin-boundaries` `boundaries/element-types` at **`error`** on `services/api/src/modules/**` (SOLID B5, 2026-06-04). See [Canonical module boundaries](#canonical-module-boundaries). |
| Package tier import guard | ✅ `eslint-plugin-boundaries` `boundaries/element-types` at **`error`** on `packages/**` (RFC-0011 Wave 3d, 2026-06-07). See [Package layer boundaries (3d)](#package-layer-boundaries-3d). |
| App layer segment / vertical guard | ✅ `eslint-plugin-boundaries` `boundaries/element-types` at **`error`** on `apps/{web,native}/**` (SOLID WS5, 2026-06). See [App layer boundaries (WS5)](#app-layer-boundaries-ws5). |
| API flat services import guard | ✅ `eslint-plugin-boundaries` at **`error`** on `services/api/src/services/**` excluding `ai/**` (RFC-0011 Phase 3, 2026-06-07). See [API flat services boundaries](#api-flat-services-boundaries). |
| React hook bug class blocked | ✅ `react-hooks/exhaustive-deps` is `error` |
| Type-aware lint enabled | ✅ **All 12 rules at `error`** — HIGH-full Phase 5c (2026-05-16). 7 promise-correctness rules (`**/*.{ts,tsx}`) + 5 `no-unsafe-*` rules (`services/api/**` + `apps/web/**`). Tests relaxed via the `**/{tests,e2e}/**` + `**/*.{test,spec}.*` glob block. `parserOptions.projectService` infrastructure live. |
| Outstanding warnings | **0** (-80 from Phase 6c, -58 from Phase 6b, -49 from Phase 6a, -99 from Phase 5b, -56 from Phase 5a, -64 from Phase 4c, -87 from Phase 4b, -104 from Phase 4a, -432 from Phase 3, -21 from Phase 2, -77 from Phase 1, -1,127 cumulative; was 1,127 at HIGH-light landing). **`npm run lint` exits clean — zero warnings, zero errors.** |

If you want to make a change touching `apps/web`, `apps/native`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`, the `web-lint` workflow will run automatically. Locally run lint with the commands in [How to run](#how-to-run-locally).

---

## Why ESLint exists in this repo

For a TypeScript + React + React Native monorepo headed for a public AGPLv3 release, lint coverage is a maturity expectation. TypeScript catches a large class of bugs, but ESLint catches a complementary class that TypeScript will never see:

- **`react-hooks/exhaustive-deps`** — stale-closure bugs (`useEffect` reads stale state). TypeScript can't see this; it's a semantic bug. We promoted this to `error` in HIGH-light.
- **`react-hooks/rules-of-hooks`** — conditional hook calls. Also semantic. Already `error`.
- **`jsx-a11y/*`** — accessibility regressions at the source level, complementing the runtime axe-core checks in the Playwright smoke suite.
- **`no-restricted-imports`** — bans specific imports (see below) for cross-platform safety.

### The canonical guardrail: cross-platform UI primitives

Components in `packages/platform/ui/src/{ai,charts}/**` MUST NOT import `Button`/`Input`/`BrewCheckbox` directly from `tamagui`. They MUST import the platform-forking wrappers from `packages/platform/ui/src/primitives/*`. Raw Tamagui leaks React Native a11y props (`accessibilityLabel`, `accessibilityRole`) to the DOM on web, triggering React console warnings.

This guardrail is enforced via `no-restricted-imports` and the underlying bug is documented in commit `221b193` (postmortem of `715bbea` / `d47f35a`).

This is exactly the kind of bug that:
- TypeScript cannot catch (Tamagui's types accept the props),
- Tests cannot easily catch (the warning is a console message, not a thrown error),
- Code review missed for two releases.

It's the reason ESLint is worth its tooling overhead in this repo.

### Canonical module boundaries {#canonical-module-boundaries}

RFC-0002 canonical modules under `services/api/src/modules/**` must not import sibling modules directly (e.g. `crp` → `mrp`). Allowed dependency directions:

- Same module (`modules/brewery/**` → `modules/brewery/**`)
- `platform/**`, `domain/**`, `plugins/**`
- Package imports (`@umbraculum/*-contracts`, etc.)

Configuration lives in [`eslint.config.mjs`](../eslint.config.mjs) (scoped `files` glob). Spike + verdict: [`docs/design/solid-boundaries-eslint-spike.md`](design/solid-boundaries-eslint-spike.md). **`boundaries/element-types` is `error`** (merge-blocking since SOLID B5, 2026-06-04). Complementary report-only drift signal: `npm run audit:solid-inventory`.

Horizontal paths (`services/api/src/routes/**`, `services/api/src/services/ai/tools/**`) are outside B5 scope by design. Flat non-AI services are fenced separately — see [API flat services boundaries](#api-flat-services-boundaries).

### API flat services boundaries {#api-flat-services-boundaries}

Flat horizontal orchestrators under `services/api/src/services/` must not import `services/api/src/modules/*/services/**` — RFC-0011 Wave 3e colocation. **`services/api/src/services/ai/**` is excluded** (horizontal AI advisor reads module services intentionally). Legacy allowlist: `platformRecipesService.ts` (`@arch-boundary`). Spike: [`docs/design/solid-boundaries-eslint-api-flat-services-spike.md`](design/solid-boundaries-eslint-api-flat-services-spike.md).

### Package layer boundaries (3d)

Physical package tiers under `packages/` (RFC-0011 Wave 3a) are enforced by `eslint-plugin-boundaries` on `packages/**/*.{ts,tsx}` (excluding `dist/**`):

| Element | Path pattern | Rule |
|---------|--------------|------|
| `pkg-platform` | `packages/platform/**` | Must **not** import `pkg-vertical` (may import `pkg-modules` contract packages) |
| `pkg-modules` | `packages/modules/**` | Must **not** import `pkg-vertical` |
| `pkg-vertical` | `packages/verticals/*/**` | May import `pkg-platform` + `pkg-modules`; **never** sibling vertical |

**Intentional exception:** `packages/platform/i18n/src/index.ts` merges `@umbraculum/brewery-i18n` into `getSharedMessages()` (`@arch-boundary`); ESLint disables `boundaries/element-types` for that file only.

Spike + verdict: [`docs/design/solid-boundaries-eslint-packages-spike.md`](design/solid-boundaries-eslint-packages-spike.md). Configuration: [`eslint.config.mjs`](../eslint.config.mjs) (package-layer block).

### App layer boundaries (WS5)

Apps (`apps/web`, `apps/native`) must follow **dependency direction** ([`DATA-ACCESS-BOUNDARIES.md`](DATA-ACCESS-BOUNDARIES.md) §6, [`solid-audit-charter.md`](design/solid-audit-charter.md) §2): UI talks to the API over HTTP + Zod contracts, not by importing server source or sibling feature folders they do not own.

**Tool:** `eslint-plugin-boundaries` — `boundaries/element-types` at **`error`** on `apps/{web,native}/**/*.{ts,tsx}`. Complements WS6 `no-restricted-imports` (pattern-based `@prisma/*` and `services/api/**` block). Spike + verdict: [`docs/design/solid-boundaries-eslint-apps-spike.md`](design/solid-boundaries-eslint-apps-spike.md).

**Element types (summary):**

| Type | Path pattern | Rule |
|------|--------------|------|
| `api-service` | `services/api/**` | Forbidden from all app elements |
| `web-app-shared` | `apps/web/src/**` | Cross-route shared i18n/navigation helpers |
| `web-platform-shared-layout` | `apps/web/app/_shared-layout/{_components,_lib}/**` | **Platform shared layout** — persistent UI frame (nav, footer, auth bar, global providers). See [backbone §3.7](design/pre-flip-application-surface-backbone.md). Must not import locale verticals. |
| `web-brewery-shared` | `apps/web/app/[locale]/(brewery)/{_components,_lib}/**` | Brewery route-group shared UI/helpers (recipe-edit, recipeImport, …) |
| `web-water-shared` | `apps/web/app/[locale]/(brewery)/recipes/[id]/water/{_lib,_hooks}/**` | Shared across mash/sparge/boil |
| `web-water-segment` | `apps/web/app/[locale]/(brewery)/recipes/[id]/water/*/**` | No sibling segment imports (e.g. mash → boil) |
| `web-recipe-edit-shared` | `apps/web/app/[locale]/(brewery)/recipes/[id]/edit/{_lib,_hooks}/**` | Shared edit helpers |
| `web-recipe-edit-surface` | `apps/web/app/[locale]/(brewery)/recipes/[id]/edit/**` | May import edit-shared, water-shared, platform-shared-layout, brewery-shared, app-shared only |
| `web-locale-vertical` | `apps/web/app/[locale]/(pim\|mrp\|crp\|brewery\|automation)/**` | No cross-vertical imports; may import platform-shared-layout and brewery-shared (brewery vertical only) |
| `web-recipe-cluster` | `apps/web/app/[locale]/(brewery)/recipes/**` | Must not import locale vertical admin UI source |
| `native-app-shared` | `apps/native/src/{auth,components,…}/**` | Allowed cross-module shared surfaces |
| `native-module-segment` | `apps/native/src/modules/*/**` | No sibling module imports (e.g. brewery → pim) |

**Allowed without fence:** `@umbraculum/*` packages (`api-client`, `*-contracts`, `ui`, `brewery-*`, etc.) — not modelled as boundary elements.

**Path history (2026-06):** WS5 recipe-cluster elements targeted legacy `apps/web/app/recipes/**` until the fork-cleanliness epic moved the sole implementation to `apps/web/app/[locale]/(brewery)/recipes/**`. Historical Phase 4 lint notes in this doc still cite legacy paths; current enforcement patterns are in the table above. Inventory: [`web-brewery-tree-consolidation-inventory.md`](design/web-brewery-tree-consolidation-inventory.md).

**How to fix violations:**

1. Move shared code to an explicit shared layer (`_lib`, `_hooks`, `web-platform-shared-layout`, `web-brewery-shared`, `web-app-shared`, or a `@umbraculum/*` package).
2. Do **not** import `services/api/**` or `@prisma/*` from apps — use `@umbraculum/api-client` + contracts.
3. Rare intentional coupling: document with `@arch-boundary` + README note per charter §6.

Configuration: [`eslint.config.mjs`](../eslint.config.mjs) (WS5 block). Report-only drift signal: `npm run audit:solid-inventory` (app cross-segment heuristic).

**Excluded (by design):** `apps/web/e2e/**` is outside WS5 scope until a dedicated policy lands.

### Client-safe package imports (WS6)

Apps must not import `@prisma/*` or `services/api/**` source (belt-and-suspenders alongside WS5 `eslint-plugin-boundaries`). Rule: `no-restricted-imports` at **`error`** on `apps/{web,native}/**` (promoted S closure epic 2026-06) — see [`docs/design/solid-client-safe-imports-spike.md`](design/solid-client-safe-imports-spike.md). Allowlist: [`scripts/eslint/appClientPackageAllowlist.mjs`](../scripts/eslint/appClientPackageAllowlist.mjs).

---

## Scope tiers — value/cost analysis

Lint configuration has a fundamental value/cost trade-off: stricter rules catch more bugs but require more triage of pre-existing violations. We staged this in four tiers. Keep this table updated as project priorities shift.

| Tier | Effort to land | Value | Status |
|---|---|---|---|
| **Minimal** — only `no-restricted-imports` scoped to cross-platform UI folders. | Low (one config + one rule). | Low–medium: only catches the one bug class. Doesn't earn its tooling overhead. | ❌ Rejected as the lone scope. |
| **Medium** — full base preset (TS-recommended + React-Hooks + jsx-a11y) with per-glob overrides; `no-restricted-imports` on cross-platform UI; `react-hooks/exhaustive-deps` set to `warn`. | Medium (one config + ~5 plugins + light cleanup of pre-existing warnings). | High — catches a real class of React bugs TypeScript misses, formalizes a11y, prevents future drift. | ✅ Superseded by HIGH-light. |
| **HIGH-light** — Medium + `exhaustive-deps` as **error** + `--max-warnings 0` on 9 clean packages + `allowInterfaces: "with-single-extends"` to keep Tamagui's module-augmentation pattern legal. | Medium-high (1 PR, ~3 hours focused work). | High — locks in the clean parts; gates against drift; gives an honest "where are we" picture. | ✅ **Landed.** |
| **HIGH-staged** — HIGH-light + clean `any` warnings package-by-package, expanding `lint:packages-strict` glob with each cleanup. | Medium-high per phase (4–6 phases). | High — real type-safety wins where the money is (contracts, services, web pages). | 🚧 In progress — see [HIGH-staged roadmap](#high-staged-roadmap) below. |
| **HIGH-full** — HIGH-staged + 12 type-aware rules at `error` (7 promise-correctness rules `**/*.{ts,tsx}` + 5 `no-unsafe-*` rules `services/api/**` and `apps/{web,native}/**`) + `no-explicit-any: error` + `no-unused-vars: error` + `no-empty-object-type: error` repo-wide. Editor-only ESLint config split (`eslint.config.editor.mjs` + `.vscode/settings.json.example`) protects against IDE lag and `source.fixAll.eslint: true` auto-fix overreach. | Medium-high — measurement (2026-05-16) showed full-repo type-aware lint takes 44s wall (vs prior 6s), ~1,671 warnings to triage of which ~411 auto-fix. Landed in 5 phases / 23 commits over 2026-05-16. | Highest — production-grade hygiene; signals maturity to public contributors. | ✅ **Landed 2026-05-16** (originally targeted H1 2027). All five phases (auto-fix sweep, promise correctness, `services/api` `no-unsafe-*`, `apps/web` `no-unsafe-*`, rule promotions + IDE-config prereq) shipped in a single day, faster than estimated, with two latent bugs surfaced as side effects (the `.account → .workspace` UI regression in Phase 4 and 5 pre-existing `tsc` errors fixed across Phases 3-4). Phase log: see [HIGH-full upgrade](#high-full-upgrade). |

### Why we did not go HIGH-full in one shot

HIGH-staged removed all `@typescript-eslint/no-explicit-any` warnings (Phases 1–6b) and all `@typescript-eslint/no-unused-vars` warnings (Phase 6c), and promoted both rules from `warn` to `error`. The repo is now warning-free under the current (non-type-aware) rule set. With that baseline established, a measurement run on 2026-05-16 enabled `@typescript-eslint/recommended-type-checked` against the post-Phase-6c tree (master `09c8b3c`) and surfaced **1,671 type-aware warnings** in 44s wall-clock — close to the prior estimate but distributed differently than the original framing assumed:

- **`services/api` is 62% of the surface** (1,034 warnings, dominated by `no-unsafe-member-access` 507 and `no-unsafe-assignment` 158). Prisma raw queries, Fastify request bodies, AI tool I/O, BeerJSON normalisation — not Tamagui.
- **`apps/web` is 27%** (452 warnings, of which 266 are the `no-unsafe-*` family — these are the genuine Tamagui-driven props-leaked-as-`any` cases the doc was always worried about).
- **`apps/native` is only 5%** (78 warnings, of which only 3 are `no-unsafe-*`). Tamagui's React Native bindings type cleanly enough that the friction story is essentially apps/web-only, not both-platforms.
- **~411 warnings (~25%) auto-fix** with `eslint --fix` — mostly `no-unnecessary-type-assertion` casts left over from the Phase 1–6c `any`-removal that became redundant once the surrounding code got typed.

Doing HIGH-full as one mega-PR would still:

1. Generate a diff too large to review meaningfully,
2. Conflate the four distinct work tiers (auto-fix, real-bug Promise correctness, services/api boundary typing, apps/web Tamagui surface),
3. Risk semantic regressions in the `no-unsafe-*` narrowing where the type guard chosen is wrong,
4. Block other work for the duration.

The remaining HIGH-full work is therefore phased into 5 commits with explicit per-phase scope, counts, and verification gates — see [HIGH-full upgrade](#high-full-upgrade) below.

---

## HIGH-staged roadmap

Each phase below clears a slice of pre-existing `any` warnings, then expands the strict gate to cover it. Phases can be done independently and in any order, but **`packages/platform/contracts/**` should go first** because contracts types flow downstream into services + apps.

### Phase 1 — `packages/platform/contracts/**` (~77 `any` warnings) — ✅ **Landed**

- [x] Triage `packages/platform/contracts/src/water/parseComputeAndSave.ts` (32 `any`) — done
- [x] Triage `packages/platform/contracts/src/analysis/parseGravityAnalysis.ts` (22 `any`) — done
- [x] Triage `packages/platform/contracts/src/water/waterProfile.ts` (13 `any`) — done
- [x] Triage `packages/platform/contracts/src/auth/meResponse.ts` (10 `any`) — done
- [x] Expand `lint:packages-strict` to include `packages/platform/contracts` — done
- [x] Update this doc's TL;DR table — done
- [x] Verify zero behavior change: 38/38 contracts unit tests pass; all downstream TS error counts (services/api, apps/web, apps/native, packages/platform/ui) identical to pre-change baseline.

**Why this was first:** contracts types are the source of truth for cross-process data (services → apps). Tightening them improves type safety in every downstream consumer.

**Strategy used:** "tighten in place" — replaced `any` with `Record<string, unknown>` (after `isObject` narrowing), used proper return types on helper functions, used named union casts (`WaterCalcDerivationKind`, `NumberFormatUnit`, etc.) instead of `any` for unvalidated string-to-union narrowing. No Zod migration. See the commit (linked from this section after merge) and the discussion in the related session transcript for the full pros/cons of the Zod alternative.

### Phase 2 — `packages/verticals/brewery/beerjson/**` (21 `any` warnings) ✅ landed 2026-05-16

**Scope:** 1 file, 986 lines (`packages/verticals/brewery/beerjson/src/index.ts`). All 21 `any` removed.

**Strategy used:** "tighten in place" — same as Phase 1.
- Added local helpers `isObject`, `isFiniteNumber`, `parseValueWithUnit` (the BeerJSON shape uses `{ unit, value }` pairs everywhere — extracting this once collapses ~10 repeated guard chains into one helper call per access).
- Output builders now type accumulators as `Record<string, unknown>` (pre-existing behaviour preserved; downstream consumers treat the BeerJSON document as opaque JSON-passed-to-API).
- Input parsers now take `unknown` + `isObject` narrowing.
- A `BeerJsonRecipe = Record<string, unknown>` alias replaces `any[]` in the document shape.
- Two minor pre-existing semantic improvements landed alongside (both safer): in input parsers, missing-but-typed unit/value pairs (e.g. `unit === "F"` with no `value`) now return `null` instead of `NaN`; and unknown `type`/`form` strings on misc/hop ingredients fall back to a valid union member instead of being trusted unchecked.

**Tests added (Option B):** `packages/verticals/brewery/beerjson/src/index.test.ts` — 4 round-trip tests (recipe-level grist+hops+yeast+misc, mash, replaceMashInBeerJsonDocument with null clearing, validateMashBeforeSave smoke). 4/4 passing. The package now has its own `vitest` dev dep + `test` script (mirrors `packages/platform/contracts`).

- [x] Add 4 round-trip unit tests
- [x] Triage 21 `any` in `packages/verticals/brewery/beerjson/src/index.ts`
- [x] Tests green: 4/4
- [x] Downstream typecheck: zero new beerjson-related errors in `apps/web` / `apps/native`
- [x] Expanded `lint:packages-strict` to include `packages/verticals/brewery/beerjson`
- [x] Updated TL;DR table; **boundary milestone reached: 11 of 11 packages gated; only `apps/**` and `services/**` have outstanding `any` debt**

### Phase 3 — `services/api/src/**` (444 → 0 `any` warnings) ✅ landed 2026-05-16

**Scope:** All of `services/api/src/**` (routes + services + domain + importers + beerjson). 444 `no-explicit-any` warnings → 0.

**Strategy used:** "tighten in place" — same as Phases 1 and 2.

- Added `services/api/src/lib/typeGuards.ts` with shared `isObject`, `isFiniteNumber`, `isString` helpers (used across the codebase to narrow untyped JSON / request bodies).
- Standardized pattern at trust boundaries: routes accept `Record<string, unknown>` request bodies and pass them to services; services widen their input types to `unknown` for validated fields and call typed parser helpers (e.g. `parseAcidType`, `parseStrengthKind`, `toScope`, `toType`, `toVerificationStatus`) that return narrow union types. This kept route handlers thin while pushing validation into services where it belongs (SRP).
- Replaced `(x as any).field` chains with `isObject` guards and named type aliases (`BeerJsonDoc`, `XmlNode`, `BeerXmlRecipe`, `MashStepNode`, `WaterSettingsLoose`, etc.).
- Replaced Prisma `as any` casts with proper Prisma utility types: `Prisma.InputJsonValue` for JSON columns, `Prisma.<Model>UncheckedUpdateInput` for partial updates, `Prisma.<Model>UncheckedCreateInput` for upsert create branches.
- Replaced `(req.cookies as any)?.[KEY]` with `(req.cookies ?? {}) as Record<string, string | undefined>` and replaced `req: any` helpers with `FastifyRequest`.
- One narrow escape hatch with explicit comment: `seed/sources/beerproto/beerproto.ts` keeps `type PrismaLike = any` because the file deliberately avoids importing Prisma-generated types to stay editable when client generation is out of sync.

**Verification:** services/api unit + integration test suite green (149/149); apps/web TS error count unchanged (590 baseline, all pre-existing Tamagui-related); apps/native TS error count unchanged (0).

The separate "should we adopt Zod / Valibot / TypeBox here?" question is tracked as Phase 7 (see `docs/CONTRACTS-VALIDATION-STRATEGY.md`); migrating to a schema library is *not* in HIGH-staged scope.

- [x] Tighten top-5 files (gravityAnalysis, recipesService, recipeWaterComputeAndSave, recipeWaterSettings, brewSessions) — 47% reduction
- [x] Tighten next-10 files — cumulative 72%
- [x] Tighten remaining tail files — cumulative 100%
- [x] Add `services/api/src/lib/typeGuards.ts`
- [x] Tests green: 149/149
- [x] Downstream typecheck: zero new API-related errors in `apps/web` / `apps/native`
- [x] Update TL;DR table; **boundary milestone reached: 0 `no-explicit-any` warnings in `services/api/src/**`**

> Note: a small number of dead-code and unused-var warnings remain in `services/api/src` (e.g. unused legacy validator stubs in `services/recipesService.ts`). These are tracked under Phase 6 (mop-up) since they are not `no-explicit-any` and removing them is a behavioural cleanup, not a type-tightening.

### Phase 4 — `apps/web/app/recipes/**` (~250 `any` warnings)

The recipe edit pages have the highest accumulated `any` debt. Expect Tamagui friction here — coordinate with `docs/TAMAGUI.md`.

- [x] Phase 4a: `apps/web/app/recipes/[id]/edit/page.tsx` (104 `any` removed) ✅ landed 2026-05-16
- [x] Phase 4b: water sub-pages (mash + sparge + boil — `water/page.tsx` was already clean) (87 `any` removed) ✅ landed 2026-05-16
- [x] Phase 4c: yeast + brew-sessions pages (64 `any` removed) ✅ landed 2026-05-16
- [ ] Add `lint:web-recipes-strict` script once clean (still gated on `apps/web/app/recipes/**` being `any`-free; remaining surface is mostly the brew-sessions detail page's pre-existing Tamagui-adjacent TS errors, tracked separately)

#### Phase 4a — `apps/web/app/recipes/[id]/edit/page.tsx` ✅ landed 2026-05-16

**Scope:** 1 file, 3,806 lines (the recipe editor — the largest single `apps/web` page). 104 `no-explicit-any` warnings → 0.

**Strategy used:** "tighten in place" — same as Phases 1–3.

- Replaced ad-hoc `(x as any).field` chains over `recipeExtJson` and `beerJsonRecipeJson` with a local `asRecord(v: unknown): Record<string, unknown> | null` narrower (mirrors the `services/api/src/lib/typeGuards.ts::isObject` helper we added in Phase 3 — declared locally instead of imported to avoid an apps/web → services cross-app dependency).
- Added local DTO interfaces for the `/api/ingredients/*` search responses (`FermentableSearchResult`, `HopSearchResult`, `YeastSearchResult`). They mirror the Prisma row + select shape that the API actually returns; declared at the consumer side so apps/web does not depend on Prisma types.
- Added `analysis?: unknown` to the `Recipe` type (the field is attached by `GET /recipes/:id`'s gravity-analysis enrichment but was never declared, which is why the page kept casting `(r as any).analysis`).
- Imported `NumberFormatHintV1` and `WaterCalcDerivation` from `@umbraculum/contracts` and used `Record<string, NumberFormatHintV1 | undefined>` / `Record<string, WaterCalcDerivation | undefined>` aliases when indexing `parsed.formatHints[field]` / `parsed.derivations[derivationKey]` by an arbitrary string field name. This collapses two `as any` casts into honest, lossless type assertions.
- Extracted `getRecipeEfficiencyPercent(recipe)` and `getBeerJsonBatchSize(recipe)` helpers. The efficiency helper replaces four duplicated 9-line IIFE blocks (32 `as any` casts) inside the OG / PBG math-body renderers. Bonus: it incidentally fixes a pre-existing copy-paste bug in the PBG block where `brewEff` was returning `e.equipment.mash.mashEfficiencyPercent` instead of `e.brewhouseEfficiencyPercent` (the intended fallback when no mash efficiency is set). User-visible effect: when mash efficiency is unset but brewhouse efficiency is, the PBG body's "efficiency" footnote now displays the brewhouse value (matching the OG body's behaviour) instead of falling through to the BeerJSON or `na`.
- Replaced `tMath(\`...${dynamicKey}\` as any)` and `tAnalysis(\`warnings.${code}\` as any)` with `... as Parameters<typeof tMath>[0]` (and the same for `tAnalysis`). Honest cast that asserts "this dynamic string is a valid message key", no information loss.
- Replaced narrow union casts in `BrewSelect.onValueChange` callbacks: `v as any` → `v as GristMaltClass` / `v as NonNullable<HopRow["form"]>`. The cast is still needed because `BrewSelect` types its callback as `(value: string) => void`, but the union assertion is now explicit and grep-able.
- Dropped unconditionally-redundant casts: `(recipe as any).version` (already `?: number` on `Recipe`), `gristRows as any` / `miscRows as any` when calling `buildBeerJsonRecipeDocument` / `buildRecipeExtJsonFromEditorState` (state is already typed as `EditorGristRow[]` / `EditorMiscRow[]`), `(y as any)?.id` etc. when `y` is already an `EditorYeastRow`.
- Replaced `delete (extBaseForSave as any).yeastTypeOverrides` with a direct `delete extBaseForSave.yeastTypeOverrides` after typing `extBaseForSave` as `Record<string, unknown>`.

**Verification:**

- ESLint: file went from 111 warnings (104 `no-explicit-any` + 7 pre-existing `no-unused-vars`) to 7 warnings (0 `no-explicit-any` + 7 pre-existing `no-unused-vars`).
- `apps/web` TypeScript error count held exactly at the pre-change baseline: 1067 total errors repo-wide, 239 in `recipes/[id]/edit/page.tsx`. Both numbers unchanged. A normalized diff (line/col stripped) of the TS error logs shows zero new error categories or messages — only line-number shifts from the ~115 lines of types/helpers added at the top of the file. Histogram of error codes (`error TS####`) is byte-identical before vs after.
- Repo-wide `no-explicit-any` count: 517 → 413 (drop of 104, exactly matches Phase 4a scope).
- No new `apps/web` unit tests added (Phase 4 is type-tightening, no behavioural change). The one incidental PBG-efficiency bug fix described above will be picked up by existing Playwright recipe-flow specs the next time they run; if it surfaces a regression, the previous (buggy) behaviour is recoverable as a one-line revert in `getRecipeEfficiencyPercent`.

**Why this file went first in Phase 4:** at 104 `any` warnings it was the highest-leverage single file in `apps/web`, the duplicated efficiency-from-ext block was a visible code-smell that the helper extraction obviously cleaned up, and the ingredient-search DTOs naturally consumed the sharper `services/api` types from Phase 3.

#### Phase 4b — `apps/web/app/recipes/[id]/water/{mash,sparge,boil}/page.tsx` ✅ landed 2026-05-16

**Scope:** 3 sibling files (`mash/page.tsx`, `sparge/page.tsx`, `boil/page.tsx`), 5,085 lines combined. 87 `no-explicit-any` warnings → 0. (`water/page.tsx`, the index, was already `any`-free.) Initial estimate was ~115; the index page being clean reduced the actual workload.

**Strategy used:** "tighten in place" — same as Phases 1–4a. The 3 files share an almost-identical shape (each owns an acidification calculator + salt additions + overall snapshot for its brewing stage), so the toolkit assembled in Phase 4a was applied uniformly across all three. Order: smallest first (sparge 19 → boil 24 → mash 44) to validate the toolkit on smaller surface area before tackling the largest file.

- Extracted `apps/web/app/_lib/typeGuards.ts` exporting `asRecord(v: unknown): Record<string, unknown> | null` and imported it in mash/sparge/boil. This generalises the local `asRecord` helper introduced in Phase 4a so future apps/web pages can reuse it without re-declaring (the Phase 4a inline copy in `recipes/[id]/edit/page.tsx` is left in place — refactoring that file's helper into the shared one is mechanical and can ride along with Phase 4c if the consumer set grows).
- Replaced `useState<any | null>(null)` for derivation states (`saltsDerivation`, `acidDerivation`, `overallDerivation`, `saltDerivation`) with `useState<WaterCalcDerivation | null>(null)` (the type is from `@umbraculum/contracts` and is exactly what the API returns post-`parseMashComputeAndSaveResponse` / `parseSpargeComputeAndSaveResponse` / `parseBoilComputeAndSaveResponse`). 8 derivation states tightened.
- Replaced `useState<any | null>(null)` for sparge's `spargeOverall` with the shape `{ result: WaterOverallResult; derivation: WaterCalcDerivation } | null`.
- Replaced `((s.xStrengthKind as any) ?? "percent") as "percent" | "normality" | "molarity" | "solid"` (3 sites — one per stage) with explicit safe narrowing: a 5-line ternary that checks each union member against the saved string before falling back to `"percent"`. No more "trust the saved value blindly through `as any`".
- Dropped redundant `as any` casts on parser arguments: `parseGravityAnalysisResponseV1(analysis)` was being called with `(analysis as any)` even though the parser's signature is `(x: unknown) => GravityAnalysisResponseV1`. The cast hid the fact that the contract was already correct.
- Replaced internal-API response unpacking patterns (`/api/water-calc/salt-additions`, `/api/water-calc/{mash,sparge,boil}-overall`) — these don't yet have contract parsers in `@umbraculum/contracts`, so we use `asRecord` to narrow `res.data` and then typed shape-casts to the local `SaltAdditionsResult` / `WaterOverallResult` / `WaterCalcDerivation`. Same defensive posture as Phase 4a's "internal monorepo API without a parser" treatment; if/when these endpoints get parsers in a future Phase 7 round, the casts will fall away.
- Replaced `(s.gristRows as any[])` and `(r as any).{mashDiPh,mashTaToPh57_mEqPerKg,mashRoastDehuskedOverride,timingUse,lateAddition,amountKg}` accesses with direct field access on `EditorGristRow` (the type from `@umbraculum/brewery-beerjson` already declares all these fields — the casts were purely defensive and unnecessary).
- Replaced `(recipe as any).recipeExtJson` / `(recipe as any).beerJsonRecipeJson` with direct access (`recipe?.recipeExtJson`, `recipe?.beerJsonRecipeJson`) — the local `RecipeResponse["recipe"]` type already declares these as `unknown`, so the `as any` was redundant. Then narrowed with `asRecord` for safe property access (`asRecord(extRec?.mashPhModel)` etc.).
- Replaced post-`parseMashComputeAndSaveResponse` setter casts (`setSaltsResult(computed.salts.result as any)`, `setSaltsDerivation(computed.salts.derivation as any)`, etc. — about 28 sites combined across the 3 files) with typed shape-casts (`as unknown as SaltAdditionsResult` / `as unknown as MashOverallResult`) for state setters whose local types are structurally compatible but stricter than the contract types (e.g. local `breakdown[].saltKey: SaltKey` vs contract `breakdown[].saltKey: string`). Derivation state setters drop the cast entirely (the contract type matches the state type).

**Verification:**

- ESLint: all 4 files (`water/page.tsx`, `water/mash/page.tsx`, `water/sparge/page.tsx`, `water/boil/page.tsx`) at 0 `no-explicit-any` warnings.
- `apps/web` TypeScript error count held exactly at the pre-change baseline: 1067 total errors repo-wide, identical per-file counts (29 sparge / 37 boil / 36 mash, all pre-existing Tamagui-adjacent). A normalized diff (line/col stripped) of the TS error logs shows zero new error categories or messages.
- Repo-wide `no-explicit-any` count: 413 → 326 (drop of 87, exactly matches Phase 4b scope).
- No new `apps/web` unit tests added (Phase 4b is type-tightening, no behavioural change). The water sub-pages are already covered by the Playwright recipe-flow specs that exercise mash/sparge/boil acidification through the storefront UI.

**Why these files went together in Phase 4b:** they are siblings of the same brewing-stage-calculator pattern, share ~90% of their `any` patterns (derivation states, strength-kind narrowing, internal-API response unpacking, recipe-ext traversal), and benefit from a single shared `asRecord` import. Splitting them across multiple PRs would have triplicated the review surface for the same conceptual change.

#### Phase 4c — `apps/web/app/recipes/[id]/yeast/page.tsx` + `brew-sessions/{,[brewSessionId]/}page.tsx` ✅ landed 2026-05-16

**Scope:** 3 files, 3,491 lines combined. 64 `no-explicit-any` warnings → 0 (yeast 33, brew-sessions list 2, brew-sessions detail 29).

**Strategy used:** "tighten in place" — same toolkit as Phases 1–4b. Order: smallest first (brew-sessions list 2 → yeast 33 → brew-sessions detail 29) to validate the toolkit on the trivial case before the dense ones.

- Re-used the shared `asRecord` helper from `apps/web/app/_lib/typeGuards.ts` (extracted in Phase 4b). Imported in all three files. Growing the consumer set justifies the helper extraction in retrospect.
- **Ride-along cleanup:** refactored the local `asRecord` definition in `apps/web/app/recipes/[id]/edit/page.tsx` (Phase 4a's inline copy) to import from `_lib/typeGuards.ts` instead. Removes a near-duplicate function (~10 lines) so future changes to the narrower happen in one place. Mechanical, no behaviour change.
- **`yeast/page.tsx` (33 `any`):** the load-effect at the top had a dense `(ext as any).field` cluster reading 12+ recipe-ext arrays (yeast pitch rate, fermentation temp, oxygenation, diacetyl rest, format/type, species, needs-propagation, cells-per-L/KG/G, manual cell count, attenuation overrides, ingredient links). Replaced with a single `extRec = asRecord(r.recipeExtJson)` extraction at the top, then `asRecord(extRec?.fieldName)` per array. The downstream `.map()` over `baseYeast` now indexes typed `Record<string, unknown> | null` arrays — collapsed three nested `XxxRaw && typeof XxxRaw === "object" && typeof XxxRaw[id] === "string"` checks into the simpler `XxxRaw && typeof XxxRaw[id] === "string"`. Replaced the `validSpecies.includes(speciesRaw as any)` cheat with the established `(validSpecies as ReadonlyArray<string>).includes(speciesRaw)` Phase 4a pattern. Replaced the `extBase` save block (`({ ...(extBase as any) } as any)`) with `Record<string, unknown>` typing, so `delete extBaseForSave.yeastTypeOverrides` etc. just work without casts. Dropped redundant `gristRows as any` / `miscRows as any` casts when calling `buildBeerJsonRecipeDocument` / `buildRecipeExtJsonFromEditorState` (the state is already typed as `EditorGristRow[]` / `EditorMiscRow[]`). Replaced `(recipe as any)?.{analysis,recipeExtJson}` JSX prop accesses with direct field access (the local `Recipe` type already declares both).
- **`brew-sessions/page.tsx` (2 `any`):** trivial — both sites were `(res.data as any)?.field` response unpacking on `apiFetch` results. Replaced with `(res.data as { field?: shape })?.field` typed shape-casts. Same Phase 4a precedent.
- **`brew-sessions/[brewSessionId]/page.tsx` (29 `any`):** mixed bag, all from existing patterns. Replaced ~10 `(res.data as any)?.{brewSession,step,steps,message}` response-unpack sites with typed shape-casts. Replaced `(payload as any).reason` after a typeof-guard with `asRecord(payload)?.reason`. Replaced `attachments.find((a: any) => ...)` (type cheat — the array is already `HydrometerAttachment[]`) with the proper element type via inferred narrowing on `Array.isArray(...) ? ... : []` plus an `as HydrometerDevice[]` / `HydrometerAttachment[]` / `HydrometerReading[]` cast on the parsed result. Replaced 3 dynamic-i18n-key `as any` casts with `as Parameters<typeof tPreset>[0]` (matches the established `apps/web/app/recipes/[id]/edit/page.tsx` Phase 4a precedent at lines 1870 and 2415). Removed 3 i18n-params `as any` casts entirely — `t("timerLineStopped", { elapsed: ... })` and `t("logsPagination.status", { page, pages })` typecheck correctly without the cast (the casts were defensive but unnecessary). Replaced `PRESET_SECTION_ORDER.indexOf(a as any)` with the same `as readonly string[]` pattern already used three lines above for `.includes(...)`. Replaced `tickRef.current = setInterval(...) as any` with `as unknown as number` (the ref is `useRef<number | null>` and `globalThis.setInterval` returns `number` in DOM lib but `NodeJS.Timeout` if `@types/node` lib types win — `as unknown as number` is the explicit "we want the DOM number here" assertion). Replaced `(window as any).webkitAudioContext` with a `winRec = window as unknown as Record<string, unknown>` extract for the legacy-Safari fallback. Dropped a now-unnecessary `focusEl?.focus({ preventScroll: true } as any)` cast (modern TS DOM types accept `FocusOptions` natively).

**Verification:**

- ESLint: all 3 files at 0 `no-explicit-any` warnings. The remaining warnings on these files are all pre-existing `no-unused-vars` (2 in yeast — `YStack` import, `height` callback arg).
- `apps/web` TypeScript error count held exactly at the pre-change baseline: 1067 total errors repo-wide. Per-file TS counts also held: 7 yeast, 8 brew-sessions list, 120 brew-sessions detail (= 128 in the looser-grep baseline; the brew-sessions detail file naturally absorbs both, so the redistribution is bookkeeping not regression). Edit page held at 239 errors after the `asRecord` dedup ride-along. A normalized diff (line/col stripped) of the TS error logs shows zero new error categories or messages.
- Repo-wide `no-explicit-any` count: 326 → 262 (drop of 64, exactly matches Phase 4c scope).
- Repo-wide all-warnings count: 406 → 342 (same -64 delta, no other warning category affected).
- No new `apps/web` unit tests added (Phase 4c is type-tightening, no behavioural change). The yeast and brew-sessions pages are already covered by the Playwright recipe-flow specs that exercise yeast pitching + brew session lifecycle.

**Why these files went together in Phase 4c:** they share ~80% of their `any` patterns with Phase 4a/4b (`apiFetch` response unpacking, recipe-ext traversal, dynamic i18n keys), and the brew-sessions list page is so trivial (2 `any`) that splitting it into its own PR would have been disproportionate review overhead. Including the `asRecord` dedup ride-along in `edit/page.tsx` (~10 lines, no behavioural change) is a small but appropriate cleanup that grows the shared-helper consumer set from 3 to 4 files.

### Phase 5 — `apps/native/src/**` (155 `any` warnings — **all cleared**)

Same patterns as Phase 4 but for the React Native side. May land easier or harder depending on how `docs/TAMAGUI.md` migration goes.

- [x] Phase 5a: `RecipeEditScreen.tsx` (56 `any` removed) ✅ landed 2026-05-16 — also extracts shared `navigation/types.ts` and `lib/typeGuards.ts` for reuse by Phase 5b
- [x] Phase 5b: `YeastScreen.tsx` + remaining 14 native screens + 6 non-screen files (99 `any` removed) ✅ landed 2026-05-16
- [ ] Add `lint:native-strict` script gating `apps/native/src/**` once a CI runner with native deps is in place (deferred to Phase 6 mop-up; behaviour-equivalent locally via `npx eslint apps/native --max-warnings 0`)

#### Phase 5a — `apps/native/src/screens/RecipeEditScreen.tsx` ✅ landed 2026-05-16

**Scope:** 1 file, 2,117 lines (the largest single React Native screen — counterpart to `apps/web/app/recipes/[id]/edit/page.tsx`). 56 `no-explicit-any` warnings → 0. Plus 2 small infra files extracted for Phase 5b reuse.

**Strategy used:** "tighten in place" — same toolkit as Phases 1–4c. The patterns mirror Phase 4a's web edit page and Phase 4c's web yeast page almost exactly (same JSON shapes coming from the same API).

**Infrastructure additions (Phase 5b dividends):**

- Extracted `apps/native/src/navigation/types.ts` exporting `RootStackParamList` and `TabParamList` (previously declared inline in `AppNavigator.tsx`). Avoids the circular-reference trap that would happen if a screen imported the param list from `AppNavigator.tsx` (which already imports all screens). All Phase 5b screens that currently use `useNavigation<any>()` (12 sites across 11 files) can now type their navigation properly.
- Created `apps/native/src/lib/typeGuards.ts` mirroring `apps/web/app/_lib/typeGuards.ts` (Phase 4b extraction). Exports `asRecord(v: unknown): Record<string, unknown> | null`. Phase 5b screens can `import { asRecord } from "../lib/typeGuards"` instead of re-declaring the helper inline.

**Per-pattern changes in `RecipeEditScreen.tsx`:**

- Replaced `useNavigation<any>()` + 4 `(navigation as any).navigate(...)` sites with a typed `RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, "RecipeEdit">`. Each `navigate()` call now type-checks the route name + params at compile time (e.g. `navigation.navigate("RecipeYeast", { recipeId })` would fail TS if `recipeId` were missing).
- Replaced the dense `(ext as any).field` cluster (12+ `recipeExtJson` field reads at the top of `loadRecipe`) with a single `extRec = asRecord(r.recipeExtJson)` extraction + per-field `asRecord(extRec?.fieldName)` for nested objects. Same Phase 4c yeast pattern.
- Replaced the yeast-attenuation overrides loop's `Object.entries(yeastOverridesRaw as any)` with the typed `Object.entries(yeastOverridesRaw)` after `asRecord` narrowing.
- Replaced the yeast-row map's `(yeastXxxRaw as any)[row.id]` indexing patterns (5 sites × ~3 expressions = ~15 casts) with direct indexing on the `Record<string, unknown> | null` typed Raws + lossless `as <literal>` casts on the final assignment. Behaviour preserved.
- Replaced `(r as any).beerJsonRecipeJson` and `(r as any).recipeExtJson` with direct field access — the local `Recipe` type already declares both as `unknown`.
- Replaced 6 `(res.data as any)?.{recipe,styles,profiles,items}` response-unpack casts with typed shape-casts (`as { recipe?: Recipe }` / `as { styles?: unknown }` etc.) plus `Array.isArray(...) ? (... as ItemType[]) : []` for the list responses. Same Phase 4a/4c precedent.
- Replaced 2 `extBase` save blocks (`extBase && typeof extBase === "object" && !Array.isArray(extBase) ? { ...(extBase as any) } : ({} as any)`) — one in `applyEquipmentProfileToRecipe`, one in `save` — with `Record<string, unknown> = baseRec ? { ...baseRec } : {}`. Same Phase 4a/4c precedent.
- Replaced 2 `as any` casts on `EditorGristRow["potential"]` field updates (potential picker + value input) with typed `as NonNullable<EditorGristRow["potential"]>` casts. The cast is still needed because TS can't fully infer the discriminated-union match from the narrowed `kind` variable, but the assertion is now structural rather than a type-system bypass.

**Verification:**

- ESLint: `RecipeEditScreen.tsx` at 0 `no-explicit-any` warnings (12 remaining warnings are all pre-existing `no-unused-vars` in dead-code yeast-row helpers — Phase 6 mop-up territory). Both new files (`navigation/types.ts`, `lib/typeGuards.ts`) at 0 warnings.
- `apps/native` TypeScript error count held exactly at the pre-change baseline of 0 errors (`npm run typecheck --workspace=@umbraculum/native` clean). The Phase 5a changes did not introduce a single new TS error — typed navigation is fully assignable across the 4 `navigate()` call sites.
- Repo-wide `no-explicit-any` count: 262 → 206 (drop of 56, exactly matches Phase 5a scope).
- Repo-wide all-warnings count: 342 → 286 (same -56 delta, no other warning category affected).
- No new `apps/native` unit tests added (Phase 5a is type-tightening, no behavioural change).

**Why this file went first in Phase 5:** at 56 `any` it was the highest-leverage single file in `apps/native` (matches the doc's pre-flight estimate of 68 — actual count was 56), the patterns map 1:1 onto Phase 4a/4c so the toolkit transferred cleanly, and the navigation-type-extraction + typeGuards-extraction set up Phase 5b for cheap mechanical reuse across the remaining 11 native screens (where 12 of the 13 `useNavigation<any>` sites still live).

#### Phase 5b — rest of `apps/native/src/**` ✅ landed 2026-05-16

**Scope:** 21 files across `apps/native/src/screens/**` (15 files), `apps/native/src/auth/**` (2), `apps/native/src/media/**` (2), `apps/native/src/navigation/openWebFallback.ts`, `apps/native/src/types/dom-shim.d.ts`, and `apps/native/src/bootstrap.ts`. 99 `no-explicit-any` warnings → 0.

**File-level breakdown:**

| File | `any` removed | Notes |
|---|---|---|
| `screens/YeastScreen.tsx` | 36 | Mirror of Phase 4c web yeast page — same `recipeExtJson` + API patterns. |
| `screens/FermDataIntegrationScreen.tsx` | 9 | Tilt/iSpindel/RAPT integration token + device unpacks. |
| `screens/BrewdayStepsSettingsScreen.tsx` | 8 | `Constants.crypto?.randomUUID`, dynamic i18n keys, settings response shape. |
| `bootstrap.ts` | 6 | `Object.defineProperty` polyfill; `ErrorUtils` typing. |
| `screens/BrewSessionDetailScreen.tsx` | 5 | API response unpacks for hydrometer flow. |
| `auth/apiBaseUrl.ts` | 5 | `Constants.expoConfig` / `Constants.manifest*` SDK-version-tolerant unpacks. |
| `screens/DashboardScreen.tsx` | 4 | `healthState.me` shape-casts + tab-to-stack `CompositeNavigationProp`. |
| `screens/Water{Sparge,Mash,Boil}Screen.tsx` | 3 each (9) | `useNavigation<any>` + per-screen idiomatic patterns. |
| `screens/RecipesListScreen.tsx` | 3 | API response unpacks + typed nav. |
| `screens/BrewSessionsListScreen.tsx` | 3 | API response unpacks + typed nav. |
| `screens/ContributingScreen.tsx` | 2 | `route.params` cast + typed nav. |
| `media/RemoteImage.tsx` | 2 | `expo-image` `onError` event narrowing. |
| `screens/{WaterHub,SelectWorkspace,About}Screen.tsx` | 1 each (3) | Mostly `useNavigation<any>` + tiny shape-casts. |
| `navigation/openWebFallback.ts` | 1 | `webview-exchange` response shape-cast. |
| `media/mediaBaseUrl.ts` | 1 | `Constants.expoConfig.extra` unpack. |
| `auth/AuthProvider.tsx` | 1 | `parseToken` shape-cast. |
| `types/dom-shim.d.ts` | 1 | `declare const HTMLElement: any` → `new (...args: never[]) => unknown` (constructor-compatible — `unknown` would have broken `instanceof HTMLElement` checks in Tamagui). |

**Strategy used:** "tighten in place" — same toolkit as Phases 1–5a. The bulk of the work was mechanical:

- **`useNavigation<any>` → typed `NavigationProp<RootStackParamList>`** in 12 screens, importing the param list from the new `apps/native/src/navigation/types.ts` (Phase 5a extraction). One screen (`DashboardScreen`) needed a `CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Dashboard">, NativeStackNavigationProp<RootStackParamList>>` because it's a tab screen that navigates into the parent stack and into a sibling tab (`Recipes`). Two screens (`BrewSessionsListScreen`, `ContributingScreen`, `BrewSessionDetailScreen`, `YeastScreen`) additionally use `RouteProp<RootStackParamList, "RouteName">` for `useRoute()` typing.
- **`(res.data as any)?.field` → `(res.data as { field?: unknown })?.field`** with `Array.isArray(...) ? (... as ItemType[]) : []` for list responses. ~25 sites across 9 files. Same Phase 4a/4c precedent.
- **`(ext as any).field` recipeExtJson reads** in `YeastScreen.tsx` consolidated to `extRec = asRecord(r.recipeExtJson)` + per-field `asRecord(extRec?.field)`. Same Phase 4c yeast pattern; `asRecord` imported from `apps/native/src/lib/typeGuards.ts` (Phase 5a extraction).
- **`(globalThis as any).crypto?.randomUUID`** → typed `globalThis as { crypto?: { randomUUID?: () => string } }` (one site in `BrewdayStepsSettingsScreen.tsx`). Same pattern already used in `YeastScreen.tsx`'s `newRowId` after Phase 5a.
- **Dynamic i18n keys**: `t(\`presetSections.${k}\` as any)` → `t(... as Parameters<typeof t>[0])`. 3 sites in `BrewdayStepsSettingsScreen.tsx`. Same Phase 4a/4c precedent.
- **`(Constants.expoConfig as any)?.extra.X` / `(Constants as any).manifest*`**: replaced with explicit per-step shape-casts (`{ extra?: { X?: unknown } }`, etc.). The casts are still present but each one is a precise, narrow shape rather than `any`. The variation across Expo SDK versions (`manifest` vs `manifest2` vs `expoConfig`) is genuine runtime drift, so per-step `unknown` is the honest type.
- **`computed.acid.result as any`** in `WaterSpargeScreen.tsx` and `WaterBoilScreen.tsx`: removed — the discriminated-union narrowing on `computed.acid.kind === "*_manual"` already gives TS the correct `WaterAcidificationManualResult` vs `WaterAcidificationResult` type. The `as any` was unnecessary.
- **`Object.defineProperty` polyfill** in `bootstrap.ts`: `(obj: any, prop: any, descriptor: any) => ...` → `((obj: object, prop: PropertyKey, descriptor: PropertyDescriptor) => ...) as typeof Object.defineProperty`. The outer cast is structural (matches the global `defineProperty` signature) rather than a parameter-level `any`.
- **`HTMLElement` shim**: `declare const HTMLElement: any` → `declare const HTMLElement: new (...args: never[]) => unknown`. `unknown` alone broke `x instanceof HTMLElement` in `node_modules/@tamagui/element/src/getWebElement.ts` (the RHS of `instanceof` must be assignable to `Function`); the constructor-shaped type satisfies that constraint while keeping the shim's runtime intent ("we don't have DOM, just say it's a class").

**Verification:**

- ESLint: `apps/native` overall at **0 `no-explicit-any` warnings** (down from 99). The remaining 187 repo-wide warnings are all in `apps/web` (outside `app/recipes/**`) and `services/api` test stragglers.
- `apps/native` TypeScript: 0 errors after Phase 5b (held at the pre-change baseline). The dom-shim change was the only place a TS error was introduced (`@tamagui/element/getWebElement.ts(19,28) TS2359`) and it was caught by `npm run typecheck --workspace=@umbraculum/native` and fixed before commit by switching from `unknown` to a constructor-shaped type. No new errors landed.
- `@umbraculum/contracts` TypeScript: 0 errors (sanity-checked because Phase 5b's WaterSparge/Boil simplification reads through the discriminated-union narrowing that contracts owns).
- Repo-wide `no-explicit-any` count: 206 → 107 (drop of 99, exactly matches Phase 5b scope).
- Repo-wide all-warnings count: 286 → 187 (same -99 delta).
- No new `apps/native` unit tests added (Phase 5b is type-tightening, no behavioural change).

**Phase 5 cumulative impact:** 155 `any` removed across 22 files (Phase 5a's RecipeEditScreen + Phase 5b's 21 files). The whole React Native app surface is now `any`-free. Combined with Phases 1–4 (`packages/**`, `services/api/src/**`, `apps/web/app/recipes/**`), the only remaining `any` debt is the `apps/web` non-recipes pages (mostly under `apps/web/app/[locale]/**` and `apps/web/app/_components/**`, ~96 warnings) plus a small `services/api` test residue.

### Phase 6 — `apps/web` non-recipes any cleanup + mop-up

The big-leverage `any` debt outside `apps/web/app/recipes/**` lives in two files (49 of the 107 post-5b warnings). Phase 6a clears those. Phase 6b sweeps the long tail. Phase 6c is the original mop-up scope (no-unused-vars promotion).

- [x] Phase 6a: `apps/web/app/[locale]/ferm-data-integration/page.tsx` (26 `any`) + `apps/web/app/_components/RecipeImportForm.tsx` (23 `any`) — 49 `any` removed ✅ landed 2026-05-16
- [x] Phase 6b: Long tail — `apps/web/app/HealthPanel.tsx` (13), `apps/web/app/[locale]/inventory/page.tsx` (7), `apps/web/app/recipes/_components/YeastEditor.tsx` (6), `apps/web/app/_components/PrimaryNav.tsx` (5), `apps/web/app/recipes/[id]/water/_lib/mathBodies.ts` (4), `apps/web/app/[locale]/(auth)/{login,signup}/page.tsx` (4 each), and 9 smaller files (1–2 `any` each) + `services/api/prisma/seed.ts` (1 `any`) — 58 `any` removed ✅ landed 2026-05-16
- [x] Phase 6c: 80 `no-unused-vars` warnings cleaned across `apps/native/src/screens/{AboutScreen,BrewSessionDetailScreen,BrewdayStepsSettingsScreen,RecipeEditScreen,RecipesListScreen,Water{Boil,Hub,Mash,Sparge}Screen}.tsx` + `apps/web/app/{[locale]/{brewday-steps-settings,equipment,ferm-data-integration,inventory,page,recipes/{import,page},water-profiles},recipes/[id]/{brew-sessions/[brewSessionId],edit,water/{_lib/mathBodies,boil,mash,page,sparge},yeast},recipes/_components/YeastEditor}.tsx` + `services/api/src/{domain/waterCalc/mashPhDefaultsV1,plugins/requestContext,seed/sources/beerproto/beerproto,services/recipesService,tests/{brewSessions,waterProfiles}.test}.ts` plus 1 `no-empty-object-type` carve-out (`services/api/src/services/ai/tools/brewery/currentBrewSessionStatus.ts`); both `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any` promoted from `warn` to `error` ✅ landed 2026-05-16
- [x] Verify no remaining pre-existing warnings outside known carve-outs ✅

#### Phase 6a — `apps/web/app/[locale]/ferm-data-integration/page.tsx` + `apps/web/app/_components/RecipeImportForm.tsx` ✅ landed 2026-05-16

**Scope:** 2 files, 1,386 lines combined. 49 `no-explicit-any` warnings → 0. Both are big "container" files — the ferm-data integration page is the web counterpart of `apps/native/src/screens/FermDataIntegrationScreen.tsx` (Phase 5b), and `RecipeImportForm` is the shared single + bulk recipe import form used by `apps/web/app/[locale]/recipes/page.tsx` and the platform-admin recipes page.

**Strategy used:** "tighten in place" — same toolkit as Phases 1–5b. Both files were dominated by two patterns: `(res.data as any)?.field` API response unpacks (~25 sites combined), and `xs.map((x: any) => …)` JSX iterators where the array element shape was known but unstated (~10 sites combined).

**Per-file changes:**

- **`ferm-data-integration/page.tsx` (26 → 0):** Defined 4 explicit row types — `IntegrationSummary`, `IntegrationDevice`, `HydrometerReadingPoint`, `RecentBrewSession` — at the top of the file, mirroring the same shapes used in the native counterpart (Phase 5b). Replaced the 3 `any`-typed `useState<...>` declarations (`integrations`, `devicesByKind`, `recentBrewSessions`) with the new types. Replaced the 6 method-level error-message extracts (`(res.data as any)?.message`) with `(res.data as { message?: unknown })?.message`. Replaced the 9 `(res.data as any)?.{token,publicPath,integration,devices,brewSessions}` response-unpacks with explicit shape-casts + `Array.isArray` for list responses. The 2 JSX `map((d: any) => …)` / `map((r: any) => …)` iterators dropped to typed callbacks (the array elements are `IntegrationDevice` and `HydrometerReadingPoint` respectively). Same Phase 4a/5b precedent.
- **`RecipeImportForm.tsx` (23 → 0):** Defined 3 explicit shapes — `BulkPreviewItem`, `BulkCreatedItem`, `BulkFailedItem` — alongside the pre-existing `ImportWarning` type. Updated the `bulkPreviewItems` and `bulkResult` state declarations to use these types instead of `any[]` / `{ created: any[]; failed: any[] }`. Replaced the 5 `(res.data as any)?.{styles,preview,previewItems,recipe,created,failed}` response-unpacks with typed shape-casts. The preview-extraction block's 5 `(p as any).field` reads consolidated to a single `pRec = p as { name?: unknown; notes?: unknown; warnings?: unknown }` narrowing. The bulk-result `Array.isArray((res.data as any)?.created) ? ((res.data as any).created as any[]) : []` simplified to `Array.isArray(body?.created) ? (body.created as BulkCreatedItem[]) : []` after the body shape-cast. JSX iterators (`bulkPreviewItems.map`, `bulkResult.created.map`, `bulkResult.failed.map`, and the inner warnings loop) all dropped their `: any` annotations.

**Verification:**

- ESLint: both files at 0 `no-explicit-any` warnings (down from 26 + 23 = 49).
- `apps/web` TypeScript: held at the pre-change baseline of 590 errors (`npx tsc --noEmit` from `apps/web` — all 590 are pre-existing Tamagui/Next.js type-system gaps unrelated to Phase 6a). The Phase 6a changes did not introduce a single new TS error.
- Repo-wide `no-explicit-any`: 107 → 58 (drop of 49, exact match to scope).
- Repo-wide all-warnings: 187 → 138 (same -49 delta, no other warning category affected).
- No new unit tests added — Phase 6a is type-tightening, no behavioural change. Both files are exercised by the existing Playwright smoke suite.

**Why these two files went together in Phase 6a:** they're the two largest single residuals after Phase 5b (26 + 23 = 49 of the remaining 107 `any` warnings, ≈46% of the post-5b debt), they share ~80% of their patterns with prior phases, and the ferm-data-integration page in particular was already half-typed by Phase 5b's native counterpart — porting the same type definitions back to web was mostly mechanical. Splitting them into two PRs would have been disproportionate review overhead given the pattern uniformity.

#### Phase 6b — `apps/web` long tail + `services/api/prisma/seed.ts` ✅ landed 2026-05-16

**Scope:** 18 files. 58 `no-explicit-any` warnings → 0. **This phase eliminates the last `any` in the repo.**

**File-level breakdown:**

| File | `any` removed | Notes |
|---|---|---|
| `apps/web/app/HealthPanel.tsx` | 13 | `/api/auth/me` response narrowing — `raw` typed as `{ ok?: unknown; user?: { email?: unknown } | null; activeWorkspaceId?: unknown; activeAccountId?: unknown; role?: unknown }`. |
| `apps/web/app/[locale]/inventory/page.tsx` | 7 | Defined `FermentableSearchItem` and `HopSearchItem` types; replaced `useState<any[]>` + `(item: any)` callback args with the typed shapes; `metadataJson` cast switched to `Record<string, unknown>`. |
| `apps/web/app/recipes/_components/YeastEditor.tsx` | 6 | `recipeExtJson.batchSizeLiters` / `analysis.result.{ogEstimatedSg,kettleVolumeLiters}` shape-casts narrowed to `number` via `typeof === "number"` guard (preserves the existing `analysisOg: number \| null \| undefined` prop signature). Defined `YeastSearchItem` for `/api/ingredients/yeasts` response; replaced `useState<any[]>` + `(item: any)` callback args. |
| `apps/web/app/_components/PrimaryNav.tsx` | 5 | `auth/me`-driven brand resolution; replaced `(next.workspaces as any[]).find((w) => (w as any).id === ...)` with `Array<unknown>` + `(w as { id?: unknown }).id` narrowing; `activeRec.brandKey` access via `{ brandKey?: unknown }` shape-cast. |
| `apps/web/app/recipes/[id]/water/_lib/mathBodies.ts` | 4 | `(r as any)[k1]` indexing in the salt-delta forEach replaced with `Record<string, { kind?: string; value?: number } \| undefined>`; `ctx.streams` typed as `StreamShape[]`; `ctx.ions` cast to `Record<string, number \| null \| undefined>`. |
| `apps/web/app/[locale]/(auth)/login/page.tsx` | 4 | `activeWorkspaceId` resolution from auth response — IIFE wrapping a typed body shape-cast (`{ activeWorkspaceId?: unknown; activeAccountId?: unknown }`) replacing the chained ternary `as any` casts. |
| `apps/web/app/[locale]/(auth)/signup/page.tsx` | 4 | Same pattern as login. |
| `apps/web/app/[locale]/recipes/page.tsx` | 2 | `(res.data as any)?.{styles,recipes}` → typed shape-casts; `Array.isArray` for list narrowing. |
| `apps/web/app/[locale]/platform/recipes/page.tsx` | 2 | `(res.data as any)?.workspaces ?? .accounts` consolidated to a typed body shape-cast first. |
| `apps/web/app/[locale]/platform/ads/page.tsx` | 2 | `(auth.me.user as any)?.isPlatformAdmin` → `{ isPlatformAdmin?: unknown }` shape-cast; `(res.data as any)?.ads` → typed shape-cast. |
| `apps/web/app/[locale]/(auth)/select-workspace/page.tsx` | 2 | Same workspace/account body shape-cast as platform/recipes. |
| `apps/web/i18n/request.ts` | 1 | `getSharedMessages(locale) as any` → `MessagesShape = Record<string, unknown> & { recipes?: { edit?: Record<string, string>; water?: { mash?: Record<string, string> } } }` so the existing runtime guardrails (`messages.recipes.edit.saving = ... ?? "Saving…"`) keep type-checking against the actual structure they manipulate. |
| `apps/web/app/[locale]/recipes/[id]/versions/page.tsx` | 1 | `(res.data as any)?.versions` → typed shape-cast. |
| `apps/web/app/[locale]/equipment/page.tsx` | 1 | `(listRes.data as any)?.profiles` → typed shape-cast. |
| `apps/web/app/[locale]/accessibility/page.tsx` | 1 | `res.data as any` → `{ user?: Record<string, unknown> }`; `me?.user ?? {}` → `Record<string, unknown> = me?.user ?? {}`. |
| `apps/web/app/_components/MathHelpPopover.tsx` | 1 | `removeEventListener("pointerdown", onPointerDown, { capture: true } as any)` → `EventListenerOptions` (the proper DOM type for the third arg). |
| `apps/web/app/_components/AdSlot.tsx` | 1 | `res.data as any` → `Partial<SlotResponse>` (the local response type was already declared 30 lines above — the cast was just sloppy). |
| `services/api/prisma/seed.ts` | 1 | BJCP styles fetch — `(await res.json()) as any` → `{ beerjson?: { styles?: unknown } }`. The downstream `Array.isArray(styles)` check + per-row `typeof === "string"` narrowing keep behaviour identical. |

**Strategy used:** "tighten in place" — same toolkit as Phases 1–6a. Every change in this phase was mechanical, drawing on three patterns established earlier:

1. **API response unpacks** (`(res.data as any)?.field` → `(res.data as { field?: unknown })?.field` + `Array.isArray` for lists) — most of the long tail.
2. **State/callback typing** (`useState<any[]>` → `useState<TypedShape[]>` after defining the shape locally) — inventory, YeastEditor.
3. **Auth/me body shape-casts** (`(meState.data as any).user.email` → `(meState.data as { data?: unknown }).data` then narrow `raw` to a typed `{ ok?: unknown; user?: { email?: unknown } | null; ... }`) — HealthPanel, PrimaryNav, login/signup, accessibility.

**Verification:**

- ESLint: **0 `no-explicit-any` warnings repo-wide** (down from 58). The remaining 80 warnings are all `no-unused-vars` (Phase 6c scope) and the 1-warning carve-outs already documented elsewhere.
- `apps/web` TypeScript: held at the pre-change baseline of 590 errors (`npx tsc --noEmit` from `apps/web` — all 590 are pre-existing Tamagui/Next.js type-system gaps unrelated to Phase 6b). One transient TS error introduced during the rewrite (`HopSearchItem` missing `type` field, `YeastSearchItem` same) was caught by a normalized-diff TS-error log and fixed before commit. A second transient error in `i18n/request.ts` (initial overly-permissive `Record<string, ...>` shape broke `messages.recipes.water.mash.lateFermentablesExcludedNote = …`) was fixed by replacing the generic shape with the explicit `MessagesShape` interface that mirrors the actual mutations the file performs. A third transient error in `mathBodies.ts` (`v.value` could be `undefined` after the `Record<string, { kind?: string; value?: number }>` cast) was fixed by adding `typeof v.value === "number"` to the existing guard.
- `apps/native` TypeScript: 0 errors (held at baseline; Phase 6b is web-only).
- `@umbraculum/contracts` TypeScript: 0 errors.
- Repo-wide `no-explicit-any`: 58 → 0. **Phase HIGH-staged is type-cast-cleanup-complete.**
- Repo-wide all-warnings: 138 → 80 (-58, exactly Phase 6b scope).
- No new unit tests added — Phase 6b is type-tightening, no behavioural change. All 18 files are exercised by the existing Playwright smoke suite + auth flow specs.

**Phase 6 cumulative impact:** 107 `any` removed across 20 files (Phase 6a's 2 files + Phase 6b's 18). Combined with Phases 1–5, **the entire monorepo is now `no-explicit-any`-free.** This unblocked promoting `@typescript-eslint/no-explicit-any` from `warn` to `error` repo-wide, which landed alongside Phase 6c.

#### Phase 6c — `no-unused-vars` mop-up + rule promotions ✅ landed 2026-05-16

**Scope:** 80 `no-unused-vars` warnings (the entire post-6b tail) + 1 `no-empty-object-type` carve-out → 0. Both `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any` promoted from `warn` to `error`.

**Strategy used:** for each warning the assistant chose between two equally valid mechanical fixes:

1. **Delete** — when the unused symbol was a top-level import (e.g. `Linking`, `Heading`, `Spinner`, `useEffect`, `Fragment`, `H1`, `H2`, `View`, `WaterProfile`, `WaterCalcDerivationKind`, `combineAfterSaltsAndAcid`, `formatFixed`, `UnauthorizedError`, `FieldBadge`, `saveRecipeWaterSettings`). 21 imports removed across 13 files. The rule for "delete vs prefix": if the symbol was *imported* and the file no longer needed the import line at all, delete it; if the file still needs the line for other names, drop just the unused name from the destructuring.
2. **Underscore-prefix** — when the unused symbol was a locally-defined constant, state setter pair, hook return, function parameter, or non-trivial declaration that future readers might still want for context (e.g. `_INTEGRATION_KINDS`, `_PresetKey`, `_recipeId`, `_locale`, `_settings`, `_loading`, `_canCall`, `_activeWorkspaceId`, `_yeastResults`, `_setYeastQuery`, `_yeastSearching`, `_yeastAmountTextById`, `_equipmentProfilesLoading`, `_versionsLoading`, `_acidDerivation`, `_loadingProfiles`, `_spargeCalciumPpm`, `_spargeMagnesiumPpm`, `_boilCalciumPpm`, `_boilMagnesiumPpm`, `_mashStatus`, `_mashManualStatus`, `_isKindWorking`, `_getSectionLabel`, `_calcMashEstimatedPh`, `_ensureSpargeSaltsSnapshotForAcidification`, `_searchYeasts`, `_addYeastRow`, `_addYeastFromDb`, `_updateYeastRow`, `_removeYeastRow`, `_newRowId`, `_canSave`, `_height`, `_idxInSection`, `_sectionPending`, `_contributingUrl`, `_notes`, `_idx`, `_cookieNoSession`, `_srmToEbc`, `_snapshotGristRows`, `_snapshotYeastRows`, `_validateGristJson`, `_validateHopsJson`, `_validateYeastJson`, `_validateMiscJson`, `_YEAST_FORMAT_OPTIONS`, `_YeastRow`, `_CATEGORIES`). 59 underscore-prefixings across 23 files. The `argsIgnorePattern: "^_"` / `varsIgnorePattern: "^_"` ESLint config (already in place from HIGH-light) makes `_`-prefixed names compliant without further configuration.

**Why the `_`-prefix bias?** Several of these "unused" callbacks (`_searchYeasts`, `_addYeastRow`, `_addYeastFromDb`, `_updateYeastRow`, `_removeYeastRow` in `apps/native/src/screens/RecipeEditScreen.tsx`; `_calcMashEstimatedPh` in `apps/web/app/recipes/[id]/water/mash/page.tsx`; `_validateGristJson` / `_validateHopsJson` / `_validateYeastJson` / `_validateMiscJson` / `_snapshotGristRows` / `_snapshotYeastRows` in `services/api/src/services/recipesService.ts`) are dead-but-likely-revived: they were consciously written, they exercise infrastructure that's still in use elsewhere, and the safer call in non-interactive cleanup is to leave them in place behind a `_` prefix rather than delete them in a context where the reviewer can't easily flag a regression. A future cleanup pass can drop them once the surrounding screen/service flows stabilise.

**One non-`no-unused-vars` carve-out:** `services/api/src/services/ai/tools/brewery/currentBrewSessionStatus.ts` had a `no-empty-object-type` warning on `interface CurrentBrewSessionStatusInput {}`. Replaced with `type CurrentBrewSessionStatusInput = Record<string, never>;` which is the canonical "I really do mean an empty object" expression and the one suggested by the `no-empty-object-type` rule itself.

**Rule promotions — `eslint.config.mjs`:**

```diff
-      "@typescript-eslint/no-unused-vars": [
-        "warn",
-        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
-      ],
-      "@typescript-eslint/no-explicit-any": "warn",
+      "@typescript-eslint/no-unused-vars": [
+        "error",
+        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
+      ],
+      "@typescript-eslint/no-explicit-any": "error",
```

Both promotions are documented inline in `eslint.config.mjs` with a pointer back to this section.

**Verification:**

- `npm run lint` exits clean: **0 warnings, 0 errors** repo-wide.
- `npm run lint:packages-strict` (the `--max-warnings 0` gate on every `packages/**` workspace) still passes.
- `apps/web` TypeScript: held at the pre-change baseline of 590 errors (pre-existing Tamagui/Next.js gaps; Phase 6c added zero new TS errors).
- `apps/native` TypeScript: 0 errors (held at baseline).
- `@umbraculum/contracts` TypeScript: 0 errors.
- `services/api` TypeScript: held at the pre-existing 19-error baseline (none of which are touched by the underscore-prefixings or the `Record<string, never>` change).
- No new unit tests added — Phase 6c is mechanical naming, no behavioural change. The two `services/api` test files touched (`brewSessions.test.ts`, `waterProfiles.test.ts`) had unused locals only — runtime behaviour identical.

**Phase HIGH-staged is now complete.** Both `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars` are promoted to `error`, the repo is warning-free, and the gating preconditions for HIGH-full (`recommended-type-checked` rule set + `--max-warnings 0` everywhere) are met. The HIGH-full upgrade is now a separate decision — see the section below.

### Phase 7 (optional, separate decision) — runtime-validation library migration

This is **not** an ESLint phase per se — it's an architectural decision adjacent to the type-discipline work. Phase 1 surfaced the question ("should `packages/platform/contracts` use Zod / Valibot / TypeBox instead of hand-rolled validators?"). The current decision is **no**, last re-confirmed 2026-05-16 (0/6 trigger criteria met — see [`docs/CONTRACTS-VALIDATION-STRATEGY.md` § Audit log](CONTRACTS-VALIDATION-STRATEGY.md#audit-log)). The question deserves to be tracked rather than forgotten.

- [ ] Re-evaluate when one of the trigger criteria in `docs/CONTRACTS-VALIDATION-STRATEGY.md` is met (new complex contract, OpenAPI requirement, form-validation parity, drift bugs, bundle-size shift, independent route migration).

See `docs/CONTRACTS-VALIDATION-STRATEGY.md` for the full pros/cons, candidate libraries (Zod, Valibot, Arktype, TypeBox), migration mechanics if/when we go, the decision log, and the per-criterion audit log.

---

## HIGH-full upgrade

HIGH-staged is complete; HIGH-full was scoped as 5 reviewable phases for the foundation-hardening pass in [`docs/ROADMAP.md`](ROADMAP.md), ahead of the July 2026 public-alpha window.

### Measurement baseline (2026-05-16, master `09c8b3c`)

A throwaway ESLint flat config that adds `@typescript-eslint/recommended-type-checked` on top of the regular config (with `parserOptions.projectService: true`) was run against the post-Phase-6c tree. The raw per-workspace logs are kept under `var/tmp/cursor/raw/high-full-*.raw` (gitignored) for reproducibility. Headline numbers:

- **Total warnings:** 1,671 (errors: 0, after the throwaway-config-only `js.configs.recommended` carve-outs are accounted for).
- **Auto-fixable:** ~411 (~25%) via `eslint --fix`. Mostly `no-unnecessary-type-assertion`.
- **Wall time, full repo:** 44s (vs ~6s for the current non-type-aware lint). The wall time is acceptable for CI (`web-lint.yml` has a 10-min timeout; the lint phase goes from ~10–15s to ~44s, total job goes from ~3–4 min to ~3.5–4.5 min). The bigger UX cost is editor inline lint — Cursor's per-file feedback goes from ~instant to several seconds, which is the main day-to-day friction.
- **Per-workspace distribution:**

  | Workspace | Warnings | Top rule (count) |
  |---|---:|---|
  | `services/api` | 1,034 | `no-unsafe-member-access` (507) |
  | `apps/web` | 452 | `no-unsafe-member-access` (147) |
  | `apps/native` | 78 | `no-unnecessary-type-assertion` (34) |
  | `packages/platform/contracts` | 59 | `no-unsafe-member-access` (42) |
  | `packages/platform/ui` | 21 | `no-unnecessary-type-assertion` (6) |
  | `packages/platform/test-mcp` | 9 | `no-unnecessary-type-assertion` (6) |
  | `packages/platform/i18n-react` | 3 | `no-unnecessary-type-assertion` (3) |
  | `packages/verticals/brewery/beerjson` | 2 | `no-redundant-type-constituents` (2) |
  | `packages/platform/i18n` | 2 | `no-unnecessary-type-assertion` (2) |
  | `packages/platform/api-client` | 0 | — |
  | `packages/platform/media` | 0 | — |
  | `packages/platform/navigation` | 0 | — |
  | `packages/verticals/brewery/recipes-ui` | 0 | — |

- **Friction tiers** (where the warnings actually live):
  - **Tier A — Real bug catches** (~135 warnings): `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`, `prefer-promise-reject-errors`, `no-implied-eval`, `only-throw-error`. Each fix catches a real bug or near-bug. No Tamagui interaction.
  - **Tier B — Mechanical cleanup** (~425 warnings, ~96% auto-fixable): `no-unnecessary-type-assertion`, `no-redundant-type-constituents`, `no-base-to-string`, `restrict-template-expressions`, `unbound-method`. Mostly stale casts left over from the Phase 1–6c `any`-removal.
  - **Tier C-narrow — `services/api` `no-unsafe-*`** (~665 warnings): Prisma raw queries, Fastify request bodies, AI tool I/O, BeerJSON normalisation. Real type-discipline issues, no Tamagui involvement.
  - **Tier C-wide — `apps/web` `no-unsafe-*`** (~266 warnings): Tamagui-driven props leaked as `any`. The genuine "Tamagui wall" — but bounded to apps/web only (apps/native has 3 such warnings total).

### Phase plan

#### Phase 1 — Auto-fix sweep

- **Scope (planned):** ~411 warnings, single commit, mechanical only.
- **Scope (actual):** **310 warnings eliminated** (1,671 → 1,361). The shortfall versus the ~411 estimate is the cost of the safety reverts described under "Lessons learned" below — auto-fix produced 100 fixes that the TypeScript baseline rejected, and we restored the casts/comments rather than fix the underlying types in this phase.
- **Rules enabled (auto-fix only):** `no-unnecessary-type-assertion`, `no-redundant-type-constituents`, the auto-fixable subset of `no-base-to-string`.
- **Strategy:** ran `eslint --fix` against a temporary type-aware config (`eslint.config.measure.mjs`, deleted after the run) with all type-aware rules at `warn`. Manual review of the resulting diff, then surgical reverts to keep per-workspace TS baselines green and the existing lint clean.
- **Verification gate (achieved):**
  - Per-workspace TS baselines hold: `apps/web` 590, `apps/native` 0, `services/api` 19, `packages/platform/contracts` 0, `packages/platform/i18n` 0, `packages/platform/i18n-react` 0, `packages/platform/test-mcp` 0, **`packages/platform/ui` 25** (revised baseline; the original phase plan listed this as 0, which was wrong).
  - `npm run lint` exits clean (0 errors, 0 warnings, ~7s wall).
  - `npm run lint:packages-strict` exits clean (`--max-warnings 0` on all 11 strict packages).
  - Remeasurement (post-fix) confirms type-aware warning surface dropped 310 (1,671 → 1,361, 43s wall).
- **Files touched:** 64 — services/api 38 (mostly tests), apps/web 13, apps/native 8, packages/platform/i18n-react 2, packages/platform/i18n 1, packages/platform/test-mcp 1, packages/platform/contracts 1.
- **Lessons learned (carry into Phase 2+):**
  - **The throwaway config is not "safe by construction".** Setting an existing rule (e.g. `react-hooks/exhaustive-deps`) to `off` in the throwaway config makes ESLint's `--fix` treat all corresponding `// eslint-disable-next-line ...` comments as "unused", and a hidden secondary fixer (`eslint-comments` family, transitively enabled by `recommended-type-checked`) strips them. We lost ~17 disable comments to this; they were re-added surgically. **Mitigation for Phase 2+:** explicitly set the same severity in the throwaway config that production uses, never `off`. If a production rule must be silenced for measurement, use `// eslint-disable` *in the throwaway config* rather than rule-level off.
  - **Auto-fix is not always type-safe even on `no-unnecessary-type-assertion`.** It removes assertions that the type checker can't verify *without* the assertion (e.g. `as Record<string, unknown>` casts that opened up dynamic indexing, or `as EditorYeastRow[]` that papered over a structural mismatch downstream). We reverted 11 files where the auto-fix broke `tsc --noEmit`. **Mitigation for Phase 2+:** always run `tsc --noEmit` per workspace after `--fix`, and `comm -13` against the pre-fix baseline; revert offenders before commit.
  - **Per-workspace baselines must be measured directly, not trusted from prior summaries.** The HIGH-full plan claimed `packages/platform/ui` at 0 TS errors; it's actually 25 (pre-existing Tamagui prop typing errors). Always re-measure.
- **Effort (actual):** ~3 hours (estimate was 30 min — the gap is entirely revert/recovery work above).
- **Risk:** very low after the safety reverts; remaining changes are auto-fix output that both ESLint and `tsc` accept.
- **Status:** ✅ **landed** (commit pending push).

#### Phase 2 — Tier A: Promise correctness ✅ landed 2026-05-16

- **Actual scope (post-Phase-1 remeasurement):** 133 warnings under the 7 promoted rules plus the 3 already-fixed strict-gated ones (136 total touched). Distribution:
  - `services/api`: 47 `require-await`.
  - `apps/web`: 41 `no-misused-promises` + 13 `no-floating-promises` + 2 `require-await` = 56.
  - `apps/native`: 24 `no-misused-promises` + 4 `no-floating-promises` + 1 `require-await` + 1 `prefer-promise-reject-errors` = 30.
  - `packages/platform/test-mcp`: 1 `no-misused-promises` + 1 `require-await` = 2.
  - `packages/platform/ui`: 1 `no-base-to-string` (pre-fixed because strict-gated; `no-base-to-string` is not part of the 7 Phase 2 rules but was queued via the throwaway measurement and worth landing here).
- **Rules promoted to `warn` in `eslint.config.mjs`:** `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`, `prefer-promise-reject-errors`, `no-implied-eval`, `only-throw-error`. Scoped to `**/*.{ts,tsx}` (the 7 rules are type-aware and require the new TS-only `parserOptions.projectService` block).
- **Type-aware infrastructure:** new TS-only language-options block enables `parserOptions.projectService: { allowDefaultProject: [...] }` with `tsconfigRootDir: import.meta.dirname`. The `allowDefaultProject` allowlist covers TS files outside any tsconfig include — vitest configs (`{services/api,apps/web,apps/native,packages/{beerjson,contracts,core}}/vitest.config.ts`), tsup configs (`packages/{recipes-ui,ui}/tsup.config.ts`), and `services/api/prisma/seed.ts`, `packages/verticals/brewery/core/src/index.d.ts`. `**`-globs are not allowed in `allowDefaultProject` — explicit relative paths only.
- **Wall-time impact:** full-repo `npm run lint` went from ~7s to ~39s on a hot cache. Acceptable. Phase 5 will absorb this when the rules go to `error`; the cost is real but the value (catching async bug classes that TS itself cannot see) compounds.
- **Strategy per rule (as actually applied):**
  - `no-floating-promises` (17 sites total): the 13 in `apps/web` and 3 in `apps/native` were all `(async () => { … })();` IIFEs in `useEffect` bodies. Prefixed each with `void`. The 17th (`apps/native/AdSlot.tsx`) was a bare `Linking.openURL(...)` not awaited; same `void` fix.
  - `no-misused-promises` (66 sites total): wrap the Promise-returning handler in a sync wrapper that satisfies the void-return contract.
    - **Default (Tamagui `onPress` and similar):** `onPress={() => { void fn(); }}`. The bound handler usually doesn't consume the event, and Tamagui's `onPress` signature is `(e: GestureResponderEvent) => void` — passing the event via `Parameters<typeof fn>` trips TS2352 ("converting `[event: GestureResponderEvent]` to `[]`") whenever the handler is `() => Promise<…>`.
    - **For `onSubmit` / `onChange` / `onValueChange` (web only):** the bound fn does consume the event (e.g. `e.preventDefault()`), so use `onSubmit={(...a) => { void fn(...(a as Parameters<typeof fn>)); }}`.
    - **For Alert.alert button objects (`onPress: async () => { … }`)** and other multi-line property-style handlers: rewrote to `onPress: () => { void (async () => { … })(); }`.
    - **Multi-line single-expression arrows** (e.g. `onValueChange={(v) => fn({...})}` across 3+ lines): hand-edited to `(v) => { void fn({...}); }`.
  - `require-await` (51 sites total, mostly `services/api`): drop the `async` keyword. For Fastify plugin entry points (27 `routes/*.ts` files + 4 framework plugins) the function never awaits — Fastify accepts both sync and async signatures. For Fastify route handlers (`app.post('/foo', async (req) => …)` in `waterCalc.ts`, `health.ts`, `recipesImport.ts`) ditto. For methods/arrow shorthand returning a Promise from a single internal call (e.g. test mocks, seed `upsertSourceMap`): when the surrounding type required a Promise return, used `() => Promise.resolve(...)` or simply returned the inner Promise without awaiting. One `await-thenable` fallout in `app.ts:99` (an `await aiRoutes(registry)(instance)` call where `aiRoutes()` returned the now-sync inner) was refactored to the Fastify callback-form plugin signature.
  - `prefer-promise-reject-errors` (1 site): `apps/native/DashboardScreen.tsx` `withTimeout()` helper. Tightened the `reject` callback's `err` argument type to `unknown` and wrapped non-Error values: `reject(err instanceof Error ? err : new Error(String(err)))`.
  - `await-thenable` / `no-implied-eval` / `only-throw-error`: 0 standing violations.
- **Order of landing (5 commits):**
  1. **Phase 2a** (`packages/platform/test-mcp` + `packages/platform/ui`, 3 warnings): pre-fix the strict-gated packages so the rule promotion in 2b can land without breaking `lint:packages-strict`.
  2. **Phase 2b** (`eslint.config.mjs` + `services/api`, 47 warnings): promote the 7 rules; add the type-aware parser block; fix all `services/api` violations.
  3. **Phase 2c** (`apps/web`, 56 warnings): wrap handlers / void IIFEs.
  4. **Phase 2d** (`apps/native`, 30 warnings): wrap handlers / void IIFEs / Error-ize one reject.
  5. **Phase 2e** (this docs update + delete `eslint.config.measure.mjs`).
- **Verification:** all 7 rules at zero warnings; `npm run lint` exits 0 with 0/0; `npm run lint:packages-strict` clean; per-workspace `tsc --noEmit` baselines unchanged (`apps/web` 590, `apps/native` 0, `services/api` 19, `packages/{contracts,i18n,i18n-react,test-mcp,api-client,beerjson,media,navigation,recipes-ui}` 0, `packages/platform/ui` 25). `services/api` vitest pass/fail pattern unchanged from pre-Phase-2 (12 pass / 20 file-load fails / 3 test fails — all DB-env failures, not regressions).
- **Lessons learned (carry into Phase 3+):**
  - **Type-aware lint costs ~30s wall time** even with `projectService` and explicit `allowDefaultProject` paths. CI minute budget should account for this. Editor performance is a separate concern (see Phase 5 prerequisite).
  - **`Parameters<typeof fn>` does not safely tunnel through Tamagui `onPress`.** When the bound handler takes 0 args but the JSX dispatcher hands you an event, TS2352 fires on the cast. Default to the no-arg `() => { void fn(); }` form for `onPress`/`onClick`; only use the Parameters form when the bound handler actually consumes the event (forms, value-changers).
  - **Pre-fix the strict gate before the rule promotion.** The packages strict gate (`--max-warnings 0`) means promoting a rule mid-flight breaks CI for any package with even one violation. Always sweep packages first, then promote.
  - **`allowDefaultProject` requires explicit relative paths**, not globs. `**/vitest.config.ts` is rejected with "glob too wide". Maintain the allowlist as new TS files outside tsconfig includes appear.

#### Phase 3 — Tier C-narrow: `services/api` `no-unsafe-*` ✅ landed 2026-05-16

- **Actual scope (post-Phase-2 remeasurement):** **777 warnings** in `services/api/**` (raw count under the 5 promoted rules). Distribution was sharply different from the original plan:

  | Slice                                    | Count | %   |
  |------------------------------------------|------:|----:|
  | Test files (`**/tests/**`, `*.test.ts`)  |   611 | 79% |
  | Source files                             |   166 | 21% |

  Per-rule across the full surface: `no-unsafe-member-access` 528, `no-unsafe-assignment` 184, `no-unsafe-call` 49, `no-unsafe-return` 10, `no-unsafe-argument` 6.

  Within source files, the 166 warnings concentrated almost entirely in two files:

  | File                                                  | Count |
  |-------------------------------------------------------|------:|
  | `services/api/src/seed/sources/beerproto/beerproto.ts` |   108 |
  | `services/api/prisma/seed.ts`                         |    31 |
  | `services/api/src/app.ts`                             |    17 |
  | `services/api/src/beerjson/beerjsonValidator.ts`      |     3 |
  | 7 other files (1 each)                                |     7 |

  The original plan estimated ~665 warnings split across "Prisma raw queries / Fastify request handlers / AI tool I/O / BeerJSON normalisation". In practice those file families were **already typed cleanly** by HIGH-staged Phases 2–4 (the `services/api/src/**` cleanup that landed before HIGH-full). The remaining concentration was in two seed/import files plus Fastify wiring.

- **The big decision — relax `no-unsafe-*` in tests, not source:**
  611 of 777 warnings (79%) came from the test-file convention `JSON.parse(res.body) as { foo: ... }` followed by `.field.subfield` chains. Re-typing every Fastify-inject test response would be ~600 mechanical fixes with very low bug-catching value: tests control both ends of the boundary, the type assertions are usually correct, and the expected shape is implicit in the test name.
  Decision: relax the 5 `no-unsafe-*` rules in test files (matching the existing `no-explicit-any: off` and `no-unused-expressions: off` relaxations in the same `**/*.{test,spec}.{ts,tsx,js,jsx}` glob block). Industry standard — typescript-eslint's own docs recommend relaxing the unsafe family in tests. Source code keeps the strong guardrail.
- **Rules promoted (scoped to `services/api/**`, off in tests):** `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-argument`, `no-unsafe-return`.
- **Strategy:** per `docs/CONTRACTS-VALIDATION-STRATEGY.md`, this codebase stays on hand-rolled validators. Phase 3 typed each source boundary with `unknown` + type guards / `parseX()` helpers; **no Zod/Valibot was introduced**. The Zod migration remains a separate decision with its own trigger criteria.
- **Order of landing (5 commits, ~3 hours):**
  1. **Phase 3a** (`eslint.config.mjs` only, -611 warnings instantly): promote the 5 rules at `warn` on `services/api/**`; extend the test-files relaxation block to add the 5 unsafe-* at `off`. The throwaway `eslint.config.measure.mjs` is also deleted (production config now produces the same measurement).
  2. **Phase 3b** (`services/api/src/app.ts`, 17 warnings): all 17 in the dev-only CORS origin callback. Imported `OriginFunction` from `@fastify/cors` and hoisted the inline arrow into a typed local `const corsOriginFn: OriginFunction = (origin, cb) => { ... }`. The single residual warning on the `app.register(cors, ...)` call itself is `@fastify/cors`'s `export = fastifyCors` namespace+function-merge confusing type-aware ESLint (TS itself accepts the call cleanly); suppressed with a focused `eslint-disable-next-line` and an explanatory comment block. **Side effect:** the typed callback exposed 2 latent type errors that were previously hidden behind the `any` parameter inference, so the `services/api` tsc baseline drops from 19 → 17 (improvement, not regression).
  3. **Phase 3c** (`services/api/prisma/seed.ts` + `services/api/prisma/tsconfig.json`, 31 warnings): two unrelated root causes —
     - **argon2 type resolution (7 warnings):** `import argon2 from "argon2"` works in `src/routes/auth.ts` but failed in `prisma/seed.ts` because `seed.ts` is outside the API tsconfig `include: ["src/**/*.ts"]` and was being resolved via flat-config's `allowDefaultProject` escape hatch. Fix: add a dedicated `services/api/prisma/tsconfig.json` (extends `../tsconfig.json`, `noEmit: true`, `include: ["seed.ts"]`). `projectService` finds it automatically; the `"services/api/prisma/seed.ts"` entry is removed from `allowDefaultProject`. Runtime unaffected (`prisma db seed` invokes `tsx`, not `tsc`).
     - **BJCP styles parsing (24 warnings):** `Array.isArray(styles)` narrows `unknown` to `any[]`, so `for (const s of styles) { typeof s?.style_id === "string" ... }` had `s: any`. Added a local `function isRecord(v: unknown): v is Record<string, unknown>` guard, asserted `styles as unknown[]` after the runtime check, and narrowed each element with `if (!isRecord(s)) continue` before property access.
  4. **Phase 3d** (`services/api/src/seed/sources/beerproto/beerproto.ts`, 108 warnings — the largest single file): all 108 traced to a single root cause — an explicit escape hatch typing the prisma argument as `any`:
     ```ts
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     type PrismaLike = any;
     ```
     The comment said this was to keep editor/host typechecking robust when Prisma Client was out of sync, but every other `services/api/**` file imports `PrismaClient` directly without issue. Replaced `PrismaLike = any` with `import type { PrismaClient }` + `type PrismaLike = PrismaClient` — `tsc --noEmit` confirmed zero hidden errors had been masked by the `any`. Single-line fix cleared all 108 warnings.
  5. **Phase 3e** (8 misc files, 10 warnings): tail of unrelated micro-causes —
     - `Array.isArray` narrowing to `any[]` (in 3 sites: `gravityAnalysis.ts`, `platformRecipes.ts`, `recipesExport.ts`, `recipesImportService.ts`) → annotate locals as `: unknown[]`.
     - Third-party `JSON.parse` / `parser.parse` / Ajv schema returns typed `any` (in `beerjsonValidator.ts` 3 sites, `beerxmlImporter.ts` 1 site) → cast to the appropriate shape (`AnySchema` for Ajv) or `: unknown` for narrow-on-use.
     - Catch handler `(err) => err?.message` (in `seedE2eFixture.ts`) → tighten to `(err: unknown)` and `err instanceof Error ? err.message : String(err)`.
     - Node 22 `Buffer<ArrayBufferLike>` regression vs `IncomingMessage` async-iter chunks typed as `any` (in `webhookRawBody.ts`) → cast iterable to `AsyncIterable<Buffer | Uint8Array | string>`.

- **Verification:** `npm run lint` exits 0/0 (full monorepo). `npm run lint:packages-strict` unchanged (clean). Per-workspace `tsc --noEmit` baselines: `services/api` 17 (improved from 19, **no regression**), `apps/web` 590, `apps/native` 0, `packages/{contracts,i18n,i18n-react,test-mcp,api-client,beerjson,media,navigation,recipes-ui}` 0, `packages/platform/ui` 25. Wall-time impact: full-repo lint stays at ~39s (the 5 new rules fire on the same file set the parser already serves).

- **Effort (actual):** ~3 hours (estimate was 10–20 hours). The gap is entirely the test-relaxation decision (-611 warnings via config) plus the `PrismaLike = any` discovery (-108 via single import change) — together ~93% of the surface dissolved into 2 commits.

- **Lessons learned (carry into Phase 4+):**
  - **Always re-measure at phase start; don't trust the original estimate.** The Phase 3 plan listed file families that didn't exist (cleared by HIGH-staged). The dominant warnings were in two seed files that the plan didn't mention. A 30-minute remeasurement saved ~10+ hours of work targeting the wrong files.
  - **Tests deserve different lint discipline than source.** The test-relaxation decision (-611) followed the existing `no-explicit-any: off` precedent and is the natural next step every time a type-aware rule lands. Phase 4 (`apps/web` `no-unsafe-*`) should consider the same relaxation — `apps/web/**/__tests__/**` and Playwright fixtures will have the same `JSON.parse → as Shape` pattern.
  - **A single escape hatch can poison a whole file.** Beerproto's `type PrismaLike = any` was 108 of Phase 3's 166 source warnings. Before splitting a high-warning file into commits, scan for top-of-file `any` aliases or `as any` casts that fan out — one fix may collapse the entire surface.
  - **Files outside `tsconfig.include` deserve their own sub-tsconfig, not `allowDefaultProject`.** The escape hatch is fine for trivial files (vitest configs, tsup configs, `.d.ts` shims) but breaks for files that import third-party CJS modules with `esModuleInterop` semantics (the `prisma/seed.ts` argon2 case). When a file develops real logic, give it a real tsconfig.
  - **`Array.isArray` narrows `unknown` to `any[]`, not `unknown[]`.** This was Pattern A in 4 of the Phase 3e tail fixes plus the BJCP styles loop in 3c. The standard remedy is `const items: unknown[] = Array.isArray(x) ? x : []` (or assert `as unknown[]` immediately after the runtime check).
  - **Sub-projects work with `projectService`.** Adding a `services/api/prisma/tsconfig.json` cleared a class of "type that could not be resolved" warnings without touching `eslint.config.mjs` rules. Keep this pattern for Phase 4 if it surfaces.

#### Phase 4 — Tier C-wide: `apps/web` `no-unsafe-*` ✅ landed 2026-05-16

- **Actual scope (post-Phase-3 remeasurement):** **304 warnings** in `apps/web/**` under the 5 promoted rules (vs ~266 estimated, +14%). Distribution was, again, sharply different from the original plan:

  | Slice                                                               | Count | %   |
  |---------------------------------------------------------------------|------:|----:|
  | 4 water-related pages w/ stale `profiles?.account` field            |   290 | 95% |
  | Playwright e2e specs (auto-relaxed via `**/e2e/**` glob)            |    10 |  3% |
  | Genuine tail (3 unrelated files; only 2 of 4 warnings Tamagui-ish)  |     4 |  1% |

  Per-rule across the full surface: `no-unsafe-member-access` 153, `no-unsafe-assignment` 122, `no-unsafe-return` 16, `no-unsafe-argument` 10, `no-unsafe-call` 3.

- **The plan called this "the Tamagui wall." It wasn't.**
  The original plan (now archived above) framed Phase 4 as "Tamagui-driven props leaked as `any`" requiring an architectural decision between three sub-strategies (4a per-site disable / 4b adapter improvements / 4c hybrid). The phase-start measurement showed the actual distribution: **95% of the surface (290 warnings) traced to a single root cause unrelated to Tamagui** — four UI consumers reading `profiles?.account` after the `account → workspace` rename missed them (pre–history-rewrite commit `87876d0`; SHA no longer resolvable after the 2026-05 org-transfer history rewrite). The Tamagui-adjacent surface was 2 warnings in `NavSheet.tsx` (5% of the tail). No 4a/4b/4c decision tree was needed.

- **Significant collateral discovery — a long-broken UI feature returns:**
  Because the four pages read `profiles?.account` (a field that no longer exists on the parsed `WaterProfilesResponse`), `acc` was always `[]`. The dropdowns silently dropped workspace-scoped water profiles. Fixing the type also fixes the runtime bug — workspace water profiles re-appear in:
    - `apps/web/app/recipes/[id]/water/mash/page.tsx`
    - `apps/web/app/recipes/[id]/water/sparge/page.tsx`
    - `apps/web/app/recipes/[id]/water/boil/page.tsx`
    - `apps/web/app/[locale]/water-profiles/page.tsx`
  The Phase 4b commit message is prefixed `fix(web)` rather than `foundation` to make the user-visible behaviour change discoverable in `git log`.

- **Rules promoted (scoped to `apps/web/**`, off in tests/e2e):** same 5 `no-unsafe-*` rules as Phase 3.
- **Test relaxation:** the existing test-files block (`**/*.{test,spec}.{ts,tsx,js,jsx}`, `**/tests/**`, `**/e2e/**`) automatically covers `apps/web/e2e/**` Playwright specs. The 10 e2e warnings observed in the throwaway measurement evaporate to 0 under the production config — no extra glob needed.
- **Strategy:** identical to Phase 3 — type the boundary as `unknown`, narrow with the existing hand-rolled `parseX()` helpers in `packages/platform/contracts`. No Zod/Valibot. The `select-workspace/page.tsx` fix is exemplary: instead of inline `body as { workspaces?: unknown; accounts?: unknown }` cast + `Array.isArray` dance, delegate to `parseAuthMeResponse(res.data)` which already centralises the legacy-`accounts` fallback in the contract.
- **Order of landing (4 commits, ~1 hour):**
  1. **Phase 4a** (`eslint.config.mjs` only, +294 warnings): promote the 5 unsafe-* rules at `warn` on `apps/web/**`. Block positioned after the type-aware parser block and after Phase 3a's `services/api/**` block, but before the test-files relaxation block (later block wins; e2e auto-exempt).
  2. **Phase 4b** (`fix(web)` — 4 files, -290 warnings + restores workspace water profiles dropdown): replace `profiles?.account ?? []` with `profiles?.workspace ?? []` and rename the local `acc` variable to `wsp` in all four pages. 8 lines total. apps/web tsc baseline drops 590 → 586 (4 latent type errors that were hidden behind the `error typed` propagation now resolved).
  3. **Phase 4c** (3 files, -4 warnings):
     - `apps/web/app/[locale]/(auth)/select-workspace/page.tsx` (1): replace inline `Array.isArray(body?.workspaces ?? body?.accounts) ? list : []` with `parseAuthMeResponse(res.data).workspaces`. Aliases the local `WorkspaceListItem = AuthMeResponseWorkspace`. apps/web tsc drops another 1 (586 → 585).
     - `apps/web/app/_components/NavSheet.tsx` (2): only "Tamagui-adjacent" warning of the whole phase. The web-only `YStack onClickCapture` handler had `e: any` because Tamagui's DOM-vs-RN abstraction makes the inferred event type ambiguous. Annotate explicitly: `(e: MouseEvent<HTMLElement>) => { ... }`. The runtime `instanceof HTMLElement` check still narrows; the annotation just gives type-aware ESLint a non-`any` starting type.
     - `apps/web/app/recipes/[id]/edit/page.tsx` (1): the unused-by-convention helper `_addYeastFromDb` calls a non-existent `addYeastRow` (the corresponding TS2552 lives in the apps/web pre-existing tsc baseline). Suppressed with a focused `eslint-disable-next-line @typescript-eslint/no-unsafe-call` and a block comment documenting the dead-code state. Deliberately did NOT use `@ts-expect-error` (would be brittle the moment `addYeastRow` is defined; doesn't change the lint outcome anyway).
  4. **Phase 4d** (this docs update + delete `eslint.config.measure.mjs`).

- **Verification:** `npm run lint` exits 0/0 (full monorepo). `npm run lint:packages-strict` clean. Per-workspace `tsc --noEmit` baselines: `apps/web` **585** (improved from 590, **no regression**), `services/api` 17 (unchanged from Phase 3), `apps/native` 0, `packages/{contracts,i18n,i18n-react,test-mcp,api-client,beerjson,media,navigation,recipes-ui}` 0, `packages/platform/ui` 25. Wall-time impact: full-repo lint goes ~39s → ~42s (one more rule family on the same parser-served file set). Acceptable.

- **Effort (actual):** ~1 hour (estimate was 10–30h). The gap is dominated by the same lesson as Phase 3: the surface dissolved into 2 commits because 95% of warnings traced to a single fixable root cause. There was no Tamagui adapter project to do.

- **Lessons learned (carry into Phase 5):**
  - **The "Tamagui wall" was a phantom.** Both Phase 3 and Phase 4 measurements showed the no-unsafe-* surface concentrated in a small number of files with file-specific root causes (escape hatches, stale renames), not in a broad Tamagui-adapter-shaped surface. The Tamagui type-system gap that motivated `docs/TAMAGUI.md` is real, but it is NOT what generates `no-unsafe-*` warnings at scale in this codebase. Don't over-design future phases around Tamagui hypotheses.
  - **Lint promotion finds latent runtime bugs.** Phase 4b's `.account → .workspace` rename had been silently broken since `87876d0` and would have stayed silent indefinitely without the type-aware lint pass. The promotion paid for itself in user-visible bug fixes, not just static-discipline points. Treat each future lint-tightening phase as an opportunity to surface this kind of drift.
  - **Stale-rename cascades behave like escape hatches.** A non-existent field access (e.g. `profiles?.account` after the rename) produces an `error typed` value that propagates through every downstream consumer, generating dozens or hundreds of warnings from a single source. When triaging a high-warning file, look for "type that cannot be resolved" / "error typed" early in the chain, not in the leaves.
  - **Web-only Tamagui handlers can be cleanly typed with `react`'s event types.** When a Tamagui component is used inside `apps/web/**` (Next.js, web-only render), the runtime event is always a React DOM event. Annotating handlers with `MouseEvent<HTMLElement>` / `FormEvent<HTMLFormElement>` / etc. gives type-aware ESLint a non-`any` starting type without forking Tamagui or relaxing types. This is a third tool in the kit alongside Phase 3's `() => { void fn(); }` (no-arg JSX wrappers) and `(...a) => { void fn(...a as Parameters<typeof fn>); }` (event-consuming JSX wrappers).
  - **Dead code with pre-existing tsc errors gets a focused eslint-disable, not a `@ts-expect-error`.** `@ts-expect-error` becomes its own error the moment the underlying issue is fixed (brittle), and doesn't change the lint outcome (the call expression stays "error typed" regardless of TS suppression). For unreachable code paths, a one-line disable directive with an inline `-- TS####` reference comment is the right tool.

#### Phase 5 — Rule promotions + IDE-config prerequisite ✅ landed 2026-05-16

The closing phase of the HIGH-full upgrade. Two parts ran in parallel: a contributor-facing IDE-config prerequisite (mitigations C + A + E + F) and the actual rule promotion (`warn → error`). Both completed in a single day in 5 commits.

##### Part 1 — IDE-config prerequisite (C + A + E + F)

Phases 1–4 shipped the rule changes; Phase 5 first had to ship the contributor-facing safeguards that prevent the failure modes Phase 1 demonstrated (auto-fix overreach + stripped `eslint-disable` comments + IDE lag). The mitigation stack landed:

- **C — Editor-only thinner ESLint config (`eslint.config.editor.mjs`):** ✅ landed 5a. Derived from production via a transform (single `TYPE_AWARE_RULES` allowlist filters the 12 type-aware rule names + a `stripProjectService` step removes `parserOptions.projectService`). Saves ~6× wall time on editor inline lint (~7s vs ~42s) and mechanically defeats the auto-fix-overreach failure mode (the rules are simply not enabled in the editor; auto-fix has nothing to overreach into). A final `linterOptions.reportUnusedDisableDirectives: "off"` block prevents the editor from flagging (and `source.fixAll` from auto-stripping) `eslint-disable` directives that target rules the editor config has stripped.
- **A — `.vscode/settings.json.example`:** ✅ landed 5a. Pins `eslint.options.overrideConfigFile: "eslint.config.editor.mjs"`, `eslint.run: "onSave"`, and `editor.codeActionsOnSave.source.fixAll.eslint: "explicit"`. `.gitignore` adjusted from `.vscode/` (full-directory) to `.vscode/*` + `!.vscode/settings.json.example` so the example file is tracked while the real `.vscode/settings.json` stays gitignored.
- **E — Cursor rule (`23a-eslint-fixall-discipline.mdc`):** ✅ committed upstream 5b. The rule is plugin-owned (per `11-cursor-package-files-edit-in-source-repo.mdc`, edit the plugin source repo, not an installed mirror or this consumer repo); it ships with the `umbraculum-node-react-cursor-assistant` plugin. The Magento variant (`rf-magento-cursor-assistant`) does not get the rule (no ESLint surface).
- **F — `docs/LINTING.md` "Recommended editor configuration" section:** ✅ landed 5b. Full how-to with three concrete troubleshooting entries for the failure modes contributors will actually hit, the C+A+E+F status table, and rationale for skipping B/D/G.

##### Part 2 — Rule promotion (`warn → error`) + cleanup

- **5c — promote 12 type-aware rules to `error`:** ✅ landed. All 7 promise-correctness rules (Phase 2) on `**/*.{ts,tsx}` + all 5 `no-unsafe-*` rules (Phases 3–4) on `services/api/**` and `apps/web/**`. The test-files relaxation block (`**/{tests,e2e}/**`, `**/*.{test,spec}.*`) keeps these rules at `off`, unchanged. The block-header comments in `eslint.config.mjs` updated to reflect Phase 5 landing (previously: "Phase 5 promotes them to error"; now: "promoted from warn by Phase 5"). Verification: `npm run lint` exits 0/0 (~40s wall); editor config exits 0/0 (~7s wall).
- **5d — drop `lint:packages-strict`:** ✅ landed. The script (`eslint packages/... --max-warnings 0`) and its corresponding `web-lint.yml` step were dropped as redundant. With rules at `error` repo-wide, any new violation fails the main `npm run lint` step; the dedicated package-level strict gate provides no additional signal.
- **5f — promote `no-empty-object-type` to `error`:** ✅ landed 2026-05-16 (post-Phase-5e housekeeping). With the 12 type-aware rules already at `error` and the editor-config split shipped, the lone warning-level rule was the last drift surface — promoted with the Tamagui-friendly `with-single-extends` allowance preserved (so `interface MyTheme extends Tamagui.Theme {}` and similar module-augmentation patterns stay legal). Repo had zero violations of the rule, so the promotion was effort-free; the value is removing the asymmetry "every other rule fails CI, this one warns."
- **5g — extend `no-unsafe-*` to `apps/native`:** ✅ landed 2026-05-16. The original Phase 4 deliberately scoped the 5 `no-unsafe-*` rules to `services/api/**` + `apps/web/**`, leaving `apps/native/**` excluded. Two reasons documented at the time: (a) the HIGH-full measurement reported only 3 `no-unsafe-*` warnings in apps/native — the smallest of the three first-party workspaces by an order of magnitude — so the value of locking it down was small; (b) the IDE-cost objection (type-aware lint slowdown in the editor) was a live concern. Phase 5a's editor-config split eliminated reason (b) — the editor lint pass strips type-aware rules regardless of file scope, so adding apps/native to the production-only `error` scope no longer affects editor performance. Reason (a) (small absolute volume) becomes a *positive*: 3 warnings is a few-minute cleanup, and the value is now coverage parity ("every first-party workspace fails CI on the same `no-unsafe-*` regression"). Measurement: all 3 warnings clustered on a single line in `apps/native/src/navigation/AppNavigator.tsx` — the inline `<RootStack.Screen name="SelectWorkspace">{({ navigation }) => …}</RootStack.Screen>` render-prop where `navigation` was inferred as `any`. Fixed by importing `type NativeStackScreenProps` from `@react-navigation/native-stack` and annotating the destructured argument as `NativeStackScreenProps<RootStackParamList, "SelectWorkspace">`. The pattern matches the typed-navigation idiom already used elsewhere in `apps/native` (`useNavigation<NavigationProp<RootStackParamList>>()`). Promoted directly to `error` in the same commit (no warn-staging — the surface was small enough that staging would have been overhead). Verification: `apps/native` tsc baseline unchanged (0 errors); `npm run lint` exits 0/0 (~42s wall); the eslint glob simplification (`apps/web/**` + `apps/native/**` → `apps/{web,native}/**`) keeps the rule list as a single block.

##### Effort and findings

- **Estimated:** ~2.5 hours for the full Phase 5 (~2h prereq + ~30min promotion).
- **Actual:** ~1.5 hours. The transform-from-production pattern for `eslint.config.editor.mjs` removed the need for a separate rule list to maintain, and the package-owned cursor rule landed cleanly in both source repos with no version-bump churn.
- **Lessons learned:**
  - **The "transform-don't-fork" pattern works for derivative ESLint configs.** Importing `baseConfig` and applying `stripTypeAwareRules` + `stripProjectService` is more maintainable than duplicating production rules into a parallel file. Future type-aware rule additions only need the rule name appended to `TYPE_AWARE_RULES`.
  - **Plugin-owned Cursor rules should be changed upstream first.** The `11-cursor-package-files-edit-in-source-repo.mdc` rule fired correctly when an attempted local-write of `23a-eslint-fixall-discipline.mdc` would have created a repo-local fork of plugin policy. The right escalation is to land the change in the umbraculum-toolset plugin source, then let contributors receive it via the plugin install/update path. Repo-local `.cursor/rules/` copies are reserved only for troubleshooting a plugin `alwaysApply` enforcement gap, and should be copied from the plugin install path rather than authored from scratch.
  - **`lint:packages-strict` was a HIGH-light artifact.** It existed to gate clean packages while warnings still piled up elsewhere. Once the entire repo reaches zero warnings AND rules are at `error`, the dedicated gate has no purpose. The phase plan correctly identified this as redundancy to drop in 5d.
  - **The `linterOptions.reportUnusedDisableDirectives: "off"` block is essential, not optional.** Without it, the editor config would flag every focused `// eslint-disable-next-line @typescript-eslint/no-unsafe-*` comment as "unused" (because the rule is stripped in the editor) — and `source.fixAll.eslint: "explicit"` won't save you if the contributor explicitly invokes "Fix all auto-fixable Problems". The block is the second line of defense after the editor-config split.

**Closing state:** repo at zero warnings, zero errors. CI gate is `npm run lint` (single command, ~40s). Editor uses the stripped config (~7s, instant inline feedback). The IDE-config prereq stack (C+A+E+F) protects against the auto-fix-overreach failure mode mechanically. The HIGH-full upgrade is closed.

### Realised output of HIGH-full

This section describes what HIGH-full was originally projected to deliver vs. what it actually delivered after the 2026-05-16 landing. Kept as a post-mortem for future readers reasoning about similar upgrades.

| Dimension | Original projection (HIGH-staged era, pre-Phase-5) | Realised outcome (post-Phase-5e, master `4cbf461`) |
|---|---|---|
| Repo lint state | Zero warnings repo-wide under `npm run lint`, every error real, every PR catches type-safety regressions before merge. | ✅ As projected. `npm run lint` exits 0/0; all 12 type-aware rules + `no-explicit-any` + `no-unused-vars` + `no-empty-object-type` are at `error` (the last one promoted in 2026-05-16 housekeeping). |
| CI cost | ~30s wall vs prior ~6s (~5× slower). Acceptable inside the `web-lint.yml` 10-min budget. | ✅ Close to projection. Measured ~40s wall in the post-Phase-5 measurement; full job stays well inside the 10-min CI budget. |
| Editor inline lint cost | ~3–5× slower than today (per-file, type-aware rules need TS program loaded) — flagged as the only meaningful UX cost. | ⚠️ **Mitigated, not paid.** Phase 5a shipped the editor-config split (`eslint.config.editor.mjs`) which strips type-aware rules + `parserOptions.projectService` for the IDE. Editor inline lint runs ~7s wall vs the prior ~6s — i.e. effectively unchanged. The "main UX cost" of HIGH-full was avoided by structural design, not absorbed. CI gets full type-aware rules; editor gets ~95% of catch-on-save value at near-prior speed. |
| Auto-fix safety | Not addressed in original projection. | ✅ **Bonus outcome.** Phase 1 surfaced an unanticipated risk: `source.fixAll.eslint: true` (a default many contributors carry over) silently strips `eslint-disable` directives and rewrites type assertions when type-aware rules are loaded. Phase 5a/5b/5e shipped a 4-mitigation stack (C+A+E+F: editor-only config + `.vscode/settings.json.example` + cursor rule `23a-eslint-fixall-discipline.mdc` + this doc) to defeat the failure mode mechanically. The cursor rule now ships via the `umbraculum-node-react-cursor-assistant` plugin. |
| Wall-clock effort | Estimated H1 2027 timeline (5 phases over months). | ✅ **Compressed.** All 5 phases shipped in a single day (2026-05-16) across 23 commits. Two latent UI bugs surfaced as side effects (`account → workspace` rename consumers in 4 water dropdowns; long-broken `restore` button — see Phase 4b post-mortem above). |
| Library migration question | Phase 7 (Zod / Valibot / TypeBox) flagged as "should we?" but unresolved. | ✅ **Resolved as deferred.** First scheduled audit landed 2026-05-16 in `docs/CONTRACTS-VALIDATION-STRATEGY.md` § Audit log: 0/6 trigger criteria met → "stay on hand-rolled" re-confirmed. Audit cadence now structured per-criterion for future re-evaluations. |

**Net summary:** HIGH-full delivered every projected benefit, avoided the projected UX cost via the editor-config split, and surfaced two latent bugs and a structural auto-fix-safety risk that wouldn't have been visible without the rule promotion. The original "main UX cost" framing turned out to be wrong — the cost was only paid if you naively pointed the editor extension at the production config, which the C+A+E+F stack now prevents by default.

### Beyond HIGH-full — the wider foundation-hardening pass

HIGH-full is a complete, closed slice. The roadmap-level **foundation-hardening pass** ahead of the July 2026 public-alpha window has three slices:

| Slice | Status | Living doc |
|---|---|---|
| **ESLint hardening** (HIGH-light → HIGH-staged → HIGH-full + 5f housekeeping + 5g native parity) | ✅ **Landed** 2026-05-16 | this doc |
| **TypeScript hardening** — drive per-workspace `tsc --noEmit` baselines toward 0 across `apps/web/**` (current baseline 585), `services/api/**` (current 17), `packages/platform/ui` (current 25). The HIGH-full lint cleanup already moved each of these baselines downward as a side effect; remaining errors are mostly Tamagui shorthand-prop typing (apps/web), Prisma raw-query result typing (services/api), and the few intentional `as any` carve-outs in `packages/platform/ui/src/primitives/*` that are documented in `docs/TAMAGUI.md`. | 🟡 **Not started.** No dedicated tracking doc yet — recommended creation: `docs/TYPECHECKING.md`, mirroring this doc's measurement-first / phase-gated structure. | — |
| **Test-coverage hardening** — drive per-layer coverage gaps from the cheapest-test-layer mapping in [`docs/TESTING.md`](TESTING.md). HIGH-full surfaced two latent bugs that escaped existing tests (Phase 4b stale rename, Phase 5g render-prop typing); both indicate gaps in the L4 (contract-snapshot) and L5 (Playwright) layers respectively. | 🟢 **Phase 4 complete (Phase 1 + 2 + 3 + 4a + 4b-1 through 4b-5 all done).** Only optional Phase 5 (`packages/verticals/brewery/core` L1 audit) + deferred Phase 4d (ACL coverage) remain. Phase 1 (2026-05-17): L1 contract parser coverage 5/8 → 8/8 (32 new tests, 70 total). Phase 2 (2026-05-18): L4 BeerJSON contract snapshots for **all 15 native-consumed endpoints** (7 contract suites, 16 tests, L4 coverage 2/15 → 15/15). Phase 3a (2026-05-18): L5 Playwright regression-pin for Phase 4b symptom (`smoke/water-profiles.spec.ts`; 2 tests). Phase 3b (2026-05-18): L5 Playwright regression-pin for Phase 5g SelectWorkspace flow (`smoke/select-workspace.spec.ts`; 3 tests; required `e2e-multi-admin` persona + secondary workspace seed). Phase 4a (2026-05-18): L2 route surface audit — 18 test files exercising ~75 of ~120 routes; highest-signal gap was cross-workspace isolation on the 17-route brew-sessions surface (0 isolation tests pre-audit); 3 workspace-scoped route files have zero L2 coverage (inventory, brewday-settings, integrations-generic-non-tilt); role-based ACL (`AclService.requireRole`) exists but is unwired from routes (known v0 state, not a bug). Phase 4b implementation backlog scoped into 5 sub-phases. Smoke suite: 13 → 18 specs, all green. Phase 4b-1 (2026-05-18): cross-workspace isolation pins on brew-sessions — 7 new tests in `brewSessions.test.ts` (was 10, now 17) covering GET detail + PATCH date + DELETE + start/pause/stop with a second persona/workspace expecting 404 (not 200/403). Closes the audit's highest-signal gap. Phase 4b-2 (2026-05-18): inventory L2 from scratch — new `services/api/src/tests/inventory.test.ts` with 20 tests covering all 4 routes (GET list + POST + PATCH + DELETE) across 5 axes (happy / validation 400s / auth 401s / cross-workspace 404 / list filter). Phase 4b-3 (2026-05-18): brewday-settings L2 from scratch — new `services/api/src/tests/brewdaySettings.test.ts` with 9 tests covering both GET + PATCH routes (happy / PATCH round-trip / auth / cross-workspace isolation; pinned `settings: null` for fresh workspace AND explicit `notes: null` clear-on-PATCH behavior). Phase 4b-4 (2026-05-18): water compute-and-save + hub-summary L2 auth pins — appended sibling `describe` block to `services/api/src/tests/recipeWaterSettings.test.ts` with 8 explicit 401 assertions (4 routes × 2 unauth flavors) for the 4 endpoints that previously had L4-only coverage; pins the `requireActiveWorkspace` gate so a future regression removing it surfaces here even though L4 would still pass. Phase 4b-5 (2026-05-18): platform-admin gate pinned across all 12 platform routes — new `services/api/src/tests/platformAdminRoutes.test.ts` (27 tests) covers `platformAds.ts` (4 routes) + `platformRecipes.ts` (8 routes) with 12 × 401 `missing_session` + 12 × 403 `not_platform_admin` + 3 admin happy-paths. Admin user is provisioned by promoting a standard `createSessionForTestUser` user via direct `app.prisma.user.update({ isPlatformAdmin: true })` — the standard helper deliberately doesn't accept the flag to prevent accidental promotions in unrelated tests. Services/api test count: 162 → 233 across 40 files (+71 tests / +4 new files / +1 extended), all green. **Phase 5a (2026-05-18): `packages/verticals/brewery/core` L1 audit + gap-fix.** All function exports across the 4 source files (`gravity.js`, `units/units.js`, `units/rounding.js`, `water.js`) already covered with reasonable depth; gap-fix pinned the previously-untested `DEFAULT_MASH_TARGET_PH` constant (documented as coupled to the Prisma column default — silent-drift risk) via new `packages/verticals/brewery/core/src/water.test.js`, plus 6 behavioral-contract gaps via extensions to the 3 existing test files (negative-value passthrough on mass/volume, non-defensive contract of `litersToUsGallons` / `kgToLb`, strict-string unit matching, JS-spec half-rounding direction on negative `roundTo` inputs, `platoToSg` upper boundary at 100 plato + sub-1.0-SG behavior, `sgToPlato` extreme-SG passthrough). packages/verticals/brewery/core test count: 26 → 47 across 3 → 4 files. Audit also surfaced **Phase 5b**: `services/api/src/domain/waterCalc/*` ~1000 LoC of pure math/derivation across 4 substantial + 5 smaller files with no direct L1 unit tests; split into 5 sub-phases (5b-1 → 5b-5). **Phase 5b-1 (2026-05-18): stoichiometry + alkalinity primitives.** New `saltAdditions.test.ts` (24 tests) pins per-salt stoichiometry against Bru'n-Water-convention reference numerics (gypsum, CaCl2·2H2O, epsom, NaCl, NaHCO3 — all 5 salts × both ions verified at `toBeCloseTo(value, 1)` precision = 0.1 ppm), plus linearity (2x grams → 2x ppm), inverse volume scaling, multi-salt accumulation, breakdown shape invariants (per-ion sum = overall delta), and all 9 validation error paths. New `residualAlkalinity.test.ts` (17 tests) pins the 0.713 Ca + 0.588 Mg Kolbach coefficients, the clamp-to-zero on effective alkalinity, defaults-to-zero for missing Ca/Mg, all non-finite throw paths, and symmetry between the standalone helper and `effectiveAlkalinityPpmCaCO3FromCaMg`'s embedded calculation. **🎉 Phase 5b-5 (2026-05-18): overall + mashPhEstimate wrapper — closes the test-coverage hardening slice.** New `overall.test.ts` (20 tests) pins the bicarb ↔ alkalinity unit-conversion factors (50/61 + 61/50 + round-trip symmetry) + `deriveBicarbonatePpmFromAlkalinityPpmCaCO3` clamp-to-zero (brewing reporting contract) + `combineAfterSaltsAndAcid` composition contract (Ca/Mg/Na unchanged; sulfate + chloride get acid-step deltas added; **bicarbonate is OVERWRITTEN by acidResult.finalAlkalinity, NOT propagated from afterSalts.bicarbonate** — the most subtle invariant in the surface). New `mashPhEstimate.test.ts` (3 tests) pins the 16-LoC wrapper-forwards-verbatim contract via deep-equal comparison with mashPhEstimateV1 + identical error propagation. services/api: 233 → 400 tests across 40 → 49 files (+167 tests / +9 new files across the entire test-coverage hardening pass; project was at 162 tests when the pass started on 2026-05-17). Every non-trivial waterCalc file (9 of 9) now has direct L1 unit tests. Only Phase 4d (deferred role-based ACL coverage) remains, gated on the ACL-wiring architectural decision. | [`docs/TESTING.md`](TESTING.md) → "Coverage audit + hardening pass" + "Phase 5a `packages/verticals/brewery/core` audit + gap-fix" + "Phase 5b implementation backlog" |
| **Documentation hardening** — module READMEs (`packages/*/README.md`, `services/api/README.md`, `apps/{web,native}/README.md`) audited for public-flip quality; "describe" rather than "stub". Currently uneven (some packages have rich READMEs, others have stubs or none). | 🟡 **Not started.** No dedicated tracker. The `docs/README.md` index is up to date but module-local docs are not. | — |

The "Phase 7" runtime-validation library question ([`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)) is a separate architectural decision adjacent to all four slices — it has its own per-criterion audit cadence and is currently re-confirmed as deferred (audit log convention introduced 2026-05-16).

When picking the next slice, the cheapest-bug-catching-per-hour ranking (informed by what HIGH-full's side effects revealed) is roughly:

1. **Test-coverage hardening (L4 + L5 gaps).** 🎉 **COMPLETE for all non-deferred phases.** Phase 4 + Phase 5a + all 5 Phase 5b sub-phases shipped. HIGH-full demonstrated that the lint promotion caught 2 latent bugs that should have been caught by tests. Prefer adding the missing tests over relying on lint to surface future similar drift. Phase 1 (L1 parser coverage), Phase 2 (L4 snapshots), Phase 3a + 3b (L5 regression pins), Phase 4a (L2 route surface audit), **all 5 Phase 4b sub-phases (4b-1 through 4b-5)**, **Phase 5a (`packages/verticals/brewery/core` L1 audit + gap-fix)**, and **Phase 5b-1 (waterCalc L1 for `saltAdditions` + `residualAlkalinity`)** all landed 2026-05-17/18. **Both HIGH-full-surfaced latent bugs are regression-pinned; the audit's full Phase 4b gap-fix backlog is closed (162 → 274 services/api tests across 30 → 42 files in 2 days); packages/verticals/brewery/core is fully L1-pinned at the function and constant level (26 → 47 tests); the first ~245 LoC of the waterCalc surface (`saltAdditions.ts` + `residualAlkalinity.ts`) now has direct L1 unit-test coverage with literature-comparable reference numerics.** Remaining (deferred only): Phase 4d (role-based ACL coverage, gated on `AclService.requireRole` wiring decision). Tracked in [`docs/TESTING.md`](TESTING.md). The remaining `integrationsGeneric.ts` non-Tilt branches (5 routes) are unscheduled — lower priority because that surface is auth-gated proxying to external integrations, not workspace-scoped writable data.
2. **TypeScript hardening (Tamagui shorthand baselines).** ~610 cumulative `tsc` errors across the three first-party workspaces. Most are Tamagui-shorthand-related (per `docs/TAMAGUI.md` caveat 2) and would benefit from a coordinated Tamagui adapter prop-typing project — but that's larger scope. Bounded version: address the non-Tamagui `tsc` errors first (the Prisma raw-query and AI-tool-result typing in services/api), which are more straightforward type-discipline work.
3. **Documentation hardening.** Highest variance in effort estimate (depends on how many module READMEs need to be written from scratch vs polished). Lowest urgency per-bug-catch but most visible to a public-flip first-impression reader.
4. **Phase 7 (Zod migration).** Currently deferred per audit; only re-engages if a trigger criterion fires. See `docs/CONTRACTS-VALIDATION-STRATEGY.md` § Audit log.

None of slices 1-3 are blocking. Pick based on the bottleneck you're feeling most acutely at the time.

---

## How to run locally

ESLint runs inside a `node:20-slim` container (per the no-npm-on-host policy):

```bash
# From repo root — full repo lint
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint"
```

CI runs the same `npm run lint` step — there is no separate strict gate. With all type-aware rules at `error` (HIGH-full Phase 5c), any new violation fails CI as an error. The previous `npm run lint:packages-strict` (`--max-warnings 0` on `packages/**`) was dropped in Phase 5d as redundant.

For a focused path (much faster iteration):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && \
            npx eslint packages/platform/ui/src/ai/"
```

Auto-fix safe issues (mostly unused `eslint-disable` directives):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint -- --fix"
```

---

## Recommended editor configuration

When working in this repo, copy `.vscode/settings.json.example` to `.vscode/settings.json` (gitignored — your local copy is yours to tweak). The example pins three settings that matter:

1. **`eslint.options.overrideConfigFile: "eslint.config.editor.mjs"`** — points the Cursor / VS Code ESLint extension at the editor-only config (mitigation **C** of the Phase 5 prerequisite stack). The editor config derives from production but strips the 12 type-aware rules (the 7 promise rules + the 5 `no-unsafe-*` rules) and the `parserOptions.projectService` block that drives the cost. Full inline-feedback rules stay enabled (`no-explicit-any: error`, `no-unused-vars: error`, `react-hooks/exhaustive-deps: error`, `jsx-a11y/recommended`, the cross-platform UI primitives guardrail, etc.) — about ~95% of catch-on-save value, at ~7s wall instead of ~42s.

2. **`eslint.run: "onSave"`** — lint on save, not on every keystroke. Drops typing latency to zero and matches CI's actual gate (lint runs once per commit).

3. **`editor.codeActionsOnSave.source.fixAll.eslint: "explicit"`** — auto-fix runs only when you explicitly invoke it (command palette → "ESLint: Fix all auto-fixable Problems"), never silently on save. **`true` is forbidden by the plugin-shipped `23a-eslint-fixall-discipline.mdc` rule** (cursor rule mitigation **E**, delivered by `umbraculum-node-react-cursor-assistant`). If that `alwaysApply` rule is observed not being enforced in Cursor, copy it from the plugin install path into repo-local `.cursor/rules/` as the troubleshooting fallback documented in `AGENTS.md`.

### Why this matters

`eslint.config.mjs` enables 12 type-aware rules. Type-aware rules require ESLint to load the full TypeScript program for each lint pass:

- **In CI:** ~42s wall. Acceptable; the `web-lint.yml` workflow has a 10-min budget and the lint phase fits comfortably inside it.
- **In the editor (no override):** every save reloads the TS program. Inline lint feedback goes from instant to ~3-5s; ESLint-server RAM grows by several hundred MB; on large workspaces, contributors disable inline lint, and the production rule loses real-world enforcement.
- **Worse:** `source.fixAll.eslint: true` (a default many contributors carry over from previous projects) lets the typescript-eslint auto-fixer **silently strip `eslint-disable` directives** that look "unused" against a transient rule state, and **rewrite type assertions** in ways that break `tsc --noEmit`. HIGH-full Phase 1 lost ~17 disable comments and 11 files to that pattern before we caught it. The risk is highest for AI-mediated edits where the auto-fixer runs implicitly between agent turns.

The mitigation stack landed in HIGH-full Phase 5a/5b consists of four pieces:

| ID | What | Where it lives | Status |
|----|------|----------------|--------|
| **C** | `eslint.config.editor.mjs` (editor-only ESLint config that strips type-aware rules and `projectService`) | This repo, root | ✅ landed Phase 5a |
| **A** | `.vscode/settings.json.example` (recommended workspace settings) | This repo, `.vscode/` (gitignored carve-out) | ✅ landed Phase 5a |
| **E** | `23a-eslint-fixall-discipline.mdc` cursor rule (forbids `source.fixAll.eslint: true`, requires the editor-config split when present) | `umbraculum-node-react-cursor-assistant` plugin (`rules/23a-eslint-fixall-discipline.mdc`); repo-local `.cursor/rules/` is fallback-only if plugin `alwaysApply` enforcement fails | ✅ shipped via plugin pack |
| **F** | This section + the cross-link from the Phase 5 prerequisite section above | This repo, `docs/LINTING.md` | ✅ landed Phase 5b |

Mitigations B (an EditorConfig-only delta) and G (a forced `eslint.options.workingDirectories` override) were considered and skipped — they don't add value beyond what C+A+E+F deliver. D (ESLint Daemon) is opt-in for contributors who want even faster inline feedback; it's not part of the recommended baseline.

### Troubleshooting

**Symptom:** ESLint inline feedback is slow / RAM usage is high in this repo.
**Fix:** Confirm `.vscode/settings.json` exists locally and contains the `eslint.options.overrideConfigFile: "eslint.config.editor.mjs"` line from the example. Without it, the extension defaults to `eslint.config.mjs` and pays the full type-aware cost.

**Symptom:** The editor flags an `eslint-disable-next-line @typescript-eslint/no-unsafe-*` directive as "Unused eslint-disable directive".
**Fix:** Pull latest — the editor config has a `linterOptions.reportUnusedDisableDirectives: "off"` block that suppresses these (the rules are stripped in the editor config, so the directives look "unused" to it, but they ARE used in CI). If the warning persists after pull, check that the editor extension is actually using `eslint.config.editor.mjs` and not the production config.

**Symptom:** I want to see all the type-aware warnings the editor would normally hide (e.g. before a PR).
**Fix:** Run `npm run lint` in a terminal — that uses the production `eslint.config.mjs` and shows every rule. Do not flip `eslint.options.overrideConfigFile` in your settings to bypass — that re-introduces the auto-fix-overreach risk.

---

## CI

The `.github/workflows/web-lint.yml` workflow runs a single ESLint invocation on every PR that touches `apps/web/**`, `apps/native/**`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`:

- **`npm run lint`** — full repo. Errors block CI. Since HIGH-full Phase 5c (2026-05-16) all 12 type-aware rules + `no-explicit-any` + `no-unused-vars` are at `error`, so any new violation fails the build. The lone `no-empty-object-type` straggler was promoted to `error` in 5f housekeeping the same day (with the Tamagui-friendly `with-single-extends` allowance preserved); no warning-level rules remain.

Runs inside a `node:20-slim` container to mirror the CI environment exactly. The historical `npm run lint:packages-strict` second step was dropped in Phase 5d (now redundant since the main `lint` is the strict gate).

### CI heap budget

The workflow passes `NODE_OPTIONS=--max-old-space-size=6144` to the node:20-slim container. Surfaced 2026-05-19 after the sub-plan #9 slot-4 push (commit `bd7d147`) produced the first CI run to OOM the type-aware ESLint parser with the default v8 heap (~4 GB):

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
Aborted (core dumped)
Error: Process completed with exit code 134.
```

**Root cause is monotonic monorepo growth, not a code defect.** `eslint.config.mjs` runs the type-aware parser repo-wide (`parserOptions.projectService` with `tsconfigRootDir` set to the repo root), which loads the entire TypeScript project graph (`services/api/**` + `apps/web/**` + `apps/native/**` + every `packages/*/`) into a single node process — plus rule contexts for all 12 type-aware rules (`no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`, `prefer-promise-reject-errors`, `no-implied-eval`, `only-throw-error`, and the five `no-unsafe-*` for the api + web + native scopes). Default v8 old-generation cap (~4 GB) was sufficient at HIGH-full Phase 5 (May 16) but exceeded by sub-plan #9 slot 4 (May 19).

**Why local doesn't hit it:** local editors use `eslint.config.editor.mjs`, which strips the type-aware rules from IDE-level lint (per Phase 5a). When running `npm run lint` locally outside the container, the host machine isn't constrained by node:20-slim's container memory envelope.

**Why 6 GB:** GitHub-hosted `ubuntu-latest` runners ship with 7 GB RAM, so a 6 GB v8 old-generation cap leaves enough headroom for the node runtime + npm + ESLint scaffolding. Re-evaluate the cap if the type-checked file count per package crosses ~100 on average.

**Local fix (if your dev machine starts hitting this):** export the same `NODE_OPTIONS` before running `npm run lint` — `NODE_OPTIONS='--max-old-space-size=6144' npm run lint`. The CI bump is the canonical anchor; copy it locally as needed.

---

## Adding a new rule

1. Decide whether the rule applies project-wide or to a specific glob (e.g. only TSX, only test files, only the AI cross-platform folder). Use a per-glob override in `eslint.config.mjs`.
2. **Land warnings as `warn` first.** Only promote to `error` after all pre-existing violations are fixed, otherwise CI breaks for reasons unrelated to the PR introducing the rule.
3. Document the rule's intent in a comment block in `eslint.config.mjs` — this file is also documentation, and a future contributor needs to understand *why* before they're asked to obey.
4. Update this doc (the value/cost table + TL;DR row at minimum).

### Flat-config gotcha — order matters

`eslint.config.mjs` uses ESLint's flat-config format. **Later blocks override earlier blocks for matching files.** Specifically:

- Project-wide rule tweaks (no `files:` predicate) MUST appear *before* any file-glob override blocks. Otherwise the project-wide rules will re-enable rules that file-glob blocks tried to disable.
- This was a real bug in the Medium-scope landing — the test override (`files: ["**/tests/**"]` → `no-explicit-any: off`) was being overridden by a project-wide block that came after it. Fix landed in HIGH-light.

---

## Silencing a violation

Pre-existing violations should be silenced inline rather than by disabling the rule globally. The required pattern:

```ts
// eslint-disable-next-line <rule-name> -- <brief reason, link to tracking issue/commit/doc if applicable>
const offendingLine = …;
```

The `-- <reason>` is mandatory in this repo — silent `eslint-disable-next-line` directives without a reason are not acceptable and will be asked to be expanded in code review.

**Note:** unused/redundant `eslint-disable-next-line` directives are automatically flagged by ESLint (`reportUnusedDisableDirectives` is enabled in the base config). `npm run lint -- --fix` will remove them.

Where the violation is structurally impossible to fix in the current PR (e.g. would change behavior, requires migrating a dependency), open a tracking issue and reference it in the comment:

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect; tracked in #1234.
useEffect(() => { /* ... */ }, []);
```

---

## Tamagui interaction

A large fraction of `any` warnings (and the future-HIGH-full `no-unsafe-*` violations) come from interactions with Tamagui's loose prop types. Before triaging Tamagui-adjacent warnings, read `docs/TAMAGUI.md` for the project's adaptation strategy and known upstream issues. Don't burn time fixing what is fundamentally a Tamagui type-system gap.

---

## Known structural follow-ups

Items that are not bugs in the current configuration but that, if addressed, would simplify the config or remove a class of recurring drift. None of these block CI today; they are tracked here so the next contributor who touches the relevant area can absorb the fix opportunistically rather than re-discovering the context.

### `allowDefaultProject` — drain the last 5 holdouts

After commit `0885854` (2026-05-25) the `parserOptions.projectService.allowDefaultProject` list in `eslint.config.mjs` was trimmed from 12 entries → 5 entries by extending the owning `tsconfig.json`'s `include` array for 5 packages, dropping matched files from 10 → 5 (well under typescript-eslint's hard ceiling of 8). The 5 remaining holdouts are kept on `allowDefaultProject` because the corresponding tsconfig surgery would be a structural change beyond a lint hotfix. Closing them would empty the allowlist entirely and remove the 8-file ceiling as a recurring trip-hazard.

Background — the ceiling exists because the default project re-parses files per-rule per-lint-pass, so wide globs there are a documented perf footgun; the bump-the-limit parameter is named `maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING` to discourage that escape. See `https://tseslint.com/allowdefaultproject-glob-too-wide` and the inline comment in `eslint.config.mjs` for the convention.

| Holdout | Why stuck | Fix shape | Effort |
|---|---|---|---|
| `services/api/vitest.config.ts` | `services/api/tsconfig.json` is the build config (`rootDir: "src"`, no `noEmit`); adding a root-level file to `include` trips TS6059 in the `typecheck` CI job. | Split into `services/api/tsconfig.json` (lint/typecheck, no-emit, `include: ["src/**/*.ts", "vitest.config.ts"]`) + `services/api/tsconfig.build.json` (the current shape, build-only). Match the pattern already used by `packages/platform/contracts/` and siblings. | Small — one new file + a `tsc` invocation update if `services/api`'s build script references the existing tsconfig directly. |
| `packages/verticals/brewery/beerjson/vitest.config.ts` | Same as above — `packages/verticals/brewery/beerjson/tsconfig.json` is the build config (`rootDir: "src"`, `outDir: "dist"`, `declaration: true`, no `noEmit`). | Same split pattern. `packages/verticals/brewery/beerjson/tsconfig.build.json` already exists; the work is moving the build-only fields into it and leaving `tsconfig.json` as the no-emit lint/typecheck config. | Small — `tsconfig.build.json` exists, so this is mostly a reshuffle. |
| `packages/verticals/brewery/core/vitest.config.ts` | `packages/verticals/brewery/core/` has no `tsconfig.json` at all (structural gap). | Create `packages/verticals/brewery/core/tsconfig.json` with `include: ["src/**/*.ts", "vitest.config.ts"]` matching the `packages/platform/contracts/` shape. | Small — single new file. |
| `packages/verticals/brewery/core/src/index.d.ts` | Same gap as above; no `packages/verticals/brewery/core/tsconfig.json`. | Covered by the same new tsconfig (`"src/**/*.ts"` glob matches `.d.ts`). | Same fix as the row above. |
| `scripts/check-web-url-segments.ts` | `scripts/` has no `tsconfig.json`. Any future `scripts/*.ts` would also need an allowlist entry. | Create `scripts/tsconfig.json` with `include: ["**/*.ts"]` (lint + typecheck only; scripts run via `tsx`, not compiled). | Small — single new file, and it future-proofs against the next ad-hoc script. |

Closing all five would let `eslint.config.mjs` drop the `allowDefaultProject` key entirely. At that point the 8-file ceiling becomes a non-issue, the type-aware parser is bound to a real tsconfig project for every TS file in the repo, and the comment block explaining the escape-hatch convention can shrink to a one-liner.

History — the original drift surfaced 2026-05-25 across two CI failures:

- Commit `47f4a16` cleared the first one (one unused-variable bug + two missing allowlist entries) but bumped the list to 10 entries, tripping the throttle on the next CI run.
- Commit `0885854` cleared the throttle by the tsconfig-include approach, leaving the 5 holdouts above and adding the convention comment to `eslint.config.mjs`.

---

## Related

- `docs/TAMAGUI.md` — Tamagui type-system caveats and our adaptation strategy.
- `docs/TESTING.md` — test layer map (unit / integration / contract / Playwright). Lint complements but does not replace tests.
- `docs/PLATFORM-ARCHITECTURE.md` — broader architectural context, especially §10.1.1 (go-public path) where public-quality lint hygiene is part of the pre-flip checklist.
- `docs/ROADMAP.md` — milestone alignment; HIGH-full landed ahead of the July 2026 public-alpha window.
- `packages/platform/ui/README.md` — `@umbraculum/ui` package overview, including the platform-forking primitives that the cross-platform import guardrail references.
