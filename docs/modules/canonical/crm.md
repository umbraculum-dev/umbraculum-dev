# `crm` — canonical module (open door)

**Tier:** Public
**Status:** **Open door** — not implemented. Reserved code, β layout pre-committed. No firm horizon; expected after MRP / WMS / CRP land.
**Code:** `crm`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's CRM roadmap or planning to extend the future CRM module.

> [!NOTE]
> Per-module page for the (not-yet-implemented) `crm` canonical module. The code is reserved by [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md); the folder shape is pre-committed by [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md). When work starts, replace this stub with a real per-module page modeled on [`automation.md`](automation.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **customer relationships, contacts, accounts, opportunities, customer-facing orders**.

The CRM canonical module owns the platform's "who do we sell to, what's the pipeline, what have they ordered?" surface. Concretely (illustrative, refined by the future surface design doc):

- Account / contact / opportunity hierarchy.
- Customer-facing order lifecycle (quote → order → fulfillment-signal → invoice-signal).
- Pipeline reporting and forecasting AI tools.
- The boundary with general-ledger AR/AP is **explicit and small**: CRM owns the order; finance integration owns the invoice. CRM never reimplements finance.

---

## 2. Why CRM is a canonical module (and not a vertical-specific feature)

CRM is universally needed across verticals — a brewery's distributor relationships, a distillery's wholesaler accounts, a cosmetics manufacturer's retail buyers all map to the same Contact / Account / Opportunity primitives. Per [PLATFORM-ARCHITECTURE.md §1.1.1](../../PLATFORM-ARCHITECTURE.md), it would be the same category mistake as treating CRM as part of the brewery vertical: the vertical is the brewery, the canonical domain is CRM.

Note from [RFC-0001 §4.1](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): the original brewery vertical scope did not include CRM — it's the canonical module where Umbraculum has the least pre-existing surface to reframe. That makes the eventual `crm` implementation closer to greenfield than `mrp` or `wms`.

---

## 3. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path (when shipped) |
|---|---|
| API | `services/api/src/modules/crm/` |
| Web | `apps/web/app/[locale]/(crm)/` |
| Native | `apps/native/src/modules/crm/` |
| Contracts | `packages/crm-contracts/` → `@umbraculum/crm-contracts` |

Postgres schema name: `crm` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 4. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `mrp` | Loose — customer orders drive demand for MRP planning; coupling is via demand-line records. |
| `wms` | Loose — orders trigger picking lists; coupling is via shipment-line records. |
| `automation` | None directly. |
| `crp` | Loose — sales forecasts feed long-range capacity planning, but the boundary is forecasting, not real-time. |

---

## 5. Non-goal — finance integration boundary

[RFC-0001 §4.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) is explicit that **finance (general ledger, AR/AP) is likely never canonical to Umbraculum** because customers integrate their existing finance system rather than replace it. CRM ships order-level data and emits events; the GL integration is downstream and uses the platform's general integrations framework, not CRM internals.

---

## 6. What needs to happen before this stub becomes a real page

1. **Surface design doc** under `docs/design/canonical-crm-module-surface.md`.
2. **Phase A — contracts**, **Phase B — read path**, etc. (same recipe as MRP / WMS / `automation`).
3. **Identify the first vertical demand signal.** Unlike MRP/WMS, the brewery vertical doesn't drive CRM directly today. A second vertical configuration with concrete distributor-CRM needs would justify lighting up this module.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4, §4.1.
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4.
- [PLATFORM-ARCHITECTURE.md §1.1.1](../../PLATFORM-ARCHITECTURE.md) — peer-decomposition rationale.
- [`automation.md`](automation.md) — template.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
