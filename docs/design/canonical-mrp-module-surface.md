# Canonical `mrp` module surface - design

**Tier:** Public  
**Status:** Draft surface design 2026-05-26; H2 2026 alpha track shipped (Waves 1–6 + demo closure 2026-05-27); alpha proof not complete until human walkthrough sign-off — see [ROADMAP § H2 2026 MRP/CRP](../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning)
**Audience:** core team, MRP implementers, brewery-vertical maintainers, module SDK authors, AI-consultant maintainers  
**Resolves:** `mrp` open-door next step from [`modules/canonical/mrp.md`](../modules/canonical/mrp.md)  
**Builds on:** [`RFC-0001`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [`RFC-0002`](../rfcs/0002-canonical-module-physical-layout.md), [`RFC-0007`](../rfcs/0007-canonical-document-rendering.md), [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)

> [!NOTE]
> Wave 1 shipped `@umbraculum/mrp-contracts`, the `mrp` Prisma schema, read-only API skeleton routes, module/web-segment registration, and L2 isolation tests. Wave 2 projects brewery recipes and brew sessions into those read routes at request time. Wave 3 exposes those read models in the web app through read-only production-order and material-requirement pages. Wave 4 adds deterministic E2E fixture proof across the MRP/CRP read projections. Wave 5 adds module-owned read-only AI tools for production orders and material requirements. Wave 6 registers four RFC-0007 document templates and module-owned render-job routes (work-order preview, work-order/route-card PDFs, material-requirement XLSX, production-order CSV). This is still not alpha-complete: no native write workflow, WMS behavior, or complete public-alpha proof is claimed as shipped.

---

## 1. Summary

`mrp` is the canonical material requirements planning module: the shared production-planning kernel for production orders, work orders, bills of materials, material requirements, and production lifecycle. It is designed so brewery can prove the surface without turning brewery assumptions into canonical invariants.

MRP does not own inventory execution, capacity scheduling, live controller state, or product master data. It references those sibling domains through module contracts and service boundaries.

| Layer | Planned beta-layout location | Planned responsibility |
|---|---|---|
| Contracts | `packages/mrp-contracts/` -> `@umbraculum/mrp-contracts` | **Wave 1 shipped:** DTOs, Zod schemas, `CONTRACT_VERSION`, production-order/BOM/material-requirement refs, planned AI/rendering payload schemas. |
| API | `services/api/src/modules/mrp/` | **Wave 1–6 shipped (read + rendering):** read-only routes, services, Prisma `mrp` schema, module registration, read-time brewery projections, read-only AI tool handlers, and RFC-0007 document templates with render-job routes. |
| Web | `apps/web/app/[locale]/(mrp)/` | **Wave 3 shipped:** read-only production-order list/detail and material-requirement entry pages under registered static URL segments. Proposal/write pages remain future work. |
| Native | `apps/native/src/modules/mrp/` | Future operator/manager screens; may trail web in alpha. |
| Rendering | module-registered templates | Work orders, route cards, material-requirement exports. |
| AI tools | module-owned `registerAiTools` hook | **Wave 5 shipped:** `mrp.listProductionOrders`, `mrp.getProductionOrder`, and `mrp.explainMaterialRequirements` as read-only advisor tools. Propose/write tools remain future work. |

---

## 2. Canonical extensibility stance

`mrp` is an **extensible canonical kernel**, not a complete commercial MRP/ERP suite. The first implementation should expose stable primitives and extension points:

- production-order identity and lifecycle,
- production-order lines,
- BOM and BOM-line references,
- material-requirement calculations,
- operation/route-template references,
- work-order/document hooks,
- AI-tool hooks,
- tier-limit/add-on declarations,
- cross-module references to PIM, CRP, WMS-later, and vertical configurations.

Out of scope for the first alpha surface:

- procurement/RFQ/purchase-order workflows,
- accounting/ERP posting,
- full WMS stock movement,
- MES dispatch and execution,
- finite-capacity optimization,
- deep costing,
- multi-plant planning,
- autonomous AI writes.

Third-party and vertical modules should be able to attach domain-specific metadata or adapters without forking MRP's core contract.

---

## 3. Domain scope

### 3.1 In scope

| Concern | MRP stance |
|---|---|
| Production order | The central planned manufacturing unit: what to make, quantity, due date, status, source, and optional product/variant references. |
| Production-order line | A quantity-bearing line for one output item or batch component. |
| Work order | Operator-facing execution packet derived from a production order; may be a state table or rendered artifact depending on implementation phase. |
| BOM | A reusable material structure for a planned output. Brewery recipes can project into this shape. |
| BOM line | Required material, quantity, unit, loss/yield assumptions, and optional substitute metadata. |
| Material requirement | Expanded requirement for a production order, optionally annotated with availability assumptions until WMS ships. |
| Operation template | Planned steps/operations that CRP can schedule; brewery brewday settings are an input. |
| AI explanation | Read/propose tools that explain requirements and next actions in workspace context. |
| Rendering templates | Work-order PDFs, route cards, and material-requirement exports through the platform rendering pipeline. |

### 3.2 Out of scope

| Concern | Owner |
|---|---|
| Stock movements, lots/serials, locations, receipts/issues | `wms` |
| Capacity load, resource calendars, resource assignment, schedule conflicts | `crp` |
| Live vessel/controller state, alarms, adapter status | `automation` |
| Product and variant master data | `pim` |
| Brewery recipe authoring, BeerJSON, water chemistry, yeast math | `brewery` |
| Customer/account demand management | `crm` |

---

## 4. Data model sketch

Illustrative only; exact Prisma names and fields land with implementation.

```prisma
model MrpProductionOrder {
  id              String   @id @default(uuid())
  workspaceId     String   @map("workspace_id")
  orderNumber     String   @map("order_number")
  status          String
  sourceModule    String?  @map("source_module")
  sourceRefId     String?  @map("source_ref_id")
  outputProductId String?  @map("output_product_id")
  outputVariantId String?  @map("output_variant_id")
  quantity        Decimal
  unit            String
  plannedStartAt  DateTime? @map("planned_start_at")
  dueAt           DateTime? @map("due_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  lines           MrpProductionOrderLine[]
  requirements    MrpMaterialRequirement[]
  operations      MrpOperation[]
  @@unique([workspaceId, orderNumber])
  @@index([workspaceId, status])
  @@map("production_orders")
  @@schema("mrp")
}

model MrpBom {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  code        String
  name        String
  ownerModule String?  @map("owner_module")
  sourceRefId String?  @map("source_ref_id")
  lines       MrpBomLine[]
  @@unique([workspaceId, code])
  @@map("boms")
  @@schema("mrp")
}
```

The model intentionally uses cross-module references by ID/string rather than direct imports from sibling module internals. Service-layer validation decides whether a referenced PIM product, brewery recipe, or CRP schedule exists.

---

## 5. Contracts package

Wave 1 package: [`packages/mrp-contracts/`](../../packages/mrp-contracts/) published in-repo as `@umbraculum/mrp-contracts`.

Expected exports:

- `CONTRACT_VERSION` and version-skew helpers.
- `ProductionOrderSchema`, `ProductionOrderStatusSchema`, `ProductionOrderRefSchema`.
- `ProductionOrderLineSchema`.
- `BomSchema`, `BomLineSchema`, `BomRefSchema`.
- `OperationTemplateSchema` / `OperationSchema`.
- `MaterialRequirementSchema`.
- Response envelopes for list/get/summary routes.
- AI tool input/output schemas.
- Document-template input schemas for work orders and material-requirement exports.

Internal Umbraculum code uses Zod v4 schemas per [`RFC-0003`](../rfcs/0003-validation-library-adoption.md). Runtime payloads must be parsed at package, HTTP, AI-tool, and rendering-template boundaries.

---

## 6. API surface

Wave 1 read-only API routes:

| Route | Method | Purpose |
|---|---|---|
| `/mrp/production-orders` | GET | List production orders for the active workspace. |
| `/mrp/production-orders/:orderId` | GET | Get production-order detail, including lines and operation refs. |
| `/mrp/production-orders/:orderId/material-requirements` | GET | Expanded material requirements for one order. |
| `/mrp/boms` | GET | List BOM definitions visible to the active workspace. |
| `/mrp/boms/:bomId` | GET | Get one BOM. |
| `/mrp/work-orders/:orderId/preview` | GET | **Wave 6 shipped:** preview the work-order payload before rendering. |
| `/mrp/work-orders/:orderId/render-jobs` | POST | **Wave 6 shipped:** submit work-order or route-card PDF render jobs through `@umbraculum/rendering`. |
| `/mrp/production-orders/:orderId/material-requirements/render-jobs` | POST | **Wave 6 shipped:** material-requirements XLSX export. |
| `/mrp/production-orders/render-jobs` | POST | **Wave 6 shipped:** production-order list CSV export. |

Write routes are not part of the first alpha proof unless the implementation plan explicitly includes human-approved create/update flows and route-level L2 isolation tests.

Every route must:

- require an active session and active workspace,
- scope all reads by `workspaceId`,
- use Zod request/response schemas,
- return contract-validated DTOs,
- avoid raw SQL exposure to AI tools,
- avoid deep imports from sibling modules.

---

## 7. Web and native slices

Planned web route group: `apps/web/app/[locale]/(mrp)/`.

Planned URL segments, subject to `registerWebModule({ ownedUrlSegments })`:

| Segment | Purpose |
|---|---|
| `production-orders` | Production-order list and detail. |
| `work-orders` | Work-order previews and render-job status. |
| `material-requirements` | Requirements summary and shortage assumptions. |

The route group must follow the two beta disciplines from RFC-0002:

- no `apps/web/app/[locale]/(mrp)/page.tsx`,
- no group-root dynamic segment such as `apps/web/app/[locale]/(mrp)/[id]/page.tsx`.

Native slice: `apps/native/src/modules/mrp/`. For alpha, native may be limited to shared contracts/navigation readiness unless public-alpha user testing requires operator-facing work-order views.

---

## 8. Brewery alpha projection

Brewery proves MRP without becoming MRP.

| Brewery source | MRP projection |
|---|---|
| `Recipe` / BeerJSON | BOM and operation-template input. |
| `BrewSession` | Production-order source and work-order proof. |
| `BrewdaySettings` | Operation defaults and planned durations. |
| `InventoryItem` | Material availability assumption only; WMS remains future. |
| PIM product/variant refs | Finished-good or sellable-unit identity where present. |

Wave 2 shipped the first read-time adapter: recipes project as BOMs, brew sessions project as production orders, session steps project as operations, and recipe ingredients project as assumption-only material requirements. Projection IDs are deterministic (`brewery-recipe-<recipeId>`, `brewery-brew-session-<sessionId>`, `brewery-brew-session-step-<stepId>`), and persisted `mrp.*` rows are not created or required.

Wave 3 shipped the first web proof of that adapter: `/production-orders`, `/production-orders/<orderId>`, and `/material-requirements` render the existing HTTP read APIs with contract-schema validation and explicit provenance labels such as "Projected from brewery." Wave 4 hardens that proof with deterministic E2E fixture coverage for brewery production orders, material requirements, CRP resource/capacity/schedule handoff, and read-only conflicts. Wave 5 exposes the same evidence to the AI consultant through module-owned read-only tools. The UI and AI layer are read-only and do not parse projection IDs to infer source ownership.

The alpha implementation should continue to prefer adapters/projections over irreversible data migration. Existing brewery routes remain stable until a later implementation plan explicitly moves behavior.

---

## 9. CRP handoff

MRP hands CRP scheduleable operations:

- production order ID,
- operation ID/code,
- required resource class if known,
- planned duration,
- earliest start / due date,
- quantity/batch size,
- source module and source reference.

MRP does not decide final resource allocation. CRP owns calendars, capacity buckets, scheduled operations, and conflicts.

---

## 10. AI tools

First AI tools, read-only subset shipped in Wave 5:

| Tool | Scope | Purpose |
|---|---|---|
| `mrp.listProductionOrders` | read | Summarize planned/released/in-progress orders. |
| `mrp.getProductionOrder` | read | Fetch one order with lines, status, and source refs. |
| `mrp.explainMaterialRequirements` | read | Explain expanded requirements and availability assumptions. |
| `mrp.summarizeWorkOrder` | future read | Produce a concise operator-facing summary. |
| `mrp.proposeOrderAdjustment` | future propose-write | Suggest changes to timing, quantity, or split strategy; human approval required. |

The shipped Wave 5 tools are `scope: "read"` and return the existing route response envelopes. The future `propose-write` tool must not mutate state directly; it returns structured proposals that UI/API workflows can present for confirmation.

---

## 11. Rendering templates

Planned module-owned templates registered via `registerModule({ documentTemplates })`:

| Template ref | Kind | Purpose |
|---|---|---|
| `mrp:work-order-pdf@v1` | `pdf` | Operator-facing work order. |
| `mrp:route-card-pdf@v1` | `pdf` | Step/operation route card. |
| `mrp:material-requirements-xlsx@v1` | `xlsx` | Material requirement export for planning/review. |
| `mrp:production-order-csv@v1` | `csv` | Lightweight list export for alpha/debug. |

MRP must not bundle its own PDF/XLSX/CSV libraries. Rendering is a horizontal platform concern per RFC-0007.

---

## 12. Tier limits and add-ons

Illustrative future tier-limit slice:

| Field | Meaning |
|---|---|
| `mrpEnabled` | Whether the module surface is enabled for the workspace. |
| `mrpAiToolsEnabled` | Whether MRP tools are visible to the AI orchestrator. |
| `maxOpenProductionOrders` | Planning-volume guardrail by tier. |
| `maxBomDefinitions` | BOM definition guardrail by tier. |

Potential addon code: `mrp_module`.

The exact values belong to the future implementation plan; this surface doc only records that limits attach through the module SDK rather than a brewery-private tier-limit path.

---

## 13. Phasing

| Phase | Output |
|---|---|
| A | Contracts package with schemas, tests, version helpers. |
| B | API skeleton and read-only routes registered via `registerModule()`. |
| C | Brewery projection from recipe/session to production-order proof. |
| D | **Wave 4 shipped:** deterministic read-only web proof over the Wave 2 projections. Proposal pages remain future work. |
| E | **Wave 6 shipped:** rendering templates and work-order render-job routes. |
| F | **Wave 5 shipped:** read-only AI tools and integration proof. Propose tools remain future work. |
| Mature | Write workflows, WMS integration, richer scheduling with CRP, native operator flows. |

---

## 14. Alpha acceptance proof

The alpha proof is complete when a user can:

1. Start from one brewery recipe/session.
2. See a planned MRP production order.
3. See expanded material requirements.
4. See scheduleable operations handed to CRP.
5. Generate a work-order artifact through the rendering pipeline.
6. Ask the AI consultant to explain the order and requirements using MRP tools.

The proof must make clear that this is an extensible canonical module surface, not a finished commercial MRP product.

Wave 4 satisfies the deterministic read-only web visibility portions of this proof (items 1-4). Wave 5 satisfies the read-only AI explanation portion of item 6 for production orders and material requirements. Wave 6 satisfies item 5 for MRP work-order artifacts via the rendering pipeline. **Alpha demo walkthrough ready (2026-05-26):** browser export buttons on production-order pages, runbook [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) (includes **quick gates before Playwright** — stack health, seed, stale `.auth`), CI coverage for all MRP render-job routes, Playwright export smoke — human gap-log sign-off still pending. Propose/write workflows, native, and WMS portions remain open.

---

## 15. Cross-references

- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md) - joint plan.
- [`mrp-crp-wave-3-read-only-alpha-experience-build-log.md`](mrp-crp-wave-3-read-only-alpha-experience-build-log.md) - Wave 3 web read-only implementation record.
- [`mrp-crp-wave-4-alpha-proof-hardening-build-log.md`](mrp-crp-wave-4-alpha-proof-hardening-build-log.md) - Wave 4 deterministic proof record.
- [`mrp-crp-wave-5-ai-planning-advisor-build-log.md`](mrp-crp-wave-5-ai-planning-advisor-build-log.md) - Wave 5 read-only AI planning advisor record.
- [`mrp-crp-wave-6-rendering-templates-build-log.md`](mrp-crp-wave-6-rendering-templates-build-log.md) - Wave 6 rendering templates and render-job routes.
- [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) - public-alpha demo operator runbook.
- [`mrp-crp-alpha-demo-closure-build-log.md`](mrp-crp-alpha-demo-closure-build-log.md) - alpha demo closure (web exports + CI).
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md) - paired capacity-planning surface.
- [`modules/canonical/mrp.md`](../modules/canonical/mrp.md) - open-door module page.
- [`modules/verticals/brewery/README.md`](../modules/verticals/brewery/README.md) - reference vertical.
- [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) - product master boundary.
- [`canonical-automation-module-surface.md`](canonical-automation-module-surface.md) - automation boundary.
- [`RFC-0001`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) - module governance.
- [`RFC-0002`](../rfcs/0002-canonical-module-physical-layout.md) - physical layout.
- [`RFC-0007`](../rfcs/0007-canonical-document-rendering.md) - rendering pipeline.
