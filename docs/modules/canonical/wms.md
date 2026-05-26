# `wms` — canonical module (open door)

**Tier:** Public
**Status:** **Open door** — not implemented. Reserved code, β layout pre-committed. Working assumption: lands in the H2 2027 tranche as the second native-mandatory vertical per [ROADMAP.md](../../ROADMAP.md).
**Code:** `wms`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's warehouse-management roadmap or planning to extend the future WMS module.

> [!NOTE]
> Per-module page for the (not-yet-implemented) `wms` canonical module. The code is reserved by [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md); the folder shape is pre-committed by [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md). When work starts, replace this stub with a real per-module page modeled on [`automation.md`](automation.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **warehouse management, stock movements, locations, lots / serials**.

The WMS canonical module owns the platform's "where is each physical thing, in what quantity, and what is its provenance?" surface. Concretely (illustrative, refined by the future surface design doc):

- Locations hierarchy (warehouses, bays, bins).
- Stock-on-hand by SKU × location × lot/serial.
- Receipt / issue / transfer movements with audit trail.
- Lot and serial tracking for traceability and compliance.
- Brewery vertical's existing `ingredients.ts` + `inventory.ts` flat routes ([services/api/src/routes/](../../../services/api/src/routes/)) are the "what's in stock" surface that becomes the brewery-vertical adapter onto canonical WMS primitives when this module ships.

---

## 2. Why it's a peer canonical, not a sub-module of `mrp`

[RFC-0001 §4.1](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): MRP plans demand; WMS executes physical stock. They are tightly coupled but conceptually distinct — a vertical may need WMS without MRP (a pure distribution vertical) or MRP without WMS (a service business). Forcing them under a "manufacturing" umbrella creates a coupling the architecture does not actually require.

---

## 3. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path (when shipped) |
|---|---|
| API | `services/api/src/modules/wms/` |
| Web | `apps/web/app/[locale]/(wms)/` |
| Native | `apps/native/src/modules/wms/` |
| Contracts | `packages/wms-contracts/` → `@umbraculum/wms-contracts` |

Postgres schema name: `wms` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 4. Native-mandatory note

[ROADMAP.md §H2 2027](../../ROADMAP.md) flags WMS as the **second native-mandatory vertical** (after the brewery vertical's native shell). The implication: when WMS ships, the `apps/native/src/modules/wms/` slice is not optional — warehouse operators work with mobile barcode scanners on the floor, and a web-only WMS shell would fail real-world workflows. Surface design must treat native as a first-class consumer, not a port.

---

## 5. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `mrp` | Strong — MRP generates demand for raw materials; WMS commits stock against that demand. Co-designed in the H1 2027 → H2 2027 tranche. |
| `crm` | Loose — customer orders drive picking lists; the link is mediated via shipment-line records, not a direct FK to CRM internals. |
| `automation` | Loose — automation devices (e.g. weigh stations) may emit movement events that WMS records, but the data flows through the integrations framework, not a direct dependency. |

---

## 6. What needs to happen before this stub becomes a real page

Same path as MRP — no mini-RFC required (code already allocated). Surface design doc → Phase A contracts → Phase B read path → coordinated brewery-side adapter.

1. **Surface design doc** under `docs/design/canonical-wms-module-surface.md`.
2. **Phase A — contracts.** Create `packages/wms-contracts/`, ship types + `CONTRACT_VERSION`.
3. **Phase B — read path.** Land `services/api/src/modules/wms/`, register via `@umbraculum/module-sdk`, ship read routes and AI tools.
4. **Brewery WMS adapter.** Brewery's `ingredients.ts` / `inventory.ts` either move to `services/api/src/modules/brewery/` or get reframed as WMS catalog entries — the surface design doc resolves the exact framing.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4, §7.
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4.
- [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md) — H1 2027 / H2 2027 phasing.
- [ROADMAP.md §H2 2027](../../ROADMAP.md) — WMS as native-mandatory.
- [`automation.md`](automation.md) — template.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
