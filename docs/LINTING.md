# Linting (ESLint)

**Tier:** Public
**Status:** v2.0 — HIGH-staged Phases 1 (`packages/contracts/**`), 2 (`packages/beerjson/**`), 3 (`services/api/src/**`), 4a–4c (`apps/web/app/recipes/**`), 5a–5b (entire `apps/native/src/**`), and **6a** (`apps/web/app/[locale]/ferm-data-integration/page.tsx` + `apps/web/app/_components/RecipeImportForm.tsx`) landed; every `packages/**` workspace is gated at `--max-warnings 0`, `services/api/src/**` is `any`-free, all of `apps/web/app/recipes/**` (~11,400 lines) is `any`-free, the entire `apps/native/src/**` surface is `any`-free with typed React Navigation, and the two highest-leverage non-recipes web files are now `any`-free. Only the apps/web "long tail" (~58 `any` across 22 small files, mostly 1–13 each) and a 1-`any` services/api seed residual remain.
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
| Outstanding warnings | **138** (-49 from Phase 6a, -99 from Phase 5b, -56 from Phase 5a, -64 from Phase 4c, -87 from Phase 4b, -104 from Phase 4a, -432 from Phase 3, -21 from Phase 2, -77 from Phase 1, -989 cumulative; was 1,127 at HIGH-light landing) |

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
- `apps/native` TypeScript error count held exactly at the pre-change baseline of 0 errors (`npm run typecheck --workspace=@brewery/native` clean). The Phase 5a changes did not introduce a single new TS error — typed navigation is fully assignable across the 4 `navigate()` call sites.
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
- `apps/native` TypeScript: 0 errors after Phase 5b (held at the pre-change baseline). The dom-shim change was the only place a TS error was introduced (`@tamagui/element/getWebElement.ts(19,28) TS2359`) and it was caught by `npm run typecheck --workspace=@brewery/native` and fixed before commit by switching from `unknown` to a constructor-shaped type. No new errors landed.
- `@brewery/contracts` TypeScript: 0 errors (sanity-checked because Phase 5b's WaterSparge/Boil simplification reads through the discriminated-union narrowing that contracts owns).
- Repo-wide `no-explicit-any` count: 206 → 107 (drop of 99, exactly matches Phase 5b scope).
- Repo-wide all-warnings count: 286 → 187 (same -99 delta).
- No new `apps/native` unit tests added (Phase 5b is type-tightening, no behavioural change).

**Phase 5 cumulative impact:** 155 `any` removed across 22 files (Phase 5a's RecipeEditScreen + Phase 5b's 21 files). The whole React Native app surface is now `any`-free. Combined with Phases 1–4 (`packages/**`, `services/api/src/**`, `apps/web/app/recipes/**`), the only remaining `any` debt is the `apps/web` non-recipes pages (mostly under `apps/web/app/[locale]/**` and `apps/web/app/_components/**`, ~96 warnings) plus a small `services/api` test residue.

### Phase 6 — `apps/web` non-recipes any cleanup + mop-up

The big-leverage `any` debt outside `apps/web/app/recipes/**` lives in two files (49 of the 107 post-5b warnings). Phase 6a clears those. Phase 6b sweeps the long tail. Phase 6c is the original mop-up scope (no-unused-vars promotion).

- [x] Phase 6a: `apps/web/app/[locale]/ferm-data-integration/page.tsx` (26 `any`) + `apps/web/app/_components/RecipeImportForm.tsx` (23 `any`) — 49 `any` removed ✅ landed 2026-05-16
- [ ] Phase 6b: Long tail — `apps/web/app/HealthPanel.tsx` (13), `apps/web/app/[locale]/inventory/page.tsx` (7), `apps/web/app/recipes/_components/YeastEditor.tsx` (6), `apps/web/app/_components/PrimaryNav.tsx` (5), and 18 smaller files (1–4 `any` each)
- [ ] Phase 6c: Clean ~50 `no-unused-vars` warnings (mostly unused imports — mechanical deletions); promote `no-unused-vars` from `warn` to `error`
- [ ] Verify no remaining pre-existing warnings outside known carve-outs

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
