# @umbraculum/api-client

Typed API client with pluggable auth strategies (cookie sessions for web; bearer tokens for native + Node).

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

The transport layer between any client and `services/api`. Web (Next.js) and native (React Native + Expo) both consume from this package, but they authenticate differently — the web app rides a cookie session (`sid` httpOnly), the native app sends a bearer token (`Authorization: Bearer <token>`). This package abstracts that split behind two interchangeable auth-strategy factories (`cookieAuth()` and `bearerTokenAuth(getToken)`); the rest of the client surface is identical across platforms. Returned payloads are runtime-validated by the parsers in [`@umbraculum/contracts`](../contracts/README.md). See [`docs/AUTH-STRATEGY.md`](../../../docs/AUTH-STRATEGY.md) for the platform-wide auth direction.

## Scope

- **Contains**: the `createApiClient(baseUrl, auth, options?)` factory, auth strategies, **typed facades** (Phase E), RFC-0007 render-job helpers, OpenAPI-derived path/component **types** (`PlatformOpenApiPaths`, `BreweryOpenApiPaths`, …), and a `fetch` injection point for environments where the global `fetch` is not appropriate (Node tests, RN Hermes).
- **Does not contain**: contract DTO/parser definitions (those live in `@umbraculum/contracts`); auth backend logic — token issuance, session creation (lives in `services/api/src/routes/auth/`); UI session-state management (lives in the consuming app).

## Typed facades (Phase E)

**Two-layer client:** OpenAPI types (compile-time) + contracts parsers (runtime). Never trust `JSON.parse` + type assertion alone.

First-party apps reach the API through nginx at `/api/*`. Facades map OpenAPI path keys to client paths via `toClientPath()` internally.

| Facade module | Example calls | Contracts parser |
|---------------|---------------|------------------|
| `platform/auth` | `getAuthMe`, `login`, `loginNative`, `signup`, `logout`, `setActiveWorkspace`, `patchAuthPreferences`, `exchangeWebviewToken` | `AuthMeResponseSchema`, `AuthLogin*Schema`, `AuthSignup*Schema`, … |
| `platform/workspaces` | `listWorkspaces`, `createWorkspace`, `getHealth` | `WorkspacesListResponseSchema`, `HealthResponseSchema` |
| `platform/modules` | `getWorkspaceBilling`, `listIntegrationDevices` | `WorkspaceBillingResponseSchema`, `IntegrationDevicesListResponseSchema` |
| `platform/ai` | `getWorkspaceAiSettings`, `patchWorkspaceAiSettings`, `getWorkspaceAiUsage`, `createAiUpgradeBillingIntent` | `WorkspaceAiSettingsResponseSchema`, `WorkspaceAiUsageResponseSchema`, `BillingIntentResponseSchema` |
| `platform/ads` | `getAdSlot` | `AdSlotResponseSchema` |
| `platform/platformAdmin` | `listPlatformWorkspaces`, `listPlatformRecipes`, platform recipe import, platform ads CRUD | `PlatformWorkspacesListResponseSchema`, `PlatformAdsListResponseSchema`, … |
| `platform/rendering` | `submitRenderJob`, `runAsyncRenderJobExport`, … | `RenderJob*ResponseSchema` |
| `brewery/recipes` | `listRecipes`, `getRecipe`, `patchRecipe`, `listBrewSessionsForRecipe`, `createBrewSession` | `parseRecipesListResponse`, `RecipeResponseSchema`, … |
| `brewery/waterProfiles` | `listWaterProfiles`, `createWaterProfile`, `verifyWaterProfile`, `unverifyWaterProfile`, `deleteWaterProfile` | `parseWaterProfilesResponse`, `WaterProfileResponseSchema`, `OkResponseSchema` |
| `brewery/waterSettings` | `getRecipeWaterSettings`, `updateRecipeWaterSettings` | `RecipeWaterSettings*ResponseSchema` |
| `brewery/waterCompute` | `computeAndSaveMash`, `computeAndSaveSparge`, `computeAndSaveBoil` | `parseMashComputeAndSaveResponse`, … |
| `brewery/waterCalc` | `calcSaltAdditions`, `estimateMashPh`, `calcMashOverall`, `calcSpargeOverall`, `calcBoilOverall`, … (10 `/water-calc/*` POSTs) | `WaterCalcWithDerivationResponseSchema`, `WaterCalcResultOnlyResponseSchema` |
| `brewery/water` | `getRecipeWaterHubSummary` | `parseRecipeWaterHubSummaryResponse` |
| `brewery/styles` | `listStyles` | `StylesListResponseSchema` |
| `brewery/ingredients` | `searchFermentables`, `searchHops`, `searchYeasts` | `FermentablesListResponseSchema`, … |
| `brewery/recipeImport` | `previewRecipeImport`, `importRecipe`, bulk preview/import | `RecipeImport*ResponseSchema` |
| `brewery/brewSessions` | `getBrewSession`, session lifecycle, steps, integration attach/readings | `BrewSession*ResponseSchema`, `Integration*ResponseSchema` |
| `brewery/inventory` | `listInventory`, `createInventoryItem`, `patchInventoryItem`, `deleteInventoryItem` | `Inventory*ResponseSchema` |
| `brewery/equipmentProfiles` | list/create/patch/delete | `EquipmentProfile*ResponseSchema` |
| `brewery/brewdaySettings` | `getBrewdaySettings`, `patchBrewdaySettings` | `BrewdaySettingsResponseSchema` |
| `platform/integrations` | workspace integration CRUD, devices, tilt attach/detach, recent sessions | `@umbraculum/contracts` integrations schemas |
| `automation/vessels` | `listVessels`, `getVessel` | `VesselListResponseSchema`, `VesselStateResponseSchema` |
| `pim/products` | `listProducts`, `createProduct`, `getProduct`, `listProductVariants` | `Product*ResponseSchema`, `VariantListResponseSchema` |
| `pim/attributeSets` | `listAttributeSets`, `getAttributeSet` | `AttributeSet*ResponseSchema` |
| `pim/categories` | `listCategories` | `CategoryListResponseSchema` |
| `mrp/productionOrders` | `listProductionOrders`, `getProductionOrder`, `listMaterialRequirements` | `ProductionOrder*ResponseSchema`, `MaterialRequirementListResponseSchema` |
| `crp/planning` | `listResources`, `getResource`, `listWorkCenters`, `listScheduledOperations`, `listCapacityConflicts`, `getCapacityLoad` | `@umbraculum/crp-contracts` response schemas |

