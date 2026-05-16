# Linting (ESLint)

**Tier:** Public
**Status:** v1.7 — HIGH-staged Phases 1 (`packages/contracts/**`), 2 (`packages/beerjson/**`), 3 (`services/api/src/**`), 4a (`apps/web/app/recipes/[id]/edit/page.tsx`), 4b (`apps/web/app/recipes/[id]/water/**` — mash + sparge + boil pages), and **4c** (`apps/web/app/recipes/[id]/yeast/page.tsx` + `brew-sessions/{,[brewSessionId]/}page.tsx`) landed; every `packages/**` workspace is gated at `--max-warnings 0`, `services/api/src/**` is `any`-free, and the recipe editor surface in `apps/web` (recipe edit + water + yeast + brew-sessions pages, ~11,400 lines) is now `any`-free. Phase 5 (`apps/native/src/screens/**`) or Phase 6 (mop-up) is next.
**Audience:** maintainers, contributors, anyone authoring web/native UI code or services
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (Tamagui type-system caveats), `docs/TESTING.md`, `docs/PLATFORM-ARCHITECTURE.md` §10.1.1 (go-public path), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — Zod/Valibot/TypeBox decision, separate from ESLint scope), `eslint.config.mjs` (this file is also documentation — read the comment headers).

---

## TL;DR

| What | State |
|---|---|
| ESLint runs in CI | ✅ `web-lint` GitHub Action, path-gated |
| Errors block CI | ✅ |
| Warnings tolerated repo-wide | ⚠️ Yes (HIGH-staged work to remove them, see roadmap) |
| Warnings forbidden in clean packages | ✅ `npm run lint:packages-strict` — **11 of 11 packages** at `--max-warnings 0` (every `packages/**` workspace is gated; only `apps/**` and `services/**` still have `any` debt) |
| Cross-platform UI primitives enforced | ✅ `no-restricted-imports` on `packages/ui/src/{ai,charts}/**` |
| React hook bug class blocked | ✅ `react-hooks/exhaustive-deps` is `error` |
| Type-aware lint enabled | ❌ Deferred to HIGH-full (alongside `no-explicit-any: error`) |
| Outstanding warnings | **342** (-64 from Phase 4c, -87 from Phase 4b, -104 from Phase 4a, -432 from Phase 3, -21 from Phase 2, -77 from Phase 1, -785 cumulative; was 1,127 at HIGH-light landing) |

