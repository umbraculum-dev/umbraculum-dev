# OpenAPI — platform catalog + brewery add-on

**Tier:** Public  
**Status:** Partial (platform + brewery add-on) — F1 partial closure extended 2026-05-31  
**Audience:** external integrators, module authors, maintainers  

This document is the **canonical index** for machine-readable API documentation in Umbraculum. Human route tables in module docs remain authoritative when a spec and a route table disagree until the drift is fixed.

---

## Status

| Aspect | Platform catalog | Brewery add-on | Full F1 closure (future) |
|--------|------------------|----------------|---------------------------|
| Artifact | [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) | [`services/api/openapi/brewery.json`](../services/api/openapi/brewery.json) | Same paths; grows with PR3 |
| Profile | `UMBRACULUM_MODULE_PROFILE=platform` at generation | `reference` profile | — |
| Coverage | **53 paths / 72 operations** | **12 paths / 21 operations** | ~80%+ of HTTP surface schema-backed |
| Tags | `automation`, `pim`, `mrp`, `crp`, `rendering`, `platform` | `brewery` only | + billing, integrations, AI, … |
| CI | `npm run openapi:check` validates **both** files | same | Unchanged |

**ISVs without the brewery vertical:** use the **platform catalog only** — see [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) and [`design/platform-module-profile.md`](design/platform-module-profile.md).

**Still on human route tables:** billing, integrations, webhooks, AI orchestrator, remaining brewery routes (water, brew sessions, import, ingredients).

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
| `brewery` | Reference vertical (partial) | No | Yes (21 ops) | [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) |
| *(none yet)* | Billing / integrations / AI | PR3 backlog | — | [`services/api/README.md`](../services/api/README.md) |

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

**After regenerate:** copy both artifacts to the docs-site static mirror:

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
3. **Pin types** — `@umbraculum/<code>-contracts` and `@umbraculum/contracts` for platform auth/workspaces.
4. **Browse machine-readable paths** — filter by tag in Swagger UI or Redoc.
5. **Auth** — cookie `sid` (web) or bearer (native); auth paths are in the platform spec under tag `platform`.
6. **Automation adapters** — `CONTRACT_VERSION` remains authoritative over OpenAPI for mailbox semantics.

Try locally: [`GETTING-STARTED.md`](GETTING-STARTED.md) §2.3.

---

## Known limitations

- **Partial coverage** — ~93 documented operations vs ~180+ total HTTP handlers (~52%).
- **BeerJSON / complex JSON** — OpenAPI may show loose object schemas; contracts + route tables win.
- **Brewery add-on incomplete** — water, brew sessions, import, ingredients deferred to Phase C / ongoing PR3.
- **No codegen yet** — `@umbraculum/api-client` OpenAPI-driven generation is a separate follow-on.

---

## Roadmap to full F1 closure

Full F1 closes when PR3 brings remaining platform and brewery routes onto `zodApp` + tags and combined documented operations reach **~80%** of production HTTP surface.

**Continuation plan:** OpenAPI Phase A+B (`openapi_phase_a+b_65d86c2d.plan.md`, extends alpha pre-flip plan Phase 5).

**Related:** [RFC-0003](rfcs/0003-validation-library-adoption.md) Decision G, [ecosystem case study — Business Central](design/ecosystem-case-study-business-central.md) §4.
