# RFC-0001 — Modules, tiers, governance, and automation placement

**Tier:** Public
**Status:** Accepted 2026-05-18 (core team approval recorded; this is a living RFC — see §13 Resolution for the change procedure)
**Audience:** prospective contributors, self-hosters, third-party module developers, hosted-service customers, and anyone evaluating Umbraculum's governance shape as a long-term operational dependency.
**Document role:** canonical module-governance commitment for Umbraculum's reserved-code and tier model.

> **Disclaimer.** This RFC sets architectural and governance commitments for Umbraculum's module ecosystem. It is a public-readable artifact intended to outlive any single maintainer; the commitments here are durable but not unchangeable — the change procedure is the same one used for license changes ([`docs/LICENSING.md`](../LICENSING.md) §10).

---

## 1. Summary

This RFC commits to six decisions and defers one cluster of design work:

- **Decision A — Canonical-module rule.** One canonical module per reserved domain code; extensions register INTO canonical modules; permissionlessness lives below the canonical layer. Structural enforcement via the `code` field in `registerModule()`.
- **Decision B — Reserved canonical codes.** The authoritative initial set is five peer codes — `mrp`, `wms`, `crm`, `crp`, `automation` — decomposed SAP-style as flat peers, not nested under a single "manufacturing" umbrella. `brewery` is explicitly NOT in this set; it is a tier-6 vertical configuration. *(Extended 2026-05-19 by [RFC-0004](0004-canonical-pim.md) to add `pim` as a sixth peer code; see §4 amendment footer.)*
- **Decision C — Module tier model.** Six tiers (core canonical / bundled SDK / community / third-party / private / vertical configuration) with rights and obligations per tier. Brewery is the canonical tier-6 example.
- **Decision D — Governance.** Only canonical-code allocation is gated; tiers 3–6 are permissionless. Promotion to canonical via mini-RFC + core team approval; the mini-RFC checklist must include the consumption-contract confirmation from Decision F.
- **Decision E — Automation placement.** Automation is promoted to canonical module status. The canonical-module *surface* (data model, adapter contract, AI tools, tier limits) and the brewery-OpenPLC translation are specified in the accepted design [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) (Accepted 2026-05-19). The H2 2026 implementation phasing in that doc preserves the horizon from [`docs/ROADMAP.md`](../ROADMAP.md) as a working assumption.
- **Decision F — Horizontal-platform-services consumption contract.** Modules consume the platform's auth / tenancy / ACL / billing / AI / observability / i18n / UI / secrets / integrations / HTTP / DB. Modules MUST NOT ship parallel implementations. Modules MAY extend platform services through SDK-declared extension points. Enforced by SDK shape, lint rules (post-RFC follow-on), the canonical-code mini-RFC checklist, and documentation discipline.

Decision E surface design landed in [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) (Accepted 2026-05-19). §7.2 below retains the historical deferral record; the accepted recommendations live in that design doc.

---

## 2. Motivation

We are about to begin work on a second canonical module. Before that work starts, we need governance and module discipline pinned in writing — because the decisions in this RFC are the hardest to retrofit later, and getting them wrong would be more expensive than every other decision the project might make in 2026.

Two failure modes motivate this RFC, both visible in adjacent ecosystems:

**Domain duplication — the Magento / Mage-OS warning.** When a permissionless module ecosystem allows two modules to claim the same domain (two CRMs, two billing extensions, two checkout flows), the ecosystem fragments. Adobe inherited a permissive Magento extension model where vendors shipped competing implementations of overlapping concerns; the resulting fragmentation made the platform expensive to operate, hostile to learn, and structurally vulnerable to community fork (Mage-OS). The lesson is precise: *permissionless contribution is fine; permissionless canonical-domain allocation is not*. Without the canonical-module rule (Decision A) and reserved-code allocation (Decision B), Umbraculum would re-create the same failure shape.

**Cross-cutting fragmentation — the WordPress plugin-hell warning.** When a permissionless module ecosystem has no horizontal-platform-services consumption contract, modules silently reimplement the cross-cutting concerns the platform should own — auth, sessions, billing, ACL, i18n, observability — producing N parallel implementations that a hosting team cannot operate coherently. The "central premium-tier hosted ecosystem with N modules" scenario is the WordPress-hell scenario in operational form: a hosting team facing twenty different auth implementations across modules cannot offer a coherent product. Without the consumption contract (Decision F), Umbraculum's hosted offering would degenerate the same way as soon as the third or fourth module shipped.

These are the failure modes Decision A, Decision B, and Decision F structurally prevent. Decision C (tier model) and Decision D (governance) are the social mechanisms that keep the structural enforcement honest. Decision E (automation placement) is the most consequential immediate-term concrete: it commits us to designing automation as a peer canonical module rather than letting it accrete inside the brewery vertical or the integrations framework by inertia.

---

## 3. Decision A — Canonical-module rule (commit)

**One canonical module per reserved domain code.** Extensions register INTO canonical modules through named extension points; they do NOT register alongside as parallel competing modules.

Permissionlessness lives BELOW the canonical layer:

- Tier 1 (core canonical) is gated.
- Tiers 3–6 (community, third-party, private, vertical configuration; tier 2 is the bundled SDK, also maintained by the core team) are permissionless. Any indie developer, vertical-specific consultancy, customer in-house team, or open-source contributor can publish a module at tiers 3–6 without project approval.

**Structural enforcement.** The `registerModule({ code, ... })` shape sketched in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4 makes the `code` field the gate. A module attempting a reserved canonical code that is already taken is a boot error, surfaced explicitly. There is no "first writer wins" or "registration order" semantic; the canonical code is declared in this RFC (Decision B) and updated by mini-RFC (Decision D) — a runtime collision is a code error.

**Why the rule lives in the RFC, not in code alone.** The structural enforcement above prevents accidental collision; it does not prevent a community fork from introducing an overlapping canonical code in a parallel reserved-code list. The reserved-code list is governance, not code. We pin it in writing here, in a public RFC, so that anyone evaluating Umbraculum as a long-term dependency can read both the rule and the allocation procedure (Decision D) before they invest.

This is the hardest decision to retrofit later — once two community modules ship competing implementations of the same domain, the ecosystem has the Magento / Mage-OS shape, and the cost of unwinding it is higher than the cost of the entire platform's H2 2026 backbone. That is why this rule lands in the project's first RFC, before the second canonical module ships.

---

## 4. Decision B — Reserved canonical codes (commit)