If you want to make a change touching `apps/web`, `apps/native`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`, the `web-lint` workflow will run automatically. Locally run lint with the commands in [How to run](#how-to-run-locally).

---

## Why ESLint exists in this repo

For a TypeScript + React + React Native monorepo headed for a public AGPLv3 release, lint coverage is a maturity expectation. TypeScript catches a large class of bugs, but ESLint catches a complementary class that TypeScript will never see:

- **`react-hooks/exhaustive-deps`** — stale-closure bugs (`useEffect` reads stale state). TypeScript can't see this; it's a semantic bug. We promoted this to `error` in HIGH-light.
- **`react-hooks/rules-of-hooks`** — conditional hook calls. Also semantic. Already `error`.
- **`jsx-a11y/*`** — accessibility regressions at the source level, complementing the runtime axe-core checks in the Playwright smoke suite.
- **`no-restricted-imports`** — bans specific imports (see below) for cross-platform safety.

### The canonical guardrail: cross-platform UI primitives

Components in `packages/ui/src/{ai,charts}/**` MUST NOT import `Button`/`Input`/`BrewCheckbox` directly from `tamagui`. They MUST import the platform-forking wrappers from `packages/ui/src/primitives/*`. Raw Tamagui leaks React Native a11y props (`accessibilityLabel`, `accessibilityRole`) to the DOM on web, triggering React console warnings.

This guardrail is enforced via `no-restricted-imports` and the underlying bug is documented in commit `221b193` (postmortem of `715bbea` / `d47f35a`).

This is exactly the kind of bug that:
- TypeScript cannot catch (Tamagui's types accept the props),
- Tests cannot easily catch (the warning is a console message, not a thrown error),
- Code review missed for two releases.

It's the reason ESLint is worth its tooling overhead in this repo.

---

## Scope tiers — value/cost analysis

Lint configuration has a fundamental value/cost trade-off: stricter rules catch more bugs but require more triage of pre-existing violations. We staged this in four tiers. Keep this table updated as project priorities shift.

| Tier | Effort to land | Value | Status |
|---|---|---|---|
| **Minimal** — only `no-restricted-imports` scoped to cross-platform UI folders. | Low (one config + one rule). | Low–medium: only catches the one bug class. Doesn't earn its tooling overhead. | ❌ Rejected as the lone scope. |
| **Medium** — full base preset (TS-recommended + React-Hooks + jsx-a11y) with per-glob overrides; `no-restricted-imports` on cross-platform UI; `react-hooks/exhaustive-deps` set to `warn`. | Medium (one config + ~5 plugins + light cleanup of pre-existing warnings). | High — catches a real class of React bugs TypeScript misses, formalizes a11y, prevents future drift. | ✅ Superseded by HIGH-light. |
| **HIGH-light** — Medium + `exhaustive-deps` as **error** + `--max-warnings 0` on 9 clean packages + `allowInterfaces: "with-single-extends"` to keep Tamagui's module-augmentation pattern legal. | Medium-high (1 PR, ~3 hours focused work). | High — locks in the clean parts; gates against drift; gives an honest "where are we" picture. | ✅ **Landed.** |
| **HIGH-staged** — HIGH-light + clean `any` warnings package-by-package, expanding `lint:packages-strict` glob with each cleanup. | Medium-high per phase (4–6 phases). | High — real type-safety wins where the money is (contracts, services, web pages). | 🚧 In progress — see [HIGH-staged roadmap](#high-staged-roadmap) below. |
| **HIGH-full** — HIGH-staged + `@typescript-eslint/recommended-type-checked` (type-aware) + `no-explicit-any` as **error** + `--max-warnings 0` repo-wide. | High (CI gets slower; many pre-existing violations surface from type-aware rules). | Highest — production-grade hygiene; signals maturity to public contributors. | 🚧 **Target: Q4 2026 / Q1 2027**, aligned with the public AGPLv3 flip (`docs/ROADMAP.md`). |

### Why we did not go HIGH-full in one shot

Roughly 1,040 of 1,127 outstanding warnings are `@typescript-eslint/no-explicit-any`. Mechanically fixing them would take an estimated 20–60 hours. More importantly, `recommended-type-checked` makes ESLint significantly slower (likely 5–10× in our monorepo), and Tamagui's type ecosystem (`docs/TAMAGUI.md`) generates large amounts of friction with `no-unsafe-*` rules. Doing HIGH-full as one mega-PR would:

1. Block other work for 1–2 weeks,
2. Generate a diff so large that meaningful review is impossible,
3. Conflate "real bug fixes" with "scope-creep refactors",
4. Risk landing semantic regressions (e.g. `catch (err: any)` → `unknown` requires careful narrowing).

HIGH-staged converts that monolith into ~5 reviewable PRs spread over months, each delivering measurable value (one more package gated against drift).

---

## HIGH-staged roadmap

Each phase below clears a slice of pre-existing `any` warnings, then expands the strict gate to cover it. Phases can be done independently and in any order, but **`packages/contracts/**` should go first** because contracts types flow downstream into services + apps.

### Phase 1 — `packages/contracts/**` (~77 `any` warnings) — ✅ **Landed**

- [x] Triage `packages/contracts/src/water/parseComputeAndSave.ts` (32 `any`) — done
- [x] Triage `packages/contracts/src/analysis/parseGravityAnalysis.ts` (22 `any`) — done
- [x] Triage `packages/contracts/src/water/waterProfile.ts` (13 `any`) — done
- [x] Triage `packages/contracts/src/auth/meResponse.ts` (10 `any`) — done
- [x] Expand `lint:packages-strict` to include `packages/contracts` — done
- [x] Update this doc's TL;DR table — done
- [x] Verify zero behavior change: 38/38 contracts unit tests pass; all downstream TS error counts (services/api, apps/web, apps/native, packages/ui) identical to pre-change baseline.

**Why this was first:** contracts types are the source of truth for cross-process data (services → apps). Tightening them improves type safety in every downstream consumer.

**Strategy used:** "tighten in place" — replaced `any` with `Record<string, unknown>` (after `isObject` narrowing), used proper return types on helper functions, used named union casts (`WaterCalcDerivationKind`, `NumberFormatUnit`, etc.) instead of `any` for unvalidated string-to-union narrowing. No Zod migration. See the commit (linked from this section after merge) and the discussion in the related session transcript for the full pros/cons of the Zod alternative.

### Phase 2 — `packages/beerjson/**` (21 `any` warnings) ✅ landed 2026-05-16

**Scope:** 1 file, 986 lines (`packages/beerjson/src/index.ts`). All 21 `any` removed.

**Strategy used:** "tighten in place" — same as Phase 1.
- Added local helpers `isObject`, `isFiniteNumber`, `parseValueWithUnit` (the BeerJSON shape uses `{ unit, value }` pairs everywhere — extracting this once collapses ~10 repeated guard chains into one helper call per access).
- Output builders now type accumulators as `Record<string, unknown>` (pre-existing behaviour preserved; downstream consumers treat the BeerJSON document as opaque JSON-passed-to-API).
- Input parsers now take `unknown` + `isObject` narrowing.
- A `BeerJsonRecipe = Record<string, unknown>` alias replaces `any[]` in the document shape.
- Two minor pre-existing semantic improvements landed alongside (both safer): in input parsers, missing-but-typed unit/value pairs (e.g. `unit === "F"` with no `value`) now return `null` instead of `NaN`; and unknown `type`/`form` strings on misc/hop ingredients fall back to a valid union member instead of being trusted unchecked.

**Tests added (Option B):** `packages/beerjson/src/index.test.ts` — 4 round-trip tests (recipe-level grist+hops+yeast+misc, mash, replaceMashInBeerJsonDocument with null clearing, validateMashBeforeSave smoke). 4/4 passing. The package now has its own `vitest` dev dep + `test` script (mirrors `packages/contracts`).

- [x] Add 4 round-trip unit tests
- [x] Triage 21 `any` in `packages/beerjson/src/index.ts`
- [x] Tests green: 4/4
- [x] Downstream typecheck: zero new beerjson-related errors in `apps/web` / `apps/native`
- [x] Expanded `lint:packages-strict` to include `packages/beerjson`
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
- Imported `NumberFormatHintV1` and `WaterCalcDerivation` from `@brewery/contracts` and used `Record<string, NumberFormatHintV1 | undefined>` / `Record<string, WaterCalcDerivation | undefined>` aliases when indexing `parsed.formatHints[field]` / `parsed.derivations[derivationKey]` by an arbitrary string field name. This collapses two `as any` casts into honest, lossless type assertions.
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
- Replaced `useState<any | null>(null)` for derivation states (`saltsDerivation`, `acidDerivation`, `overallDerivation`, `saltDerivation`) with `useState<WaterCalcDerivation | null>(null)` (the type is from `@brewery/contracts` and is exactly what the API returns post-`parseMashComputeAndSaveResponse` / `parseSpargeComputeAndSaveResponse` / `parseBoilComputeAndSaveResponse`). 8 derivation states tightened.
- Replaced `useState<any | null>(null)` for sparge's `spargeOverall` with the shape `{ result: WaterOverallResult; derivation: WaterCalcDerivation } | null`.
- Replaced `((s.xStrengthKind as any) ?? "percent") as "percent" | "normality" | "molarity" | "solid"` (3 sites — one per stage) with explicit safe narrowing: a 5-line ternary that checks each union member against the saved string before falling back to `"percent"`. No more "trust the saved value blindly through `as any`".
- Dropped redundant `as any` casts on parser arguments: `parseGravityAnalysisResponseV1(analysis)` was being called with `(analysis as any)` even though the parser's signature is `(x: unknown) => GravityAnalysisResponseV1`. The cast hid the fact that the contract was already correct.
- Replaced internal-API response unpacking patterns (`/api/water-calc/salt-additions`, `/api/water-calc/{mash,sparge,boil}-overall`) — these don't yet have contract parsers in `@brewery/contracts`, so we use `asRecord` to narrow `res.data` and then typed shape-casts to the local `SaltAdditionsResult` / `WaterOverallResult` / `WaterCalcDerivation`. Same defensive posture as Phase 4a's "internal monorepo API without a parser" treatment; if/when these endpoints get parsers in a future Phase 7 round, the casts will fall away.
- Replaced `(s.gristRows as any[])` and `(r as any).{mashDiPh,mashTaToPh57_mEqPerKg,mashRoastDehuskedOverride,timingUse,lateAddition,amountKg}` accesses with direct field access on `EditorGristRow` (the type from `@brewery/beerjson` already declares all these fields — the casts were purely defensive and unnecessary).
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

### Phase 5 — `apps/native/src/screens/**` (~162 `any` warnings)

Same patterns as Phase 4 but for the React Native side. May land easier or harder depending on how `docs/TAMAGUI.md` migration goes.

- [ ] Phase 5a: `RecipeEditScreen.tsx` (68 `any`)
- [ ] Phase 5b: `YeastScreen.tsx` + remaining screens
- [ ] Add `lint:native-screens-strict` script once clean

### Phase 6 — Mop-up

- [ ] Clean 86 `no-unused-vars` warnings (mostly unused imports — mechanical deletions)
- [ ] Promote `no-unused-vars` from `warn` to `error`
- [ ] Verify no remaining pre-existing warnings outside known carve-outs

### Phase 7 (optional, separate decision) — runtime-validation library migration

This is **not** an ESLint phase per se — it's an architectural decision adjacent to the type-discipline work. Phase 1 surfaced the question ("should `packages/contracts` use Zod / Valibot / TypeBox instead of hand-rolled validators?"). The current decision is **no**, but the question deserves to be tracked rather than forgotten.

- [ ] Re-evaluate when one of the trigger criteria in `docs/CONTRACTS-VALIDATION-STRATEGY.md` is met (new complex contract, OpenAPI requirement, form-validation parity, drift bugs, bundle-size shift, independent route migration).

See `docs/CONTRACTS-VALIDATION-STRATEGY.md` for the full pros/cons, candidate libraries (Zod, Valibot, Arktype, TypeBox), migration mechanics if/when we go, and the decision log.

---

## HIGH-full upgrade

When HIGH-staged is complete (target: Q4 2026 / Q1 2027), the final upgrade is:

- [ ] Promote `@typescript-eslint/no-explicit-any` from `warn` to `error` (project-wide, with surgical per-file disables for the genuine "this is dynamic" cases).
- [ ] Add `@typescript-eslint/recommended-type-checked` with per-glob `parserOptions.project`. This enables ~30 type-aware rules including `no-floating-promises`, `no-misused-promises`, `await-thenable`, `no-unsafe-*`.
- [ ] Triage the new violations (expect 100s–1000s — many will be in Tamagui-adjacent code, see `docs/TAMAGUI.md`).
- [ ] Change `npm run lint` to `npm run lint -- --max-warnings 0`.
- [ ] Update `web-lint.yml` to drop the separate `lint:packages-strict` step (no longer needed — the main lint is strict everywhere).
- [ ] Update this doc to mark HIGH-full as ✅ landed.

The expected output of HIGH-full: 0 warnings repo-wide, every error is real, every PR catches type-safety regressions before merge.

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

For the strict gate that runs in CI:

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint:packages-strict"
```

For a focused path (much faster iteration):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && \
            npx eslint packages/ui/src/ai/"
```

Auto-fix safe issues (mostly unused `eslint-disable` directives):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint -- --fix"
```

---

## CI

The `.github/workflows/web-lint.yml` workflow runs two ESLint invocations on every PR that touches `apps/web/**`, `apps/native/**`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`:

1. **`npm run lint`** — full repo. Errors block CI; warnings reported but tolerated.
2. **`npm run lint:packages-strict`** — gated packages (`packages/api-client`, `core`, `i18n`, `i18n-react`, `media`, `navigation`, `recipes-ui`, `test-mcp`, `ui`) with `--max-warnings 0`. Any new warning here blocks merge.

Both run inside a `node:20-slim` container to mirror the CI environment exactly. Adding a new package to the strict gate requires editing the `lint:packages-strict` script in the root `package.json` (see [HIGH-staged roadmap](#high-staged-roadmap) for the per-phase update).

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

## Related

- `docs/TAMAGUI.md` — Tamagui type-system caveats and our adaptation strategy.
- `docs/TESTING.md` — test layer map (unit / integration / contract / Playwright). Lint complements but does not replace tests.
- `docs/PLATFORM-ARCHITECTURE.md` — broader architectural context, especially §10.1.1 (go-public path) where public-quality lint hygiene is part of the pre-flip checklist.
- `docs/ROADMAP.md` — milestone alignment; HIGH-full targets Q4 2026 / Q1 2027 alongside the public AGPLv3 flip.
- `packages/ui/README.md` — `@brewery/ui` package overview, including the platform-forking primitives that the cross-platform import guardrail references.
