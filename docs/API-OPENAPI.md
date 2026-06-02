# OpenAPI — platform catalog + brewery add-on

**Tier:** Public  
**Status:** F1 Done (platform + brewery add-on) — Phase D closure 2026-06-01  
**Audience:** external integrators, module authors, maintainers  

This document is the **canonical index** for machine-readable API documentation in Umbraculum. Human route tables in module docs remain authoritative when a spec and a route table disagree until the drift is fixed.

---

## Status

| Aspect | Platform catalog | Brewery add-on | F1 status |
|--------|------------------|----------------|------------|
| Artifact | [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) | [`services/api/openapi/brewery.json`](../services/api/openapi/brewery.json) | Committed + CI-checked |
| Profile | `UMBRACULUM_MODULE_PROFILE=platform` at generation | `reference` profile | — |
| Coverage | **81 paths / 105 operations** | **55 paths / 70 operations** | **175 ops (~97%)** |
| Tags | `automation`, `pim`, `mrp`, `crp`, `rendering`, `platform`, `billing`, `ads`, `ai`, `platform-admin`, `integrations`, `webhooks` | `brewery` only | SSE chat exempt |
| CI | `npm run openapi:check` validates **both** files | same | Floor counts in `openapi.test.ts` |

**ISVs without the brewery vertical:** use the **platform catalog only** — see [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) and [`design/platform-module-profile.md`](design/platform-module-profile.md).