The authoritative initial set of reserved canonical codes is **five peer codes** (extended to **six** on 2026-05-19 by [RFC-0004](0004-canonical-pim.md) — see §4 amendment footer):

- `mrp` — material requirements planning, production planning, work orders.
- `wms` — warehouse management, stock movements, locations, lots / serials.
- `crm` — customer relationships, contacts, accounts, opportunities, customer-facing orders.
- `crp` — capacity requirements planning, resource scheduling, work-center load.
- `automation` — workspace-scoped runtime control surface for physical equipment, telemetry, alarms, setpoints. (Surface design deferred per Decision E.)
- `pim` — master product information management: products, variants, attribute sets, categories, media assets, channel and locale overrides. Vertical-agnostic by design (Akeneo / Pimcore / Salsify class). *(Allocated by [RFC-0004](0004-canonical-pim.md) 2026-05-19 per Decision D mini-RFC procedure.)*

`brewery` is NOT in this set. Brewery is a tier-6 vertical configuration consuming the canonical-module surface plus brewery-specific seed data (BJCP styles, BeerJSON, hop bitterness math, water chemistry), brewery-specific prompts, and brewery-specific UI flows. Treating brewery as a canonical module would be the category mistake [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1.1 names: *"the same shape as building a CRM for a hotel and calling it Hotel instead of CRM."* The hotel is the vertical; the CRM is the canonical domain. The same applies here: brewery is the vertical; production planning, inventory, capacity, customer relationships, and automation are the canonical domains.

(Historical note: an earlier revision of the project's umbrella architecture discussion listed `brewery` as a peer canonical code; the inconsistency was caught and corrected before this RFC drafted. The architecture doc has been right all along — see [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1 — and this RFC ratifies that framing.)

### 4.1 Decomposition rationale (peer modules, not nested under "manufacturing")

We chose **flat peer decomposition** (sometimes called SAP-style) over hierarchical decomposition (a single `manufacturing` umbrella code with `mrp` / `wms` / `automation` nested inside). Drupal, SAP S/4HANA, Salesforce / Force.com, and Odoo all use peer-module decomposition; the reasoning is the same in each case:

- **Domain-level concerns don't naturally subordinate to a single umbrella.** Production planning, inventory, capacity, customer relationships, and automation are peer operational concerns. Forcing them under a "manufacturing" parent creates an arbitrary dependency on a higher-level construct that does not exist in practice.
- **Vertical configurations consume an arbitrary subset of canonical modules.** A brewery vertical needs `mrp` + `wms` + `automation` + (later) `crm`. A cosmetics vertical needs `mrp` + `wms` + (compliance — future). A distillery vertical needs `mrp` + `wms` + `automation` + (regulatory — future). Each vertical configuration picks its set; the canonical layer should not pre-commit a hierarchy that some verticals do not need.
- **The AI consultant reasons across canonical modules at workspace scope** ([`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0). A flat peer decomposition gives the orchestrator one mental model — *"what canonical modules are installed in this workspace"* — instead of having to reason over both a hierarchy and a flat installation set.
- **The canonical Drupal lesson — "one module per functionality, no parallel competing modules" — is structurally enforced by reserved-code allocation.** Hierarchy is not needed for the discipline.

### 4.2 Future allocations

Future canonical codes are added via mini-RFC + core team approval (Decision D). Plausible future codes (informational watch list — neither a commitment nor a roadmap, just a forward-looking framing):

- `quality` — QC inspections, NCR (non-conformance reports), CAPA (corrective/preventive actions), inspection plans. Cross-vertical primitives: brewery BJCP scoring, distillery TTB sampling, cosmetics stability testing, food-batch HACCP records all map cleanly. Strongest candidate of the watch list.
- `maintenance` — preventive / predictive maintenance, asset registry, maintenance work orders. Cross-vertical (any vertical with capital equipment); natural peer to `crp`.
- `procurement` — purchase orders, supplier management, RFQ. Supply-side companion to `crm`. Cross-vertical (every manufacturing vertical buys raw materials).
- `docs` (or `dms`) — controlled document management: SOPs, work instructions, GMP records, version-controlled procedures. Cross-vertical for regulated industries (cosmetics GMP, food HACCP, brewery FDA, distillery TTB).
- `hr` — workforce, payroll-adjacent. Cross-vertical but the boundary with external HR-SaaS integrations is sharper than for the others above — most operators integrate with Gusto/Rippling/etc. rather than replace them. The canonical scope, if allocated, is likely narrower than full-HRIS (e.g., shift scheduling + competency records).
- `finance` — general ledger, AR/AP. **Likely never canonical to Umbraculum.** We expect customers to integrate with their existing finance system (QuickBooks, Xero, NetSuite, SAP-FI) rather than replace it. Listed here only to record the explicit non-canonical posture.

We pin the initial set at five and treat further allocation as YAGNI: a code is added when there is concrete demand and a reference implementation underway, not on speculation. The mini-RFC is cheap; pre-allocation is a category of debt the project does not need to take on now.

### 4.3 Concerns that should NOT become canonical (framing clarifications)

The mini-RFC decision in Decision D is partly a *negative* discipline — recognizing that some plausible-sounding additions to the canonical set would actually be category mistakes. Three patterns to watch for:

- **`privacy` (and analytics / reporting / notifications) — horizontal, not canonical.** DSAR workflows, GDPR/CCPA enforcement, data-retention policies, audit-trail spanning, observability, notifications-as-a-service, and cross-module reporting all share a defining property: **every module participates uniformly in them**. That is the §8 / Decision F shape — the WordPress-hell shape Decision F exists to prevent. Treating any of these as canonical would invite parallel implementations across modules (a `crm` DSAR queue, an `mrp` DSAR queue, …) which is exactly the failure mode §2 names. They belong in the §8.2 obligation table as platform services that every module consumes, possibly with thin default-admin-UI shells; not as reserved canonical codes.
- **`legal` and `compliance` — likelier Tier 3/4 connectors or vertical-specific surfaces.** Contracts / NDAs / regulatory filings have a real domain shape, but most operators (a) use external legal SaaS (Ironclad, DocuSign, Notion-Legal) and want a *connector* not a replacement, and (b) regulatory filings (TTB-Beer, TTB-Spirits, FDA-Cosmetics, FDA-Food) are *vertical-specific* not cross-vertical. The right shapes are Tier 3/4 connectors (against external legal SaaS) plus vertical-specific surfaces (TTB filing on the distillery vertical, FDA filing on the cosmetics vertical). Bundling them under a `compliance` umbrella also runs into §4.1's anti-umbrella rationale: quality / privacy / traceability / regulatory are too-different concerns to share a code.
- **`traceability` — already in `wms` (lot/serial tracking) + `quality` (audit trail of inspections); does not need its own code.** Listed here so future contributors don't propose it as a standalone canonical without confronting the existing-coverage objection.

These clarifications are not changes to Decision A or Decision B. They refine §4.2's forward-looking framing so contributors evaluating new code proposals have a clearer map of what the canonical-set shape resists.

*§4.2 + §4.3 watch list and clarifications added 2026-05-19 (non-substantive amendment; no change to Decisions A–F; informational framing only).*

*§4 reserved-code set extended from five to six on 2026-05-19 by [RFC-0004](0004-canonical-pim.md) (Decision D mini-RFC allocating `pim`). Decision B's commitment ("the authoritative initial set is five peer codes") describes RFC-0001's initial allocation at acceptance time; subsequent allocations via the Decision D mini-RFC procedure are recorded here. Body text in this section reflects the current set; the historical record of the initial five is preserved by the "(extended to six on …)" parenthetical on each enumeration.*

---

## 5. Decision C — Module tier model (commit)

Six tiers, with rights and obligations declared explicitly. Tier 1 (core canonical) is gated; tiers 3–6 are permissionless; tier 2 (the bundled SDK) is maintained by the core team and licensed permissively so module developers can build against it.

| Tier | Name | Allocation | License | Example |
|---|---|---|---|---|
| 1 | Core canonical | Gated (mini-RFC + core team approval per Decision D) | AGPLv3 (per [`docs/LICENSING.md`](../LICENSING.md) §6) | `mrp`, `wms`, `crm`, `crp`, `automation`, `pim` |
| 2 | Bundled SDK / contracts | Maintained by core team | MIT (per [`docs/LICENSING.md`](../LICENSING.md) §6.2) | `@umbraculum/module-sdk`, `@umbraculum/ai-tool-sdk`, `@umbraculum/api-client`, `@umbraculum/i18n-keys` |
| 3 | Community module / extension | Permissionless | Author's choice (MIT-compatible recommended) | A community-built integration, an open-source vertical configuration |
| 4 | Third-party vendor module | Permissionless | Commercial / proprietary OK (modules build on the MIT SDK) | A commercial vertical-specific add-on; a vendor's pre-built BI dashboards |
| 5 | Private / workspace-owned | Permissionless | Customer's choice | An internal module a consultancy or customer in-house team builds for one workspace |
| 6 | Vertical configuration | Permissionless | Per-bundle (the brewery vertical-configuration we ship is AGPLv3 alongside the core; a community-built vertical configuration is the author's choice) | **`brewery`** (canonical example), distillery, kombucha, cosmetics, food-batch, fragrance |

**Pinned example: `brewery` is the canonical tier-6 vertical configuration.** This pin matters because the historical inconsistency — `brewery` listed alongside `mrp` and `wms` as if it were a peer canonical domain — was a real source of confusion that this RFC corrects. Pinning brewery as the tier-6 example here, with the canonical decomposition rationale in §4.1, prevents future contributors from re-introducing the confusion.

**What a tier-6 vertical configuration ships.** It consumes the canonical-module surface and adds: vertical-specific seed data (for brewery: BJCP styles, BeerJSON, default fermentables / hops / yeast catalogs, water-chemistry models, hop bitterness math); vertical-specific AI prompts and knowledge sources (brew-day templates, recipe-style guidelines); vertical-specific UI flows and routes (the brewery editor, the brewing-process visualizations); vertical-specific i18n strings under a vertical-prefixed namespace; possibly vertical-specific tier-limit slices (for brewery: `maxRecipesPerWorkspace`).

**What a tier-6 vertical configuration does NOT ship.** It does not own canonical-domain semantics. The brewery vertical does not implement its own production-planning logic — once `mrp` ships, the brewery vertical's brew-sessions-as-production-orders flow into the canonical `mrp` module's primitives. The brewery vertical does not implement its own inventory model — once `wms` ships, brewery's ingredient-and-fermenter inventory flows into `wms`. This is the migration trajectory documented in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2.

---

## 6. Decision D — Governance (commit)

**Only canonical-code allocation is gated.** Tiers 3–6 contribution is permissionless. Anyone — an indie developer, a consultancy, a customer in-house team, an open-source contributor — can publish a module at tier 3, tier 4, tier 5, or tier 6 without asking the project's permission. Quality is curated and spotlighted; it is not gatekept.

This is the WordPress / Magento lesson stated as a positive commitment: gating canonical-domain allocation is fine and necessary; gating contribution kills communities. Umbraculum's defensibility depends on a thriving ecosystem of third-party modules, not on a small core team trying to ship everything.

**Promotion to canonical (the only gated path).** A module that has matured at tier 3 or tier 4 — community adoption, stable surface, demonstrated cross-vertical applicability — can be promoted to canonical via:

1. **Mini-RFC** in `docs/rfcs/NNNN-canonical-<code>.md`, following the same template format as license-change RFCs ([`docs/LICENSING.md`](../LICENSING.md) §10): motivation, alternatives considered, impact across audiences, migration plan.
2. **Consumption-contract checklist** (per Decision F) — explicit confirmation the module uses the platform's auth, tenancy, ACL, billing, AI, observability, i18n, UI, secrets, integrations, HTTP, and DB conventions, and does not ship parallel implementations of any of them. A mini-RFC that does not include this checklist is incomplete.
3. **Public-comment period** post-public-alpha (target: July 2026 per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1) — minimum 30 days, hosted publicly. Pre-public-alpha, solo author drafts → core team reviews → core team approves; the mini-RFC is written as if it WILL be public-readable.
4. **Core team approval.** The core team's role is to verify Decisions A through F are honored, not to second-guess product fit (which is what the community signal at tier 3–4 already established).
5. **Forward-only allocation.** A canonical code, once allocated, is not unallocated except via a separate de-allocation mini-RFC (which we expect to be rare).

**Contributor mechanics.** Per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.2, all meaningful changes go through public PRs with public review; the project signs commits via Developer Certificate of Origin (DCO); we do not adopt a CLA that grants the project's legal entity unilateral re-licensing rights ([`docs/LICENSING.md`](../LICENSING.md) §9.4).

---

## 7. Decision E — Automation placement (commit canonical status; defer surface design)

**We commit `automation` to canonical module status.** The H2 2026 horizon from [`docs/ROADMAP.md`](../ROADMAP.md) is preserved as a working assumption for when the canonical module's surface lands, subject to refinement once the surface design is worked out in the follow-on sub-plan (see §7.2 below).

Automation is the most consequential placement decision in this RFC because the alternative — leaving automation inside the integrations framework, or accreting it inside the brewery vertical — was a real possibility we considered and rejected (see §10 Alternatives considered, Decision E).

### 7.1 Why canonical, not integration-framework or brewery-vertical-internal

Three reasons, in order of weight:

1. **The OpenPLC sister-repo design space is mature, not speculative.** The brewery vertical's existing automation surface — the OpenPLC + Modbus + pi-sidecar + safety-relevant alarm logic system — is documented as a frozen `2.0.1-dev` baseline across that repo's `README.md`, `DEVELOPMENT.md`, and detailed sub-specifications. Designing a canonical `automation` module is *documenting an existing system*, not inventing one. The follow-on sub-plan's job is to translate the existing system's primitives into the canonical-module + vertical-configuration framing this RFC pins; it is not to design a system from scratch.
2. **Treating automation as "another integration" is a category mistake.** The integrations framework (Tilt, Reveal, Generic device readings — see [`services/api/src/routes/integrationsGeneric.ts`](../../services/api/src/routes/integrationsGeneric.ts)) is a single-device read-mostly transport: a thermometer publishes a temperature, the platform stores it, the user looks at it. The OpenPLC system is a multi-vessel supervisory master with bidirectional setpoint / program / alarm authority and safety-relevant control logic. Conflating them forces the wrong shape on either side: the integrations framework gets stretched out of recognizable scope, or `automation` is under-empowered as a sub-feature of the brewery vertical. Neither is acceptable.
3. **MRP-and-automation under the same umbrella is a key differentiating story.** No mainstream ERP ships a real automation / PLC layer (SAP, Oracle, NetSuite, Odoo, ERPNext stop at "production order"). If `mrp` lands at H1 2027 (per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2), `automation` should land at the same time or just before so they can be co-designed — vessel registry, brewing-program-as-production-order, capacity-load reasoning crossing `mrp` ↔ `automation` ↔ `wms` ↔ `crp`. Bolting them together at H2 2027 would lose this story.

### 7.2 What we deferred and why — open questions for the follow-on sub-plan

**Resolved (Accepted design 2026-05-19).** The four questions below were answered in [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md). Pre–Phase A implementation checkpoints (B1–B2) remain in that doc §12.

The umbrella discussion that produced this RFC's earlier drafts described `automation` with a long list of design specifics — vessel registry shape, adapter contract, AI tool names, tier-limit fields. Each of those is a design choice the follow-on sub-plan is supposed to actually work out; pre-committing them in this RFC would be the same mistake the umbrella-plan-stage discussion was making. So we defer them, and we name the open questions explicitly here so the follow-on sub-plan starts from a real list, not from "figure it out".

Four open questions deferred to the follow-on sub-plan (`Canonical automation module shape — design + brewery-OpenPLC translation`):

**1. Adapter contract ownership — primary structural question.** Does the canonical `automation` module own a *generic adapter SDK* that the brewery vertical (and any other vertical with PLC needs — distillery, cosmetics, food-batch) consumes? Or does each vertical ship its own adapter implementation against canonical-automation primitives? This is the same shape as the consumption contract in Decision F: "1 auth interface owned by the platform, modules consume" → "1 adapter SDK owned by the canonical `automation` module, verticals consume". The structural intuition is symmetric, but the analysis must engage on the merits — hardware adapters have different lifecycle, latency, and safety properties than software services, and the consumption-contract pattern may not translate cleanly. The follow-on sub-plan resolves this on first principles.

**2. Equipment-vs-Vessel relationship — noted with explicit doubt about whether this is architectural or semantic.** Today's brewery-vertical schema has `EquipmentProfile` (`services/api/prisma/schema.prisma` model `EquipmentProfile`) — a workspace-scoped, design-time, snapshot-copy-semantics record of brewing-process calculation parameters (kettle volume, mash efficiency, hop water absorption). The umbrella-stage discussion imagined a separate canonical-automation `Vessel` concept — a runtime-physical-instance with telemetry state (currentTempC, mode, alarm-active, last-seen-at). Are these two models in two module surfaces (brewery-vertical `EquipmentProfile` plus canonical-automation `Vessel`, related by FK or unrelated)? Or one model with two views (a single physical-equipment concept consumed by both modules; the question is more semantic than architectural — like a tire usable by both car and bike, where the question is what a tire IS, not which module owns it)? The follow-on sub-plan's task is to resolve which framing is correct on first principles. **Author's note (deliberately preserved here so the sub-plan inherits the doubt):** the architectural framing was the umbrella-plan-stage default; the semantic framing is a competing instinct; neither has been rigorously argued. The sub-plan should engage both.

**3. OpenPLC sister-repo translation — what stays where.** The existing brewery-vertical OpenPLC stack in the **OpenPLC sister repo** (bench-profile tanks/pump/level-sensors/alarms project) carries safety-relevant alarm logic that explicitly cannot be touched without re-validation (per that repo's `DEVELOPMENT.md` §3 "Alarm-layer stability"). What part of the brewery-vertical surface stays in the sister repo (under its existing safety-validated runtime), and what part ships in the new canonical `automation` module (workspace-scoped surface, AI tools, tier limits)? The seam between the two — at runtime, at deployment time, at upgrade time — is the central translation question.

**4. Pi-sidecar UI ownership and integrations-framework relationship — bundled as "what existing infrastructure stays where".** The pi-sidecar runs Jinja + FastAPI per the umbrella-plan §6 decision (kept; not litigated here); the canonical `automation` module's UI surface manifests in the workspace shell per the one-shell-federated-modules policy ([`docs/ROADMAP.md`](../ROADMAP.md) Standing principles). What's the relationship between the pi-sidecar's existing operator UI and the canonical-automation workspace-shell UI — separate surfaces, layered, federated, web-only? And the parallel question on the data side: the integrations framework's `Device` / `Reading` concepts (`services/api/src/routes/integrationsGeneric.ts`) overlap with the proposed canonical-automation telemetry surface. Are they the same concept used by two modules? Adjacent? Layered? The sub-plan resolves both questions together because they share the same "existing infrastructure stays where" shape.

### 7.3 What this RFC does NOT pre-decide about automation

To make the deferral above explicit, the items below are *out of scope* for this RFC and live in the follow-on sub-plan:

- The data model for the canonical `automation` module (whether it is `Vessel`, `Equipment`, `Resource`, or a different concept; whether it is one model or several; what its relationship to `EquipmentProfile` is).
- The adapter contract shape (generic SDK consumed by verticals, or per-vertical adapter implementations against canonical-automation primitives).
- The specific AI tools the canonical `automation` module will register into the platform AI orchestrator ([`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.3) — naming, signatures, ACL scope.
- The tier-limit fields the canonical `automation` module will contribute (whether the limit is on vessels, adapters, telemetry channels, or a different surface).
- The pi-sidecar runtime — that decision is closed: Jinja + FastAPI stays per umbrella-plan §6, NOT relitigated here.
- The horizon — H2 2026 is preserved as the working assumption; the follow-on sub-plan refines it once the surface design's depth is known.

What IS pinned by this RFC: `automation` is a canonical module (Decision E commit); the brewery-OpenPLC surface translates into a brewery-vertical configuration of that canonical module (per Decision C tier-6 framing); the consumption contract (Decision F) applies (the canonical `automation` module consumes platform auth, tenancy, ACL, billing, AI, observability, i18n, UI, secrets, HTTP, DB; modules built on the canonical `automation` module's adapter SDK — if that's the resolved shape — must consume rather than reimplement).

---

## 8. Decision F — Horizontal-platform-services consumption contract (commit)

Decision A (canonical-module rule) prevents two modules claiming the same domain. This decision addresses the orthogonal failure mode: **modules silently reimplementing cross-cutting concerns the platform already owns**, producing auth fragmentation, parallel session models, double billing flows, ad-hoc role systems, redundant i18n catalogs, and unobservable side-channels. WordPress's plugin ecosystem is the anti-pattern; Drupal, Salesforce / Force.com, AWS IAM, and iOS / Android are the positive precedents. The "central premium-tier hosted ecosystem with N modules" scenario in §2 is the WordPress-hell scenario in operational form.

### 8.1 The rule

Every cross-cutting concern below is **owned by the horizontal platform**. Modules MUST consume the platform's implementation. Modules MUST NOT ship a parallel implementation. Modules MAY extend platform services through SDK-declared extension points — typed hooks declared by the platform-owned service, not a free-for-all.

### 8.2 Per-service obligation table

| Concern | Platform service / convention | Module obligation | Extension point if module needs more |
|---|---|---|---|
| Identity / sessions | `User`, `Session`, login / signup / magic-link, native bearer tokens, webview bridge ([`services/api/src/routes/auth.ts`](../../services/api/src/routes/auth.ts)) | Use `requireActiveSession`-equivalent; never define a parallel session model | Module-declared user attributes (extends `User`, never replaces) |
| Tenancy | `Workspace`, `WorkspaceMember`, `requireActiveWorkspace` ([`services/api/src/routes/workspaces.ts`](../../services/api/src/routes/workspaces.ts)) | Scope all operations to the active workspace from request context; never maintain a parallel tenancy concept | Module-declared workspace settings under module-prefixed key |
| ACL / roles | `AclService.requireRole` ([`docs/TENANCY-AND-ACL.md`](../TENANCY-AND-ACL.md); shape exists; route wiring in progress) | Declare required roles via the SDK; never invent a parallel permission model | Module-declared roles registered in the SDK, not stored in module-private tables |
| Billing / entitlements | `WorkspaceBilling`, `BillingTier`, `BillingPurchaseIntent`, `WorkspaceBillingAddon` ([RFC-0009](0009-workspace-billing-addons-and-entitlements.md) — shape committed; implementation H1 2027) ([`services/api/src/routes/billing.ts`](../../services/api/src/routes/billing.ts)) | Declare `addonCodes` and `tierLimits` via the SDK; never integrate Stripe / RevenueCat directly from module code | `tierLimits(tier)` slice contribution per module |
| AI platform | Orchestrator, tool registry, usage ledger, encrypted BYOK storage, workspace memory, prompt composition ([`services/api/src/services/ai/`](../../services/api/src/services/ai/)) | Register tools via `registerAiTools`; register future `aiPrompts` / `knowledgeSources` via the SDK; never call provider APIs directly from module code | Module-contributed tools, prompts, knowledge sources |
| Observability | Structured logger, error handler, request context, audit trail | Use the platform logger; emit events via platform conventions; write to the audit ledger | Module-defined event types under module-prefixed namespace |
| i18n | `@umbraculum/i18n` + `useT` hook ([`packages/i18n/`](../../packages/i18n/), [`packages/i18n-react/`](../../packages/i18n-react/)) | Use platform i18n; module strings live under module-prefixed namespace per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4 | Module-namespaced translation files |
| UI primitives | Tamagui tokens, design system, accessibility primitives, route IDs ([`packages/ui/`](../../packages/ui/), [`packages/navigation/`](../../packages/navigation/)) | Use platform UI primitives; module screens consume the design system | Module-defined components built on top of `@umbraculum/ui` |
| Secrets / KMS | Encrypted key vault used by AI BYOK ([`services/api/src/services/ai/`](../../services/api/src/services/ai/)) | Use platform key vault for any module-level secrets (PLC credentials, API keys, integration tokens); never write secrets to env vars or disk module-locally | New secret kinds registered via the SDK |
| Integrations framework | Devices, attachments, readings (Tilt, Reveal, Generic) ([`services/api/src/routes/integrationsGeneric.ts`](../../services/api/src/routes/integrationsGeneric.ts)) | If a module needs a device contract, USE the integrations framework as transport; never invent a parallel device-ingestion path | New device kinds registered via the integrations SDK |
| HTTP boundary | Fastify plugins (error handler, request context, CORS, webhook raw body, session auth), platform `registerModule()` | Register routes via `registerModule()`; never `app.register(myCustomCors)` around the platform | Module routes; that's it |
| Database | Prisma + `multiSchema` ([`docs/DATA-ACCESS-BOUNDARIES.md`](../DATA-ACCESS-BOUNDARIES.md)); pgpool read-replica routing per [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](../POSTGRES-REPLICATION-ARCHITECTURE.md) | Use the platform Prisma client; respect read-replica routing; declare module schema via the SDK at H1 2027 | Module-owned Prisma models within module-owned schema |
| Document / file rendering | `@umbraculum/rendering` (per [RFC-0007](0007-canonical-document-rendering.md)) — Gotenberg sidecar for HTML→PDF + DOCX/ODT→PDF; exceljs for XLSX; `@fast-csv/format` for CSV; bwip-js for barcodes / QR; xmlbuilder2 for XML feeds; eta for HTML/email templates; MJML for email composition; async-via-BullMQ on existing Redis | Submit render jobs via `renderJob.submit({ kind, template, data, locale, delivery })`; module-owned templates registered via `registerDocumentTemplate(...)`; modules MUST NOT bundle parallel PDF / XLSX / DOCX / CSV / barcode / XML / template-engine libraries; modules MUST NOT run a parallel job queue for rendering work | `registerDocumentTemplate({ kind, ref, schema, render })` per template via the SDK; new `RenderKind` values via the lightweight allocation procedure in [RFC-0007](0007-canonical-document-rendering.md) §15.3 |
| Notifications / outbound delivery | Platform-owned outbound-delivery service (per [RFC-0008](0008-notifications-outbound-delivery.md)) — email first, later push / in-app / webhooks / SMS as needed; owns provider config, queues, recipient validation, preferences / unsubscribe, audit logs, delivery events, bounce/complaint handling, rate limits, abuse controls, and billing/cost controls | Register notification intents/templates/triggers via the SDK once the service exists; modules MUST NOT import provider SDKs, ship parallel SMTP/API clients, run module-private delivery queues, store module-private unsubscribe state, or bypass platform delivery audit logs | Module-contributed notification intents, typed payload schemas, template refs, recipient selectors, workflow triggers, default copy, and localization keys |

### 8.3 Enforcement layers (defense in depth)

1. **SDK shape.** The `registerModule()` signature exposes only legitimate slots. There is no `auth` slot, no `billing` slot, no `session` slot — modules cannot register a competing implementation because the platform's API does not accept it.
2. **Lint rules** — post-RFC follow-on, scoped to canonical-module folders. We will configure `eslint-plugin-boundaries` (or equivalent) with banned-import lists per module: e.g., the `stripe` SDK is bannable from any folder under `modules/<code>/` because billing goes through the platform. This work is out of scope for RFC-0001; it lands once canonical-module folders exist.
3. **Mini-RFC promotion checklist.** Per Decision D, the mini-RFC that allocates a canonical code includes a consumption-contract checklist — explicit confirmation the module uses platform auth, tenancy, ACL, billing, AI, observability, i18n, UI, secrets, integrations, HTTP, and DB. A mini-RFC missing the checklist is incomplete.
4. **Documentation discipline.** This rule is referenced from [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.1 and §4.2 (post-RFC follow-on cross-link to be added) so module developers see it before they start building, not after.

### 8.4 What this rule explicitly does NOT prohibit

- **Extending** platform services through SDK-declared extension points. A CRM module that needs sales-territory user attributes extends `User` via the `userAttributes` extension point; it does not create a parallel `crm_users` table.
- **Module-private domain state.** A module's own domain data (vessels, orders, contacts, recipes) lives in its own Prisma schema (post-`multiSchema`). The contract is about cross-cutting *concerns*, not about preventing modules from owning their domain data.
- **Reference implementations from outside.** A third-party module from an indie consultancy can ship; it must consume the platform contract just like core canonical modules. The contract is on the public-facing module surface, not on who authors the module.

*§8.2 obligation table extended on 2026-05-21 by [RFC-0007](0007-canonical-document-rendering.md) (Decision A) — added the **Document / file rendering** row. Decision F's commitment ("every cross-cutting concern below is owned by the horizontal platform; modules MUST consume the platform's implementation; modules MUST NOT ship a parallel implementation") applies to the row in the same shape as every prior row; the row's extension point (`registerDocumentTemplate`) lands in `@umbraculum/module-sdk` per the §8.3 enforcement-layer-#1 SDK-shape discipline. §8.2 was extended again on 2026-05-25 by [RFC-0008](0008-notifications-outbound-delivery.md) — added the **Notifications / outbound delivery** row to make the email-composition-vs-transport boundary explicit before public alpha. Body text in §8.2 reflects the current set; the historical record of the original twelve rows is preserved by this footer.*

---

## 9. Cross-references and non-goals

### 9.1 What this RFC builds on (and does NOT relitigate)

- **Native-app shape.** [`docs/ROADMAP.md`](../ROADMAP.md) Standing principles ("one audience per app", "AI consultant is the cross-module connective tissue") and [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0 (AI-consultant context principle). RFC commits canonical-code allocation; native-app allocation follows the existing one-shell-federated-modules policy.
- **Module SDK contract.** [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4 sketches the `registerModule()` shape; this RFC commits the surrounding governance, the SDK redesign is out of scope.
- **License posture.** [`docs/LICENSING.md`](../LICENSING.md) § (TL;DR + §6). Tier-1 canonical modules are AGPLv3; tier-2 SDK is MIT; tiers 3–6 follow the author's choice. No license changes proposed in this RFC; license-change RFCs follow [`docs/LICENSING.md`](../LICENSING.md) §10 separately.
- **AI consultant architecture.** [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §§4.0, 4.3, 6, 7. RFC commits that canonical modules register tools via `registerAiTools` and future `aiPrompts` / `knowledgeSources` into the single platform orchestrator; the orchestrator's design itself is out of scope.
- **Pi-sidecar runtime.** Umbrella-plan §6 (umbrella-plan is a private discussion artifact; the relevant content is summarized in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §3.5 and the OpenPLC sister-repo's `DEVELOPMENT.md`). The pi-sidecar stays Jinja + FastAPI; this RFC does not change that.
- **Public identity.** This RFC uses the Umbraculum wordmark and `umbraculum` namespace from inception.

### 9.2 What this RFC explicitly does NOT do (non-goals)

- **Module folder layout.** Committed in [RFC-0002 — Canonical-module physical layout](0002-canonical-module-physical-layout.md) (Accepted 2026-05-19): β three-tree distribution (`services/api/src/modules/<code>/`, `apps/web/app/[locale]/(<code>)/`, `apps/native/src/modules/<code>/`, `packages/<code>-contracts/`). RFC-0001 committed the conceptual model; RFC-0002 is the mechanical layout.
- **Lint enforcement of the consumption contract.** `eslint-plugin-boundaries` configuration, banned-import lists per module folder — out of scope. Lands once canonical-module folders exist.
- **AclService wiring.** Decision F claims `AclService.requireRole`; contributor-facing policy and as-built state are in [`docs/TENANCY-AND-ACL.md`](../TENANCY-AND-ACL.md). Route wiring remains separate work (see [`docs/TESTING.md`](../TESTING.md) Phase 4d).
- **License changes.** [`docs/LICENSING.md`](../LICENSING.md) §10 is its own RFC track; this RFC does not change license posture.
- **`@brewery/*` package scope migration.** A separate post-RFC follow-on (the rename sub-plan deliberately left `@brewery/*` alone — it is an actual scope, not a brand placeholder).
- **The canonical `automation` module's surface design and the brewery-OpenPLC translation.** Per Decision E §7.2, owned by a follow-on sub-plan. This RFC commits canonical status; the surface is the sub-plan's work.

---

## 10. Alternatives considered

For each commit decision, the rejected alternative(s) and why.

### 10.1 Decision A — alternative considered: WordPress-style permissionless canonical modules

A permissive ecosystem where any module can claim any domain code, and the platform "lets the market decide" between competing implementations.

**Rejected.** Permissionless canonical-domain allocation produces parallel competing implementations (multiple CRMs, multiple billing extensions, multiple checkout flows) and fragments the ecosystem. The Magento → Mage-OS history is the cost case. Permissionlessness is the right default below the canonical layer (tiers 3–6 are permissionless); it is the wrong default at the canonical layer.

### 10.2 Decision B — alternative considered: nest canonical modules under a single "manufacturing" umbrella

A hierarchical decomposition where `manufacturing` is a top-level reserved code containing `mrp` / `wms` / `automation` / `crp` as sub-modules, with `crm` as a separate top-level peer.

**Rejected.** Domain-level concerns do not naturally subordinate to a single umbrella. Production planning, inventory, capacity, and automation are peer operational concerns. Forcing them under a `manufacturing` parent creates an arbitrary dependency on a higher-level construct that does not exist in practice. Drupal, SAP S/4HANA, Salesforce / Force.com, and Odoo all use peer decomposition; the precedent is consistent. See §4.1.

### 10.3 Decision C — alternative considered: Magento-style three-tier (core / community / commercial)

A three-tier model: core canonical modules; community modules; commercial / enterprise modules. No vertical-configuration tier.

**Rejected.** The brewery-as-vertical-configuration distinction is the structural insight that resolves the umbrella's earlier inconsistency. Without tier 6, vertical configurations get mis-tiered — they are either pretending to be canonical modules (the original §1 inconsistency) or pretending to be community modules (which would put them at tier 3 alongside generic community extensions, losing the canonical-consumption framing). Six tiers is the minimum that captures the actual shape.

### 10.4 Decision D — alternative considered: gate community / third-party / private contribution

A model where any tier-3 or tier-4 module is reviewed and approved by the project before publication.

**Rejected.** The WordPress / Magento lessons are explicit: gating contribution kills communities. Quality is curated and spotlighted (a spotlight-on-the-best-modules program is plausible future work; not in this RFC); it is not gatekept. Tier 1 (canonical) gating is necessary and limited; everything else is permissionless.

### 10.5 Decision E — alternative considered: leave `automation` inside the integrations framework, elevate to canonical at H1 2027 alongside MRP

The "integrations-first now, canonical later" path. Less platform churn now; canonical work happens at H1 2027 alongside MRP.

**Rejected.** Three reasons (per §7.1, repeated for completeness in this Alternatives section because the rejection is consequential):

- The OpenPLC sister-repo design space is mature, not speculative — designing `automation` as canonical is documenting an existing system, not inventing one. Deferring the canonical placement is not deferring complexity; it is letting complexity accrete in the wrong place.
- Treating automation as "another integration" forces the wrong shape on either side: the integrations framework gets stretched out of scope, or `automation` becomes an under-empowered sub-feature of the brewery vertical.
- MRP-and-automation co-design is a key differentiating story for Umbraculum vs SAP / Oracle / NetSuite / Odoo / ERPNext. Bolting them together at H2 2027 loses the story.

### 10.6 Decision F — alternative considered: permissive consumption contract that allows modules to substitute platform services

A model where modules can ship parallel implementations of auth, billing, sessions, ACL, etc. — a strict opt-in to platform services rather than a mandatory consumption obligation.

**Rejected.** The central premium-tier hosted ecosystem cannot operate twenty parallel auth implementations across modules. Drupal, Salesforce / Force.com, AWS IAM, iOS / Android all enforce equivalent consumption obligations precisely because the WordPress permissive-substitution model produced an ecosystem the WordPress hosting layer cannot operate cleanly. The mandatory consumption contract is the structural answer to the "central hosted N-modules" failure mode.

---

## 11. Impact across audiences

Per [`docs/LICENSING.md`](../LICENSING.md) §10's standard impact section structure.

### 11.1 Contributors

Day-to-day contribution shape is unchanged. Tiers 3–6 remain permissionless. The added ceremony is the mini-RFC + consumption-contract checklist for canonical-code allocation (Decision D) — relevant only for contributors proposing a new canonical module, not for module developers extending existing canonical modules or shipping at tiers 3–6.

### 11.2 Self-hosters

No immediate impact. Future canonical modules ship as before. Self-hosters who integrate third-party modules at tiers 3–6 see the consumption contract (Decision F) as a guarantee: the modules they install are using the same auth, tenancy, billing, and observability surface as the core, so operational behavior is consistent across modules.

### 11.3 Module developers

The SDK surface (`registerModule()`, `registerAiTools`, future `aiPrompts`, `tierLimits`, `addonCodes`, `extensionPoints`) is the public contract. Modules build against the MIT-licensed SDK packages ([`docs/LICENSING.md`](../LICENSING.md) §6.2), so module developers can license their own module's source code however they want — including proprietary — without their choice being constrained by the AGPL core.

The consumption contract (Decision F) is the key obligation: a module developer cannot ship a parallel auth, billing, or AI-tool registry. They must consume platform services. This is not a friction point for most modules — it is the same obligation Drupal, Salesforce / Force.com, and AWS module ecosystems impose. Modules that need more than the platform exposes use SDK-declared extension points (per service in the §8.2 obligation table).

### 11.4 Hosted customers

No immediate impact. The canonical-module discipline produces a more coherent product over time as second-module work begins. Hosted customers see the consumption contract as a guarantee that adding new modules to their workspace does not create operational inconsistency (multiple session models, multiple billing flows, etc.).

### 11.5 Enterprises

The tier model (Decision C) plus license posture ([`docs/LICENSING.md`](../LICENSING.md) TL;DR) gives enterprise legal teams clear answers about which modules carry which obligations. Tier 1 (canonical) modules are AGPLv3; tier 2 (SDK) is MIT; tier 4 (third-party vendor) modules carry the vendor's chosen license. Enterprises that cannot adopt AGPLv3 use the commercial dual license ([`docs/LICENSING.md`](../LICENSING.md) §6.3) for the same code on alternative terms.

---

## 12. Migration plan

### 12.1 Today's flat brewery surface

The current implementation has brewery-vertical routes (`services/api/src/routes/{recipes,brewSessions,inventory,brewdaySettings,...}.ts`) and brewery-vertical web routes (`apps/web/app/[locale]/{recipes,inventory,...}`) registered flat in `services/api/src/app.ts`. There is no `registerModule()` helper yet (per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.3 — net-new before 2nd module ships).

This RFC's pinning of brewery as a tier-6 vertical configuration did not by itself require an immediate code move. It pinned the architectural framing the migration later followed as the public-alpha preparation window moved forward from the original H1 2027 assumption.

### 12.2 The H1 2027 restructure (per existing PLATFORM-ARCHITECTURE.md §5.2)

When the second canonical module ships:

- `registerModule()` helper exists (net-new per §5.3 — already on the list).
- Brewery web routes wrap in `(brewery)` Next.js route group — no URL change.
- Brewery-vertical Postgres tables stay in `public`; new module gets its own Postgres schema via Prisma `multiSchema`.
- `tierLimitsService` becomes module-aware: each module contributes a `tierLimits(tier)` slice.
- `app.ts` flat `register` calls become `registerModule(...)` calls.
- `@brewery/*` package scope migration (a separate post-RFC follow-on per §9.2 non-goals): horizontal packages move to `@umbraculum/*`; brewery-vertical packages re-scope to `@umbraculum/brewery-*`.

### 12.3 The canonical `automation` module migration — deferred to follow-on sub-plan

Per Decision E §7.2, the four open questions (adapter contract ownership; Equipment-vs-Vessel relationship; OpenPLC sister-repo translation; pi-sidecar / integrations-framework bundling) are owned by the follow-on sub-plan `Canonical automation module shape — design + brewery-OpenPLC translation`. The migration shape for `automation` specifically — what code moves, what stays in the OpenPLC sister-repo, when the canonical module's surface ships — is determined by that sub-plan. The H2 2026 horizon is the working assumption; the sub-plan refines.

### 12.4 The canonical `mrp` / `wms` / `crm` / `crp` module migrations

These are post-RFC follow-on scope. RFC-0001 commits that they will exist as peer canonical modules; the design of each module's surface is its own future RFC (or its own discussion artifact, as the team's process matures).

---

## 13. Resolution

**Status: Accepted 2026-05-18.**

Decisions A, B, C, D, E (canonical status), and F are committed. Decision E surface design and the brewery-OpenPLC translation are owned by the follow-on sub-plan `Canonical automation module shape — design + brewery-OpenPLC translation`, to be drafted post-RFC-acceptance.

The 30-day public-comment period in [`docs/LICENSING.md`](../LICENSING.md) §10 applies post-public-alpha (target: July 2026 per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1). Until then, solo author drafts → core team reviews → core team approves; this RFC was written as if it WILL be public-readable so the public alpha re-publishes without rewrite.

Post-public-flip, if the core team chooses to run a retroactive 30-day public-comment period for foundational RFCs (RFC-0001 included), the Resolution section may be amended at that time; the original Accepted date (2026-05-18) remains the canonical commitment date and the source-of-truth for any forward-only application of this RFC's decisions.

**Change procedure for this RFC.** Future amendments to RFC-0001 follow the same RFC process documented in [`docs/LICENSING.md`](../LICENSING.md) §10: a successor RFC at `docs/rfcs/NNNN-<title>.md`, written as a public artifact, with motivation / alternatives considered / impact / migration plan sections. Amendments that affect the consumption contract (Decision F) or the canonical-module rule (Decision A) are particularly consequential and we expect them to be rare; amendments that allocate new canonical codes (Decision B extension) are expected and follow the mini-RFC procedure documented in Decision D.

---

## 14. Touched docs (sweep summary)

This RFC's documentation cross-reference sweep. Full sweep table in the sub-plan progress notes ([`~/.cursor/plans/draft_rfc-001_cluster_a_054a4ef7.plan.md`](#) — private discussion artifact). Public-readable summary:

- **NEW**: `docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md` (this file).
- **Substantive cross-ref**: [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4 — one-line pointer to RFC-0001 added in companion edit.
- **No-change-with-reason**: [`docs/LICENSING.md`](../LICENSING.md) (already cross-references the RFC process, no update needed); [`docs/ROADMAP.md`](../ROADMAP.md) (Standing principles already capture the relevant policy; H2 2026 / H1 2027 horizons referenced); [`docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`](../modules/verticals/brewery/IMPLEMENTATION-LOG.md) and [`docs/CROSS-PLATFORM-BOUNDARIES.md`](../CROSS-PLATFORM-BOUNDARIES.md) (successors to the former implementation-log doc; RFC is forward-looking, no cross-ref needed); [`docs/CODING-STANDARDS.md`](../CODING-STANDARDS.md) (code-level standards, RFC-001 is governance / architecture, no direct intersection); [`docs/AUTH-STRATEGY.md`](../AUTH-STRATEGY.md) and [`docs/AUTH-HARDENING-ASSESSMENT.md`](../AUTH-HARDENING-ASSESSMENT.md) (auth-specific docs; the consumption contract §8.2 references them as the platform service, no reverse cross-ref needed); [`docs/TIER-PRICING-ANALYSIS.md`](../TIER-PRICING-ANALYSIS.md) (commercial doc, no governance cross-ref needed).
- **Deferred — separate repo**: OpenPLC sister-repo's `README.md` and `DEVELOPMENT.md` cross-references — the brewery-OpenPLC translation is owned by the follow-on sub-plan; cross-linking from the sister repo back to RFC-0001 happens when that sub-plan publishes its design output.
- **Deferred — plugin-owned**: shared Cursor rules / skills / subagents are delivered by the umbraculum-toolset plugin pack (see [`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md)); repo-side `.cursor/rules/` is reserved only as the fallback copy location for troubleshooting an unenforced plugin `alwaysApply` rule. RFC-0001 references for contributors live in [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md) when that cross-ref is needed.

---

*RFC-0001 is part of the Umbraculum platform's governance documentation set. See [`docs/README.md`](../README.md) for the full doc index, [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) for the platform vision this governance serves, [`docs/LICENSING.md`](../LICENSING.md) for the license posture and the broader RFC process this document follows, and [`MANIFESTO.md`](../../MANIFESTO.md) for the project values that motivate the structural decisions committed here.*
