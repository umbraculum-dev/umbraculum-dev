# Canonical `crp` module surface - design

**Tier:** Public  
**Status:** Draft surface design 2026-05-26; Wave 5 read-only AI planning advisor, Wave 6 rendering templates, and alpha demo walkthrough automation shipped; alpha proof not complete (human sign-off pending)
**Audience:** core team, CRP implementers, brewery-vertical maintainers, automation maintainers, module SDK authors, AI-consultant maintainers  
**Resolves:** `crp` open-door next step from [`modules/canonical/crp.md`](../modules/canonical/crp.md)  
**Builds on:** [`RFC-0001`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [`RFC-0002`](../rfcs/0002-canonical-module-physical-layout.md), [`canonical-automation-module-surface.md`](canonical-automation-module-surface.md), [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)

> [!NOTE]
> Wave 1 shipped `@umbraculum/crp-contracts`, the `crp` Prisma schema, read-only API skeleton routes, module/web-segment registration, and L2 isolation tests. Wave 2 projects brewery/automation planning sources into those read routes at request time. Wave 3 exposes those read models in the web app through read-only resources, capacity, and schedule pages. Wave 4 adds deterministic E2E fixture proof across resources, work-center context, capacity load, scheduled operations, and read-only conflicts. Wave 5 adds module-owned read-only AI tools for resources, work centers, scheduled operations, capacity load, and conflicts. Wave 6 registers four RFC-0007 document templates and capacity/schedule render-job routes. This is still not alpha-complete: no native write workflow, optimizer, automation-control behavior, or complete public-alpha proof is claimed as shipped.

---

## 1. Summary

`crp` is the canonical capacity requirements planning module: the shared capacity-planning kernel for resources, work centers, calendars, scheduled operations, capacity load, and conflict detection. It consumes production operations from `mrp` and resource/vessel references from `automation`/brewery, but it does not own production-order lifecycle or live controller state.

| Layer | Planned beta-layout location | Planned responsibility |
|---|---|---|
| Contracts | `packages/crp-contracts/` -> `@umbraculum/crp-contracts` | **Wave 1 shipped:** DTOs, Zod schemas, `CONTRACT_VERSION`, resource/work-center/calendar/load/conflict refs, planned AI/rendering payload schemas. |
| API | `services/api/src/modules/crp/` | **Wave 1–6 shipped (read + rendering):** read-only routes, services, Prisma `crp` schema, module registration, read-time brewery/automation projections, read-only AI tool handlers, and RFC-0007 document templates with render-job routes. |
| Web | `apps/web/app/[locale]/(crp)/` | **Wave 3 shipped:** read-only resources, resource detail, capacity-load, schedule, and conflict pages under registered static URL segments. Proposal/write pages remain future work. |
| Native | `apps/native/src/modules/crp/` | Future operator/manager screens; may trail web in alpha. |
| Rendering | module-registered templates | **Wave 6 shipped:** capacity-load XLSX, schedule PDF, resource-calendar CSV, conflict-report PDF via RFC-0007. |
| AI tools | module-owned `registerAiTools` hook | **Wave 5 shipped:** `crp.listResources`, `crp.listWorkCenters`, `crp.listScheduledOperations`, `crp.explainCapacityLoad`, and `crp.listConflicts` as read-only advisor tools. Propose/write tools and optimizer behavior remain future work. |

---

## 2. Canonical extensibility stance

`crp` is an **extensible canonical kernel**, not a complete commercial CRP/APS suite. The first implementation should expose stable primitives and extension points:

- resources and work centers,
- calendars and availability windows,
- scheduled operations,
- capacity-load calculations,
- conflict detection,
- scheduling proposals,
- future optimizer plug-in boundary,
- AI-tool hooks,
- rendering-template hooks,
- tier-limit/add-on declarations,
- clear handoff from MRP and automation.

Out of scope for the first alpha surface:

- full finite-capacity optimizer,
- labor planning and skill matrices,
- multi-plant scheduling,
- MES dispatch and shop-floor execution,
- autonomous schedule writes,
- detailed costing,
- procurement or material planning decisions owned by MRP/WMS,
- direct PLC/control behavior owned by automation.

Future optimizers can plug into CRP through explicit proposal APIs; the optimizer must not become the module's core contract.

---

## 3. Domain scope

### 3.1 In scope

| Concern | CRP stance |
|---|---|
| Resource | A constrained planning unit: vessel, line, room, work center, labor pool, or other schedulable capacity. |
| Work center | Grouping of resources that share a planning purpose or capacity class. |
| Calendar | Availability windows, downtime, blackout windows, and planning horizon. |
| Scheduled operation | Placement of an MRP operation on a resource/window. |
| Capacity bucket | Time-window aggregation for load/capacity comparison. |
| Capacity load | Planned and committed load per resource/window. |
| Conflict | Overbooking, unavailable resource assignment, missed due date, or capacity exhaustion. |
| Scheduling proposal | Human-approved suggestion for moving/splitting/reassigning operations. |

### 3.2 Out of scope

| Concern | Owner |
|---|---|
| Production-order lifecycle, BOMs, material requirements | `mrp` |
| Live vessel/controller telemetry, alarms, adapter state | `automation` |
| Stock availability and inventory constraints | `wms` later; MRP assumptions during alpha |
| Brewery equipment-profile editing | `brewery` |
| Product/variant identity | `pim` |
| PLC execution and safety interlocks | automation + brewery OpenPLC sister repo |

---

## 4. Automation boundary

The automation module answers: "what is this vessel doing right now according to the adapter?"

CRP answers: "what is this resource scheduled for, when, and is that schedule feasible?"

CRP may consume:

- `automation.Vessel` identity,
- vessel display name/code/kind,
- optional equipment-profile reference,
- coarse current state for operator context.

CRP must not:

- deep-import `services/api/src/modules/automation/` internals,
- own live telemetry or alarms,
- issue PLC commands,
- put scheduling fields onto automation routes,
- turn `(automation)/` pages into scheduling pages.

This preserves the boundary already documented in [`services/api/src/modules/automation/README.md`](../../services/api/src/modules/automation/README.md).

---

## 5. Equipment contracts decision

CRP is the first concrete second consumer of brewery `EquipmentProfile` as planning-resource metadata. The design therefore treats an equipment contract extraction as part of the CRP planning surface:

- Preferred shape: `@umbraculum/equipment-contracts` as a small MIT contracts package for shared equipment/resource references.
- Alpha fallback: if implementation risk is too high, CRP can initially store a minimal `externalResourceRef` and link to brewery/automation by `(ownerModule, refId)` while documenting the extraction as the next migration.

The surface doc recommendation is to design as if the shared contract exists, but not to block documentation acceptance on physically creating the package.

---

## 6. Data model sketch

Illustrative only; exact Prisma names and fields land with implementation.

```prisma
model CrpResource {
  id                 String   @id @default(uuid())
  workspaceId        String   @map("workspace_id")
  code               String
  displayName        String   @map("display_name")
  resourceKind       String   @map("resource_kind")
  workCenterId       String?  @map("work_center_id")
  ownerModule        String?  @map("owner_module")
  ownerRefId         String?  @map("owner_ref_id")
  equipmentProfileId String?  @map("equipment_profile_id")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  workCenter         CrpWorkCenter? @relation(fields: [workCenterId], references: [id])
  scheduledOperations CrpScheduledOperation[]
  @@unique([workspaceId, code])
  @@index([workspaceId, resourceKind])
  @@map("resources")
  @@schema("crp")
}

model CrpScheduledOperation {
  id                  String   @id @default(uuid())
  workspaceId          String   @map("workspace_id")
  resourceId           String   @map("resource_id")
  mrpProductionOrderId String   @map("mrp_production_order_id")
  mrpOperationId       String   @map("mrp_operation_id")
  status              String
  startsAt            DateTime @map("starts_at")
  endsAt              DateTime @map("ends_at")
  loadQuantity        Decimal? @map("load_quantity")
  loadUnit            String?  @map("load_unit")
  resource            CrpResource @relation(fields: [resourceId], references: [id])
  @@index([workspaceId, startsAt])
  @@index([resourceId, startsAt, endsAt])
  @@map("scheduled_operations")
  @@schema("crp")
}
```

CRP references MRP operations by contract-level IDs, not by direct Prisma relations into the MRP schema unless a later implementation explicitly chooses cross-schema relations.

---

## 7. Contracts package

Wave 1 package: [`packages/crp-contracts/`](../../packages/crp-contracts/) published in-repo as `@umbraculum/crp-contracts`.

Expected exports:

- `CONTRACT_VERSION` and version-skew helpers.
- `ResourceSchema`, `ResourceRefSchema`, `ResourceKindSchema`.
- `WorkCenterSchema`.
- `ResourceCalendarSchema`, `AvailabilityWindowSchema`.
- `ScheduledOperationSchema`.
- `CapacityBucketSchema`.
- `CapacityLoadSchema`.
- `CapacityConflictSchema`.
- `ScheduleProposalSchema`.
- Response envelopes for list/get/load/conflict routes.
- AI tool input/output schemas.
- Document-template input schemas for schedules and load exports.

Internal Umbraculum code uses Zod v4 schemas per [`RFC-0003`](../rfcs/0003-validation-library-adoption.md). Runtime payloads must be parsed at package, HTTP, AI-tool, and rendering-template boundaries.

---

## 8. API surface

Wave 1 read-only API routes (also in OpenAPI tag `crp` — [`API-OPENAPI.md`](../API-OPENAPI.md)):

| Route | Method | Purpose |
|---|---|---|
| `/crp/resources` | GET | List resources for the active workspace. |
| `/crp/resources/:resourceId` | GET | Get one resource and its planning metadata. |
| `/crp/work-centers` | GET | List work centers. |
| `/crp/capacity-load` | GET | Load/capacity summary by resource/window. |
| `/crp/scheduled-operations` | GET | List scheduled operations by time/resource/order filters. |
| `/crp/conflicts` | GET | List detected conflicts. |
| `/crp/schedule-proposals` | POST | Future: produce a human-reviewable schedule proposal, not a direct write. |
| `/crp/capacity-load/render-jobs` | POST | **Wave 6 shipped:** capacity-load XLSX export through `@umbraculum/rendering`. |
| `/crp/schedule/render-jobs` | POST | **Wave 6 shipped:** schedule PDF export. |
| `/crp/resources/calendar/render-jobs` | POST | **Wave 6 shipped:** resource calendar CSV export. |
| `/crp/conflicts/render-jobs` | POST | **Wave 6 shipped:** conflict-report PDF export. |

Every route must:

- require an active session and active workspace,
- scope all reads by `workspaceId`,
- use Zod request/response schemas,
- return contract-validated DTOs,
- avoid raw SQL exposure to AI tools,
- avoid deep imports from MRP or automation internals.

---

## 9. Web and native slices

Planned web route group: `apps/web/app/[locale]/(crp)/`.

Planned URL segments, subject to `registerWebModule({ ownedUrlSegments })`:

| Segment | Purpose |
|---|---|
| `capacity` | Capacity-load summary. |
| `schedule` | Scheduled operations and conflict review. |
| `resources` | Resource/work-center list and detail. |

The route group must follow the two beta disciplines from RFC-0002:

- no `apps/web/app/[locale]/(crp)/page.tsx`,
- no group-root dynamic segment such as `apps/web/app/[locale]/(crp)/[id]/page.tsx`.

Native slice: `apps/native/src/modules/crp/`. For alpha, native may be limited to shared contracts/navigation readiness unless user testing requires operator-facing schedule/resource views.

---

## 10. Brewery alpha projection

Brewery proves CRP without becoming CRP.

| Brewery / canonical source | CRP projection |
|---|---|
| `BrewSession` via MRP | Scheduled operation input. |
| `BrewdaySettings` | Planned duration and operation sequence. |
| `EquipmentProfile` | Resource capacity assumptions. |
| `automation.Vessel` | Vessel/resource identity and optional current-state context. |
| MRP production order | Demand/load source. |

Wave 2 shipped the first read-time adapter: automation vessels project as CRP resources, brewery equipment profiles project as work centers, and timed brew-session steps project as scheduled operations/load where the source data is sufficient. Missing duration or missing unambiguous resource assignment is surfaced as a conservative read-only conflict rather than invented scheduling data.

Wave 3 shipped the first web proof of that adapter: `/resources`, `/resources/<resourceId>`, `/capacity`, and `/schedule` render the existing HTTP read APIs with contract-schema validation and explicit provenance labels such as "Projected from automation vessel" and "Projected from brewery." Wave 4 hardens that proof with deterministic fixture coverage for automation vessel resources, brewery equipment-profile work centers, capacity-load buckets, scheduled operations, and read-only conflicts. Wave 5 exposes the same evidence to the AI consultant through module-owned read-only tools. The UI and AI layer are read-only and do not parse projection IDs to infer source ownership.

The alpha implementation should continue to prefer projections and references over irreversible data migration. Existing brewery and automation routes remain stable.

---

## 11. MRP handoff

CRP consumes scheduleable operations from MRP:

- production order ID,
- operation ID/code,
- required resource class,
- planned duration,
- earliest start / due date,
- quantity/batch size,
- priority if available.

CRP returns:

- scheduled operations,
- capacity loads,
- conflicts,
- proposals for moving/splitting/reassigning operations.

MRP remains the source for production-order lifecycle. CRP does not silently mutate MRP state.

---

## 12. AI tools

First AI tools, read-only subset shipped in Wave 5:

| Tool | Scope | Purpose |
|---|---|---|
| `crp.listResources` | read | List resources/work centers and planning metadata. |
| `crp.listWorkCenters` | read | List work centers and planning metadata. |
| `crp.listScheduledOperations` | read | List scheduled operations projected from existing planning sources. |
| `crp.explainCapacityLoad` | read | Summarize load/capacity for a resource/window. |
| `crp.listConflicts` | read | Explain conflicts and capacity exhaustion. |
| `crp.explainResourceCalendar` | future read | Explain availability windows and downtime. |
| `crp.proposeScheduleAdjustment` | propose | Suggest schedule/capacity adjustments; human approval required ([`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md)). |

The shipped Wave 5 tools are `scope: "read"` and return the existing route response envelopes. The future `propose-write` tool returns structured proposals. It must not directly mutate schedule state.

---

## 13. Rendering templates

**Wave 6 shipped.** Module-owned templates registered via `registerModule({ documentTemplates })`:

| Template ref | Kind | Purpose |
|---|---|---|
| `crp:capacity-load-xlsx@v1` | `xlsx` | Capacity load export for planning/review. |
| `crp:schedule-pdf@v1` | `pdf` | Human-readable schedule view. |
| `crp:resource-calendar-csv@v1` | `csv` | Calendar/availability export. |
| `crp:conflict-report-pdf@v1` | `pdf` | Conflict summary for operator review. |

CRP must not bundle its own PDF/XLSX/CSV libraries. Rendering is a horizontal platform concern per RFC-0007.

---

## 14. Tier limits and add-ons

Illustrative future tier-limit slice:

| Field | Meaning |
|---|---|
| `crpEnabled` | Whether the module surface is enabled for the workspace. |
| `crpAiToolsEnabled` | Whether CRP tools are visible to the AI orchestrator. |
| `maxPlanningResources` | Resource count guardrail by tier. |
| `maxScheduledOperationsHorizonDays` | Planning-horizon guardrail by tier. |

Potential addon code: `crp_module`.

The exact values belong to the future implementation plan; this surface doc only records that limits attach through the module SDK rather than a brewery-private tier-limit path.

---

## 15. Phasing

| Phase | Output |
|---|---|
| A | Contracts package with schemas, tests, version helpers, and equipment-contract extraction decision. |
| B | API skeleton and read-only routes registered via `registerModule()`. |
| C | Resource projection from brewery equipment and automation vessels. |
| D | Capacity-load and conflict calculations. |
| E | **Wave 4 shipped:** deterministic read-only web proof over resources, work centers, capacity, schedule, and conflicts. Proposal pages remain future work. |
| F | **Wave 6 shipped:** rendering templates and capacity export routes. |
| G | **Wave 5 shipped:** read-only AI tools and integration proof with MRP. Propose tools remain future work. |
| Mature | Human-approved writes, richer scheduler/optimizer plug-ins, WMS constraints, native operator flows. |

---

## 16. Alpha acceptance proof

The alpha proof is complete when a user can:

1. Start from MRP operations for one brewery production order.
2. See resources derived from brewery equipment/automation vessel references.
3. See a capacity-load view over a bounded planning window.
4. Detect at least one conflict or at-capacity condition.
5. Generate a schedule/load artifact through the rendering pipeline.
6. Ask the AI consultant to explain the capacity picture and propose an adjustment.

The proof must make clear that this is an extensible canonical module surface, not a finished commercial CRP/APS product.

Wave 4 satisfies the deterministic read-only web visibility portions of this proof (items 1-4). Wave 5 satisfies the read-only AI explanation portion of item 6 for resources, capacity load, scheduled operations, and conflicts. Wave 6 satisfies item 5 for CRP schedule/load artifacts via the rendering pipeline. **Alpha demo walkthrough ready (2026-05-26):** browser export buttons on capacity (and stretch schedule/resources pages), runbook [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) (includes **quick gates before Playwright** — stack health, seed, stale `.auth`), CI coverage for all CRP render-job routes, Playwright export smoke — human gap-log sign-off still pending. Propose/write workflows, optimizer, native, and WMS portions remain open.

---

## 17. Cross-references

- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md) - joint plan.
- [`mrp-crp-wave-3-read-only-alpha-experience-build-log.md`](mrp-crp-wave-3-read-only-alpha-experience-build-log.md) - Wave 3 web read-only implementation record.
- [`mrp-crp-wave-4-alpha-proof-hardening-build-log.md`](mrp-crp-wave-4-alpha-proof-hardening-build-log.md) - Wave 4 deterministic proof record.
- [`mrp-crp-wave-5-ai-planning-advisor-build-log.md`](mrp-crp-wave-5-ai-planning-advisor-build-log.md) - Wave 5 read-only AI planning advisor record.
- [`mrp-crp-wave-6-rendering-templates-build-log.md`](mrp-crp-wave-6-rendering-templates-build-log.md) - Wave 6 rendering templates and render-job routes.
- [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) - public-alpha demo operator runbook.
- [`mrp-crp-alpha-demo-closure-build-log.md`](mrp-crp-alpha-demo-closure-build-log.md) - alpha demo closure (web exports + CI).
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md) - paired production-planning surface.
- [`modules/canonical/crp.md`](../modules/canonical/crp.md) - open-door module page.
- [`modules/verticals/brewery/README.md`](../modules/verticals/brewery/README.md) - reference vertical.
- [`canonical-automation-module-surface.md`](canonical-automation-module-surface.md) - automation boundary.
- [`services/api/src/modules/automation/README.md`](../../services/api/src/modules/automation/README.md) - in-code automation-vs-CRP guardrail.
- [`RFC-0001`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) - module governance.
- [`RFC-0002`](../rfcs/0002-canonical-module-physical-layout.md) - physical layout.
- [`RFC-0007`](../rfcs/0007-canonical-document-rendering.md) - rendering pipeline.
