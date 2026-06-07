# Canonical native platform — horizontal surface

**Tier:** Public  
**Status:** As-built 2026-05-27; July 2026 brewery alpha scope committed  
**Audience:** native app maintainers, vertical/module authors, mobile-first adopters, plan executors  
**Resolves:** operational companion to [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) native slice, [PLATFORM-ARCHITECTURE.md](../PLATFORM-ARCHITECTURE.md) §1.1 cross-platform commitment  
**Builds on:** [DEVELOPMENT-NATIVE-LOCAL.md](../DEVELOPMENT-NATIVE-LOCAL.md), [NATIVE-STRATEGY-AND-CI.md](../NATIVE-STRATEGY-AND-CI.md), [AUTH-STRATEGY.md](../AUTH-STRATEGY.md), [ubuntu-touch-shell-strategy.md](ubuntu-touch-shell-strategy.md), [canonical-document-rendering-surface.md](canonical-document-rendering-surface.md)

> **Disclaimer.** This is the single source of truth for what native ships today, platform obligations for native consumers, route availability, July 2026 alpha boundaries, and post-alpha gates. RFC-0002 commits the β native slice shape; this doc tracks as-built behavior and known debt.

---

## 1. Summary

| Concern | Owner | Doc / code |
|---------|-------|------------|
| Native platform shared layout | `apps/native` | [`apps/native/README.md`](../../apps/native/README.md) |
| Route policy | `@umbraculum/navigation` | [`packages/platform/navigation/src/index.ts`](../../packages/platform/navigation/src/index.ts) |
| Module registration (native) | `@umbraculum/module-sdk` | `registerNativeModule()` — [`registerNativeModule.ts`](../../packages/modules/module-sdk/src/registerNativeModule.ts) |
| Auth transport | `@umbraculum/api-client` | `bearerTokenAuth` — [AUTH-STRATEGY.md](../AUTH-STRATEGY.md) |
| Render jobs (client) | `@umbraculum/api-client` | [`renderJob.ts`](../../packages/platform/api-client/src/renderJob.ts) |
| Validation | `@umbraculum/contracts` | [RFC-0003](../rfcs/0003-validation-library-adoption.md) — parse at HTTP boundaries |
| File output | Platform rendering | [RFC-0007](../rfcs/0007-canonical-document-rendering.md) — **no** PDF/XLSX libs in native |

Native MUST NOT bundle Gotenberg, exceljs, pdfkit, or a private render queue. Binary artifacts use async render jobs + signed URL download.

---

## 2. Current as-built (2026-05-27)

### 2.1 Physical layout

Per RFC-0002 β:

| Slice | Brewery (tier-6 vertical) | Canonical modules (mrp, crp, pim, wms, …) |
|-------|---------------------------|---------------------------------------------|
| Native | [`apps/native/src/modules/brewery/screens/`](../../apps/native/src/modules/brewery/screens/) | **Not wired** — `apps/native/src/modules/<code>/` reserved |
| Contracts | `@umbraculum/contracts` + `@umbraculum/brewery-beerjson` | `@umbraculum/mrp-contracts`, `@umbraculum/crp-contracts`, etc. consumed on **web only** today |

Route registration in the shell is **app-owned** ([`AppNavigator.tsx`](../../apps/native/src/navigation/AppNavigator.tsx)). Brewery module metadata is recorded via `registerNativeModule({ code: "brewery", ... })` at bootstrap ([`registerPlatformNativeModules.ts`](../../apps/native/src/navigation/registerPlatformNativeModules.ts)).

### 2.2 Shared packages (native consumers)

| Package | Role on native |
|---------|----------------|
| `@umbraculum/ui` | Tamagui primitives (`Screen`, `Button`, charts) |
| `@umbraculum/brewery-recipes-ui` | Recipe editors, mash/water UI |
| `@umbraculum/brewery-beerjson` | BeerJSON types/helpers |
| `@umbraculum/api-client` | HTTP + bearer auth + render-job helpers |
| `@umbraculum/contracts` | Zod-backed `parseXxx()` at boundaries |
| `@umbraculum/navigation` | `RouteId`, `getRouteAvailability`, `routeToNativeTarget` |
| `@umbraculum/i18n` / `@umbraculum/i18n-react` | Catalog + `useT()` |
| `@umbraculum/media` | Asset URLs |

### 2.3 Auth and web fallback

