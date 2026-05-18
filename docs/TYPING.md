# Typing (TypeScript)

**Tier:** Public
**Status:** v0.6 — **Phase 1 audit + Phase 2 methodology correction + Phase 3a test-authoring remediation + Phase 3b production-code remediation + Phase 4 apps/web typecheck infrastructure + Phase 5 per-workspace CI typecheck gate all landed 2026-05-18.** Baselined `tsc --noEmit` across all 15 workspaces (14 TS workspaces + the JS-only `packages/core`); piloted 4 candidate stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) in 8 clean workspaces to size the rollout cost. **Phase 3b fixed the remaining 14 services/api production-code errors across 4 issue classes**: (A) Prisma `Json` column typing in `brewdaySettingsService.ts` + `inventoryService.ts` (5 cast sites, using `Prisma.InputJsonValue` for set/update and `Prisma.DbNull` to preserve runtime "clear to SQL NULL" semantics for inventory metadata); (B) Prisma `Where` clause unification in `routes/ingredients.ts` (3 routes — fermentables, hops, yeasts — refactored from spread-based literals with `as const` to explicit `AND: Prisma.<Entity>WhereInput[]` composition; **this also fixed a latent cross-workspace data-leak bug** — the original spread silently overwrote the workspace-scoping `OR` with the search-query `OR` whenever both `activeWorkspaceId` AND `q` were present, exposing all workspaces' rows to search); (C) transaction-lambda de-narrowing in `brewSessionsService.ts` (`addStepTimerDeltaSeconds` parameter retyped from `PrismaClient` to `Prisma.TransactionClient`); (D) `UnitConversionWarningV1` shape mismatch in `recipesImportService.ts` (replaced 2 lying `as Array<{ code; message }>` casts with real `.map(w => ({ code, message: \`${path}: ${fromUnit} → ${toUnit}\` }))` projections that produce a meaningful user-facing message). All 400 services/api vitest tests still pass; `services/api` `tsc --noEmit` drops 14 → **0**. **Phase 4 (same day)** wired `apps/web`'s typecheck infrastructure: added `"typecheck": "tsc -p tsconfig.json --noEmit"` to `apps/web/package.json` (apps/web was 1 of 2 TS workspaces missing this script; the other was `apps/web/e2e`, addressed in Phase 5); verified `npm run typecheck` reproduces the canonical 585 baseline under the one-off `node:20-slim` + `/repo/node_modules` method; and **made the apps/web accept-vs-fix decision explicit** — keep [`docs/TAMAGUI.md`](TAMAGUI.md)'s accept-and-document position (the 585 errors are all in the Tamagui shorthand-prop / theme-token class); do NOT gate `apps/web` in the Phase 5 CI workflow; re-evaluate only if (i) Tamagui upstream ships better shorthand typing in a future major, (ii) a non-Tamagui type-error class accumulates inside the 585 count where it would hide in the noise, or (iii) the wrapper-primitive cost-benefit shifts (see TAMAGUI.md §"When to revisit"). TAMAGUI.md reports 590 errors in apps/web; canonical measurement is 585; within the 1% tolerance TAMAGUI.md itself uses, so no update to TAMAGUI.md is required this cycle. **Phase 5 (same day)** added `.github/workflows/typecheck.yml` — a single-job GitHub Actions workflow that runs `tsc --noEmit` across the 13 currently-clean workspaces inside one `node:20-slim` container (matching the canonical measurement method). The workflow uses sequential per-workspace invocations under `set +e` with explicit pass/fail aggregation, so all 13 results are reported even if early workspaces fail (avoids the "first failure masks the rest" debugging pain). Triggered on push/PR to `master` when any of `apps/native/**`, `apps/web/e2e/**`, `services/api/**`, `packages/**`, `**/tsconfig*.json`, or root `package.json`/`package-lock.json` changes. apps/web + packages/ui are explicitly excluded (Tamagui-accepted cost per Phase 4 decision). `apps/web/e2e` previously lacked a `typecheck` npm script — added in this phase so all 12 of the npm-workspace targets use uniform `npm run typecheck`. `services/api/prisma` is the one non-npm-workspace target (only a tsconfig, no package.json), invoked via direct `tsc -p tsconfig.json --noEmit`. Local simulation of the workflow against all 13 workspaces: clean, ~33s wall (well under the 15-min CI timeout). With the Phase 5 gate in place, the prior `apps/native` CI gate via `.github/workflows/native-deps.yml` is now redundant for the typecheck dimension; left in place for now (it also runs `expo install --check`, which is the unrelated dependency-alignment gate). Findings (canonical method — see [Methodology](#methodology) below): **2 workspaces still fail `tsc --noEmit` on `main`** (apps/web 585, packages/ui 25; total 610 errors, all in the Tamagui-accepted class per [`docs/TAMAGUI.md`](TAMAGUI.md)), **13 workspaces are clean** (apps/native, apps/web/e2e, services/api, services/api/prisma, packages/api-client, packages/beerjson, packages/contracts, packages/test-mcp, packages/i18n, packages/i18n-react, packages/media, packages/navigation, packages/recipes-ui). The remaining 610 errors are NOT real debt — they're the documented Tamagui shorthand-prop and theme-token cost. Sub-phases 5–6 below are scoped to (a) add the per-workspace CI typecheck gate for the 13 clean workspaces and (b) roll out stricter flags one at a time across the monorepo. **Phase 2 correction note**: v0.1 of this doc (initial commit `6f3c2cc`) reported 5 failing workspaces and 1103 errors; that count was inflated by inconsistent measurement methodology — `packages/beerjson` (was 1) and `packages/contracts` (was 5) were measured via the `web` container where `/packages/node_modules` is symlinked to `apps/web`'s deps (no `vitest`), and `apps/web` (was 1062) included stale `.next/types/*.ts` declarations from a prior dev-server build. The canonical method now uses a one-off `node:20-slim` container + monorepo-root hoisted `/repo/node_modules` (same as the existing `apps/native` CI gate), which is reproducible and matches CI conditions.
**Audience:** maintainers, contributors, anyone authoring TypeScript code in this repo
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (already documents the dominant apps/web + packages/ui type-error class — Tamagui shorthand props and theme tokens; accepted cost), `docs/TESTING.md` (the SoT for the testing layers), `docs/LINTING.md` (the SoT for ESLint; the ESLint slice already eliminated the explicit-`any` and unsafe-`any` classes that TypeScript was leaking through), `docs/ROADMAP.md` (the foundation-hardening pass ahead of the H1 2027 public-AGPLv3 flip), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — runtime-validation library decision; orthogonal to compile-time strictness but tracked together).

