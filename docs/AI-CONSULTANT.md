# Umbraculum AI consultant

**Tier:** Public
**Status:** v0.1 — first iteration 2026-05-19 (living document)
**Audience:** platform evaluators, hosted-service operators, module developers, end-users — anyone deciding whether Umbraculum is the AI-native platform they think it is.

> [!NOTE]
> This document is the **feature-level explainer** for the AI consultant as it ships today. It is deliberately product-oriented and short on architectural depth — for the architecture itself, the canonical source is [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0 (cornerstone principle), §4.3 (sub-system), §6 (tools + tool registry), and §7 (monetization). The two docs are complementary: this one tells you *what the consultant does*, that one tells you *why the platform is shaped around it*.

---

## 1. What this is

Umbraculum ships a **workspace-scope AI consultant** as a first-class operational surface, alongside the data-entry, reporting, and integration surfaces every operational platform has. In the running app it is the `/ai` route: a chat panel where a workspace operator can ask the AI questions grounded in their own workspace data — recipes, brew sessions, vessel telemetry, equipment profiles, inventory on hand — and the AI answers using a closed set of read-scope tools registered by the installed canonical modules.

It is not a chatbot grafted onto an ERP. It is **the architectural cornerstone the platform is organized around** ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0). The rest of this document explains what that means concretely.

---

## 2. Cornerstone principle (abbreviated)