- **Native:** bearer token in `expo-secure-store`; `POST /auth/login/native`.
- **Web bridge:** `POST /auth/webview-exchange` → system browser with cookie session — [`openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts).
- **Whitelisted web-only routes:** see §3 (`WEBVIEW_WHITELIST_ROUTE_IDS`).

---

## 3. Route availability matrix

Source: [`packages/platform/navigation/src/index.ts`](../../packages/platform/navigation/src/index.ts). Native uses **block by default**; routes promote to `available` via module registration + `configureNativeRoutePolicy()`.

### 3.1 Native-available (`getRouteAvailability(id, "native") === "available"`)

Brewery brew-day routes (from `registerNativeModule` for `brewery`):

| RouteId | Native screen |
|---------|---------------|
| `recipes` | `RecipesListScreen` |
| `recipeEdit` | `RecipeEditScreen` |
| `equipment` | `EquipmentScreen` |
| `waterHub`, `waterMash`, `waterSparge`, `waterBoil` | Water* screens |
| `waterProfiles` | `WaterProfilesScreen` |
| `fermDataIntegration` | `FermDataIntegrationScreen` |
| `yeast` | `YeastScreen` |
| `brewdayStepsSettings` | `BrewdayStepsSettingsScreen` |

`dashboard` is available via tab shell (not in module registry list but always reachable).

### 3.2 Web fallback (`whitelisted_web_fallback`)

| RouteId | Behavior |
|---------|----------|
| `inventory` | `BlockedRouteScreen` offers **Open on web** |

Extend via `WEBVIEW_WHITELIST_ROUTE_IDS` in navigation (product decision per route).

### 3.3 Blocked on native (web-only today)

| Module | RouteIds |
|--------|----------|
| automation | `vessels`, `vesselDetail` |
| pim | `products`, `productDetail`, `categories`, `attributeSets`, `attributeSetDetail` |
| mrp | `productionOrders`, `productionOrderDetail`, `materialRequirements` |
| crp | `capacity`, `schedule`, `resources`, `resourceDetail` |
| other | `quality`, `login` (native has own login stack) |

Callers MUST check `getRouteAvailability` before `routeToNativeTarget` — web-only IDs throw if gated incorrectly.

### 3.4 Ubuntu Touch (Morph webapp wrapper — not this doc)

iOS/Android obligations in §3–§4 apply to **`apps/native` (Expo)** only. **Ubuntu Touch** reuses the **web slice** in a Lomiri Click webapp (`webapp-container` + Morph); route availability follows **web**, not native. Native-only brew-day screens and offline SQLite do **not** ship on UT. Decision-of-record: [`ubuntu-touch-shell-strategy.md`](ubuntu-touch-shell-strategy.md).

---

## 4. Platform obligations for native consumers

1. **RFC-0003:** Treat API JSON as `unknown`; validate with `parseXxx()` from `@umbraculum/contracts` (or module contract packages when native consumes them). Avoid `as SomeDto` on wire payloads.
2. **RFC-0007:** Submit render jobs via API; poll job status; download via signed URL with bearer auth. Use `@umbraculum/api-client` `runAsyncRenderJobExport` / `resolveArtifactDownloadUrl`.
3. **RFC-0002:** New module UI lives under `apps/native/src/modules/<code>/`; register with `registerNativeModule`.
4. **i18n:** User-visible strings only in `packages/platform/i18n` catalogs; `npm run i18n:guardrail -w @umbraculum/native`.
5. **No parallel stacks:** No module-owned PDF/XLSX/barcode libraries on device.

---

## 5. July 2026 native EAS demo scope (brewery-only)

> **Demo vs cloud.** The hosted **demonstration** stack is **`https://demo.umbraculum.dev`** ([`demo-host-runbook.md`](demo-host-runbook.md)) — illustrative seed data, documented demo accounts, resets OK. **Not** production brewery data and **not** future customer-facing **`cloud.umbraculum.dev`** ([`cloud-hosted-product-track.md`](cloud-hosted-product-track.md)).

**In scope**

- Auth: login, workspace select, bearer session.
- All brewery screens under `apps/native/src/modules/brewery/screens/` (13 screens).
- Dashboard + tab navigation (Dashboard, Recipes; Inventory → web fallback).
- EAS internal distribution (Android minimum; iOS via EAS cloud).
- Expo Go dev loop unchanged ([DEVELOPMENT-NATIVE-LOCAL.md](../DEVELOPMENT-NATIVE-LOCAL.md)).

**Out of scope**

- Native UI for MRP, CRP, PIM, automation.
- Native inventory list (web fallback only).
- `registerNativeModule` required for all modules (brewery registered; others deferred).
- React 19.2 parity with web (Expo SDK 54 pins 19.1).
- Store-wide public release; **`cloud.umbraculum.dev`** hosted product.

### 5.1 Device smoke checklist (EAS `preview` → demo host)

- [x] `expo install --check` passes (CI: `.github/workflows/native-deps.yml`) — 2026-05-27 pre-build.
- [x] `./scripts/check-packages-dist-up-to-date.sh` passes before release branch — 2026-05-27.
- [x] Login → select workspace → recipes list → open recipe → water hub on device (EAS APK against **demo**) — 2026-06-03.
- [x] API health on dashboard against **demo** — 2026-06-03.
- [x] Inventory tab shows blocked + **Open on web** succeeds (same origin as demo) — 2026-06-03.
- [x] EAS Android internal build installs and launches — 2026-06-03.

**Optional (not a G1 gate):** Brew session **Export work order (PDF)** on native — **FAIL** on EAS `preview` APK (2026-06-03); **PASS** on [demo web (e2e session)](https://demo.umbraculum.dev/en/production-orders/brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe). Tracked in [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) § Known gaps; fix deferred.

### 5.2 Demo distribution

- **Demo URL:** `https://demo.umbraculum.dev` — API + web + media on one origin; see [`demo-host-runbook.md`](demo-host-runbook.md).
- **EAS project:** `apps/native/eas.json` — `preview` profile bakes `EXPO_PUBLIC_API_BASE_URL` / `EXPO_PUBLIC_MEDIA_BASE_URL` to demo; `development`, `production` profiles unchanged.
- **Build log:** [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md).
- **Credentials:** Expo account + `EXPO_TOKEN` for [`.github/workflows/native-eas-build.yml`](../../.github/workflows/native-eas-build.yml); demo login per runbook (passwords not in git).

---

## 6. Known validation debt (native)

Tracked for post-alpha cleanup; not blocking July alpha.

| Area | Status |
|------|--------|
| Brew session PDF export (native) | **FAIL** EAS `preview` vs demo (2026-06-03); **PASS** demo web + localhost web — render pipeline OK; native `runAsyncRenderJobExport` + `Linking.openURL` path — see [build log § Known gaps](native-eas-demo-build-log.md#known-gaps-address-later) |
| Water screens | Largely use `parseXxx` from `@umbraculum/contracts` |
| `RecipesListScreen`, `BrewSessionsListScreen` | Use `parseRecipesListResponse` / `parseBrewSessionsListResponse` (2026-05-27) |
| `YeastScreen`, `RecipeEditScreen` | Partial — BeerJSON/recipe body still uses narrowed records + some casts for editor state |
| `EquipmentScreen`, `FermDataIntegrationScreen` | `parseAuthMeResponse` where applicable |

Full cast elimination is scheduled with [pr3-routes-migration-handoff.md](pr3-routes-migration-handoff.md) co-landing.

---

## 7. Strategic forks (platform direction)

| Path | Summary | When |
|------|---------|------|
| **A — Status quo+** | Manual navigator + docs + Zod parity + web fallback | July alpha |
| **B — Structured catch-up** (default) | A + `registerNativeModule` + shared render-job client + this surface doc | 2026 H1 |
| **C — WMS-first mobile** | Native-mandatory warehouse flows; Re.Pack vs PWA gate | H2 2027 per [ROADMAP.md](../ROADMAP.md) |

**Committed:** Path B platform primitives; Path A scope for July 2026 ship.

---

## 8. Post-alpha roadmap gates

| Gate | Condition | Work |
|------|-----------|------|
| G0 | This doc accepted | Phase 1 EAS copy |
| G1 | Native EAS demo loop **core closed** (§5.1 rows 1–5 on device vs demo, 2026-06-03); optional native brew-session PDF deferred | [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) |
| G2 | MRP/CRP alpha demo signed off | Optional native deep links / web fallback expansion |
| G3 | WMS surface draft exists | `apps/native/src/modules/wms/` — [wms.md](../modules/canonical/wms.md) §4 |
| G4 | H2 2027 | Re.Pack federation spike vs PWA + scanner companion |

**MRP/CRP on native:** Default remains web + AI advisor + exports; native gets fallback links unless floor UX research demands screens.

---

## 9. Packaging strategy (H2 2027 — not decided)

[ROADMAP.md](../ROADMAP.md) §H2 2027: Re.Pack module federation vs web+PWA+thin native scanner. Evidence recorded here when spike completes. July 2026 alpha does **not** depend on this decision.

---

## 10. WMS native slice (scaffold)

When WMS surface design lands: [`apps/native/src/modules/wms/README.md`](../../apps/native/src/modules/wms/README.md) — placeholder until Phase B API + native flows.

---

## 11. Cross-links

- [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) §3 native slice  
- [RFC-0007](../rfcs/0007-canonical-document-rendering.md) — render jobs  
- [demo-host-runbook.md](demo-host-runbook.md) — **`demo.umbraculum.dev`** policy and demo accounts  
- [cloud-hosted-product-track.md](cloud-hosted-product-track.md) — future **`cloud.umbraculum.dev`** (not demo)  
- [native-eas-demo-build-log.md](native-eas-demo-build-log.md) — EAS build + smoke status  
- [ubuntu-touch-shell-strategy.md](ubuntu-touch-shell-strategy.md) — UT Morph webapp wrapper (orthogonal to native slice)  
- [canonical-mrp-module-surface.md](canonical-mrp-module-surface.md) / [canonical-crp-module-surface.md](canonical-crp-module-surface.md) — web-first planning  
- [mrp-crp-alpha-demo-walkthrough.md](mrp-crp-alpha-demo-walkthrough.md) — browser walkthrough on demo host  
- [modules/verticals/brewery/README.md](../modules/verticals/brewery/README.md) §3.3  