---

## TL;DR

| What | State |
|---|---|
| `strict: true` set across all 14 TS workspaces | ✅ |
| Stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) | ❌ Not set anywhere. Phase-6 sub-phases will enable them one-at-a-time after baselines are green. |
| `tsc --noEmit` passes per-workspace | 🟡 13 of 15 workspaces green; 2 failing (610 errors total, all Tamagui-noise — was 624 before Phase 3b). See [Per-workspace baseline](#per-workspace-baseline). |
| `tsc --noEmit` enforced in CI | ✅ All 13 currently-clean workspaces are gated by `.github/workflows/typecheck.yml` (Phase 5, 2026-05-18). `apps/web` is OUT by explicit Phase 4 decision (585 errors are Tamagui-accepted cost per TAMAGUI.md). `packages/ui` is OUT for the same reason (25 errors). |
| `apps/web` has a `typecheck` npm script | ✅ Added in Phase 4 (2026-05-18) — `tsc -p tsconfig.json --noEmit`; reproduces the canonical 585 baseline. |
| Existing `any` / `as any` / `@ts-expect-error` budget | ~17 `: any` annotations + ~58 `as any` casts + 5 `@ts-expect-error` markers, almost entirely in tests. The ESLint HIGH-full slice already eliminated explicit-`any` in source via `no-explicit-any: error`. |

---

## Why types-hardening exists in this repo

The ESLint slice ([`docs/LINTING.md`](LINTING.md)) caught the bug classes that TypeScript will never see (stale `useEffect` closures, raw Tamagui leaking RN a11y props to the DOM, `no-floating-promises` discipline, etc.). The test-coverage slice ([`docs/TESTING.md`](TESTING.md)) catches behavioral regressions at runtime across 5 layers (L1 unit through L5 Playwright). Types-hardening fills the third corner of the bug-prevention foundation: **the compile-time class of bugs that lint can't see and tests can't reach** — most notably, index-out-of-bounds (`arr[i]` returns `T`, but `arr[i]` might be `undefined`), `Map.get()` returning `undefined`, the `foo?: T` vs `foo: T | undefined` distinction (which silently swallows "I forgot to pass this" bugs), and accidental method-name collisions in class hierarchies.

`strict: true` is already on across all 14 TS workspaces — that's the floor. The high-yield next-class flags are off:

- `noUncheckedIndexedAccess` — forces `T[]` index access and `Map.get()` returns to be `T | undefined`. Highest-value flag for the next bug class; catches a category of latent crash that L1 unit tests typically don't exercise.
- `exactOptionalPropertyTypes` — pins the `foo?: T` vs `foo: T | undefined` distinction. Matters for Prisma DTOs and contract parsers where "absent" and "explicitly undefined" should mean different things.
- `noPropertyAccessFromIndexSignature` — forces `obj['key']` (not `obj.key`) for index-signature properties; catches accidental dotted-access on untyped keys.
- `noImplicitOverride` — requires the `override` keyword on subclass methods; catches accidental name collisions.

The headline cost of these flags **is not** the count of new errors they introduce (the pilot data below shows that count is small — 5 errors in apps/native for `noUncheckedIndexedAccess`, 0 across 7 other clean workspaces). The headline cost is the **5 existing failing baselines** that need to be brought to green first.

---

## Methodology

`tsc --noEmit` baseline measurements are **sensitive to which `node_modules` tree TypeScript resolves from**. The dev environment uses three different trees:

1. **Long-running `web` container**: `/packages/node_modules` is a symlink to `apps/web`'s `node_modules` (set up at container startup per [`DEVELOPMENT-LOCAL.md`](../DEVELOPMENT-LOCAL.md) lines 122–124). Packages that aren't in `apps/web`'s dependency tree (e.g. `vitest`, which only `services/api` + the test-specific packages depend on) are not resolvable from here.
2. **Long-running `api` container**: bind-mounts `services/api/node_modules` directly. Includes Prisma client generated in-container, which may differ from the host's view.
3. **One-off `node:20-slim` container**: mounts the entire repo at `/repo` and uses the **monorepo-root hoisted `/repo/node_modules`** (npm workspaces install). This is what `apps/native`'s CI gate uses (`.github/workflows/native-deps.yml`), and it's reproducible across machines because the lockfile pins the hoisted tree.

**The canonical baseline method for this slice is #3** — one-off `node:20-slim` container + `/repo/node_modules/.bin/tsc` — because (a) it's reproducible, (b) it matches CI conditions, (c) it's symmetric across all workspaces (no per-workspace tooling difference), and (d) it's the method the existing `apps/native` CI gate already uses, so a future `typecheck` workflow can match it directly.

The v0.1 of this doc (commit `6f3c2cc`) measured `apps/web` from the `web` container (1062 errors — included stale `.next/types/*.ts` from prior dev-server builds; the Next.js plugin populates these at build time and `tsc` picks them up); `packages/beerjson` + `packages/contracts` from the `web` container's `/packages/*` path (1 + 5 errors — none of which exist when measured canonically because `vitest` is resolvable from `/repo/node_modules`); and `packages/ui` similarly inflated by 3 `victory-native` resolution errors. **v0.2 reports the canonical numbers and is the source-of-truth from here on.**

To reproduce a baseline measurement:

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/<workspace>
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit
'
```

---

## Per-workspace baseline (2026-05-18, post-Phase-3b canonical)

Measured via the canonical method above. All workspaces have `strict: true` already.

### Failing baselines (2 workspaces, 610 errors — all in the Tamagui-accepted class)

| Workspace | Errors | Runtime | Primary cause |
|---|---:|---:|---|
| `apps/web` | **585** | ~2.6s | Tamagui shorthand props (`mt`, `bg`, `w`, `p`, `items`, `minW`, etc.) — already documented in [`docs/TAMAGUI.md`](TAMAGUI.md) §"Caveat 2: Shorthand props" as accepted cost. TAMAGUI.md previously reported 590 errors here; the canonical count is within 1% of that documented number. Spread across ~30 files. |
| `packages/ui` | **25** | ~4.7s | Tamagui shorthand props (`marginTop`, `gap`) + Tamagui `ThemeName "alt2"` (theme-token caveat from TAMAGUI.md §"Caveat 1"). All errors are in the Tamagui-accepted class. |

### Clean baselines (13 workspaces)

| Workspace | Errors | Runtime |
|---|---:|---:|
| `apps/native` | 0 | ~4.9s |
| `apps/web/e2e` | 0 | ~1.5s |
| `services/api` | **0** (was 14 pre-Phase-3b) | ~7.9s |
| `services/api/prisma` | 0 | ~2.5s |
| `packages/api-client` | 0 | ~1.5s |
| `packages/beerjson` | 0 | ~1.9s |
| `packages/contracts` | 0 | ~1.8s |
| `packages/i18n` | 0 | ~1.4s |
| `packages/i18n-react` | 0 | ~1.5s |
| `packages/media` | 0 | ~1.5s |
| `packages/navigation` | 0 | ~2.4s |
| `packages/recipes-ui` | 0 | ~3.8s |
| `packages/test-mcp` | 0 | ~1.8s |

`packages/core` is intentionally JavaScript-only (no `tsconfig.json`); it has its own L1 vitest coverage ([`docs/TESTING.md`](TESTING.md) Phase 5a) and is consumed as `.js`. Not in scope for `tsc --noEmit` gating.

**Total cumulative runtime (sequential):** ~42s for all 14 workspaces. Parallel (e.g. via `npm run --workspaces typecheck`): ~8s wall (bounded by the slowest — services/api at ~7.9s). This is well below the ~42s CI lint cost; acceptable as a CI gate once baselines are green.

### Side-finding 1: vitest's runtime laxness hides type errors that `tsc --noEmit` catches

Among the 19 `services/api` errors caught in the Phase 1 audit were 4 in test files I authored during the test-coverage hardening pass (`gravityAnalysis.test.ts:36`, `overall.test.ts:197+213`). These tests ran green under `npm run test` (all 400 tests across 49 files passed) because vitest's underlying transpiler (esbuild via vite) is **lenient by design** — it strips types without type-checking them. This was the first time they surfaced because `services/api` has no CI `typecheck` gate. Phase 3a fixed them; Phase 5 will add the gate.

This is a useful corollary finding: **the L1+L2 test layers are not a substitute for `tsc --noEmit`** — they catch behavioral regressions but not type contract drift. This is part of why the foundation-hardening pass has three slices (lint, tests, types) instead of two.

### Side-finding 2: Phase 3b uncovered a latent cross-workspace data-leak bug in `/ingredients/*` search

The Phase 3b Class-B refactor of `routes/ingredients.ts` (fixing Prisma `Where` clause type errors) surfaced a real silent bug: the original spread-based where construction layered two conditional `OR` keys in a single object literal:

```ts
const where = {
  deprecatedAt: null,
  ...(ctx.activeWorkspaceId ? { OR: [{ workspaceId: null }, { workspaceId: ctx.activeWorkspaceId }] } : { workspaceId: null }),
  ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, /* … */] } : {}),
} as const;
```

When both `activeWorkspaceId` AND `q` were present, the second `OR` (search) silently overwrote the first `OR` (workspace-scoping), so the resulting query was `{deprecatedAt: null, OR: [name/producer match across the entire table]}` — i.e. any workspace's rows could match. This affected all three routes (`/ingredients/fermentables`, `/ingredients/hops`, `/ingredients/yeasts`). The type-system was complaining about the structural shape but not the semantic bug; the refactor to `AND: Prisma.<Entity>WhereInput[]` composition fixes both. **This is a high-value type-hardening dividend** — exactly the kind of bug L1+L2 tests don't catch (they test a single workspace's listing, not the cross-workspace scoping under search) and that ESLint can't see (it's a correctness bug, not a code-smell). Type-driven refactors that surface real bugs are the strongest argument for the slice.

### Typecheck infrastructure today

- **CI gate (13 workspaces, since Phase 5)**: `.github/workflows/typecheck.yml` runs `tsc --noEmit` across 13 workspaces inside a single `node:20-slim` container (one `npm install` + sequential per-workspace `npm run typecheck`, with explicit pass/fail aggregation so all 13 results are reported even on early failure). Gated set: `services/api`, `services/api/prisma`, `apps/native`, `apps/web/e2e`, `packages/api-client`, `packages/beerjson`, `packages/contracts`, `packages/i18n`, `packages/i18n-react`, `packages/media`, `packages/navigation`, `packages/recipes-ui`, `packages/test-mcp`. Triggers on push/PR to `master` touching `apps/native/**`, `apps/web/e2e/**`, `services/api/**`, `packages/**`, `**/tsconfig*.json`, or root lockfiles. apps/web is OUT by explicit Phase 4 decision (TAMAGUI-accepted cost). packages/ui is OUT for the same reason. The prior `apps/native`-only gate (`.github/workflows/native-deps.yml`) remains because it also runs `expo install --check` (an unrelated dependency-alignment guardrail); its typecheck step is now redundant but harmless.
- **Workspaces with a `typecheck` npm script (14 of 14 TS workspaces — all wired)**: `services/api`, `apps/native`, `apps/web` (Phase 4), `apps/web/e2e` (Phase 5), `packages/api-client`, `packages/beerjson`, `packages/contracts`, `packages/i18n`, `packages/i18n-react`, `packages/media`, `packages/navigation`, `packages/recipes-ui`, `packages/ui`, `packages/test-mcp`. Convention: `"typecheck": "tsc -p tsconfig.json --noEmit"`.
- **Non-npm-workspace targets**: `services/api/prisma` has a tsconfig but no `package.json` (only `seed.ts`); invoked directly via `tsc -p tsconfig.json --noEmit` inside the workflow.

---

## Candidate stricter flags — pilot results (2026-05-18)

Inline-piloted each flag against 8 clean workspaces (1 large: `apps/native`; 7 small: `apps/web/e2e`, `packages/media`, `packages/i18n`, `packages/i18n-react`, `packages/api-client`, `packages/navigation`, `packages/recipes-ui`). Method: `tsc -p tsconfig.json --noEmit --<flag>` (no file mutation, just CLI override). Counts are NEW errors beyond the (zero) baseline.

| Flag | apps/native | apps/web/e2e | packages/media | packages/i18n | packages/i18n-react | packages/api-client | packages/navigation | packages/recipes-ui | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `noUncheckedIndexedAccess` | **5** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** |
| `exactOptionalPropertyTypes` | **6** | 0 | 0 | 0 | 0 | **3** | 0 | **3** | **12** |
| `noPropertyAccessFromIndexSignature` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `noImplicitOverride` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

### Reading the pilot

- **`noUncheckedIndexedAccess`** — the 5 new errors in `apps/native` are real latent bugs (not test-only friction):
  - `src/screens/FermDataIntegrationScreen.tsx` lines 129, 131 — `arr[idx]` indexing without an undefined check.
  - `src/screens/WaterMashScreen.tsx` lines 629, 673, 674 — same pattern in mash-step row access (`row` possibly undefined, `EditorMashStep | undefined` assigned to `EditorMashStep`).
  - These are exactly the bug class the flag is designed to catch — likely TODO when first written, now formalizable.
- **`exactOptionalPropertyTypes`** — 12 new errors, with a distinctive friction signature: most are `Partial<T>` argument shape mismatches (`TS2379`), e.g. `Partial<EditorGristRow>` requires every optional field to be present or omitted, but the call site passes `{ ingredientId: undefined }` (explicit-undefined, which the flag now rejects). This is real value — it forces a discipline distinction — but the cleanup is not trivial (each call site needs either a `delete`+spread pattern or a destination-type tweak from `field?: T` to `field?: T | undefined`).
- **`noPropertyAccessFromIndexSignature`** + **`noImplicitOverride`** — essentially free across all 8 clean workspaces. Likely free across the failing 5 too (once those are green). Strong candidates for an early, low-cost sub-phase.

The pilot **does not** measure the failing 5 workspaces — adding a stricter flag on top of an already-failing baseline is noise. Phase 2–4 (bringing the 5 baselines green) is a hard prerequisite for the Phase 6 flag rollout.

---

## Bounded sub-phase plan

Mirroring the test-coverage and lint phase logs: one PR per sub-phase, single-purpose commits, doc + status-banner updates per sub-phase.

| Phase | Scope | Estimated cost | Blocks |
|---|---|---|---|
| **1 — Audit + baseline + SoT doc** (THIS doc) | Inventory `tsc --noEmit` per workspace; pilot 4 candidate flags; publish this doc. **✅ Landed 2026-05-18** (commit `6f3c2cc`). | 1 session | — |
| **2 — Methodology correction + canonical re-baseline** | The v0.1 baseline mixed measurement methods across workspaces (long-running `web`/`api` container vs. one-off `node:20-slim`). v0.2 standardizes on the one-off-container method (same as `apps/native`'s CI gate) and republishes correct numbers: failing workspaces 5 → **3**, total errors 1103 → **629**. Originally-planned scope ("add `vitest` to `packages/beerjson` + `packages/contracts` tsconfig types") **CANCELLED** — those errors were measurement artifacts, not real type debt. **✅ Landed 2026-05-18.** | <1 session | Phase 3 (without correct baselines, Phase 3 scope estimates would be wrong) |
| **3a — Test-authoring remediation in services/api** | Fixed 5 errors I authored during the test-coverage hardening pass that vitest didn't catch because esbuild transpilation is lenient (no type-checking): (a) `gravityAnalysis.test.ts:36` (Phase 5b — `args.hops ?? [defaultHop]` union didn't carry the `form?` field; fixed by extracting a `TestHopInput` type alias used for both `args.hops` and `defaultHop`); (b) `gravityAnalysis.ts:548` (production code on the related early-return path — `buGuRatio: null` missing from the `GravityAnalysis` literal returned when `beerJsonRecipeJson` is absent; the second construction site on line 751 already passed `buGuRatio` correctly, this was a one-spot omission); (c) `overall.test.ts:197+213` (Phase 5b-5 — `SaltAdditionsResult` requires `baseProfile: IonProfilePpm`; my mocks missed it because the function being tested only reads `resultingProfile.bicarbonate`; fixed by adding self-consistent baseProfile values). All 400 services/api vitest tests still pass; services/api `tsc --noEmit` drops 19 → 14. **✅ Landed 2026-05-18.** | <1 session | Phase 5 (services/api CI gate; needs full green services/api baseline first) |
| **3b — Production-code remediation in services/api** | Fixed the remaining 14 errors across 4 issue classes: (A) Prisma JSON column typing — added `Prisma.InputJsonValue` casts on `sectionsJson`/`customSectionsJson`/`defaultStepsJson` in `brewdaySettingsService.ts` and on `metadataJson` (create + update paths) in `inventoryService.ts`; the update path also maps JS `null` → `Prisma.DbNull` to preserve the existing "clear to SQL NULL" runtime semantics (verified against `inventory.test.ts:189-210` which exercises the create-path null-clear behavior). (B) Prisma `Where` clause unification — refactored fermentables/hops/yeasts routes from spread-based `as const` literals to explicit `AND: Prisma.<Entity>WhereInput[]` composition. **Side-finding documented above**: this also fixed a latent cross-workspace search-leak bug where the q-OR silently overwrote the workspace-scoping OR. (C) Transaction-lambda de-narrowing — `addStepTimerDeltaSeconds.tx` parameter retyped from `PrismaClient` to `Prisma.TransactionClient` to accept the `Omit<PrismaClient, "$on"\|"$connect"\|"$disconnect"\|"$transaction"\|"$extends">` shape that `prisma.$transaction(async (tx) => …)` provides. (D) `UnitConversionWarningV1` shape — replaced 2 lying `as Array<{ code; message }>` casts in `recipesImportService.ts` with real `.map(w => ({ code, message: \`${path}: ${fromUnit} → ${toUnit}\` }))` projections. All 400 services/api vitest tests still pass; services/api `tsc --noEmit` drops 14 → **0**. **✅ Landed 2026-05-18.** | 1 session | Phase 5 (services/api CI gate; now unblocked) |
| **4 — apps/web infrastructure** | (a) ✅ Added `"typecheck": "tsc -p tsconfig.json --noEmit"` to `apps/web/package.json` and verified `npm run typecheck` reproduces the canonical 585 baseline. (b) ✅ Confirmed [`docs/TAMAGUI.md`](TAMAGUI.md) §"Accepted cost" table is current: apps/web 590 (documented) vs 585 (canonical) — 0.85% drift, well within TAMAGUI.md's own 1% tolerance; no update needed; packages/ui 25 unchanged. (c) ✅ **Decision pinned**: keep TAMAGUI.md's accept-and-document position. apps/web is OUT of the Phase 5 CI typecheck gate (the 585 errors are all Tamagui-class noise; a CI gate over them produces no signal and locks in the noise count, harming future Tamagui upgrades). Phase 5 gates the 13 currently-clean workspaces only. Revisit triggers (per TAMAGUI.md §"When to revisit"): (i) Tamagui upstream ships better shorthand typing in a future major; (ii) a non-Tamagui type-error class accumulates inside the 585 count where it would hide in the noise (mitigation: if Phase 6b's `noUncheckedIndexedAccess` pilot were to be repeated on apps/web after the other phases land, the delta-vs-baseline tells us this); (iii) the wrapper-primitive cost-benefit shifts because total count crosses TAMAGUI.md's 1000-in-single-app threshold. **✅ Landed 2026-05-18.** | <1 session | Phase 5 (decision pinned: apps/web NOT in the gate) |
| **5 — Per-workspace CI gate** | ✅ Added `.github/workflows/typecheck.yml` — single-job workflow that runs `tsc --noEmit` across the 13 currently-clean workspaces inside one `node:20-slim` container with `/repo/node_modules` hoisted (matches the canonical measurement method). Sequential per-workspace invocation under `set +e` + explicit pass/fail aggregation so all 13 results are reported even on early failure (avoids the "first failure masks the rest" debugging pain). apps/web + packages/ui excluded per Phase 4 decision (Tamagui-accepted cost). `apps/web/e2e` previously lacked a `typecheck` npm script — added in this phase so all 12 npm-workspace targets use uniform `npm run typecheck`. `services/api/prisma` (non-npm-workspace; only a tsconfig) gets a direct `tsc -p tsconfig.json --noEmit` invocation. Local simulation: all 13 clean, ~33s wall. CI total with `npm install` ≈ 60–70s; 15-min timeout leaves comfortable headroom. **✅ Landed 2026-05-18.** | <1 session | Phase 6 (without a gate, strict-flag regressions silently re-accumulate) |
| **6a — Enable `noPropertyAccessFromIndexSignature` + `noImplicitOverride` repo-wide** | Pilot data shows 0 new errors across all 8 measured clean workspaces. Add both flags to each `tsconfig.json` (no per-workspace exceptions expected). | <1 session | Phase 6b |
| **6b — Enable `noUncheckedIndexedAccess` repo-wide** | Pilot data shows 5 new errors in `apps/native` (2 files: `FermDataIntegrationScreen.tsx` + `WaterMashScreen.tsx`), 0 elsewhere. Fix the 5 apps/native sites (the real latent bugs the flag catches), then enable. | 1 session | Phase 6c |
| **6c — Enable `exactOptionalPropertyTypes` (one workspace at a time)** | Pilot data shows 12 new errors across 3 workspaces (apps/native 6, api-client 3, recipes-ui 3) — biggest cost. The dominant friction is `Partial<T>` call sites with explicit-`undefined`. Enable per-workspace in a deliberate order (smallest first: api-client → recipes-ui → apps/native), with a clear migration pattern documented. | 1–3 sessions | — |
| **6d — Optional: `verbatimModuleSyntax` + `isolatedModules` audit** | `apps/web` already has `isolatedModules: true`; others don't. Cheap to enable, useful for ESM correctness, but lower-priority than 6a–6c. Decide whether to ship as Phase 6d or defer. | — | — |

**Order rationale.** Phase 2 (this commit) is a measurement-methodology correction needed before any "fix" phase. Phase 3 is the real first fix — pure debt cleanup with low coordination cost. Phase 4 is the gnarliest decision-point (Tamagui acceptance vs. wrapper-primitive pass — but TAMAGUI.md already takes the accept position). Phase 5 is the gate that prevents regression once green. Phase 6 is the actual hardening payoff; the cheapest flags (6a) ship first to build flag-rollout muscle memory, then the lowest-risk substantive flag (6b), then the most expensive (6c).

**What this slice explicitly does NOT do.**

- Does not propose a wrapper-primitive pass for Tamagui shorthand props. [`docs/TAMAGUI.md`](TAMAGUI.md) explicitly accepts that cost and documents the localized-cast pattern; revisit only if upstream Tamagui ships better shorthand-prop typing.
- Does not introduce a runtime-validation library (Zod/Valibot/TypeBox). That's the separate Phase 7 decision tracked in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md), with its own per-criterion trigger conditions; the latest audit (2026-05-16) re-confirmed "stay on hand-rolled" (0/6 criteria met).
- Does not change `packages/core` from JavaScript to TypeScript. `packages/core` is consumed as `.js` by both web and native and has L1 vitest coverage; converting it is out of scope for this slice.

---

## How to run locally

Per the container-only Node/npm rule ([`.cursor/rules/00-shared-node-npm-container-only.mdc`](../.cursor/rules/00-shared-node-npm-container-only.mdc)), all typecheck commands run inside Docker.

### Single workspace (the common case)

```bash
# services/api (running api container has node_modules bind-mounted)
docker compose exec -T api npm run typecheck

# apps/web (running web container; no typecheck script yet, use npx tsc directly until Phase 4)
docker compose exec -T web bash -lc 'cd /app && npx tsc --noEmit'

# any other workspace via the running web container, which has all packages mounted
docker compose exec -T web bash -lc \
  'cd /packages/contracts && /packages/node_modules/.bin/tsc -p tsconfig.json --noEmit'
```

### A workspace that isn't mounted in the running containers

`apps/native`, `apps/web/e2e`, `services/api/prisma`, `packages/api-client`, and `packages/test-mcp` aren't mounted in the long-running dev containers. Use a one-off `node:20-slim` container that mounts the entire monorepo:

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/apps/native
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit
'
```

(Reuses the monorepo's hoisted `node_modules`. Same pattern is used in `.github/workflows/native-deps.yml` for the apps/native CI gate.)

### Pilot a stricter flag without mutating tsconfig

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/packages/recipes-ui
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit --noUncheckedIndexedAccess
'
```

CLI flags override the `tsconfig.json` for that single invocation. Use this when sizing the impact of enabling a flag before committing to the tsconfig change.

### Counting errors

Errors come out one per `<file>(<line>,<col>): error TS<code>: <message>` line at the start of the output, followed by indented detail lines. To count just the top-level error count, grep for the leading non-space pattern:

```bash
tsc -p tsconfig.json --noEmit 2>&1 | grep -cE '^[^ ].+\(.+\): error'
```

---

## Anti-patterns (do not adopt while landing this slice)

- **Don't add blanket `// @ts-expect-error` to silence the 1062 apps/web Tamagui errors.** TAMAGUI.md §"Caveat 2" already accepts these; suppressing them in source obscures the count and risks hiding a genuine non-Tamagui error inside the noise.
- **Don't enable a stricter flag in `tsconfig.json` while the baseline is failing.** The new errors will compound with the existing ones and make it impossible to tell which were pre-existing. Always: bring baseline green → then enable flag → then commit both as one PR.
- **Don't migrate `packages/core` to TypeScript "while you're in there."** It's intentionally JS, consumed by both web and native; the conversion has cross-cutting native-bundle implications out of scope for this slice.
- **Don't add a `tsc --noEmit` step to the existing `web-lint` workflow.** Typecheck has different inputs (Prisma client generation, shared-package `dist/`) than lint and should be its own workflow with its own path-gating.

---

## Cross-references

- [`docs/TAMAGUI.md`](TAMAGUI.md) — the dominant type-error class in `apps/web` and `packages/ui`. **TAMAGUI.md is the SoT for what to do with Tamagui-driven type errors;** this doc only references its position.
- [`docs/LINTING.md`](LINTING.md) — the lint slice already eliminated explicit-`any` and unsafe-`any` classes; this slice is the compile-time complement.
- [`docs/TESTING.md`](TESTING.md) — runtime regression protection across 5 layers; this slice is the compile-time complement.
- [`docs/ROADMAP.md`](ROADMAP.md) → "Foundation hardening pass" — the slice this doc belongs to.
- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) — the runtime-validation library decision (Zod/Valibot/TypeBox); orthogonal to compile-time strictness.
- [`DEVELOPMENT-LOCAL.md`](../DEVELOPMENT-LOCAL.md) lines 94–121 — shared-package `dist/` build chain (beerjson → recipes-ui ordering matters for typecheck correctness) and the apps/native CI gate.
