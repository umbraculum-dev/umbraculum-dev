# Platform module profile (F-mod deploy-time SKU)

**Tier:** Public  
**Status:** Phase 1 shipped 2026-05-31  
**Audience:** integrators, maintainers, demo-host operators  
**Related:** [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md), [RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md), [`canonical-workspace-billing-addons-surface.md`](canonical-workspace-billing-addons-surface.md)

---

## Summary

Deploy-time knob **`UMBRACULUM_MODULE_PROFILE`** selects which first-party modules boot in a single process:

| Profile | Brewery reference vertical | Typical use |
|---------|---------------------------|-------------|
| **`reference`** (default) | **On** | Fresh clone onboarding, demo host, alpha walkthroughs |
| **`platform`** | **Off** | ISVs building product X without brewery routes/nav/AI |

Resolver: [`packages/modules/module-sdk/src/enabledModules.ts`](../../packages/modules/module-sdk/src/enabledModules.ts).

---

## Compose wiring

**Default (onboarding):** [`docker-compose.yml`](../../docker-compose.yml) sets:

```yaml
UMBRACULUM_MODULE_PROFILE: ${UMBRACULUM_MODULE_PROFILE:-reference}
```

on `api` and `web`.

**Integrator opt-out:** either set in [`.env`](../../.env.sample):

```bash
UMBRACULUM_MODULE_PROFILE=platform
```

or use the committed override file:

```bash
docker compose -f docker-compose.yml -f docker-compose.platform.yml up -d
```

See [`docker-compose.platform.yml`](../../docker-compose.platform.yml).

---

## What changes per profile

| Layer | `reference` | `platform` |
|-------|-------------|------------|
| API `registerBreweryModule` | Yes | No |
| `/platform/recipes/*` legacy routes | Yes | No |
| Web `BUILTIN_WEB_MODULE_REGISTRATIONS` brewery segments | Yes | No |
| Native brewery tab/routes | Yes | No |
| Web `<title>` metadata | "Brewery App" | "Umbraculum" |
| Prisma `brewery.*` schema | Migrated (may be empty) | Same — schema not dropped in Phase 1 |

---

## MRP/CRP coupling note

Alpha MRP/CRP demo projections read `brewery.recipes` via [`breweryProjectionService.ts`](../../services/api/src/modules/mrp/services/breweryProjectionService.ts). On **`platform`** profile, MRP/CRP modules still register but brewery-backed demo fixtures may be empty unless you seed alternative projection sources. For MRP/CRP brewery walkthroughs, use **`reference`** profile.

---

## Workspace-level omit (Phase 3 slice)

Deploy profile controls **process boot**. Per-workspace omit uses **`WorkspaceBillingAddon`** rows + `EntitlementsService` when `ENTITLEMENTS_ENFORCEMENT_MODE=tier_and_addons`. Self-host may set `UMBRACULUM_GRANT_ALL_ADDONS=1` to skip add-on DB checks ([RFC-0009 Decision F](../rfcs/0009-workspace-billing-addons-and-entitlements.md)).

Hosted demo: seed `brewery_module` active on demo workspaces; workspaces without the row hide brewery surfaces once enforcement is enabled.

---

## Verification

```bash
# Reference default — brewery API route exists (401 without session is OK; 404 means profile wrong)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:18080/api/inventory

# Platform opt-out — expect 404
docker compose -f docker-compose.yml -f docker-compose.platform.yml up -d api web
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:18080/api/inventory
```

Restore reference stack after contrast testing.

---

## OpenAPI generation alignment

Committed OpenAPI artifacts respect the same profile split:

| Profile at `openapi:generate` | `openapi/openapi.json` | `openapi/brewery.json` |
|-------------------------------|------------------------|-------------------------|
| `platform` (default for CI) | Canonical + rendering + platform routes | Empty or stale — regenerate with `reference` |
| `reference` | Not the CI source of truth | Brewery-tagged routes |

ISVs building product X without brewery should read **only** the platform catalog — [`API-OPENAPI.md`](../API-OPENAPI.md).

---

## Related docs

- [`demo-host-runbook.md`](demo-host-runbook.md) — demo host bring-up  
- [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) — integrator landing  
- [`GLOSSARY.md`](../GLOSSARY.md) — reference vertical terminology
