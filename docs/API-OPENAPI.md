# OpenAPI — alpha partial API catalog

**Tier:** Public  
**Status:** Alpha partial (F1 partial closure — 2026-05-28)  
**Audience:** external integrators, module authors, maintainers  

This document is the **canonical index** for machine-readable API documentation in Umbraculum. Human route tables in module docs remain authoritative when this spec and a route table disagree until the drift is fixed.

---

## Status

| Aspect | Alpha (now) | Full F1 closure (future) |
|--------|-------------|---------------------------|
| Artifact | Committed `services/api/openapi/openapi.json` | Same path; grows with PR3 |
| Coverage | **40 paths / 58 operations** with typed Zod route schemas | ~80%+ of HTTP surface schema-backed |
| Modules in spec | `automation`, `pim`, `mrp`, `crp`, `rendering`, `/health` | + platform, brewery, auth (via PR3) |
| Generator | `@fastify/swagger` + `fastify-type-provider-zod` `jsonSchemaTransform` | Unchanged |
| CI | `npm run openapi:check` in [`api.yml`](../.github/workflows/api.yml) | Unchanged |

**Not in the alpha spec:** auth, workspaces, billing, brewery vertical, webhooks, AI orchestrator, integrations — see human route tables under [`modules/`](modules/) and [`services/api/README.md`](../services/api/README.md).

---

## Artifact locations

| Consumer | Location |
|----------|----------|
| Git source of truth | [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) |
| Docs site static copy | `/openapi/openapi.json` on the built docs site (mirrors committed artifact) |
| Local Swagger UI (dev) | `http://localhost:18080/api/documentation` when the API container runs with `NODE_ENV` ≠ `production` |

Download from a checkout:

```bash
# From repo root after clone
cat services/api/openapi/openapi.json
```

**Docs site copy:** [`/openapi/openapi.json`](/openapi/openapi.json) (static mirror; regenerate with maintainer runbook below when the API spec changes).

---

## Coverage matrix

Operations appear in the committed spec only when the Fastify route carries an OpenAPI **tag** on a Zod-backed `schema` block. Untagged routes (most platform/brewery handlers today) are excluded intentionally.

| OpenAPI tag | Module / surface | In spec | Human route table |
|-------------|------------------|---------|-------------------|
| `automation` | Canonical automation | Yes — vessel read paths | [`modules/canonical/automation.md`](modules/canonical/automation.md) §4 |
| `pim` | Canonical PIM | Yes — product/variant/category/attribute/media/channel-feed paths | [`modules/canonical/pim.md`](modules/canonical/pim.md) |
| `mrp` | Canonical MRP | Yes — production orders, BOMs, work-order render jobs | [`design/canonical-mrp-module-surface.md`](design/canonical-mrp-module-surface.md) |
| `crp` | Canonical CRP | Yes — resources, planning, capacity render | [`design/canonical-crp-module-surface.md`](design/canonical-crp-module-surface.md) |
| `rendering` | Horizontal rendering (RFC-0007) | Yes — job submit/status/artifact paths | [`design/canonical-document-rendering-surface.md`](design/canonical-document-rendering-surface.md) |
| `platform` | Platform | `/health` only | — |
| *(none yet)* | Auth / workspaces / billing | PR3 backlog | [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) |
| *(none yet)* | Brewery vertical | PR3 backlog | [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) |

---

## Generator stack

F1 originally named `@asteasolutions/zod-to-openapi`. The alpha implementation uses the stack already wired for RFC-0003:

1. Route handlers declare Zod schemas via `fastify-type-provider-zod` (`zodApp.get/post/...`).
2. `@fastify/swagger` registers with `jsonSchemaTransform` / `jsonSchemaTransformObject`.
3. [`openapi-generate.ts`](../services/api/src/scripts/openapi-generate.ts) boots `buildApp()`, calls `app.swagger()`, filters to alpha tags via [`filterAlphaPaths.ts`](../services/api/src/openapi/filterAlphaPaths.ts), validates with `@readme/openapi-parser`, writes JSON.

This avoids maintaining a parallel path registry — the same route `schema` objects PR3 migrates toward feed both runtime validation and OpenAPI.

---

## Maintainer runbook

All commands run **inside the API container** (never host Node):

```bash
docker compose exec api bash -lc 'cd /app && npm run openapi:generate'
docker compose exec api bash -lc 'cd /app && npm run openapi:check'
```

**When to regenerate:**

- After adding or changing `schema` on any `zodApp` route included in the alpha tags.
- After changing [`openapi/metadata.ts`](../services/api/src/openapi/metadata.ts) (info, tags, security schemes).

**After regenerate:** copy the artifact to the docs-site static mirror:

```bash
cp services/api/openapi/openapi.json docs-site/static/openapi/openapi.json
```

CI fails if `openapi.json` drifts from a fresh generate (`openapi:check`).

---

## Integrator workflow

Recommended order for external developers:

1. **Pick the module** — [`MODULES.md`](MODULES.md) catalog + per-module route table.
2. **Pin types** — `@umbraculum/<code>-contracts` (MIT; npm publish batch at public alpha — see [`LICENSING.md`](LICENSING.md) §6.2.1).
3. **Browse machine-readable paths** — this spec filtered by tag (e.g. all `pim` operations).
4. **Auth** — cookie `sid` (web) or bearer token (native); see [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md). Security schemes are declared in the spec; auth *paths* are not yet schema-documented.
5. **Automation adapters** — `CONTRACT_VERSION` in `@umbraculum/automation-contracts` overrides OpenAPI for mailbox semantics.

Try locally: [`GETTING-STARTED.md`](GETTING-STARTED.md) §2.3 (`docker compose up`, curl against `:18080/api/...`).

---

## Known limitations

- **Partial coverage** — alpha spec is not a full API catalog; see coverage matrix above.
- **`.superRefine` / cross-field rules** — OpenAPI JSON Schema may not express all Zod refinements; contracts packages + route tables win on edge validation.
- **Untagged routes excluded** — platform/brewery paths are omitted until PR3 adds Zod route schemas and tags.
- **No codegen yet** — `@umbraculum/api-client` OpenAPI-driven generation is a separate follow-on.

---

## Roadmap to full F1 closure

Full F1 closes when PR3 ([`pr3-routes-migration-handoff.md`](design/pr3-routes-migration-handoff.md)) brings platform and brewery routes onto `zodApp` + tags and the filtered spec reaches **~80%** of production HTTP operations. Until then, F1 remains **Partial (alpha)** in [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) §Follow-ups.

**Related:** [RFC-0003](rfcs/0003-validation-library-adoption.md) Decision G, [ecosystem case study — Business Central](design/ecosystem-case-study-business-central.md) §4.
