# @umbraculum/api-client

Typed API client with pluggable auth strategies (cookie sessions for web; bearer tokens for native + Node).

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

The transport layer between any client and `services/api`. Web (Next.js) and native (React Native + Expo) both consume from this package, but they authenticate differently — the web app rides a cookie session (`sid` httpOnly), the native app sends a bearer token (`Authorization: Bearer <token>`). This package abstracts that split behind two interchangeable auth-strategy factories (`cookieAuth()` and `bearerTokenAuth(getToken)`); the rest of the client surface is identical across platforms. Returned payloads are runtime-validated by the parsers in [`@umbraculum/contracts`](../contracts/README.md). See [`docs/AUTH-STRATEGY.md`](../../docs/AUTH-STRATEGY.md) for the platform-wide auth direction.

## Scope

- **Contains**: the `createApiClient(baseUrl, auth, options?)` factory, auth strategies, **typed facades** (Phase E), RFC-0007 render-job helpers, OpenAPI-derived path/component **types** (`PlatformOpenApiPaths`, `BreweryOpenApiPaths`, …), and a `fetch` injection point for environments where the global `fetch` is not appropriate (Node tests, RN Hermes).
- **Does not contain**: contract DTO/parser definitions (those live in `@umbraculum/contracts`); auth backend logic — token issuance, session creation (lives in `services/api/src/routes/auth/`); UI session-state management (lives in the consuming app).

## Typed facades (Phase E)

**Two-layer client:** OpenAPI types (compile-time) + contracts parsers (runtime). Never trust `JSON.parse` + type assertion alone.

First-party apps reach the API through nginx at `/api/*`. Facades map OpenAPI path keys to client paths via `toClientPath()` internally.

| Facade module | Example calls | Contracts parser |
|---------------|---------------|------------------|
| `platform/auth` | `getAuthMe`, `login`, `loginNative` | `AuthMeResponseSchema`, `AuthLogin*Schema` |
| `platform/workspaces` | `listWorkspaces`, `createWorkspace`, `getHealth` | `WorkspacesListResponseSchema`, `HealthResponseSchema` |
| `platform/modules` | `getWorkspaceBilling`, `listIntegrationDevices` | `WorkspaceBillingResponseSchema`, `IntegrationDevicesListResponseSchema` |
| `platform/rendering` | `submitRenderJob`, `runAsyncRenderJobExport`, … | `RenderJob*ResponseSchema` |
| `brewery/recipes` | `listRecipes`, `getRecipe`, `patchRecipe`, `listBrewSessionsForRecipe`, `createBrewSession` | `parseRecipesListResponse`, `RecipeResponseSchema`, … |
| `brewery/waterProfiles` | `listWaterProfiles`, `createWaterProfile`, `verifyWaterProfile`, `unverifyWaterProfile`, `deleteWaterProfile` | `parseWaterProfilesResponse`, `WaterProfileResponseSchema`, `OkResponseSchema` |
| `brewery/waterSettings` | `getRecipeWaterSettings`, `updateRecipeWaterSettings` | `RecipeWaterSettings*ResponseSchema` |
| `brewery/waterCompute` | `computeAndSaveMash`, `computeAndSaveSparge`, `computeAndSaveBoil` | `parseMashComputeAndSaveResponse`, … |
| `brewery/water` | `getRecipeWaterHubSummary` | `parseRecipeWaterHubSummaryResponse` |

Full path → parser map: [`src/facadeParserMap.ts`](src/facadeParserMap.ts).

```typescript
import { bearerTokenAuth, createApiClient, listWorkspaces } from "@umbraculum/api-client";
import { listRecipes } from "@umbraculum/api-client/brewery";

const client = createApiClient(baseUrl, bearerTokenAuth(() => token));
const workspaces = await listWorkspaces(client);
const recipes = await listRecipes(client);
```

Errors from non-2xx responses throw `ApiClientError` (status + body).

## Exports

- `createApiClient(baseUrl, auth, options?)`
  - `options.fetch` (optional): inject a cross-platform `fetch` implementation
- `cookieAuth()` (web)
- `bearerTokenAuth(getToken)` (native + Node)
- Platform facades — see `src/platform/*` (re-exported from main entry)
- `@umbraculum/api-client/brewery` — brewery add-on facades only (tree-shaking friendly)
- `PlatformOpenApiPaths`, `BreweryOpenApiPaths`, and related `components` / `operations` type exports (generated from committed OpenAPI JSON)

## OpenAPI codegen (Phase E)

Types under `src/generated/` are produced from [`services/api/openapi/openapi.json`](../../services/api/openapi/openapi.json) and [`brewery.json`](../../services/api/openapi/brewery.json):

```bash
npm run openapi:codegen -w @umbraculum/api-client      # regenerate
npm run openapi:codegen:check -w @umbraculum/api-client # drift check (T1 OpenAPI slice)
```

Run inside the Node container per [`docs/TESTING.md`](../../docs/TESTING.md). Commit regenerated files whenever committed OpenAPI artifacts change.

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
- **Test**: `npm test -w @umbraculum/api-client` (vitest in container; see [`docs/TESTING.md`](../../docs/TESTING.md)).
- **Lint**: covered by root `npm run lint`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (cookie auth), `apps/native` (bearer auth); Node-side test harnesses and scripts that need to call the API as an authenticated user (also bearer).
- **Depends on**: `@umbraculum/contracts` (for the response parsers and DTO types). Does **not** depend on Next.js, Expo, React Navigation, or any UI framework.

## Status

**Phase E complete (2026-06-01). Phase E5 (2026-06-01):** brewery water facades (profiles, settings, compute-and-save, hub summary) + native water screen migration. npm publish remains a separate LICENSING decision.

The "webview caveat" above is the one explicitly-flagged limitation: bearer-only native auth does not automatically give a webview an authenticated session — that requires a future bridging mechanism (cookie/session handoff or token-to-session exchange), which is on the trajectory but not yet implemented.

## Further reading

- [`docs/API-OPENAPI.md`](../../docs/API-OPENAPI.md) — OpenAPI catalogs + Phase E roadmap
- [`docs/AUTH-STRATEGY.md`](../../docs/AUTH-STRATEGY.md) — platform-wide auth direction (cookie web + bearer native + future webview bridge)
- [`docs/AUTH-HARDENING-ASSESSMENT.md`](../../docs/AUTH-HARDENING-ASSESSMENT.md) — auth hardening review and findings
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`@umbraculum/contracts`](../contracts/README.md) — the typed response parsers this client returns
