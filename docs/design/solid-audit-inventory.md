# SOLID audit inventory

**Tier:** Internal  
**Status:** Generated snapshot (2026-06-05) — regenerate with `npm run audit:solid-inventory`  
**Audience:** auditors, module authors, agents  
**Related:** [solid-audit-charter.md](./solid-audit-charter.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md)

> **Do not hand-edit this file.** Run `npx tsx scripts/audit/solid-inventory.ts` after structural changes.

---

## Summary

| Metric | Value |
|--------|-------|
| Files scanned | 958 |
| Roots | `services/api/src`, `packages`, `apps/web/app`, `apps/native/src` |
| P0 findings | 0 |
| P1 findings | 3 |
| P2 findings | 65 |
| P3 findings | 37 |

---

## Findings table

| Path | LoC | Slice | Principles | Severity | Signal | Suggested action |
|------|-----|-------|------------|----------|--------|------------------|
| `packages/api-client/src/generated/platform.openapi.ts` | 10161 | Packages | S, I | P1 | file size 10161 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `packages/api-client/src/generated/brewery.openapi.ts` | 4895 | Packages | S, I | P1 | file size 4895 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `packages/beerjson/src/index.ts` | 1073 | Packages | S, I | P1 | file size 1073 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/components/water/WaterMashScreenContent.tsx` | 669 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/yeast/page.tsx` | 615 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/page.tsx` | 595 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/components/water/WaterSpargeScreenContent.tsx` | 554 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_components/sections/WaterSpargeAcidificationSection.tsx` | 534 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashAcidificationSection.tsx` | 524 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_components/sections/WaterBoilAcidificationSection.tsx` | 497 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/components/water/WaterBoilScreenContent.tsx` | 486 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/modules/brewery/routes/brewSessions.ts` | 442 | Brewery vertical | S, D | P2 | route file 442 LoC | Extract service layer; handler = parse → service → schema |
| `apps/web/app/recipes/[id]/water/mash/_hooks/useWaterMashAcidification.ts` | 434 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/WaterHubScreen.tsx` | 416 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_hooks/useWaterSpargeAcidification.tsx` | 411 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_hooks/useWaterBoilAcidification.ts` | 398 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/components/yeastScreen/YeastScreenRow.tsx` | 365 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashAdjustmentSection.tsx` | 340 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_components/sections/WaterSpargeSaltsSection.tsx` | 320 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/components/recipeEdit/sections/RecipeEditFermentablesSection.tsx` | 318 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_components/sections/WaterBoilAdjustmentSection.tsx` | 315 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterSparge/useNativeWaterSpargeAcidification.ts` | 310 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/modules/brewery/routes/ingredients.ts` | 302 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `apps/native/src/modules/brewery/hooks/waterBoil/useNativeWaterBoilAcidification.ts` | 297 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterMash/useNativeWaterMashSteps.ts` | 289 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashOverallSection.tsx` | 283 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashSaltsSection.tsx` | 262 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_hooks/useWaterMashSalts.ts` | 256 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/edit/_hooks/useRecipeEditPage.ts` | 252 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_hooks/useWaterSpargeSalts.ts` | 252 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/components/recipeEdit/sections/RecipeEditHopsSection.tsx` | 248 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/recipeEditScreen/useNativeRecipeEditLoad.ts` | 243 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_components/sections/WaterSpargeConfigSection.tsx` | 234 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/useWaterMashScreen.tsx` | 228 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterMash/useNativeWaterMashAcidification.ts` | 227 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_components/sections/WaterBoilSaltsSection.tsx` | 227 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/recipeEditScreen/useNativeRecipeEditActions.ts` | 226 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_hooks/useWaterMashPage.tsx` | 222 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/YeastScreen.tsx` | 219 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/useRecipeEditScreen.ts` | 215 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_hooks/useWaterBoilSalts.ts` | 215 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/modules/brewery/routes/recipes.ts` | 208 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `apps/native/src/modules/brewery/components/recipeEdit/sections/RecipeEditMashingSection.tsx` | 204 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/yeastScreen/useNativeYeastScreenActions.ts` | 202 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashMashStepsSection.tsx` | 196 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashGristSection.tsx` | 194 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_hooks/useWaterBoilPage.tsx` | 178 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/routes/platformAds.ts` | 178 | Platform routes/services | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `apps/native/src/modules/brewery/hooks/useWaterBoilScreen.tsx` | 171 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/useWaterSpargeScreen.tsx` | 159 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/_hooks/useWaterSpargePage.tsx` | 157 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/yeastScreen/useNativeYeastScreenLoad.ts` | 131 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/useRecipeEditScreenFermentables.ts` | 121 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/edit/_components/sections/RecipeEditMashingSection.tsx` | 118 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/recipeEditScreen/useNativeRecipeEditYeast.ts` | 116 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/yeastScreen/useNativeYeastScreenRows.ts` | 111 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/useRecipeEditScreenHops.ts` | 102 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterMash/useNativeWaterMashGrist.ts` | 102 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/_lib/waterCalcTypes.ts` | 70 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/_components/WaterBoilPageContent.tsx` | 65 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/modules/brewery/routes/styles.ts` | 43 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `apps/native/src/modules/brewery/hooks/waterBoil/useNativeWaterBoilSalts.ts` | 38 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterSparge/useNativeWaterSpargeSalts.ts` | 38 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/_lib/beerjsonRecipe.ts` | 37 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/lib/recipeEditHelpers.ts` | 34 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/lib/recipeEditConstants.ts` | 29 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/_components/RecipeTitleWithMeta.tsx` | 28 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/hooks/waterMash/useNativeWaterMashSalts.ts` | 20 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/_components/RecipeImportForm.tsx` | 756 | Apps (web) | S, I | P3 | file size 756 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/ferm-data-integration/page.tsx` | 728 | Apps (web) | S, I | P3 | file size 728 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/edit/_components/sections/RecipeEditAnalysisSection.tsx` | 718 | Apps (web) | S, I | P3 | file size 718 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/components/water/WaterMashScreenContent.tsx` | 669 | Apps (native) | S, I | P3 | file size 669 LoC | Review logical cohesion |
| `services/api/src/services/recipeWaterSettingsService.ts` | 629 | Platform routes/services | S, I | P3 | file size 629 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/yeast/page.tsx` | 615 | Apps (web) | S, I | P3 | file size 615 LoC | Review logical cohesion |
| `services/api/src/services/rendering/renderingJobService.ts` | 611 | Platform routes/services | S, I | P3 | file size 611 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/page.tsx` | 595 | Apps (web) | S, I | P3 | file size 595 LoC | Review logical cohesion |
| `services/api/src/importers/beerxmlImporter.ts` | 582 | Other | S, I | P3 | file size 582 LoC | Review logical cohesion |
| `services/api/src/services/brewSessionsLifecycleService.ts` | 576 | Platform routes/services | S, I | P3 | file size 576 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionStepCard.tsx` | 564 | Apps (web) | S, I | P3 | file size 564 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/components/water/WaterSpargeScreenContent.tsx` | 554 | Apps (native) | S, I | P3 | file size 554 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/edit/_components/sections/RecipeEditFermentablesSection.tsx` | 539 | Apps (web) | S, I | P3 | file size 539 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/sparge/_components/sections/WaterSpargeAcidificationSection.tsx` | 534 | Apps (web) | S, I | P3 | file size 534 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/mash/_components/sections/WaterMashAcidificationSection.tsx` | 524 | Apps (web) | S, I | P3 | file size 524 LoC | Review logical cohesion |
| `services/api/src/services/recipesService.ts` | 499 | Platform routes/services | S, I | P3 | file size 499 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/WaterProfilesScreen.tsx` | 497 | Apps (native) | S, I | P3 | file size 497 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/boil/_components/sections/WaterBoilAcidificationSection.tsx` | 497 | Apps (web) | S, I | P3 | file size 497 LoC | Review logical cohesion |
| `services/api/src/services/brewdaySettingsService.ts` | 492 | Platform routes/services | S, I | P3 | file size 492 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/components/water/WaterBoilScreenContent.tsx` | 486 | Apps (native) | S, I | P3 | file size 486 LoC | Review logical cohesion |
| `services/api/src/cli/seedE2eFixture.ts` | 482 | Other | S, I | P3 | file size 482 LoC | Review logical cohesion |
| `services/api/src/services/ai/orchestrator.ts` | 465 | Platform routes/services | S, I | P3 | file size 465 LoC | Review logical cohesion |
| `services/api/src/services/recipeWaterSettings/recipeWaterSettingsMapper.ts` | 463 | Platform routes/services | S, I | P3 | file size 463 LoC | Review logical cohesion |
| `services/api/src/seed/sources/beerproto/beerproto.ts` | 461 | Other | S, I | P3 | file size 461 LoC | Review logical cohesion |
| `services/api/src/modules/brewery/services/waterCalc/waterCalcOverallOps.ts` | 454 | Brewery vertical | S, I | P3 | file size 454 LoC | Review logical cohesion |
| `services/api/src/modules/brewery/routes/brewSessions.ts` | 442 | Brewery vertical | S, I | P3 | file size 442 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/FermDataIntegrationScreen.tsx` | 439 | Apps (native) | S, I | P3 | file size 439 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/recipes/page.tsx` | 434 | Apps (web) | S, I | P3 | file size 434 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/mash/_hooks/useWaterMashAcidification.ts` | 434 | Apps (web) | S, I | P3 | file size 434 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/RecipesListScreen.tsx` | 433 | Apps (native) | S, I | P3 | file size 433 LoC | Review logical cohesion |
| `services/api/src/domain/recipeAnalysis/gravityAnalysis.ts` | 430 | Brewery vertical (domain) | S, I | P3 | file size 430 LoC | Review logical cohesion |
| `services/api/src/services/brewSessionsRecipeStepSeeding.ts` | 427 | Platform routes/services | S, I | P3 | file size 427 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/brew-sessions/[brewSessionId]/_hooks/useBrewSessionSteps.ts` | 418 | Apps (web) | S, I | P3 | file size 418 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/WaterHubScreen.tsx` | 416 | Apps (native) | S, I | P3 | file size 416 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/water-profiles/page.tsx` | 416 | Apps (web) | S, I | P3 | file size 416 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/sparge/_hooks/useWaterSpargeAcidification.tsx` | 411 | Apps (web) | S, I | P3 | file size 411 LoC | Review logical cohesion |
| `packages/recipes-ui/src/mash/MashStepsEditor.tsx` | 402 | Packages | S, I | P3 | file size 402 LoC | Review logical cohesion |

---

## Manual audit notes (slice summaries)

See [solid-decoupling-audit.md §3](./solid-decoupling-audit.md) for slice-by-slice evidence and Tier A/B/C recommendations not fully automatable.

---

*Generated by `scripts/audit/solid-inventory.ts`.*