The single most important framing for the consultant — quoted verbatim from [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0:

> *"Structural decisions in this document that look like independent architectural choices (monorepo, one shell, consumption contract, canonical discipline, peer-module decomposition, vertical-configuration tier) are all consequences of one principle — the AI consultant must see the workspace as one coherent thing."*

The worked illustration (also from §4.0) is the fastest way to see why this matters in practice:

> *"When a brewery operator's AI is asked 'do I have stock for tomorrow's brew?', the answer crosses **brewery** (recipe BoM derived from BeerJSON), **wms** (stock-on-hand for the BoM ingredients), **mrp** (planned consumption for in-flight production orders), **crm** (committed customer orders that affect inventory commitments), and possibly **automation** (current tank states — is the fermenter free?). A federated/microservice architecture where each module owned its own context would lose this story; cross-module questions would have to be re-asked per-module-AI and stitched together by the operator. Workspace-scope context with one orchestrator + one tool registry + one prompt-composition pipeline is what makes the answer competent."*

This is what distinguishes the consultant from a per-module bolt-on. It is also why the canonical-module discipline ([`MODULES.md`](MODULES.md) §2, [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md)) is a structural requirement and not an optional purity: two competing implementations of the same canonical domain would collapse the orchestrator's mental model.

---

## 3. What it can do today

The consultant has access to a closed set of tools registered by the installed canonical modules, the brewery vertical configuration, and horizontal platform services. The model decides when to call which tool based on the user's question. Today's registered domain tools are `scope: "read"`; the rendering tool is a controlled `scope: "write"` job-submission tool:

| Tool | What it returns | Owning module |
|---|---|---|
| `brewery.recipeLookup` | Up to 5 recipes matching a name fragment or id, with style, OG, FG, ABV, SRM, IBU | brewery (vertical) |
| `brewery.recipeWaterState` | Water profile, salt additions, predicted mash pH for a recipe | brewery (vertical) |
| `brewery.currentBrewSessionStatus` | Most-recent brew session in the workspace + its current step | brewery (vertical) |
| `brewery.ingredientOnHand` | On-hand inventory by category (fermentable, hop, speciality, acid/salt, detergent/sanitizer, kegging) + optional name fragment | brewery (vertical) |
| `brewery.equipmentProfileGet` | Equipment profiles (mash tun, kettle, fermenters) by id or name fragment | brewery (vertical) |
| `automation.listVessels` | Every vessel in the workspace with current temp, mode, alarm state | `automation` (canonical) |
| `automation.vesselState` | Current state of one vessel by its workspace-unique code | `automation` (canonical) |
| `pim.searchProducts` | Products matching a SKU or name fragment | `pim` (canonical) |
| `pim.getProductDetail` | Full product detail for one product id | `pim` (canonical) |
| `pim.listCategories` | Flat category list for the active workspace | `pim` (canonical) |
| `pim.listAttributeSets` | Attribute-set definitions available in the active workspace | `pim` (canonical) |
| `mrp.listProductionOrders` | Production orders visible in the active workspace, including read-time brewery projections | `mrp` (canonical) |
| `mrp.getProductionOrder` | One production order with operations and material requirements | `mrp` (canonical) |
| `mrp.explainMaterialRequirements` | Material requirements and availability assumptions for one production order | `mrp` (canonical) |
| `crp.listResources` | Capacity resources, including automation vessels projected as resources | `crp` (canonical) |
| `crp.listWorkCenters` | Work centers, including brewery equipment-profile projections | `crp` (canonical) |
| `crp.listScheduledOperations` | Read-time scheduled operations from existing planning sources | `crp` (canonical) |
| `crp.explainCapacityLoad` | Planned, available, and overload minutes per capacity bucket | `crp` (canonical) |
| `crp.listConflicts` | Read-only capacity warnings/conflicts | `crp` (canonical) |
| `render_document` | Submit a registered document template to the canonical rendering pipeline | platform rendering service |

Domain tools enforce workspace membership at the service layer ([`requireActiveWorkspace`](../services/api/src/plugins/requestContext.ts)) — the AI cannot read data outside the operator's active workspace, even if it tries to construct a tool call that would cross workspaces. `render_document` submits a rendering job for the active workspace using registered templates; it is a platform-controlled output operation, not a domain-record mutation. Tool calls and results are visible in the chat surface for transparency.

**Registered document template refs** — full registry (brewery, pim, mrp, crp): [`docs/design/canonical-document-rendering-surface.md`](design/canonical-document-rendering-surface.md) §2. MRP/CRP subset below is via `render_document` only (no per-module export tools):

| Template ref | Kind | Module |
|---|---|---|
| `mrp:work-order-pdf@v1` | pdf | mrp |
| `mrp:route-card-pdf@v1` | pdf | mrp |
| `mrp:material-requirements-xlsx@v1` | xlsx | mrp |
| `mrp:production-order-csv@v1` | csv | mrp |
| `crp:capacity-load-xlsx@v1` | xlsx | crp |
| `crp:schedule-pdf@v1` | pdf | crp |
| `crp:resource-calendar-csv@v1` | csv | crp |
| `crp:conflict-report-pdf@v1` | pdf | crp |

Operators may also use module-owned HTTP render-job routes (for example `POST /mrp/work-orders/:orderId/render-jobs`) that build template `data` server-side; the consultant uses `render_document` with a pre-built payload or should prefer those routes when orchestrating exports for humans.

The shape of these tools is documented in the typed `AiTool` / `AiToolRegistry` contract in [`@umbraculum/ai-tool-sdk`](../packages/ai-tool-sdk/README.md); the orchestrator that runs them lives at [`services/api/src/services/ai/orchestrator.ts`](../services/api/src/services/ai/orchestrator.ts).

---

## 4. What it cannot do (yet)

The consultant is deliberately bounded today. None of the following are shipped, and several are explicitly deferred:

- **No autonomous domain writes.** The consultant cannot mutate recipes, products, vessels, inventory, billing, or workspace records. Write proposals follow the human-in-the-loop pattern ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6.5): the AI drafts a proposed change, the operator confirms or rejects, only then does the platform write. The v0 `render_document` tool is the narrow exception: it can submit a rendering job for an already-registered template, producing an output artifact rather than changing domain state.
- **No PLC commands.** The brewery's OpenPLC bridge (per [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) §9 Phase E) does not expose write tools to the consultant until H1 2027+. Read tools (`automation.vesselState`, `automation.listVessels`) ship now; setpoint changes do not.
- **No billing or admin actions.** Subscription changes, key vault rotation, workspace membership edits — all human-only.
- **No cross-workspace queries.** Every tool is scoped to the active workspace; the AI cannot ask "across all my workspaces, where is the slowest fermentation?" — this is a tenancy guarantee, not a UX bug.
- **No planning mutations.** `mrp` and `crp` expose read-only advisor tools and registered rendering templates (Wave 6), but the consultant cannot create production orders, reschedule operations, optimize capacity, or materialize projection rows. Export artifacts use `render_document` or human-triggered module render-job routes; they do not mutate domain state. `wms` and `crm` remain reserved canonical codes with no AI tool surface today.

These bounds are not a hedge — they are the shape of v0. The architecture intentionally trades autonomy for coherence + auditability while the apparatus matures.

---

## 5. How modules contribute tools

Tools are **owned by their respective modules**, not by the AI consultant itself. The implemented contract is [`registerModule({ registerAiTools })`](../packages/module-sdk/README.md): a canonical module or vertical configuration declares its AI-tool registrar alongside its routes, Prisma schema, document templates, tier limits, and add-on codes. The platform's single tool registry invokes those module registrars at API boot.

So in v0:

- Tool implementations co-locate under [`services/api/src/services/ai/tools/<module>/`](../services/api/src/services/ai/tools/) (today: `brewery/`, `automation/`, `pim/`, `mrp/`, `crp/`).
- Each shipped domain module declares `registerAiTools` in [`services/api/src/modules/<code>/index.ts`](../services/api/src/modules/).
- The api's [`app.ts`](../services/api/src/app.ts) creates the in-memory registry, invokes module-owned registrars through `@umbraculum/module-sdk`, then registers horizontal platform tools such as `render_document`.
- The contract for tools is public and typed (`AiTool`, `AiToolRegistry`, `AiToolScope` in [`@umbraculum/ai-tool-sdk`](../packages/ai-tool-sdk/README.md)).

