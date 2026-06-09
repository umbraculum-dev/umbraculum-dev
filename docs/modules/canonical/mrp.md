# `mrp` — canonical module (alpha shipped)

**Tier:** Public
**Status:** **H2 2026 alpha track shipped** (Waves 1–6 + alpha demo closure 2026-05-27) — read-only API, web UX, brewery projection, AI advisor, RFC-0007 exports, and automated demo proof exist. **TODO:** human walkthrough gap-log sign-off; propose/write tools and mature commercial scope remain [ROADMAP § H1 2027 mature](../../ROADMAP.md#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027). See [ROADMAP § H2 2026 MRP/CRP](../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning).
**Code:** `mrp`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's manufacturing-planning roadmap or planning to extend the future MRP module.

> [!NOTE]
> Per-module page for the foundation-stage `mrp` canonical module. The current implementation is deliberately narrow: [`@umbraculum/mrp-contracts`](../../../packages/canonical/mrp/contracts/README.md), [`services/api/src/modules/mrp/`](../../../services/api/src/modules/mrp/README.md), the `mrp` Prisma schema, Wave 2 read-time brewery projections, Wave 3 read-only web pages, Wave 4 deterministic fixture-backed proof, and Wave 5 read-only AI advisor tools. The current planning/build artifacts are the joint [MRP/CRP August 2026 co-design plan](../../design/mrp-crp-august-2026-co-design-plan.md), the [canonical MRP module surface design](../../design/canonical-mrp-module-surface.md), the [Wave 1 build log](../../design/mrp-crp-wave-1-build-log.md), the [Wave 2 brewery projection build log](../../design/mrp-crp-wave-2-brewery-projection-build-log.md), the [Wave 3 read-only alpha experience build log](../../design/mrp-crp-wave-3-read-only-alpha-experience-build-log.md), the [Wave 4 alpha proof hardening build log](../../design/mrp-crp-wave-4-alpha-proof-hardening-build-log.md), and the [Wave 5 AI planning advisor build log](../../design/mrp-crp-wave-5-ai-planning-advisor-build-log.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **material requirements planning, production planning, work orders**.

The MRP canonical module owns the platform's "what do we make, when, and what raw materials does that require?" surface. Concretely (illustrative, refined by the surface design doc):

- Production-order lifecycle (planned → released → in-progress → completed).
- Bill of materials (BOM) traversal — given a production order, compute material requirements.
- Lead-time and reorder-point logic that drives WMS replenishment proposals.
- Brew sessions in the brewery vertical are *production orders* in MRP's language — [ROADMAP § H2 2026](../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning) defines the bounded read-only alpha proof; [§ H1 2027 mature](../../ROADMAP.md#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027) covers write workflows and irreversible brewery→MRP promotion ([PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md)).

---

## 2. Canonical extensibility, not a finished MRP suite

`mrp` is a **canonical module**: an extensible kernel of shared production-planning primitives that vertical configurations and third-party modules can build on. It is not intended to land as a complete ready-to-sell MRP/ERP product with every planner, optimizer, procurement workflow, costing model, accounting integration, and MES execution loop built in.

The first useful implementation should therefore bias toward stable contracts and extension points: production orders, BOM/material-requirement primitives, work-order/document hooks, AI-tool hooks, and clean cross-module references. Brewery proves the surface with recipes-as-BOMs and brew sessions-as-production-orders, but brewery assumptions must not become canonical invariants unless they generalize cleanly beyond brewery.

---

## 3. Why it exists separately from `wms` and `crp`

[RFC-0001 §4.1](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) (the decomposition-rationale section) is explicit: MRP / WMS / CRP / CRM / `automation` are *peer* canonical concerns, not nested under a "manufacturing" umbrella. MRP plans production; WMS executes stock movement; CRP plans the resource side; CRM connects to customer demand. Each is its own canonical module with its own AI tools, tier limits, and Postgres schema. Verticals consume an arbitrary subset.

---

## 4. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

The module materializes as four coordinated paths; Wave 1 shipped the contracts/API foundation, Wave 2 added read-time brewery projections, Wave 3 exposes the read models in web, and Wave 4 pins deterministic fixture-backed proof:

| Slice | Path (when shipped) |
|---|---|
| API | [`services/api/src/modules/mrp/`](../../../services/api/src/modules/mrp/) |
| Web | `apps/web/app/[locale]/(mrp)/` |
| Native | `apps/native/src/modules/mrp/` |
| Contracts | [`packages/canonical/mrp/contracts/`](../../../packages/canonical/mrp/contracts/) → `@umbraculum/mrp-contracts` |

Postgres schema name: `mrp` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 5. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `wms` | Strong — MRP reads stock-on-hand and generates replenishment proposals; WMS receipt/issue lifecycle reconciles MRP material requirements. The H1 2027 co-design pairing is explicit in [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md). |
| `crp` | Strong — MRP production orders feed CRP's capacity load model. Co-designed in the same tranche. |
| `automation` | Indirect — when a production order is released and the brewery vertical's `brewery.openplc.v1` adapter is connected, the operator may launch the corresponding PLC program from the `(automation)/` shell. Coupling stays loose (vesselId reference, not data copy). |
| `crm` | Loose — customer-facing orders may drive MRP demand, but the link is mediated via demand-line records, not a direct FK. |

---

## 6. What needs to happen before implementation

Per [RFC-0001 §6 (Decision D)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md), no mini-RFC is required for `mrp` to ship — the canonical code is already allocated by RFC-0001 §4. The procedure is:

1. **Surface design doc** under [`docs/design/canonical-mrp-module-surface.md`](../../design/canonical-mrp-module-surface.md), modeled on [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md). Resolves the data model, extensibility contract, AI tool surface, tier-limit fields, phasing. **Done.**
2. **Wave 1 — contracts + read-only API foundation.** `packages/canonical/mrp/contracts/`, `services/api/src/modules/mrp/`, the `mrp` Prisma schema, module registration, and L2 isolation tests are **shipped as foundation-only**.
3. **Wave 2 — coordinated brewery projection.** Existing brewery routes remain stable while recipes and brew sessions project into MRP BOM, production-order, operation, and material-requirement read models. **Shipped as read-time projection only.**
4. **Wave 3 — read-only web alpha experience.** `apps/web/app/[locale]/(mrp)/production-orders/` and `material-requirements/` expose those read models without write controls. **Shipped as web read-only proof only.**
5. **Wave 4 — deterministic read-only alpha proof.** E2E fixture data and focused Playwright assertions now prove the MRP/CRP read-only projection path without creating MRP rows. **Shipped as proof hardening only.**
6. **Wave 5 — read-only AI planning advisor.** `mrp.listProductionOrders`, `mrp.getProductionOrder`, and `mrp.explainMaterialRequirements` register through `registerModule({ registerAiTools })` and call the existing read services. **Shipped as advisor proof only.**
7. **Wave 6 — rendering templates.** Four RFC-0007 templates (`mrp:work-order-pdf@v1`, `mrp:route-card-pdf@v1`, `mrp:material-requirements-xlsx@v1`, `mrp:production-order-csv@v1`) register through `registerModule({ documentTemplates })` with module-owned render-job routes. **Shipped as rendering proof only.**
8. **Alpha demo closure.** Web export buttons, operator walkthrough, full render-job API matrix, Playwright export smoke — see [`mrp-crp-alpha-demo-walkthrough.md`](../../design/mrp-crp-alpha-demo-walkthrough.md) (quick gates before Playwright) and [`mrp-crp-alpha-demo-closure-build-log.md`](../../design/mrp-crp-alpha-demo-closure-build-log.md). **Human sign-off still pending.**
9. **Later — write workflows.** Propose/write routes and native operator flows remain future work.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 (reserved codes), §7 (canonical-module placement principle), §12.4 (mrp/wms/crm/crp migration trajectory).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4 (β layout, naming conventions).
- [MRP/CRP August 2026 co-design plan](../../design/mrp-crp-august-2026-co-design-plan.md) — bounded alpha acceleration target.
- [Canonical MRP module surface design](../../design/canonical-mrp-module-surface.md) — planned MRP surface.
- [MRP/CRP Wave 1 build log](../../design/mrp-crp-wave-1-build-log.md) — foundation implementation record.
- [MRP/CRP Wave 2 brewery projection build log](../../design/mrp-crp-wave-2-brewery-projection-build-log.md) — read-time projection implementation record.
- [MRP/CRP Wave 3 read-only alpha experience build log](../../design/mrp-crp-wave-3-read-only-alpha-experience-build-log.md) — web read-only implementation record.
- [MRP/CRP Wave 4 alpha proof hardening build log](../../design/mrp-crp-wave-4-alpha-proof-hardening-build-log.md) — deterministic proof implementation record.
- [MRP/CRP Wave 5 AI planning advisor build log](../../design/mrp-crp-wave-5-ai-planning-advisor-build-log.md) — read-only AI advisor implementation record.
- [MRP/CRP Wave 6 rendering templates build log](../../design/mrp-crp-wave-6-rendering-templates-build-log.md) — RFC-0007 templates and render-job routes.
- [MRP/CRP alpha demo walkthrough](../../design/mrp-crp-alpha-demo-walkthrough.md) — operator runbook + Playwright quick gates.
- [MRP/CRP alpha demo closure build log](../../design/mrp-crp-alpha-demo-closure-build-log.md) — web exports + CI proof.
- [`@umbraculum/mrp-contracts`](../../../packages/canonical/mrp/contracts/README.md) — Wave 1 contracts package.
- [`services/api/src/modules/mrp/`](../../../services/api/src/modules/mrp/README.md) — Wave 1 read-only API skeleton.
- [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md) — mature MRP + CRP + WMS pairing (H1 2027).
- [ROADMAP.md § H2 2026 MRP/CRP](../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning) — alpha track (done/TODO).
- [ROADMAP.md § H1 2027 mature](../../ROADMAP.md#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027) — write workflows, WMS, commercial depth.
- [`automation.md`](automation.md) — template for what this page will look like once `mrp` ships.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