**Documented outside OpenAPI:** `POST /ai/chat` (SSE) — see [Streaming endpoints (SSE)](#streaming-endpoints-sse) below.

---

## Artifact locations

| Consumer | Location |
|----------|----------|
| Platform catalog (git) | [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) |
| Brewery add-on (git) | [`services/api/openapi/brewery.json`](../services/api/openapi/brewery.json) |
| Docs site static copies | [`docs-site/static/openapi/openapi.json`](../docs-site/static/openapi/openapi.json), [`docs-site/static/openapi/brewery.json`](../docs-site/static/openapi/brewery.json) |
| **Browsable specs (docs site)** | Platform: [https://docs.umbraculum.dev/openapi-platform](https://docs.umbraculum.dev/openapi-platform) (Redoc embed of platform catalog). Brewery add-on: [https://docs.umbraculum.dev/openapi-brewery](https://docs.umbraculum.dev/openapi-brewery). |
| Runtime (API) | `GET /api/openapi.json` (platform); `GET /api/openapi/brewery.json` when brewery module enabled |
| Local Swagger UI (dev) | `http://localhost:18080/api/documentation` when `NODE_ENV` ≠ `production` |

---

## Coverage matrix

Operations appear in a committed spec only when the Fastify route carries an OpenAPI **tag** on a Zod-backed `schema` block.

| OpenAPI tag | Module / surface | Platform spec | Brewery spec | Human route table |
|-------------|------------------|---------------|--------------|-------------------|
| `automation` | Canonical automation | Yes | — | [`modules/canonical/automation.md`](modules/canonical/automation.md) §4 |
| `pim` | Canonical PIM | Yes | — | [`modules/canonical/pim.md`](modules/canonical/pim.md) |
| `mrp` | Canonical MRP | Yes | — | [`design/canonical-mrp-module-surface.md`](design/canonical-mrp-module-surface.md) |
| `crp` | Canonical CRP | Yes | — | [`design/canonical-crp-module-surface.md`](design/canonical-crp-module-surface.md) |
| `rendering` | Horizontal rendering (RFC-0007) | Yes | — | [`design/canonical-document-rendering-surface.md`](design/canonical-document-rendering-surface.md) |
| `platform` | Health, auth, workspaces | Yes (15 ops) | — | [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) |
| `billing` | Workspace billing | Yes | — | [`services/api/README.md`](../services/api/README.md) |
| `ads` | Public ad slots | Yes | — | same |
| `ai` | Proposals, settings, usage | Yes (not `/ai/chat` SSE) | — | [`packages/contracts/src/ai/`](../packages/contracts/src/ai/) |
| `platform-admin` | Platform ads + recipes | Yes | — | same |
| `integrations` | Tilt / iSpindel / RAPT | Yes | — | same |
| `webhooks` | Stripe, RevenueCat | Yes | — | same |
| `brewery` | Reference vertical | No | Yes (70 ops) | [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) |
| *(SSE)* | `POST /ai/chat` stream | — | — | Human route table + contracts |

---

## Generator stack

1. Route handlers declare Zod schemas via `fastify-type-provider-zod` (`zodApp.get/post/...`) with `schema.tags`.
2. `@fastify/swagger` registers with `jsonSchemaTransform` / `jsonSchemaTransformObject`.
3. [`openapi-generate.ts`](../services/api/src/scripts/openapi-generate.ts) boots `buildApp()` per profile, calls `app.swagger()`, filters via [`filterOpenApiPaths.ts`](../services/api/src/openapi/filterOpenApiPaths.ts), validates with `@readme/openapi-parser`, writes JSON.

Platform catalog excludes the `brewery` tag even when generating from a reference boot — brewery paths never leak into `openapi.json`.

---

## Maintainer runbook

All commands run **inside the API container** (never host Node):

```bash
docker compose exec api bash -lc 'cd /app && npm run openapi:generate'
docker compose exec api bash -lc 'cd /app && npm run openapi:check'
```

Optional single-profile regenerate:

```bash
docker compose exec api bash -lc 'cd /app && npx tsx src/scripts/openapi-generate.ts --profile=platform'
docker compose exec api bash -lc 'cd /app && npx tsx src/scripts/openapi-generate.ts --profile=reference'
```

**When to regenerate:** after changing any `zodApp` route schema, [`openapi/metadata.ts`](../services/api/src/openapi/metadata.ts), or module profile registration.

**After regenerate:** `openapi:generate` writes both committed artifacts under `services/api/openapi/` **and** mirrors them to `docs-site/static/openapi/` automatically when the repo mount is writable. In Docker, `/umbraculum` is read-only — the script skips the mirror with a warning; copy from `services/api/openapi/` on the host:

```bash
cp services/api/openapi/openapi.json docs-site/static/openapi/openapi.json
cp services/api/openapi/brewery.json docs-site/static/openapi/brewery.json
```

Rebuild `@umbraculum/contracts` dist when adding route schemas under `packages/contracts/src/`.

CI fails if either committed file drifts from a fresh generate (`openapi:check`).

### Docs site Redoc embed (maintainer)

Browsable specs on **docs.umbraculum.dev** are **Redoc standalone** inside Docusaurus custom pages — not part of the OpenAPI generator. Examples: [platform catalog Redoc](/openapi-platform) → `docs-site/static/openapi/openapi.json`; [brewery add-on Redoc](/openapi-brewery) → `docs-site/static/openapi/brewery.json`.

**Adding or changing an embed:** follow [`docs-site/README.md`](../docs-site/README.md) § "OpenAPI / Redoc embed pages". Critical rule for agents: never `Redoc.init(..., {}, ...)` without `getRedocTheme(colorMode)` — Docusaurus dark mode breaks Redoc's default light styling (white sidebar, unreadable body text). Reuse [`OpenApiRedocEmbed`](../docs-site/src/components/OpenApiRedocEmbed.tsx).

---

## Integrator workflow

1. **Pick your SKU** — platform-only integrators: `openapi.json` only; reference vertical evaluators: both files.
2. **Browse machine-readable paths** — [platform Redoc on docs.umbraculum.dev](https://docs.umbraculum.dev/openapi-platform) or [brewery add-on Redoc](https://docs.umbraculum.dev/openapi-brewery); filter by tag in Swagger UI locally (`http://localhost:18080/api/documentation`).
3. **Pick the module** — [`MODULES.md`](MODULES.md) + per-module route tables.
4. **Pin types** — `@umbraculum/<code>-contracts` for canonical domains; `@umbraculum/contracts` for platform auth/workspaces/rendering parsers.
5. **Call the API (optional)** — `@umbraculum/api-client` typed facades over raw `fetch` (OpenAPI path types + contracts parsers). Subpaths: `/brewery`, `/automation`, `/pim`, `/mrp`, `/crp`. See [`packages/api-client/README.md`](../packages/api-client/README.md).
6. **Auth** — cookie `sid` (web) or bearer (native); auth paths are in the platform spec under tag `platform`.
7. **Automation adapters** — `CONTRACT_VERSION` remains authoritative over OpenAPI for mailbox semantics.

Try locally: [`GETTING-STARTED.md`](GETTING-STARTED.md) §2.3.

---

## Known limitations

- **F1 closure** — **175 documented operations** (~97%). One handler exempt: `POST /ai/chat` SSE (see §Streaming endpoints).
- **BeerJSON / complex JSON** — OpenAPI may show loose object schemas; contracts + route tables win.
- **Binary / stream responses** — routes that `reply.send(Buffer)` use `z.custom<Buffer>` in contracts (e.g. [`BeerJsonExportResponseSchema`](../packages/contracts/src/brewery/routeSchemas.ts)); OpenAPI shows an empty JSON schema (`{}`) while runtime returns raw bytes with `Content-Type` / `Content-Disposition` headers. Human route tables and contracts win on wire format.
- **Codegen + facades (Phase E, 2026-06)** — `@umbraculum/api-client` exports OpenAPI-derived **types** plus typed **facades** (`listWorkspaces`, `listRecipes`, rendering helpers, …). Subpath `@umbraculum/api-client/brewery` for add-on SKU. Regenerate types: `npm run openapi:codegen -w @umbraculum/api-client`. Runtime validation remains `@umbraculum/contracts` parsers inside each facade.

---

## Streaming endpoints (SSE)

`POST /ai/chat` streams Server-Sent Events and is **not** included in `openapi.json` (OpenAPI 3.0 cannot describe the event stream usefully). Integrators and agents should use this section plus [`packages/contracts/src/ai/aiChat.ts`](../packages/contracts/src/ai/aiChat.ts).

| Item | Detail |
|------|--------|
| Method / path | `POST /ai/chat` |
| Auth | Active workspace session (cookie `sid` or bearer) — same as other AI routes |
| Request body | `AiChatRequestBodySchema`: `{ message: string (1–8000), sessionId?: string, routeId?: string }` |
| Response | `Content-Type: text/event-stream` — each event: `event: <type>\ndata: <json>\n\n` |
| Event union | `assistant_chunk`, `tool_call`, `tool_result`, `proposal`, `complete`, `error` — see `AiSseEventSchema` in contracts |
| Client | [`packages/ui/src/ai/useAiChatStream.ts`](../packages/ui/src/ai/useAiChatStream.ts) mirrors the wire format |

---

## Phase E — typed integrator facades (2026-06-01)

Phase E adds **hand-written facades** on `@umbraculum/api-client`: OpenAPI path types (compile-time) + `@umbraculum/contracts` parsers (runtime). Wire authority remains contracts — generated types are ergonomics only.

| Export | Scope |
|--------|--------|
| Main entry `@umbraculum/api-client` | Platform facades: auth, workspaces, health, billing, integrations list, rendering jobs |
| Subpath `@umbraculum/api-client/brewery` | Brewery add-on: recipes, brew sessions, water profiles/settings/compute-and-save/calc preview, hub summary |
| Subpath `@umbraculum/api-client/automation` | Canonical automation hot paths: vessels list/detail |
| Subpath `@umbraculum/api-client/pim` | Canonical PIM hot paths: products, variants, attribute-sets, categories |
| Subpath `@umbraculum/api-client/mrp` | Canonical MRP hot paths: production orders, material requirements |
| Subpath `@umbraculum/api-client/crp` | Canonical CRP hot paths: resources, work centers, schedule, conflicts, capacity load |

**Pilot consumers:** `apps/native` (recipes/brew-sessions lists; all `Water*` screens), `apps/web` (`renderJobClient` → platform rendering; `breweryWaterClient` → recipe water pages + water-profiles; `fetchAuthMe` → all auth/me call sites; canonical module pages under `(automation|pim|mrp|crp)/`).

**Plans:** OpenAPI Phase E + F10 (`openapi_phase_e_f10_7a3c2d91`); Phase E5 water facades (`openapi_phase_e5_water_10eb23aa`); Phase E6 web water + `/water-calc/*` (`openapi_phase_e6_web_5fd28069`); Phase E6d-platform + E7 (`e7_auth_+_modules_af183047`).

---

## Phase E5 — brewery water facades (2026-06-01)

Phase E5 completes deferred E2 PR2: typed `@umbraculum/api-client/brewery` facades for native water hot paths (`/water-profiles`, `/recipes/{id}/water-settings`, mash/sparge/boil compute-and-save). Standalone `/water-calc/*` (web interactive preview) remains Phase E6.

---

## Phase E6 — standalone water-calc facades + web migration (2026-06-01)

Phase E6 adds all **10** `/water-calc/*` POST facades on `@umbraculum/api-client/brewery` (`waterCalc.ts`) and migrates web recipe water pages + standalone water-profiles page off raw `apiFetch` to typed facades via `apps/web/app/_lib/breweryWaterClient.ts` (`webBreweryApiClient()` + `cookieAuth()`). Completes the Phase E water family after E5 (native recipe-scoped paths).

---

## Phase E6d-platform — web auth/me migration (2026-06-02)

Phase E6d-platform migrates all remaining web `GET /api/auth/me` call sites to the existing `getAuthMe` facade while preserving centralized session-expired UX (`brewery:auth-expired`, `brewery:auth-changed`). Web apps use `fetchAuthMe()` in `apps/web/app/_lib/fetchAuthMe.ts`, which wraps `getAuthMe(webPlatformApiClient())`. Session hooks were centralized on the shared client factory in **Phase E13** (`sessionAuthUx.ts` via custom fetch in `webPlatformApiClient()`). Shared cookie client factory: `webPlatformApiClient()` in `apps/web/app/_lib/webApiClient.ts` (also used by `renderJobClient`, `breweryWaterClient`, and E7 canonical module pages).

---

## Phase E7 — canonical-module facades + web migration (2026-06-02)

Phase E7 adds typed facade subpaths for the four canonical modules and migrates all existing web pages under `(automation|pim|mrp|crp)/` off raw `apiFetch`:

| Subpath | Facades (hot paths) | Contracts package |
|---------|---------------------|-------------------|
| `@umbraculum/api-client/automation` | `listVessels`, `getVessel` | `@umbraculum/automation-contracts` |
| `@umbraculum/api-client/pim` | `listProducts`, `createProduct`, `getProduct`, `listProductVariants`, `listAttributeSets`, `getAttributeSet`, `listCategories` | `@umbraculum/pim-contracts` |
| `@umbraculum/api-client/mrp` | `listProductionOrders`, `getProductionOrder`, `listMaterialRequirements` | `@umbraculum/mrp-contracts` |
| `@umbraculum/api-client/crp` | `listResources`, `getResource`, `listWorkCenters`, `listScheduledOperations`, `listCapacityConflicts`, `getCapacityLoad` | `@umbraculum/crp-contracts` |

Render-job POST URLs on module pages remain on `renderJobClient` (unchanged). Full OpenAPI catalog coverage for each module is deferred to E7-follow-up.

---

## Phase E7-follow-up — canonical-module catalog facades (2026-06-02)

E7-follow-up completes deferred catalog facades for canonical modules (MRP, PIM, CRP) without migrating additional web pages:

| Subpath | Facades | Contracts package |
|---------|---------|-------------------|
| `@umbraculum/api-client/mrp` | `listBoms`, `createBom`, `getBom`, `patchBom`, `deleteBom`; `getWorkOrderPreview`; `submitWorkOrderRenderJob`, `submitMaterialRequirementsRenderJob`, `submitProductionOrdersListRenderJob` (+ `run*RenderJobExport` helpers) | `@umbraculum/mrp-contracts` |
| `@umbraculum/api-client/pim` | `listAttributes`, `createAttribute`, `getAttribute`, `patchAttribute`, `deleteAttribute`; `listProductMediaAssetRefs`, `createProductMediaAssetRef`, `getMediaAssetRef`, `patchMediaAssetRef`, `deleteMediaAssetRef` | `@umbraculum/pim-contracts` |
| `@umbraculum/api-client/crp` | `submitCapacityLoadRenderJob`, `submitScheduleRenderJob`, `submitResourcesCalendarRenderJob`, `submitConflictsRenderJob` (+ `run*RenderJobExport` helpers on `planning.ts`) | `@umbraculum/contracts` (`RenderJobSubmitResponseSchema`) + `@umbraculum/crp-contracts` for GET planning |

Module render-job POSTs delegate to `platform/rendering` (`submitRenderJob` / `runAsyncRenderJobExport`) with `toClientPath()`-resolved URLs. Parser map: `MRP_FACADE_PARSER_MAP`, `PIM_FACADE_PARSER_MAP`, `CRP_FACADE_PARSER_MAP` in [`facadeParserMap.ts`](../packages/api-client/src/facadeParserMap.ts).

**Note:** MRP BOM mutate routes (`POST`/`PATCH`/`DELETE` `/mrp/boms`) are facaded for catalog completeness; the API currently exposes `GET` only on those paths until server routes land.

---

## Phase E8 — brewery web tranche (2026-06-02)

Phase E8 extends `@umbraculum/api-client/brewery` with recipes catalog (create/delete/versions/duplicate/import), styles, ingredients search, brew sessions (full lifecycle + integration attach/readings), inventory, equipment profiles, and brewday settings. Platform integration facades (`getWorkspaceIntegration`, `listIntegrationDevices` with query options, tilt attach/detach, recent brew sessions) live in `platform/integrations.ts`.

All brewery-vertical web pages under `(brewery)/` and `app/recipes/**` (except BeerJSON export download links) migrate off raw `apiFetch` to `webBreweryApiClient()` + typed facades. Auth, platform-admin, AI, and ads `apiFetch` call sites remain for E9.

| Facade module | Hot paths |
|---------------|-----------|
| `brewery/recipes` | `createRecipe`, `deleteRecipe`, `listRecipeVersions`, `createRecipeVersion`, `duplicateRecipe` (+ existing list/get/patch/brew-session create) |
| `brewery/styles` | `listStyles` |
| `brewery/ingredients` | `searchFermentables`, `searchHops`, `searchYeasts` |
| `brewery/recipeImport` | `previewRecipeImport`, `importRecipe`, bulk preview/import |
| `brewery/brewSessions` | session CRUD, start/pause/stop, steps, timers, integration attach/readings |
| `brewery/inventory` | list/create/patch/delete |
| `brewery/equipmentProfiles` | list/create/patch/delete |
| `brewery/brewdaySettings` | get/patch |
| `platform/integrations` | workspace integration CRUD, devices list, tilt attach/detach, recent brew sessions |

---

## Phase E6d-native — brewery native migration (2026-06-02)

Phase E6d-native migrates all brewery-domain screens under `apps/native/src/modules/brewery/` off raw `api.get/post/patch/delete` to E8 brewery facades + platform auth/integration facades. Shared client: `nativePlatformApiClient(token)` in `apps/native/src/auth/nativeApiClient.ts` (`bearerTokenAuth` + `getApiBaseUrl()`).

| Slice | Native screens | Facades |
|-------|----------------|---------|
| E6d-PR1 | `AuthProvider`, `DashboardScreen`, `SelectWorkspaceScreen` | `getAuthMe`, `loginNative`, `logout`, `setActiveWorkspace`, `getHealth` |
| E6d-PR2 | `RecipesListScreen`, `RecipeEditScreen`, `YeastScreen`, `EquipmentScreen`, `BrewdayStepsSettingsScreen`, `WaterProfilesScreen` | `@umbraculum/api-client/brewery` recipes/styles/ingredients/equipment/brewday/water-settings |
| E6d-PR3 | `BrewSessionDetailScreen`, `FermDataIntegrationScreen` | `brewSessions` + `platform/integrations` |

Completed in E10: `AdSlot.tsx`, `openWebFallback.ts` — see [Phase E10-native-tail](#phase-e10-native-tail-2026-06-02) below.

**Grep gate:** zero raw `api.(get|post|patch|delete)(…'/api/(recipes|brew-sessions|…)` under `apps/native/src/modules/brewery/`.

---

## Phase E9 — platform web tranche (2026-06-02)

Phase E9 completes the web `apiFetch` → typed-facade migration for remaining platform surfaces. All call sites use `webPlatformApiClient()` (`apps/web/app/_lib/webApiClient.ts`) + `@umbraculum/api-client` platform facades with `ApiClientError` UX mapping.

| PR | Facade module | Web pages migrated |
|----|---------------|-------------------|
| E9-PR1 | `platform/auth` — `signup`, `patchAuthPreferences`, `exchangeWebviewToken` (+ existing `login`, `logout`, `setActiveWorkspace`) | `(auth)/login`, `(auth)/signup`, `LogoutButton`, `(auth)/select-workspace`, `accessibility` |
| E9-PR2 | `platform/ai` — `getWorkspaceAiSettings`, `patchWorkspaceAiSettings`, `getWorkspaceAiUsage`, `createAiUpgradeBillingIntent` | `ai/settings`, `ai/usage`, `ai/upgrade` |
| E9-PR3 | `platform/ads` — `getAdSlot`; `platform/platformAdmin` — workspaces/recipes list, recipe import, ads CRUD | `AdSlot`, `platform/recipes`, `platform/ads`, `RecipeImportForm` (platform path) |

BeerJSON export download links on `platform/recipes` remain plain `<a href="/api/platform/recipes/...">` anchors (binary/stream responses — same pattern as E8 brewery exports).

---

## Phase E10-native-tail — native platform migration (2026-06-02)

Phase E10 completes the native app migration off raw HTTP for the last two platform call sites deferred from E6d/E9. Shared client: `nativePlatformApiClient(token, baseUrl?)` in `apps/native/src/auth/nativeApiClient.ts`.

| Native file | Facade |
|-------------|--------|
| `apps/native/src/components/AdSlot.tsx` | `getAdSlot` (`platform/ads`) |
| `apps/native/src/navigation/openWebFallback.ts` | `exchangeWebviewToken` (`platform/auth`) |

**Ads platform note:** Native previously sent `?platform=native`, but [`AdPlatformSchema`](../packages/contracts/src/ads/routeSchemas.ts) and the Prisma `AdPlatform` enum coerce to `web` only. E10 calls `getAdSlot` without a platform override — same effective server behavior. A future product tranche can add `native` to Prisma + contracts if native-specific ad inventory is needed.

**Grep gate:** zero raw `api.(get|post|patch|delete|put)(` under `apps/native/src/`.

---

## Phase E13 — web apiFetch retirement (2026-06-02)

Phase E13 completes the web Phase E migration by retiring legacy `apiFetch` and centralizing session UX on the shared client factory.

| Change | Detail |
|--------|--------|
| Deleted | `apps/web/app/_lib/apiClient.ts` (`apiFetch`), `apps/web/app/recipes/[id]/water/_lib/api.ts` (dead re-export barrel) |
| Session UX | `sessionAuthUx.ts` hooks run inside `webPlatformApiClient()` custom `fetch` — all typed facades emit `brewery:auth-expired` / `brewery:auth-changed` on 401 when the tab had a prior valid session |
| `fetchAuthMe()` | Remains the typed `/auth/me` helper for components that need `{ ok, status, data }`; no duplicate session hooks |

**Grep gate:** zero `apiFetch` under `apps/web/`.

**Phase E closure:** first-party web HTTP is 100% `@umbraculum/api-client` facades via `webPlatformApiClient()` / `webBreweryApiClient()`.

---

## Post-E13 — integrator verification (2026-06-02)

| Artifact | Purpose |
|----------|---------|
| [`docs/INTEGRATOR-QUICKSTART.md`](INTEGRATOR-QUICKSTART.md) | External npm install + bearer/cookie examples (no monorepo clone) |
| [`scripts/integrator-api-smoke.sh`](../scripts/integrator-api-smoke.sh) | Cookie-session login → `/api/auth/me` → `/api/workspaces` → `/api/styles` (web integrator path) |
| [`packages/contracts/src/brewery/routeSchemas.test.ts`](../packages/contracts/src/brewery/routeSchemas.test.ts) | Strict brewery list schema regression (e.g. `BeerStyle.version` string wire shape) |
| [`scripts/dogfood-npm-smoke.sh`](../scripts/dogfood-npm-smoke.sh) | Registry-only npm install smoke (CI job `dogfood-npm-smoke`) |
| [`publish-contracts-api-client.yml`](../.github/workflows/publish-contracts-api-client.yml) | OIDC publish for `@umbraculum/contracts` + `@umbraculum/api-client` on `sdk-contracts-v*` tags |

**npm publish:** `@umbraculum/contracts@0.0.1` and `@umbraculum/api-client@0.0.1` on the public registry (2026-06-02). Monorepo consumers dogfood registry semver — see [`npm-sdk-monorepo-dogfood.md`](design/npm-sdk-monorepo-dogfood.md). Future bumps: [`npm-sdk-trusted-publishing.md`](design/npm-sdk-trusted-publishing.md) § "Contracts + api-client extension" (`sdk-contracts-v*` tags).

**Local smoke:**

```bash
./scripts/integrator-api-smoke.sh
# or: BASE_URL=http://localhost:18080 ./scripts/integrator-api-smoke.sh
```

---

## Phase E8-follow-up — brewery catalog facades (2026-06-02)

E8-follow-up adds brewery catalog facades deferred from E8 (BeerJSON export download links and ingredient admin):

| Facade module | Hot paths |
|---------------|-----------|
| `brewery/recipeExport` | `exportRecipeBeerJson`, `exportAllRecipesBeerJson`, `recipeBeerJsonExportPath`, `allRecipesBeerJsonExportPath` (GET binary via `BeerJsonExportResponseSchema`) |
| `brewery/ingredientAdmin` | `listIngredientSyncRuns`, `runIngredientSync` |

Parser map entries live in `BREWERY_FACADE_PARSER_MAP` in [`facadeParserMap.ts`](../packages/api-client/src/facadeParserMap.ts).

---

## F1 closure (Phase D, 2026-06-01)

F1 tracker row in [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) is **Done**. Platform + brewery add-on specs cover all JSON HTTP handlers except the SSE chat stream above. Regression guards: `openapi.test.ts` minimum path/op floors + `OPENAPI_DOCUMENTATION_EXEMPT_ROUTES` in [`exemptRoutes.ts`](../services/api/src/openapi/exemptRoutes.ts).

**Related:** [RFC-0003](rfcs/0003-validation-library-adoption.md) Decision G, [ecosystem case study — Business Central](design/ecosystem-case-study-business-central.md) §4.
