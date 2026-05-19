# `crp` — canonical module (open door)

**Tier:** Public
**Status:** **Open door** — not implemented. Reserved code, β layout pre-committed. Working assumption: lands in the H1 2027 tranche alongside `mrp` per [ROADMAP.md](../../ROADMAP.md).
**Code:** `crp`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's capacity-planning roadmap or planning to extend the future CRP module.

> [!NOTE]
> Per-module page for the (not-yet-implemented) `crp` canonical module. The code is reserved by [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md); the folder shape is pre-committed by [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md). When work starts, replace this stub with a real per-module page modeled on [`automation.md`](automation.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **capacity requirements planning, resource scheduling, work-center load**.

The CRP canonical module owns the platform's "do we have enough physical capacity to fulfil the production plan, and when?" surface. Concretely (illustrative, refined by the future surface design doc):

- Work-center / resource registry — capacity per unit time.
- Load profile (committed + planned hours per resource per window).
- Schedule view — which production order runs on which resource, when.
- Conflict detection — overbooking, alarm on capacity exhaustion.
- Vessel-as-planning-resource view that consumes `automation.Vessel` data ([surface boundary guardrail](../../../services/api/src/modules/automation/README.md#surface-boundary--automation-vs-crp-forward-looking-guardrail) is explicit that this view belongs **here**, not on the automation surface).

---

## 2. The `automation` ↔ `crp` boundary — already pre-committed

The lane separation between `automation` (live controller state, "what is this vessel doing right now?") and `crp` (planning resource state, "what is this vessel scheduled for?") is committed today in the automation module's README — see [`services/api/src/modules/automation/README.md`](../../../services/api/src/modules/automation/README.md) §"Surface boundary — automation vs. crp". Concrete contributor guidance:

- Scheduling / booking / utilization-% views live on **CRP**, not `automation`.
- The `(automation)/` web shell does **not** link into a future scheduling surface; the lane separation is the design discipline.
- When `crp` ships, it consumes `vesselId` references through `@umbraculum/equipment-contracts` (the cross-module shared type discussed in [RFC-0002 §7 item 3](../../rfcs/0002-canonical-module-physical-layout.md)) — never reaches into `services/api/src/modules/automation/` directly.

---

## 3. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path (when shipped) |
|---|---|
| API | `services/api/src/modules/crp/` |
| Web | `apps/web/app/[locale]/(crp)/` |
| Native | `apps/native/src/modules/crp/` |
| Contracts | `packages/crp-contracts/` → `@umbraculum/crp-contracts` |

Postgres schema name: `crp` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 4. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `mrp` | Strong — MRP production orders are the input; CRP allocates them onto resources. Co-designed in the H1 2027 tranche per [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md). |
| `automation` | Read-only — CRP reads `automation.Vessel` rows (via the shared equipment-contracts package) to present vessel-as-resource views. No data copy. |
| `wms` | Loose — material availability constrains schedulable production; coupling is via stock-on-hand queries. |
| `crm` | Loose — long-range demand forecast feeds capacity-planning windows. |

---

## 5. The `@umbraculum/equipment-contracts` extraction trigger

Per [canonical-automation-module-surface.md §4](../../design/canonical-automation-module-surface.md): when CRP ships, `EquipmentProfile` (currently brewery-internal) needs to be readable by both `automation` and `crp`. The cross-module shared type extraction (`@umbraculum/equipment-contracts`) is the second-consumer trigger from [RFC-0002 §7 item 3](../../rfcs/0002-canonical-module-physical-layout.md). Until then, the field stays brewery-internal and `automation` references `vesselId` directly.

---

## 6. What needs to happen before this stub becomes a real page

1. **Surface design doc** under `docs/design/canonical-crp-module-surface.md`.
2. **Phase A — contracts.** Create `packages/crp-contracts/`, ship types + `CONTRACT_VERSION`. Likely paired with the `@umbraculum/equipment-contracts` extraction.
3. **Phase B — read path.** Calendar / schedule read views consuming MRP production orders and `automation.Vessel` rows.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4, §7.
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3, §4, §7 item 3.
- [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md) — H1 2027 brewery + MRP + CRP co-design.
- [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) §4, §11 — the surface boundary already documented.
- [`services/api/src/modules/automation/README.md`](../../../services/api/src/modules/automation/README.md) §"Surface boundary — automation vs. crp" — the in-code guardrail.
- [`automation.md`](automation.md) — template.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
