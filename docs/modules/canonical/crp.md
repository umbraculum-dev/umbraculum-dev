# `crp` — canonical module (alpha shipped)

**Tier:** Public
**Status:** **H2 2026 alpha track shipped** (Waves 1–6 + alpha demo closure 2026-05-27) — read-only API, web UX, brewery/automation projection, AI advisor, RFC-0007 exports, and automated demo proof exist. **TODO:** human walkthrough gap-log sign-off; propose/write tools and mature commercial scope remain [ROADMAP § H1 2027 mature](../../ROADMAP.md#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027). See [ROADMAP § H2 2026 MRP/CRP](../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning).
**Code:** `crp`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's capacity-planning roadmap or planning to extend the future CRP module.

> [!NOTE]
> Per-module page for the foundation-stage `crp` canonical module. The current implementation is deliberately narrow: [`@umbraculum/crp-contracts`](../../../packages/canonical/crp/contracts/README.md), [`services/api/src/modules/crp/`](../../../services/api/src/modules/crp/README.md), the `crp` Prisma schema, Wave 2 read-time brewery/automation projections, Wave 3 read-only web pages, Wave 4 deterministic fixture-backed proof, and Wave 5 read-only AI advisor tools. The current planning/build artifacts are the joint [MRP/CRP August 2026 co-design plan](../../design/mrp-crp-august-2026-co-design-plan.md), the [canonical CRP module surface design](../../design/canonical-crp-module-surface.md), the [Wave 1 build log](../../design/mrp-crp-wave-1-build-log.md), the [Wave 2 brewery projection build log](../../design/mrp-crp-wave-2-brewery-projection-build-log.md), the [Wave 3 read-only alpha experience build log](../../design/mrp-crp-wave-3-read-only-alpha-experience-build-log.md), the [Wave 4 alpha proof hardening build log](../../design/mrp-crp-wave-4-alpha-proof-hardening-build-log.md), and the [Wave 5 AI planning advisor build log](../../design/mrp-crp-wave-5-ai-planning-advisor-build-log.md).

---

## 1. Domain scope

Per [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md): **capacity requirements planning, resource scheduling, work-center load**.

The CRP canonical module owns the platform's "do we have enough physical capacity to fulfil the production plan, and when?" surface. Concretely (illustrative, refined by the surface design doc):

- Work-center / resource registry — capacity per unit time.
- Load profile (committed + planned hours per resource per window).
- Schedule view — which production order runs on which resource, when.
- Conflict detection — overbooking, alarm on capacity exhaustion.
- Vessel-as-planning-resource view that consumes `automation.Vessel` data ([surface boundary guardrail](../../../services/api/src/modules/automation/README.md#surface-boundary--automation-vs-crp-forward-looking-guardrail) is explicit that this view belongs **here**, not on the automation surface).

---

## 2. Canonical extensibility, not a finished CRP suite

`crp` is a **canonical module**: an extensible kernel of shared capacity-planning primitives that vertical configurations and third-party modules can build on. It is not intended to land as a complete ready-to-sell CRP/APS product with every finite-capacity optimizer, labor-planning engine, multi-plant scheduler, MES dispatch loop, and enterprise planning integration built in.

The first useful implementation should therefore bias toward stable contracts and extension points: resource/work-center primitives, calendars, capacity-load views, conflict detection, scheduling-proposal hooks, AI-tool hooks, and rendering-template hooks. Brewery proves the surface with vessels-as-resources and brew-session scheduling, but brewery assumptions must not become canonical invariants unless they generalize cleanly beyond brewery.

---

## 3. The `automation` ↔ `crp` boundary — already pre-committed

The lane separation between `automation` (live controller state, "what is this vessel doing right now?") and `crp` (planning resource state, "what is this vessel scheduled for?") is committed today in the automation module's README — see [`services/api/src/modules/automation/README.md`](../../../services/api/src/modules/automation/README.md) §"Surface boundary — automation vs. crp". Concrete contributor guidance:

- Scheduling / booking / utilization-% views live on **CRP**, not `automation`.
- The `(automation)/` web shell does **not** link into a future scheduling surface; the lane separation is the design discipline.
- When `crp` ships, it consumes `vesselId` references through `@umbraculum/equipment-contracts` (the cross-module shared type discussed in [RFC-0002 §7 item 3](../../rfcs/0002-canonical-module-physical-layout.md)) — never reaches into `services/api/src/modules/automation/` directly.

---

## 4. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path (when shipped) |
|---|---|
| API | [`services/api/src/modules/crp/`](../../../services/api/src/modules/crp/) |
| Web | `apps/web/app/[locale]/(crp)/` |
| Native | `apps/native/src/modules/crp/` |
| Contracts | [`packages/canonical/crp/contracts/`](../../../packages/canonical/crp/contracts/) → `@umbraculum/crp-contracts` |

Postgres schema name: `crp` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 5. Expected dependencies on other canonical modules

| Module | Relationship |
|---|---|
| `mrp` | Strong — MRP production orders are the input; CRP allocates them onto resources. H2 2026 alpha co-designed; mature scope [ROADMAP § H1 2027](../../ROADMAP.md#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027) per [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md). |
| `automation` | Read-only — CRP reads `automation.Vessel` rows (via the shared equipment-contracts package) to present vessel-as-resource views. No data copy. |
| `wms` | Loose — material availability constrains schedulable production; coupling is via stock-on-hand queries. |
| `crm` | Loose — long-range demand forecast feeds capacity-planning windows. |

---

## 6. The `@umbraculum/equipment-contracts` extraction trigger

Per [canonical-automation-module-surface.md §4](../../design/canonical-automation-module-surface.md): when CRP ships, `EquipmentProfile` (currently brewery-internal) needs to be readable by both `automation` and `crp`. The cross-module shared type extraction (`@umbraculum/equipment-contracts`) is the second-consumer trigger from [RFC-0002 §7 item 3](../../rfcs/0002-canonical-module-physical-layout.md). Until then, the field stays brewery-internal and `automation` references `vesselId` directly.

---

## 7. What needs to happen before implementation

1. **Surface design doc** under [`docs/design/canonical-crp-module-surface.md`](../../design/canonical-crp-module-surface.md), including the extensibility contract for resource/calendar primitives and future optimizer plug-ins. **Done.**
2. **Wave 1 — contracts + read-only API foundation.** `packages/canonical/crp/contracts/`, `services/api/src/modules/crp/`, the `crp` Prisma schema, module registration, and L2 isolation tests are **shipped as foundation-only**.
3. **Wave 2 — coordinated brewery/resource projection.** Existing brewery and automation routes remain stable while vessels, equipment profiles, and timed brew-session steps project into CRP resource, work-center, scheduled-operation, capacity-load, and conflict read models. **Shipped as read-time projection only.**
4. **Wave 3 — read-only web alpha experience.** `apps/web/app/[locale]/(crp)/resources/`, `capacity/`, and `schedule/` expose those read models without write controls. **Shipped as web read-only proof only.**
5. **Wave 4 — deterministic read-only alpha proof.** E2E fixture data and focused Playwright assertions now prove CRP resource, work-center, capacity, schedule, and conflict projections without creating CRP rows. **Shipped as proof hardening only.**
6. **Wave 5 — read-only AI planning advisor.** `crp.listResources`, `crp.listWorkCenters`, `crp.listScheduledOperations`, `crp.explainCapacityLoad`, and `crp.listConflicts` register through `registerModule({ registerAiTools })` and call the existing read services. **Shipped as advisor proof only.**
7. **Wave 6 — rendering templates.** Four RFC-0007 templates and CRP render-job routes (capacity load XLSX, schedule PDF, conflict report, resource calendar CSV). **Shipped as rendering proof only.**
8. **Alpha demo closure.** Web export buttons, shared walkthrough with MRP, Playwright export smoke — see [`mrp-crp-alpha-demo-walkthrough.md`](../../design/mrp-crp-alpha-demo-walkthrough.md) (quick gates before Playwright) and [`mrp-crp-alpha-demo-closure-build-log.md`](../../design/mrp-crp-alpha-demo-closure-build-log.md). **Human sign-off still pending.**
9. **Later — write workflows.** Optimizer, native screens, and propose/write routes remain future work.

---

## 8. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4, §7.
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3, §4, §7 item 3.
- [MRP/CRP August 2026 co-design plan](../../design/mrp-crp-august-2026-co-design-plan.md) — bounded alpha acceleration target.
- [Canonical CRP module surface design](../../design/canonical-crp-module-surface.md) — planned CRP surface.
- [MRP/CRP Wave 1 build log](../../design/mrp-crp-wave-1-build-log.md) — foundation implementation record.
- [MRP/CRP Wave 2 brewery projection build log](../../design/mrp-crp-wave-2-brewery-projection-build-log.md) — read-time projection implementation record.
- [MRP/CRP Wave 3 read-only alpha experience build log](../../design/mrp-crp-wave-3-read-only-alpha-experience-build-log.md) — web read-only implementation record.
- [MRP/CRP Wave 4 alpha proof hardening build log](../../design/mrp-crp-wave-4-alpha-proof-hardening-build-log.md) — deterministic proof implementation record.
- [MRP/CRP Wave 5 AI planning advisor build log](../../design/mrp-crp-wave-5-ai-planning-advisor-build-log.md) — read-only AI advisor implementation record.
- [MRP/CRP Wave 6 rendering templates build log](../../design/mrp-crp-wave-6-rendering-templates-build-log.md) — RFC-0007 templates and render-job routes.
- [MRP/CRP alpha demo walkthrough](../../design/mrp-crp-alpha-demo-walkthrough.md) — operator runbook + Playwright quick gates.
- [MRP/CRP alpha demo closure build log](../../design/mrp-crp-alpha-demo-closure-build-log.md) — web exports + CI proof.
- [`@umbraculum/crp-contracts`](../../../packages/canonical/crp/contracts/README.md) — Wave 1 contracts package.
- [`services/api/src/modules/crp/`](../../../services/api/src/modules/crp/README.md) — Wave 1 read-only API skeleton.
- [ROADMAP.md § H2 2026 MRP/CRP](../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning) — alpha track.
- [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md) — mature MRP + CRP + WMS pairing (H1 2027).
- [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) §4, §11 — the surface boundary already documented.
- [`services/api/src/modules/automation/README.md`](../../../services/api/src/modules/automation/README.md) §"Surface boundary — automation vs. crp" — the in-code guardrail.
- [`automation.md`](automation.md) — template.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
