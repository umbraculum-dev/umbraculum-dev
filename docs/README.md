# Umbraculum documentation

**Tier:** Public

This folder is the canonical reference set for the Umbraculum platform. It is structured so that anyone — a new contributor, a self-hoster, a hosted-service customer, or a future maintainer — can find what they need without reading the whole repository.

Documents are grouped by **purpose**, not by physical location. Most files sit at the top level — they have not been moved into per-purpose subfolders in order to keep cross-links inside the existing codebase stable; this index provides the navigation. The exceptions are `integrations/`, `calculators/` (pre-existing per-asset folders), `archive/` (superseded revisions), and `help/` (end-user / operator help, currently empty placeholder).

> **Audience tier.** All documents in this folder are **Tier: Public** by default — written to be surfaceable when the repository flips public. The first content line of each doc carries an explicit `**Tier:** Public` marker for clarity. Other tier values reserved for future use: `Partner-restricted`, `Customer-restricted`. Documentation that is not public-tier lives outside this folder and outside any public-mirror flip; it is intentionally not indexed here.

---

## Start here

If you are new to the project, read these three documents in order:

1. [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — the **vision and shape**: horizontal platform with vertical modules, AI consultant blueprint, BYOK + paid tier unlock, and the future managed-AI path.
2. [`ROADMAP.md`](ROADMAP.md) — the **direction of travel**: what is shipped, what is next, the 12–30 month trajectory.
3. [`LICENSING.md`](LICENSING.md) — the **licensing posture and reasoning**: AGPLv3 core + MIT SDK, commercial dual license, and what these choices imply for contributors, self-hosters, module developers, and enterprises.

Cross-platform (web + native) boundaries: [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md). The brewery-vertical implementation log: [`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md). Together they complement the platform-wide perspective above.

---

## Repository structure

*Audience: new contributors, evaluators, prospective module developers, future maintainers running an orientation pass.*

The spatial map of the monorepo — what every workspace is, which layer it sits in, what consumes it, and what it consumes. Read this once before diving into any specific module or slice.

- [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md) — **the spatial map.** Five-layer mental model (apps → services → horizontal infrastructure packages → contracts packages → module SDK + vertical-flavored packages), workspace inventory tables, β-layout walkthrough for a single module, Mermaid dependency diagram, and the canonical-for-now docs publishing URL (`docs.umbraculum.dev`). Complements [`MODULES.md`](MODULES.md) (ecosystem) and [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) (architecture).

---

## Vision & strategy

*Audience: technical decision-makers, platform evaluators, future module developers.*

The high-level direction, business model, and license posture.

- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — Platform vision, AI consultant, distribution model; §2.1 *From practice, not theory* (open backbone — practitioner rationale, cites Omnis case study).
- [`ROADMAP.md`](ROADMAP.md) — Living roadmap with 12–30 month trajectory.
- [`LICENSING.md`](LICENSING.md) — Licensing rationale (AGPLv3 + MIT SDK, dual license, RFC change process).
- [`TIER-PRICING-ANALYSIS.md`](TIER-PRICING-ANALYSIS.md) — Base subscription tiers and pricing analysis (the current AI tier unlock and future managed-AI overlay are described in `PLATFORM-ARCHITECTURE.md` §7).
- [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) — How community proposals, collaborators, sponsors, and AI-compute support fit into core development without buying priority or governance rights; canonical channels at `forum.umbraculum.dev` (§4.6); authentic representation in community discourse (§6.1 — no AI impersonation of members); donation rails in [`design/donation-channels.md`](design/donation-channels.md).
- [`design/ecosystem-case-study-omnis.md`](design/ecosystem-case-study-omnis.md) — **Ecosystem lesson (Omnis).** Good product; Core vs verticals governance, 2016 doc-site fragility (§3.4–§3.6); maps to community, open repos, and free-try commitments.
- [`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md) — **Index** for all practitioner ecosystem case studies (learnability, repositioning, no-cert policy).
- [`design/ecosystem-case-study-business-central.md`](design/ecosystem-case-study-business-central.md) — **Integration lesson (Business Central).** Large partner ecosystem, opaque external API surface (OData vs REST vs custom API, version/wave maze, consultants who cannot advise integrators); maps to Umbraculum's contracts packages, module route docs, and alpha partial OpenAPI ([`API-OPENAPI.md`](API-OPENAPI.md)).
- [`design/ecosystem-case-study-sap.md`](design/ecosystem-case-study-sap.md) — **Learnability lesson (SAP ABAP).** One language across verticals, but trials ≠ safe boat for repositioning; maps to free try, no certification program, expertise-over-badges ([`MANIFESTO.md`](../MANIFESTO.md) §2.2).
- [`design/ecosystem-case-study-teamsystem.md`](design/ecosystem-case-study-teamsystem.md) — **Learnability lesson (TeamSystem).** European ERP strength, partner-only experiment path; pairs with Omnis.
- [`design/ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md) — **Learnability lesson (Odoo Community).** Partial positive — Community Edition tryability; Umbraculum copies the ladder, not the cert/partner gate; §4.1 platform-shape vs Odoo (language, native, breadth).
- [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md) — Maintainer draft for the July 2026 public-alpha launch post (do not publish until flip).

## Modules ecosystem

*Audience: anyone evaluating, contributing to, or building on top of the module set — the analog of `drupal.org/project/project_module` for Umbraculum.*

- [`MODULES.md`](MODULES.md) — **entry point for the module ecosystem.** Vocabulary (`package` vs `canonical module` vs `vertical configuration` vs `reserved canonical code` vs `module SDK`), the catalog (canonical modules + vertical configurations + horizontal packages), the "I want to build a ___" decision tree, and a worked example.
- [`modules/`](modules/) — per-module pages linked from `MODULES.md` (one page per canonical module / vertical configuration as each ships; today: `modules/canonical/automation.md`, `modules/canonical/pim.md`, and the `modules/verticals/brewery/` reference vertical docs).
- [`modules/packages/README.md`](modules/packages/README.md) — **package primer** — horizontal infrastructure, canonical contracts, and vertical-flavored workspaces with links to each `README.md`.

## AI consultant

*Audience: platform evaluators, hosted-service operators, module developers, end-users.*

The workspace-scope AI consultant is the cornerstone the platform is organized around — every other structural choice (monorepo, one shell, canonical-module discipline, peer-module decomposition, vertical-configuration tier) is downstream of one principle: the consultant must see the workspace as one coherent thing. See [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0 "AI-consultant context principle (cornerstone)" for the reasoning.

- [`AI-CONSULTANT.md`](AI-CONSULTANT.md) — **Feature surface.** What the consultant is, what it can do today (registered tools by module), what it cannot do yet, how modules contribute tools, BYOK + paid-tier unlock, per-workspace operational memory.
- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0, §4.3, §6, §7 — Architecture depth: cornerstone principle, AI-platform sub-system, tools + prompt composition + memory + worked example, BYOK monetization model.
- [`help/`](help/) — Operator-facing usage guides (see [`help/asking-umbraculum.md`](help/asking-umbraculum.md)).

## Stack & dependencies

*Audience: evaluators, future maintainers, partners — anyone who wants to know **what** the platform is built on and **why** each open-source choice was made.*

- [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) — **technology recap and per-dependency rationale.** Exhaustive companion to [`MANIFESTO.md`](../MANIFESTO.md) §1.4: for every load-bearing dependency (OS, runtime, data layer, backend, frontend web + native, validation, tests, lint, industrial automation, build, brewery-domain, docs/CI), answers three questions — role in the discipline-apparatus, why this over the proprietary alternative, what shrinks if swapped for closed source. Includes the single closed-source exception (Cursor itself) and the posture toward it.

## Governance (RFCs)

*Audience: contributors, module developers, platform evaluators.*

Public architectural and governance commitments. Process: [`LICENSING.md`](LICENSING.md) §10.

- [`rfcs/README.md`](rfcs/README.md) — **RFC index entry point.** One-line commit per RFC, the RFC anatomy (header → summary → motivation → decisions → alternatives → resolution), and the process for adding a new one.
- [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) — Canonical-module rule, reserved codes (`mrp`, `wms`, `crm`, `crp`, `automation`), tier model, governance, consumption contract, automation placement (Accepted 2026-05-18).
- [`rfcs/0002-canonical-module-physical-layout.md`](rfcs/0002-canonical-module-physical-layout.md) — Physical layout (β three-tree + per-module contracts package), naming conventions, `module-sdk` location, H1 2027 migration sequencing (Accepted 2026-05-19).
- [`rfcs/0003-validation-library-adoption.md`](rfcs/0003-validation-library-adoption.md) — Zod v4 as the internal validation library for contracts + Fastify routes; library-agnostic `ValidatedSchema<T>` interface in `@umbraculum/module-sdk` so third parties may use Zod, Valibot, TypeBox, or hand-rolled validators (Accepted 2026-05-19; F7 container-side bundle measurement open).
- [`rfcs/0004-canonical-pim.md`](rfcs/0004-canonical-pim.md) — Allocates `pim` as the 6th canonical-module reserved code (Akeneo / Pimcore class — products, variants, attribute sets, categories, media). Mini-RFC under RFC-0001 §6 Decision D (Accepted 2026-05-19).
- [`rfcs/0005-docs-site.md`](rfcs/0005-docs-site.md) — Documentation site generator (Docusaurus 3.10.x, v4-future-flagged) + canonical URL (`docs.umbraculum.dev`) + 9 publication / versioning / search / i18n / MDX-policy / CI commits. Scheduled for Week 2 of the late-H1-2026 tranche per [`ROADMAP.md`](ROADMAP.md) (Accepted 2026-05-20).
- [`rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md`](rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) — Narrow amendment to RFC-0002 Decision D: pulls the brewery file-move tranche forward from H1 2027 into Week 1 of the late-H1-2026 tranche (2026-05-20 → 2026-05-26), bundled with the web-route-shape audit. URLs preserved end-to-end (β semantics) (Accepted 2026-05-21).
- [`rfcs/0007-canonical-document-rendering.md`](rfcs/0007-canonical-document-rendering.md) — Canonical document rendering pipeline and async job runner: `@umbraculum/rendering`, `registerDocumentTemplate`, Gotenberg / exceljs / fast-csv / bwip-js / xmlbuilder2 / eta / MJML, and BullMQ on existing Redis (Accepted 2026-05-21; implemented / closed 2026-05-25).
- [`rfcs/0008-notifications-outbound-delivery.md`](rfcs/0008-notifications-outbound-delivery.md) — Notifications and outbound delivery boundary: email-ready rendering is composition only; provider transport, recipient policy, unsubscribe/compliance, audit logs, bounce/complaint handling, abuse/rate limits, and delivery billing are horizontal platform concerns (Accepted 2026-05-25).
- [`rfcs/0009-workspace-billing-addons-and-entitlements.md`](rfcs/0009-workspace-billing-addons-and-entitlements.md) — Workspace billing add-ons: modules declare `addonCodes`; platform owns `WorkspaceBillingAddon` persistence and Stripe/RevenueCat (contract Accepted 2026-05-28; implementation H1 2027). Companion: [`design/canonical-workspace-billing-addons-surface.md`](design/canonical-workspace-billing-addons-surface.md).
- [`rfcs/0010-platform-brewery-postgres-schema-split.md`](rfcs/0010-platform-brewery-postgres-schema-split.md) — Closes RFC-0002 §11.4 deferral: horizontal models in `platform.*`, brewery domain tables in `brewery.*`; forward migration only; `registerModule({ code: "brewery", prismaSchema: "brewery" })` required. Companion runbook: [`design/platform-brewery-postgres-schema-split.md`](design/platform-brewery-postgres-schema-split.md) (Accepted 2026-05-28).

## Design (pre-RFC / follow-on)

*Audience: core team, module authors implementing RFC decisions; also practitioner case studies that inform governance.*

- [`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md) — **Index** for practitioner ecosystem case studies (failure-mode map, learnability, no-cert policy).
- [`design/ecosystem-case-study-omnis.md`](design/ecosystem-case-study-omnis.md) — **Practitioner case study (Omnis Studio).** Good product, ecosystem never formed; Core/vertical dynamics and long-run migration fear (§3.4–§3.6); rewrite caution (§6).
- [`design/ecosystem-case-study-business-central.md`](design/ecosystem-case-study-business-central.md) — **Practitioner case study (Dynamics 365 Business Central).** Strong ERP and partner channel, painful external integration discovery (OData vs REST API v2.0, release waves, docs by topic not by job); senior consultants often cannot advise API consumers; maps to Umbraculum contracts packages, public route tables, version handshake, and alpha partial OpenAPI ([`API-OPENAPI.md`](API-OPENAPI.md) §4). Rewrite caution (§6).
- [`design/ecosystem-case-study-sap.md`](design/ecosystem-case-study-sap.md) — **Practitioner case study (SAP ABAP).** Repositioning in hard times; trials exist but are not a Magento-shaped safe boat; no Umbraculum certification counter-commitment. Rewrite caution (§6).
- [`design/ecosystem-case-study-teamsystem.md`](design/ecosystem-case-study-teamsystem.md) — **Practitioner case study (TeamSystem).** Partner-only experiment path; expertise trapped inside integrator channel. Rewrite caution (§6).
- [`design/ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md) — **Practitioner case study (Odoo Community).** Partial positive on learnability; §4.1 Umbraculum vs Odoo platform-shape comparison; deliberate skip of certification economy. Rewrite caution (§5).
- [`design/application-surfaces-vs-platform-backbone.md`](design/application-surfaces-vs-platform-backbone.md) — **Terminology + layering (2026-05-28).** What "backend" means in this repo; four product layers (platform backbone, modules, operator shell, optional audience-specific apps); Drupal-style admin/storefront vs ERP-style operator shell; `@umbraculum/module-sdk` as the backbone SDK vs the reserved/unused `@umbraculum/core` npm name.
- [`design/canonical-workspace-billing-addons-surface.md`](design/canonical-workspace-billing-addons-surface.md) — **Workspace billing add-ons boundary ([RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md)).** `addonCodes` registry, `tier_only` vs `tier_and_addons` enforcement, H1 2027 implementation backlog; no `WorkspaceBillingAddon` table in public α.
- [`design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) — Canonical `automation` module surface (RFC-0001 Decision E §7.2): adapter SDK, Vessel vs EquipmentProfile, OpenPLC seam, AI tools, tier limits (**Accepted design** 2026-05-19; implementation phased per doc §9).
- [`design/web-route-group-audit.md`](design/web-route-group-audit.md) — **Decision-of-record for the web route-shape audit (Accepted 2026-05-21).** Ratifies the two β disciplines (no `(<code>)/page.tsx`, no `(<code>)/[<dynamic>]/page.tsx` at the route-group root), the URL-segment registry surface in `@umbraculum/module-sdk` (`registerWebModule({ ownedUrlSegments, navEntry })` + CI gate `scripts/check-web-url-segments.ts`), and the per-module URL corrections (`/en/automation` → `/en/vessels`, `/en/pim/*` → `/en/products` / `/en/categories` / `/en/attribute-sets`, brewery URLs preserved). Pairs with [RFC-0006](rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) (governance amendment to RFC-0002 D) and the Cursor plugin rule `46-web-route-shape.mdc` in `umbraculum-platform-tsjs-cursor-assistant` v0.5.0.
- [`design/openplc-mailbox-emitter-pr-shape.md`](design/openplc-mailbox-emitter-pr-shape.md) — sister-repo PR shape for the mailbox-artifact emitter (Phase A step 4 hand-off; pairs with [`packages/automation-contracts/`](../packages/automation-contracts/)).

## Product

*Audience: product readers, evaluators, hosted-service operators.*

User-facing product surfaces and operational concerns at the product level.

- [`ROLLOUT.md`](ROLLOUT.md) — Rollout plan and staged-launch notes.
- [`SEO.md`](SEO.md) — SEO posture for the marketing/public surfaces.
- [`AGENTIC-JOBS.md`](AGENTIC-JOBS.md) — Agentic / scheduled-job notes.

## Architecture — platform-wide

*Audience: contributors, self-hosting operators, module developers.*

Cross-cutting architectural decisions that apply to every module.

- [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) — As-built contract for shared web/native packages (i18n, navigation, api-client auth, webview bridge, DB routing entrypoint).
- [`API-OPENAPI.md`](API-OPENAPI.md) — **Alpha partial OpenAPI catalog** — committed spec, coverage matrix, integrator workflow, maintainer runbook (F1 partial closure).
- Historical architecture revisions: [`archive/architecture-Rev00.md`](archive/architecture-Rev00.md), [`archive/architecture-Rev01.md`](archive/architecture-Rev01.md), [`archive/architecture-Rev02-2026-05-snapshot.md`](archive/architecture-Rev02-2026-05-snapshot.md) (frozen copy of the former `ARCHITECTURE-REV02.md`, split 2026-05-27).
- [`NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md) — Native strategy and CI pipeline notes.
- [`REACT-NATIVE-KICKOFF-READINESS.md`](REACT-NATIVE-KICKOFF-READINESS.md) — Readiness criteria for the React Native kickoff.

## Architecture — auth & security

*Audience: contributors, self-hosting operators, module developers.*

- [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) — Authentication strategy (cookie web + bearer native + webview bridge).
- [`AUTH-HARDENING-ASSESSMENT.md`](AUTH-HARDENING-ASSESSMENT.md) — Hardening review and findings.
- [`AUTH-QA.md`](AUTH-QA.md) — Auth QA notes.

## Architecture — data & infrastructure

*Audience: contributors, self-hosting operators, module developers.*

- [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md) — Postgres primary + replica architecture.
- [`DB-REPLICATION-AND-ROUTING-VERIFICATION.md`](DB-REPLICATION-AND-ROUTING-VERIFICATION.md) — Replication and read-routing verification.
- [`PGPOOL-VERIFICATION.md`](PGPOOL-VERIFICATION.md) — pgpool-II verification steps.
- [`REDIS-ARCHITECTURE.md`](REDIS-ARCHITECTURE.md) — Redis usage, key namespaces, caching pattern.

## Architecture — billing

*Audience: contributors, hosted-service operators.*

- [`ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md`](ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md) — Stripe + RevenueCat + Fastify billing source-of-truth design.

## Domain — brewery vertical

*Audience: brewery-vertical contributors and operators. These docs live under the brewery vertical module area so Docusaurus and GitHub both present them as vertical-specific material, not platform-core architecture.*

Brewery-specific modeling, data formats, and analytical models.

- [`modules/verticals/brewery/BEERJSON-FIRST.md`](modules/verticals/brewery/BEERJSON-FIRST.md) — BeerJSON-first data model and strict export discipline.
- [`modules/verticals/brewery/EQUIPMENT-AND-GRAVITY-ANALYSIS.md`](modules/verticals/brewery/EQUIPMENT-AND-GRAVITY-ANALYSIS.md) — Equipment + gravity analysis (efficiency, losses, yields).
- [`modules/verticals/brewery/WATER-CHEM-MASH-PH-MODEL.md`](modules/verticals/brewery/WATER-CHEM-MASH-PH-MODEL.md) — Water chemistry and mash pH model.
- [`modules/verticals/brewery/YEAST-MATH.md`](modules/verticals/brewery/YEAST-MATH.md) — Yeast pitching and propagation math.
- [`modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md`](modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md) — Seed data sources and licensing notes for raw materials.
- [`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md) — Brewery vertical product rules, offline/sync intent, water/recipe constraints, and living engineering constraints.

## Engineering — development

*Audience: contributors only.*

Day-to-day engineering conventions and runbooks.

- [`GETTING-STARTED.md`](GETTING-STARTED.md) — **First-time contributor tutorial.** Linear walkthrough from "Ubuntu laptop, nothing installed" to "first commit landing with the apparatus running". Targets the [`MANIFESTO.md`](../MANIFESTO.md) §1.4 gap directly. Read this if you have never opened the repo before.
- [`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) — Synthesis layer for the four-slice foundation-hardening pass (lint + types + tests + docs) plus the orthogonal validation axis. Single entry point for the bird's-eye narrative; per-slice docs below remain the sources of truth. Includes the plugin-pack handoff manifest (slice → rule/skill/subagent mapping).
- [`CODING-STANDARDS.md`](CODING-STANDARDS.md) — Coding standards (TypeScript, conventions, file layout).
- [`CI-PARITY.md`](CI-PARITY.md) — Pre-push static-analysis gate (`npx @umbraculum/ci-parity`); manifest at `.umbraculum/ci-parity.json`; four local-vs-CI divergence mechanisms.
- [`design/ci-parity-npm-trusted-publishing.md`](design/ci-parity-npm-trusted-publishing.md) — npm OIDC trusted publishing for `@umbraculum/ci-parity` (replaces 90-day `NPM_TOKEN` rotation).
- [`LINTING.md`](LINTING.md) — ESLint setup, scope tiers (HIGH-light → HIGH-staged → HIGH-full), value/cost analysis, and how to extend the strict gate.
- [`TYPING.md`](TYPING.md) — TypeScript strict-flag rollout, per-workspace `tsc --noEmit` baseline + canonical measurement methodology, the 6 candidate stricter flags + their rollout state, and the per-workspace CI typecheck gate.
- [`TAMAGUI.md`](TAMAGUI.md) — Tamagui type-system caveats, our adaptation strategy, and what to watch upstream.
- [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) — Why `packages/contracts` uses hand-rolled validators today, candidate libraries (Zod, Valibot, TypeBox), trigger criteria for revisiting, and migration mechanics if we go.
- [`TESTING.md`](TESTING.md) — Test layers, frameworks, conventions; see also the plugin-shipped `20-tests-must-follow-changes.mdc` rule.
- [`DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) — Module-level README standard (template + audit checklist) and the structural CI gate (`scripts/docs/check-readmes.py` + `.github/workflows/docs-readmes.yml`).
- [`DEVELOPMENT-ACCESSIBILITY.md`](DEVELOPMENT-ACCESSIBILITY.md) — Accessibility constraints (hard requirements).
- [`DEVELOPMENT-NATIVE-LOCAL.md`](DEVELOPMENT-NATIVE-LOCAL.md) — Local development for the native app.
- [`I18N-AUDIT.md`](I18N-AUDIT.md) — Internationalization audit and guardrails.
- [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) — Community proposal mechanism, sponsorship principles (including the AI-compute capacity ask), canonical channels at `forum.umbraculum.dev` (§4.6), donation rails [`design/donation-channels.md`](design/donation-channels.md).

## Help & guides (operator-facing)

*Audience: workspace members and admins using the app's UI to perform operational work, regardless of whether their workspace is on free, paid, or self-hosted infrastructure.*

- [`help/`](help/) — End-user / operator help documentation. Currently empty placeholder; content lands here as the brewery vertical UI matures and as additional vertical configurations land.

## Integrations

*Audience: integration developers, hardware vendors, module developers.*

Per-integration design notes.

- [`integrations/INTEGRATION-TOKENS.md`](integrations/INTEGRATION-TOKENS.md) — Integration token model.
- [`integrations/TILT.md`](integrations/TILT.md) — Tilt hydrometer integration.
- [`integrations/FLOATING-HYDROMETERS.md`](integrations/FLOATING-HYDROMETERS.md) — Floating hydrometer family.

## Reference

*Audience: contributors, archaeology readers.*

- [`calculators/`](calculators/) — Calculator references and source materials (e.g. BrunWater spreadsheet, mash-pH paper).
- [`archive/`](archive/) — Superseded architecture revisions (Rev00, Rev01) and the canonical architecture-revision PDF (`archive/architecture-Rev02.pdf`). Kept for historical reference; not load-bearing for current decisions.

---

## Contributing to the documentation

- Documentation lives in this folder (`docs/`); top-level files (`DEVELOPMENT.md`, `DEVELOPMENT-LOCAL.md`, repository `README.md`) cover repo-level mechanics and link back here for everything platform-level.
- When adding a new document, also add a link to it from this index in the appropriate category. Each category is intended to stay small enough to scan.
- **URL moves and removals (non-negotiable).** When a published doc **moves** or is **removed** from the docs site (`docs.umbraculum.dev`), the same PR must include **either** a **permanent redirect** to the replacement URL **or** a deliberate stub page that **explains why the content no longer exists** and where readers should go instead. Silent 404s — bookmarks, forum posts, and colleague links that die without explanation — are **not acceptable**. In-repo relative links must be updated in the same change; site-level redirects cover external bookmarks to old URLs. Lesson from [`design/ecosystem-case-study-omnis.md`](design/ecosystem-case-study-omnis.md) §3.5.
- New documents should follow the existing tone: precise about decisions, honest about trade-offs, and explicit about what is *not* settled.
- For any document that may be surfaced publicly in the future (Vision & strategy, License, parts of Architecture), assume the audience is technically literate but not specialist, and define terms on first use.
- Substantive licensing or governance changes follow the RFC process described in [`LICENSING.md`](LICENSING.md) §10.

## Audience for this set

This documentation is written with three audiences in mind, in approximately this priority order:

1. **Future maintainers and contributors** — the people who will keep this project alive across decades. The docs are the durable artifact; the chat history is not.
2. **Self-hosting operators and platform evaluators** — technical decision-makers assessing Umbraculum as a long-term dependency.
3. **Prospective module developers** — partners building verticals or integrations on top of the platform.

If a document does not serve at least one of these audiences clearly, it should be revised or moved out of the docs tree.
