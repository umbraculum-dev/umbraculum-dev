# SOLID audit inventory

**Tier:** Internal  
**Status:** Generated snapshot (2026-06-04) — regenerate with `npm run audit:solid-inventory`  
**Audience:** auditors, module authors, agents  
**Related:** [solid-audit-charter.md](./solid-audit-charter.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md)

> **Do not hand-edit this file.** Run `npx tsx scripts/audit/solid-inventory.ts` after structural changes.

---

## Summary

| Metric | Value |
|--------|-------|
| Files scanned | 741 |
| Roots | `services/api/src`, `packages`, `apps/web/app`, `apps/native/src` |
| P0 findings | 0 |
| P1 findings | 22 |
| P2 findings | 22 |
| P3 findings | 23 |

---

## Findings table

| Path | LoC | Slice | Principles | Severity | Signal | Suggested action |
|------|-----|-------|------------|----------|--------|------------------|
| `packages/api-client/src/generated/platform.openapi.ts` | 10161 | Packages | S, I | P1 | file size 10161 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `packages/api-client/src/generated/brewery.openapi.ts` | 4895 | Packages | S, I | P1 | file size 4895 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/edit/page.tsx` | 3851 | Apps (web) | S, I | P1 | file size 3851 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/brew-sessions/[brewSessionId]/page.tsx` | 2656 | Apps (web) | S, I | P1 | file size 2656 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/water/mash/page.tsx` | 2173 | Apps (web) | S, I | P1 | file size 2173 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/screens/RecipeEditScreen.tsx` | 2125 | Apps (native) | S, I | P1 | file size 2125 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/water/sparge/page.tsx` | 1456 | Apps (web) | S, I | P1 | file size 1456 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/water/boil/page.tsx` | 1445 | Apps (web) | S, I | P1 | file size 1445 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/_components/YeastEditor.tsx` | 1430 | Apps (web) | S, I | P1 | file size 1430 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `services/api/src/services/recipesService.ts` | 1297 | Platform routes/services | S, I | P1 | file size 1297 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/screens/WaterMashScreen.tsx` | 1259 | Apps (native) | S, I | P1 | file size 1259 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/[locale]/(brewery)/inventory/page.tsx` | 1258 | Apps (web) | S, I | P1 | file size 1258 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `services/api/src/modules/brewery/services/waterCalcService.ts` | 1251 | Brewery vertical | S, I | P1 | file size 1251 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `services/api/src/services/brewSessionsService.ts` | 1193 | Platform routes/services | S, I | P1 | file size 1193 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/[locale]/(brewery)/brewday-steps-settings/page.tsx` | 1150 | Apps (web) | S, I | P1 | file size 1150 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `packages/beerjson/src/index.ts` | 1073 | Packages | S, I | P1 | file size 1073 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/[locale]/(brewery)/equipment/page.tsx` | 1049 | Apps (web) | S, I | P1 | file size 1049 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `services/api/src/services/recipeWaterComputeAndSaveService.ts` | 965 | Platform routes/services | S, I | P1 | file size 965 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `services/api/src/domain/recipeAnalysis/gravityAnalysis.ts` | 934 | Brewery vertical (domain) | S, I | P1 | file size 934 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/screens/YeastScreen.tsx` | 927 | Apps (native) | S, I | P1 | file size 927 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/screens/WaterBoilScreen.tsx` | 852 | Apps (native) | S, I | P1 | file size 852 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/native/src/modules/brewery/screens/WaterSpargeScreen.tsx` | 827 | Apps (native) | S, I | P1 | file size 827 LoC | Split by reason-to-change; see Tier B in solid-decoupling-audit.md |
| `apps/web/app/recipes/[id]/edit/page.tsx` | 3851 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/mash/page.tsx` | 2173 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/RecipeEditScreen.tsx` | 2125 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/sparge/page.tsx` | 1456 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/boil/page.tsx` | 1445 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/WaterMashScreen.tsx` | 1259 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/YeastScreen.tsx` | 927 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/WaterBoilScreen.tsx` | 852 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/native/src/modules/brewery/screens/WaterSpargeScreen.tsx` | 827 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/yeast/page.tsx` | 615 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/recipes/[id]/water/page.tsx` | 595 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/modules/brewery/routes/brewSessions.ts` | 589 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `services/api/src/modules/brewery/routes/recipeWaterSettings.ts` | 526 | Brewery vertical | S, D | P2 | route file 526 LoC | Extract service layer; handler = parse → service → schema |
| `apps/native/src/modules/brewery/screens/WaterHubScreen.tsx` | 416 | Apps (native) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `services/api/src/routes/integrationsTilt.ts` | 407 | Platform routes/services | S, D | P2 | route file 407 LoC | Extract service layer; handler = parse → service → schema |
| `services/api/src/routes/platformRecipes.ts` | 368 | Platform routes/services | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `services/api/src/modules/brewery/routes/ingredients.ts` | 302 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `services/api/src/modules/brewery/routes/recipes.ts` | 208 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `services/api/src/routes/platformAds.ts` | 178 | Platform routes/services | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `services/api/src/modules/brewery/routes/styles.ts` | 43 | Brewery vertical | S, D | P2 | app.prisma in route handler | Extract service layer; handler = parse → service → schema |
| `apps/web/app/recipes/_lib/beerjsonRecipe.ts` | 37 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-beerjson" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/_components/RecipeTitleWithMeta.tsx` | 28 | Apps (web) | D | P2 | review client-safe import "@umbraculum/brewery-recipes-ui" | Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md |
| `apps/web/app/_components/RecipeImportForm.tsx` | 756 | Apps (web) | S, I | P3 | file size 756 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/ferm-data-integration/page.tsx` | 728 | Apps (web) | S, I | P3 | file size 728 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/BrewdayStepsSettingsScreen.tsx` | 678 | Apps (native) | S, I | P3 | file size 678 LoC | Review logical cohesion |
| `services/api/src/services/recipeWaterSettingsService.ts` | 664 | Platform routes/services | S, I | P3 | file size 664 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/EquipmentScreen.tsx` | 655 | Apps (native) | S, I | P3 | file size 655 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/yeast/page.tsx` | 615 | Apps (web) | S, I | P3 | file size 615 LoC | Review logical cohesion |
| `services/api/src/services/rendering/renderingJobService.ts` | 611 | Platform routes/services | S, I | P3 | file size 611 LoC | Review logical cohesion |
| `apps/web/app/recipes/[id]/water/page.tsx` | 595 | Apps (web) | S, I | P3 | file size 595 LoC | Review logical cohesion |
| `services/api/src/modules/brewery/routes/brewSessions.ts` | 589 | Brewery vertical | S, I | P3 | file size 589 LoC | Review logical cohesion |
| `services/api/src/importers/beerxmlImporter.ts` | 582 | Other | S, I | P3 | file size 582 LoC | Review logical cohesion |
| `services/api/src/modules/brewery/routes/recipeWaterSettings.ts` | 526 | Brewery vertical | S, I | P3 | file size 526 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/WaterProfilesScreen.tsx` | 497 | Apps (native) | S, I | P3 | file size 497 LoC | Review logical cohesion |
| `services/api/src/services/brewdaySettingsService.ts` | 492 | Platform routes/services | S, I | P3 | file size 492 LoC | Review logical cohesion |
| `services/api/src/cli/seedE2eFixture.ts` | 482 | Other | S, I | P3 | file size 482 LoC | Review logical cohesion |
| `services/api/src/services/ai/orchestrator.ts` | 465 | Platform routes/services | S, I | P3 | file size 465 LoC | Review logical cohesion |
| `services/api/src/seed/sources/beerproto/beerproto.ts` | 461 | Other | S, I | P3 | file size 461 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/FermDataIntegrationScreen.tsx` | 439 | Apps (native) | S, I | P3 | file size 439 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/recipes/page.tsx` | 434 | Apps (web) | S, I | P3 | file size 434 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/RecipesListScreen.tsx` | 433 | Apps (native) | S, I | P3 | file size 433 LoC | Review logical cohesion |
| `apps/native/src/modules/brewery/screens/WaterHubScreen.tsx` | 416 | Apps (native) | S, I | P3 | file size 416 LoC | Review logical cohesion |
| `apps/web/app/[locale]/(brewery)/water-profiles/page.tsx` | 416 | Apps (web) | S, I | P3 | file size 416 LoC | Review logical cohesion |
| `services/api/src/routes/integrationsTilt.ts` | 407 | Platform routes/services | S, I | P3 | file size 407 LoC | Review logical cohesion |
| `packages/recipes-ui/src/mash/MashStepsEditor.tsx` | 402 | Packages | S, I | P3 | file size 402 LoC | Review logical cohesion |

---

## Manual audit notes (slice summaries)

See [solid-decoupling-audit.md §3](./solid-decoupling-audit.md) for slice-by-slice evidence and Tier A/B/C recommendations not fully automatable.

---

*Generated by `scripts/audit/solid-inventory.ts`.*
