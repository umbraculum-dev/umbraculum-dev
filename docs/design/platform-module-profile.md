# Platform module profile (installation profile)

**Tier:** Public  
**Status:** Phase 1 shipped 2026-05-31; **installation profile manifest shipped 2026-06**  
**Audience:** integrators, maintainers, demo-host operators  
**Canonical SoT:** [`installation-profile.md`](installation-profile.md)  
**Related:** [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md), [RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md)

> **Terminology:** Use **installation profile**, not "platform SKU" or "install SKU". This document is kept as a short alias for older links.

---

## Summary

Deploy-time knob **`UMBRACULUM_MODULE_PROFILE`** selects which first-party modules boot in a single process:

| Profile | Brewery reference vertical | Default since 2026-06 |
|---------|---------------------------|------------------------|
| **`platform`** (core) | **Off** | **Yes** — fresh clone |
| **`reference`** | **On** | Opt-in (demo, E2E, walkthroughs) |

Manifest + resolver: [`.umbraculum/install*.json`](../../.umbraculum/) and [`packages/sdk/module-sdk/src/installProfile.ts`](../../packages/sdk/module-sdk/src/installProfile.ts).

**Web vs native:** one federated web shell; many composed native binaries — [`installation-profile.md`](installation-profile.md) § Web vs native.

---

## Compose wiring

**Default:** [`docker-compose.yml`](../../docker-compose.yml) sets `UMBRACULUM_MODULE_PROFILE=platform`.

**Reference opt-in:**

```bash
docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d
```

See [`installation-profile.md`](installation-profile.md) for manifest format, build/CI, Prisma, and entitlements.

---

## What changes per profile

| Layer | `reference` | `platform` (core) |
|-------|-------------|-------------------|
| API `registerBreweryModule` | Yes | No |
| Web brewery URL segments | Yes | No |
| Native app | `apps/native/brewery` | `apps/native/blank` |
| Prisma `brewery.*` schema | Present | Stripped after migrate (core) |
| i18n brewery strings | Merged | Omitted |
| MRP/CRP brewery projections | Live reads | Empty adapter |

---

## Workspace-level omit (RFC-0009 prep)

Deploy profile controls **server-wide install**. Per-workspace omit uses **`WorkspaceBillingAddon`** + `EntitlementsService` when `ENTITLEMENTS_ENFORCEMENT_MODE=tier_and_addons`. Installation profile is checked **first** — `brewery_module` cannot grant access when brewery is not installed.

Self-host may set `UMBRACULUM_GRANT_ALL_ADDONS=1` to skip workspace add-on DB checks ([RFC-0009 Decision F](../rfcs/0009-workspace-billing-addons-and-entitlements.md)).

---

## Verification

See [`installation-profile.md` § Verification](installation-profile.md#verification).
