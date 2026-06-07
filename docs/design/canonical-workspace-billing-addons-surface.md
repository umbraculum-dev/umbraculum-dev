# Workspace billing add-ons — horizontal boundary surface

**Tier:** Public  
**Status:** Contract documented; **implementation deferred H1 2027** (accepted 2026-05-28)  
**Audience:** module authors, billing integrators, hosted-service operators  
**Resolves:** [RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md) — pre-implementation boundary  
**Related:** [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2, [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §3.6–§7.4, [`ROADMAP.md`](../ROADMAP.md) Wave **E-full** / **F-mod** / item **2h**; integrator gap doc [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md)

> **Disclaimer.** No `WorkspaceBillingAddon` Prisma model, Stripe subscription-item flow, or add-on enforcement ships in the July 2026 public-alpha tranche. This document exists so modules do not add parallel entitlement stores or payment integrations while `registerModule({ addonCodes })` is already live.

---

## 1. Summary

| Layer | Owner | Status |
|-------|-------|--------|
| **Base subscription** | `platform.WorkspaceBilling` + tiers | Shipped |
| **Tier numeric caps** | `tierLimitsService` + module `tierLimits` slices | Shipped |
| **Add-on declaration** | `registerModule({ addonCodes })` + boot collision check | Shipped (this RFC) |
| **Add-on persistence** | `platform.WorkspaceBillingAddon` | **Partial (F-mod Phase 3, 2026-05-31)** — Prisma model + `EntitlementsService` query path; Stripe/RevenueCat wiring still H1 2027 |
| **Add-on enforcement** | `EntitlementsService` | **`tier_only` default**; opt-in `ENTITLEMENTS_ENFORCEMENT_MODE=tier_and_addons` |
| **Managed-AI credits** | `managed_ai_credits_*` add-ons + pricebook | **Deferred** (ROADMAP E-full) |

Public alpha MAY ship without purchasable module add-ons; it MUST NOT ship without this boundary ([RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md) Decision E).

---

## 2. Declared add-on codes (v1 registry)

Codes MUST be declared on exactly one module via `registerModule({ addonCodes: [...] })`. Boot fails on duplicates (`AddonCodeAlreadyRegisteredError`).

| `addonCode` | Declaring module | Notes |
|-------------|------------------|-------|
| `brewery_module` | `brewery` (tier-6 vertical) | Reference vertical; bundled in α tier story |
| `automation_module` | `automation` | First likely enforcement target (H1 2027) |
| `pim_module` | `pim` | |
| `mrp_module` | `mrp` | |
| `crp_module` | `crp` | |
| `managed_ai_credits_*` | *(platform-reserved)* | Not sold until E-full; pattern reserved in RFC-0009 |

Third-party modules use `<code>_module` under their own module code per [third-party module guide](../modules/contribute/third-party-module.md).

---

## 3. Enforcement modes

| Mode | When | `hasActiveAddon()` behavior |
|------|------|----------------------------|
| `tier_only` | Public α through pre-implementation | Always `true` (no DB lookup) |
| `tier_and_addons` | After H1 2027 implementation | Query `WorkspaceBillingAddon`; require `status === active` |

Implementation: [`services/api/src/services/entitlementsService.ts`](../../services/api/src/services/entitlementsService.ts).

**Call-site discipline:** Modules SHOULD NOT add hard `assertAddonEntitled` gates until enforcement mode flips — tier limits remain the α enforcement surface. Automation surface doc "enforce on vessel create" is **aspirational until H1 2027**.

---

## 4. Tier vs add-on matrix (conceptual)

Example for `automation` (illustrative — not enforced in α):

| Gate | Tier limit | Add-on |
|------|------------|--------|
| Max vessels / adapters | `tierLimits(tier)` | — |
| Paid automation surfaces (future) | Requires `premium+` (platform) | Requires `automation_module` active row |

Both checks may apply once implementation lands. Neither replaces the other.

---

## 5. H1 2027 implementation checklist (backlog)

| # | Step | Repo |
|---|------|------|
| 1 | Prisma `WorkspaceBillingAddon` in `platform.*` + forward migration | `umbraculum-dev` |
| 2 | Stripe subscription-item create/update on purchase; webhook handlers | `services/api` |
| 3 | RevenueCat entitlement mirror (native) | `services/api` |
| 4 | Flip `EntitlementsService` to `tier_and_addons` on hosted profile | `services/api` |
| 5 | First enforced routes (candidate: automation vessel/adapter create) | module + platform |
| 6 | Admin/operator UI for workspace add-ons | `apps/web` |
| 7 | Managed-AI credits (E-full) — optional same tranche or successor | platform AI orchestrator |

Backup discipline for billing DDL: same as [platform-brewery-postgres-schema-split.md](platform-brewery-postgres-schema-split.md) §3 (`pg_dump -Fc` before migrate).

---

## 6. Self-host

| Profile | Behavior |
|---------|----------|
| Hosted (production) | Enforce purchased add-ons once step 4 lands |
| Self-host | Config may grant all add-ons or skip checks ([RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md) Decision F) |

---

## 7. References

- [RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md)
- [`services/api/src/routes/billing.ts`](../../services/api/src/routes/billing.ts)
- [`services/api/src/services/workspaceBillingService.ts`](../../services/api/src/services/workspaceBillingService.ts)
- [`packages/modules/module-sdk/README.md`](../../packages/modules/module-sdk/README.md) — `addonCodes` + collision rules

---

*Accepted boundary 2026-05-28. Implementation PRs should link this doc and RFC-0009.*
