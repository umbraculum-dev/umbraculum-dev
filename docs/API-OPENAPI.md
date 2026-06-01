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
| Docs site static copies | [`/openapi/openapi.json`](/openapi/openapi.json), [`/openapi/brewery.json`](/openapi/brewery.json) |
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

---

## Integrator workflow

1. **Pick your SKU** — platform-only integrators: `openapi.json` only; reference vertical evaluators: both files.
2. **Pick the module** — [`MODULES.md`](MODULES.md) + per-module route tables.
3. **Pin types** — `@umbraculum/<code>-contracts` and `@umbraculum/contracts` for platform auth/workspaces; optional OpenAPI path types from `@umbraculum/api-client` (`PlatformOpenApiPaths`, `BreweryOpenApiPaths` — see §Known limitations).
4. **Browse machine-readable paths** — filter by tag in Swagger UI or Redoc. Brewery add-on: [docs site Redoc embed](/openapi-brewery) (`/openapi/brewery.json` static copy).
5. **Auth** — cookie `sid` (web) or bearer (native); auth paths are in the platform spec under tag `platform`.
6. **Automation adapters** — `CONTRACT_VERSION` remains authoritative over OpenAPI for mailbox semantics.

Try locally: [`GETTING-STARTED.md`](GETTING-STARTED.md) §2.3.

---

## Known limitations

- **F1 closure** — **175 documented operations** (~97%). One handler exempt: `POST /ai/chat` SSE (see §Streaming endpoints).
- **BeerJSON / complex JSON** — OpenAPI may show loose object schemas; contracts + route tables win.
- **Binary / stream responses** — routes that `reply.send(Buffer)` use `z.custom<Buffer>` in contracts (e.g. [`BeerJsonExportResponseSchema`](../packages/contracts/src/brewery/routeSchemas.ts)); OpenAPI shows an empty JSON schema (`{}`) while runtime returns raw bytes with `Content-Type` / `Content-Disposition` headers. Human route tables and contracts win on wire format.
- **Codegen (Phase E, 2026-06)** — `@umbraculum/api-client` exports OpenAPI-derived **types** from committed specs (`PlatformOpenApiPaths`, `BreweryOpenApiPaths`). Regenerate with `npm run openapi:codegen -w @umbraculum/api-client`; drift check: `npm run openapi:codegen:check -w @umbraculum/api-client` (wired into T1 OpenAPI slice). Runtime validation remains `@umbraculum/contracts` parsers — generated types are integrator ergonomics, not wire authority.

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

## F1 closure (Phase D, 2026-06-01)

F1 tracker row in [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) is **Done**. Platform + brewery add-on specs cover all JSON HTTP handlers except the SSE chat stream above. Regression guards: `openapi.test.ts` minimum path/op floors + `OPENAPI_DOCUMENTATION_EXEMPT_ROUTES` in [`exemptRoutes.ts`](../services/api/src/openapi/exemptRoutes.ts).

**Related:** [RFC-0003](rfcs/0003-validation-library-adoption.md) Decision G, [ecosystem case study — Business Central](design/ecosystem-case-study-business-central.md) §4.
