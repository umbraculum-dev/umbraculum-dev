# `mrp` — canonical module (open door)

**Tier:** Public
**Status:** **Open door** — not implemented. Reserved code, β layout pre-committed. Working assumption: lands in the H1 2027 tranche per [ROADMAP.md](../../ROADMAP.md).
**Code:** `mrp`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's manufacturing-planning roadmap or planning to extend the future MRP module.

> [!NOTE]
> Per-module page for the (not-yet-implemented) `mrp` canonical module. The code is reserved by [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md), the folder shape is pre-committed by [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md), but no code lives under `services/api/src/modules/mrp/` yet. This page exists so the reserved set is browsable from day one — when work starts, replace this stub with a real per-module page modeled on [`automation.md`](automation.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **material requirements planning, production planning, work orders**.

The MRP canonical module owns the platform's "what do we make, when, and what raw materials does that require?" surface. Concretely (illustrative, refined by the future surface design doc):

- Production-order lifecycle (planned → released → in-progress → completed).
- Bill of materials (BOM) traversal — given a production order, compute material requirements.
- Lead-time and reorder-point logic that drives WMS replenishment proposals.
- Brew sessions in the brewery vertical are *production orders* in MRP's language — the H1 2027 tranche promotes the brewery's existing brew-session surface into MRP primitives ([PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md)).

---

## 2. Why it exists separately from `wms` and `crp`

[RFC-0001 §4.1](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) (the decomposition-rationale section) is explicit: MRP / WMS / CRP / CRM / `automation` are *peer* canonical concerns, not nested under a "manufacturing" umbrella. MRP plans production; WMS executes stock movement; CRP plans the resource side; CRM connects to customer demand. Each is its own canonical module with its own AI tools, tier limits, and Postgres schema. Verticals consume an arbitrary subset.

---

## 3. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

When implementation lands, the module materializes as four coordinated paths:

| Slice | Path (when shipped) |
|---|---|
| API | `services/api/src/modules/mrp/` |
| Web | `apps/web/app/[locale]/(mrp)/` |
| Native | `apps/native/src/modules/mrp/` |
| Contracts | `packages/mrp-contracts/` → `@umbraculum/mrp-contracts` |

Postgres schema name: `mrp` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 4. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `wms` | Strong — MRP reads stock-on-hand and generates replenishment proposals; WMS receipt/issue lifecycle reconciles MRP material requirements. The H1 2027 co-design pairing is explicit in [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md). |
| `crp` | Strong — MRP production orders feed CRP's capacity load model. Co-designed in the same tranche. |
| `automation` | Indirect — when a production order is released and the brewery vertical's `brewery.openplc.v1` adapter is connected, the operator may launch the corresponding PLC program from the `(automation)/` shell. Coupling stays loose (vesselId reference, not data copy). |
| `crm` | Loose — customer-facing orders may drive MRP demand, but the link is mediated via demand-line records, not a direct FK. |

---

## 5. What needs to happen before this stub becomes a real page

Per [RFC-0001 §6 (Decision D)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md), no mini-RFC is required for `mrp` to ship — the canonical code is already allocated by RFC-0001 §4. The procedure is:

1. **Surface design doc** under `docs/design/canonical-mrp-module-surface.md`, modeled on [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md). Resolves the data model, AI tool surface, tier-limit fields, phasing.
2. **Phase A — contracts.** Create `packages/mrp-contracts/`, ship types + `CONTRACT_VERSION`.
3. **Phase B — read path.** Land `services/api/src/modules/mrp/` skeleton, register via `@umbraculum/module-sdk`, ship initial read routes and AI tools.
4. **Coordinated brewery → β migration.** Brew sessions move from `services/api/src/routes/brewSessions.ts` to either the brewery vertical's `services/api/src/modules/brewery/` slice (still vertical-flavored) **and / or** are reframed as MRP production orders. The exact reshape is the surface design doc's job.

---

## 6. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 (reserved codes), §7 (canonical-module placement principle), §12.4 (mrp/wms/crm/crp migration trajectory).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4 (β layout, naming conventions).
- [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md) — H1 2027 brewery-and-MRP-and-CRP co-design.
- [ROADMAP.md §H1 2027](../../ROADMAP.md) — brewery-vertical promotion + canonical-module co-design.
- [`automation.md`](automation.md) — template for what this page will look like once `mrp` ships.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