What remains target-state is the richer composition around tools: module prompt overlays, per-route overlays, knowledge-source registration, semantic reporting, full RAG, and future WMS/CRM tool bundles. The module-owned tool path itself is now in place, and Wave 5 proves that canonical planning modules can join the same workspace-scope registry without replacing vertical source ownership.

---

## 6. BYOK + tier model

The consultant ships with a deliberately conservative monetization shape ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7.1):

- **BYOK (Bring Your Own Key).** The workspace admin enters their own Anthropic API key. Anthropic bills the workspace directly for token usage; Umbraculum does not resell tokens in v0.
- **Encrypted at rest.** Keys are stored AES-256-GCM-encrypted per workspace ([`services/api/src/services/ai/keyVault.ts`](../services/api/src/services/ai/keyVault.ts)); the master key lives in `APP_AI_KEY_SECRET` (environment, not database). DB dumps without the master key are useless.
- **Paid-tier unlock.** The consultant is gated by `WorkspaceBilling.tier`: `premium`, `pro`, and `pro_plus` workspaces have access; `free` workspaces hit `402 ai_subscription_required` and can upgrade through the existing Stripe Checkout intent flow.
- **No new Stripe surface.** AI unlock reuses the existing tier mechanism — no separate AI subscription, no per-message billing, no resold credits.

> *"The customer pays their provider for raw model calls and pays Umbraculum for the operational layer that makes those calls useful: ACL-aware tools, prompt composition, per-workspace memory, limits, auditability, cross-platform UI, and support."* — [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7.1

A future **managed-AI mode** (Umbraculum-managed provider key + credit balance) is sketched in [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7.3 but is **not shipped** and is gated on BYOK demand validating first. The same orchestrator and ledger would back both modes.

The current tier numerics and pricing analysis live in [`TIER-PRICING-ANALYSIS.md`](TIER-PRICING-ANALYSIS.md); the AI tier-unlock implementation is the row in `WorkspaceBilling` + the corresponding `402` gate in [`services/api/src/routes/ai.ts`](../services/api/src/routes/ai.ts).

---

## 7. Per-workspace operational memory

Alongside the tool layer, the consultant maintains a **per-workspace operational memory** ([`services/api/src/services/ai/memoryService.ts`](../services/api/src/services/ai/memoryService.ts)) — durable notes the AI accumulates about a workspace's seasonal patterns, supplier quirks, recurring failure modes, and operator preferences. The memory is composed into every prompt for that workspace ([`promptComposer.ts`](../services/api/src/services/ai/promptComposer.ts)), giving the AI context that a stateless chatbot cannot.

This is the v0 of what [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6.5 ("Safety") and §4.3 ("Sub-system") frame as the **moat** — recall that compounds over time, is workspace-scoped (not cross-tenant), and is not transferable to a competitor's AI feature even if they ship identical tools. Full RAG over product docs + activity timelines + pgvector is later work (v1.5 per [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6.1); the v0 memory is the first half of that arc and is the part that begins compounding from a workspace's first paid month.

Memory is workspace-scoped by construction: a workspace's notes never enter another workspace's prompts, and the memory store is part of the workspace tenancy boundary the platform's `requireActiveWorkspace` plugin enforces on every request.

---

## 8. References

- **Architecture (canonical sources)**
  - [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0 — AI-consultant context principle (cornerstone)
  - [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.3 — AI platform sub-system
  - [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6 — Tools, prompt composition, memory, worked example
  - [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7 — BYOK + paid tier unlock, future managed-AI overlay
- **Trajectory**
  - [`ROADMAP.md`](ROADMAP.md) — "H2 2026 — AI consultant hardening and module-pluggable expansion" + Standing principles
- **Project values + the *other* AI story**
  - [`MANIFESTO.md`](../MANIFESTO.md) §1.2 — *AI-orchestrated code as discipline*. This is about how the project *itself* is built, not about the consultant as a product feature. The two AI stories are related but distinct; the manifesto explicitly cross-links here.
- **Ecosystem context**
  - [`MODULES.md`](MODULES.md) §2 — Vocabulary (`package`, `canonical module`, `vertical configuration`, `reserved canonical code`, `module SDK`)
  - [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 — Reserved canonical codes (the closed set the AI reasons across)
- **Operator-facing**
  - [`help/asking-umbraculum.md`](help/asking-umbraculum.md) — "What can I ask, what can the AI see, how do I get the best answers"

---

*This document will grow as additional canonical modules ship and contribute tools. Wave 5 adds read-only MRP/CRP planning advisor tools; future WMS/CRM tools and richer reporting/RAG will expand the cross-module reasoning surface further. The cornerstone framing in §2 does not change.*