Full path → parser map: [`src/facadeParserMap.ts`](src/facadeParserMap.ts) (`PLATFORM_*`, `BREWERY_*`, `AUTOMATION_*`, `PIM_*`, `MRP_*`, `CRP_*` maps).

```typescript
import { bearerTokenAuth, createApiClient, listWorkspaces } from "@umbraculum/api-client";
import { listRecipes } from "@umbraculum/api-client/brewery";
import { listVessels } from "@umbraculum/api-client/automation";

const client = createApiClient(baseUrl, bearerTokenAuth(() => token));
const workspaces = await listWorkspaces(client);
const recipes = await listRecipes(client);
const vessels = await listVessels(client);
```

Errors from non-2xx responses throw `ApiClientError` (status + body).

## External consumer quickstart

Install from npm (monorepo contributors use workspace `file:` links instead — see [`DEVELOPMENT.md`](../../../DEVELOPMENT.md)):

```bash
npm install @umbraculum/api-client@0.0.1 @umbraculum/contracts@0.0.1
# plus @umbraculum/<code>-contracts@0.0.2 for each canonical domain you integrate with
```

Browse OpenAPI paths on the docs site before wiring calls:

- Platform catalog: [docs.umbraculum.dev/openapi-platform](https://docs.umbraculum.dev/openapi-platform)
- Brewery add-on (reference vertical): [docs.umbraculum.dev/openapi-brewery](https://docs.umbraculum.dev/openapi-brewery)

**Runnable sample (no monorepo clone):** [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) — copy of [`scripts/integrator-bearer-smoke.mjs`](../../scripts/integrator-bearer-smoke.mjs). Maintainer sync: when api-client semver changes, update the sample repo `quickstart.mjs` and `@umbraculum/*` pins.

**Subpath imports** (tree-shaking friendly):

| Import | Use when |
|--------|----------|
| `@umbraculum/api-client` | Platform: auth, workspaces, health, billing, AI, ads, integrations, rendering |
| `@umbraculum/api-client/brewery` | Reference vertical add-on |
| `@umbraculum/api-client/automation` | Canonical automation hot paths |
| `@umbraculum/api-client/pim` | Canonical PIM hot paths |
| `@umbraculum/api-client/mrp` | Canonical MRP hot paths |
| `@umbraculum/api-client/crp` | Canonical CRP hot paths |

```typescript
import { bearerTokenAuth, createApiClient, listWorkspaces } from "@umbraculum/api-client";
import { listVessels } from "@umbraculum/api-client/automation";

const client = createApiClient("https://your-host.example", bearerTokenAuth(() => process.env.API_TOKEN!));
const { workspaces } = await listWorkspaces(client);
const vessels = await listVessels(client);
```

Wire authority remains `@umbraculum/contracts` parsers inside each facade — see [`@umbraculum/contracts`](../contracts/README.md).

## Exports

- `createApiClient(baseUrl, auth, options?)`
  - `options.fetch` (optional): inject a cross-platform `fetch` implementation
- `cookieAuth()` (web)
- `bearerTokenAuth(getToken)` (native + Node)
- Platform facades — see `src/platform/*` (re-exported from main entry)
- `@umbraculum/api-client/brewery` — brewery add-on facades only (tree-shaking friendly)
- `@umbraculum/api-client/automation` — canonical automation facades
- `@umbraculum/api-client/pim` — canonical PIM facades
- `@umbraculum/api-client/mrp` — canonical MRP facades
- `@umbraculum/api-client/crp` — canonical CRP facades
- `PlatformOpenApiPaths`, `BreweryOpenApiPaths`, and related `components` / `operations` type exports (generated from committed OpenAPI JSON)

## OpenAPI codegen (Phase E)

Types under `src/generated/` are produced from [`services/api/openapi/openapi.json`](../../../services/api/openapi/openapi.json) and [`brewery.json`](../../../services/api/openapi/brewery.json):

```bash
npm run openapi:codegen -w @umbraculum/api-client      # regenerate
npm run openapi:codegen:check -w @umbraculum/api-client # drift check (T1 OpenAPI slice)
```

Run inside the Node container per [`docs/TESTING.md`](../../../docs/TESTING.md). Commit regenerated files whenever committed OpenAPI artifacts change.

## Auth direction (current)

- **Web**: cookie-based sessions (`sid` httpOnly cookie). Use `cookieAuth()`.
- **Native**: **bearer-only**. Use `bearerTokenAuth(getToken)` and send `Authorization: Bearer <token>`.
- **Node**: if used, treat it as **bearer-only** (do not rely on cookies).

## Webview caveat (“already logged in”)

If we later want **opening a whitelisted web page in a native webview** to be **already authenticated** *without* additional token-handling, we must implement a bridging mechanism (e.g. cookie/session handoff or a token → webview session mechanism). This is **not** automatic with bearer-only native auth.

## Build / test / lint (local)

This package ships runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`
- Brewery subpath: `dist/brewery/index.js`

Commands (run from repo root, container-friendly per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`):

- **Build**: `npm run build -w @umbraculum/api-client` or `npm run build:packages`
- **Test**: `npm test -w @umbraculum/api-client` (vitest in container; see [`docs/TESTING.md`](../../../docs/TESTING.md)).
- **Lint**: covered by root `npm run lint`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (cookie auth), `apps/native` (bearer auth); Node-side test harnesses and scripts that need to call the API as an authenticated user (also bearer).
- **Depends on**: `@umbraculum/contracts` (platform parsers), `@umbraculum/*-contracts` (canonical module parsers). Does **not** depend on Next.js, Expo, React Navigation, or any UI framework.

## Status

**Phase E complete (2026-06-01). Phase E5–E10 (2026-06):** brewery water facades + native migration; web auth/me via `fetchAuthMe`; canonical module facade subpaths + web `(automation|pim|mrp|crp)/` page migration; **E8** brewery web tranche; **E9** platform web tranche; **E10** native platform tail (`AdSlot`, `openWebFallback`). Published on npm at **`0.0.1`** — see [External consumer quickstart](#external-consumer-quickstart).

The "webview caveat" above is the one explicitly-flagged limitation: bearer-only native auth does not automatically give a webview an authenticated session — that requires a future bridging mechanism (cookie/session handoff or token-to-session exchange), which is on the trajectory but not yet implemented.

## Further reading

- [`docs/API-OPENAPI.md`](../../../docs/API-OPENAPI.md) — OpenAPI catalogs + Phase E roadmap
- [`docs/AUTH-STRATEGY.md`](../../../docs/AUTH-STRATEGY.md) — platform-wide auth direction (cookie web + bearer native + future webview bridge)
- [`docs/AUTH-HARDENING-ASSESSMENT.md`](../../../docs/AUTH-HARDENING-ASSESSMENT.md) — auth hardening review and findings
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`@umbraculum/contracts`](../contracts/README.md) — the typed response parsers this client returns
