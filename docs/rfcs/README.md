# Umbraculum RFCs — index

**Tier:** Public
**Status:** v0.1 — first iteration 2026-05-20 (living document)
**Audience:** prospective contributors, third-party module developers, self-hosters, hosted-service customers, anyone evaluating Umbraculum as a long-term operational dependency.
**Owners:** maintainers
**Related:** [`../LICENSING.md`](../LICENSING.md) §10 (the RFC change procedure), [`../PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.2 (governance principles), [`../MODULES.md`](../MODULES.md) (module ecosystem that several RFCs commit to).

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications. This file is the index of Umbraculum's accepted and in-flight RFCs. Each entry is a one-line "what it commits"; the full text lives in the per-RFC file.

---

## 1. What an RFC is in this project

Umbraculum uses **RFCs (Requests for Comments)** to record architectural and governance commitments that downstream consumers (third-party module developers, self-hosters, hosted-service operators, future maintainers) rely on.

The RFC process applies to any change that affects the downstream consumption contract, including:

- The licensing posture in [`../LICENSING.md`](../LICENSING.md).
- The governance principles in [`../PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.2.
- The module SDK's public surface ([`../../packages/modules/module-sdk/README.md`](../../packages/modules/module-sdk/README.md)).
- The AI tool contract.
- The billing model.
- Reserved canonical module codes (currently `mrp`, `wms`, `crm`, `crp`, `automation`, `pim`).
- The physical module layout (β three-tree + contracts package per module).

RFCs are:

- **Public-comment** at the public alpha (minimum 30 days per [`../LICENSING.md`](../LICENSING.md) §10). Before the July 2026 public alpha per [`../PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, RFCs are solo-author drafts approved by the core team.
- **Forward-only** in application — RFCs do not retroactively re-license or restructure existing artifacts.
- **Living** after acceptance — each RFC carries a Resolution section with its own amendment procedure. Material amendments re-trigger the 30-day comment window post-public-alpha.

Each RFC follows the same shape:

1. **Header** — Tier, Status, Audience, brand resolution.
2. **§1 Summary** — the commits in 3–5 bullets. If you read nothing else, read this.
3. **§2 Motivation** — why we're committing now, what failure modes the commit prevents.
4. **§3+ Decisions** — one per major commit, each named "Decision X — \<title\> (commit)".
5. **§Alternatives considered** — the rejected options and why.
6. **§Resolution** — the change procedure for amending this RFC.

The `(commit)` suffix on each Decision heading is deliberate — RFCs distinguish *committed* decisions from *deferred* clusters (work the RFC explicitly does not commit, with the trigger condition that would re-open it).

---

## 2. Index

| # | Title | Status | Accepted | One-line commitment |
|---|---|---|---|---|
| [0001](0001-modules-tiers-governance-and-automation-placement.md) | Modules, tiers, governance, and automation placement | Accepted | 2026-05-18 | Canonical-module rule, reserved-code allocation (`mrp`, `wms`, `crm`, `crp`, `automation`), tier model (1–6), governance contract, horizontal-platform-services consumption rules, automation as a canonical module. |
| [0002](0002-canonical-module-physical-layout.md) | Canonical-module physical layout | Accepted | 2026-05-19 | β layout (three runtime trees + one contracts package per module): `services/api/src/modules/<code>/`, `apps/web/app/[locale]/(<code>)/`, `apps/native/src/modules/<code>/`, `packages/<code>-contracts/`. `registerModule()` in `packages/modules/module-sdk/`. Brewery's β migration was originally sequenced to H1 2027 alongside the second canonical module, then accelerated by RFC-0006 after PIM shipped. |
| [0003](0003-validation-library-adoption.md) | Validation library adoption | Accepted (Phase 1) | 2026-05-19 | Zod v4 as the internal validation library for `packages/*-contracts/` and Fastify routes. Library-agnostic `ValidatedSchema<T>` interface in `@umbraculum/module-sdk` so third-party modules may use Zod, Valibot, TypeBox, or hand-rolled validators. Phase 1 spike landed PASS verdict on all three falsifiable tests; container-side bundle measurement is the open follow-up (F7). |
| [0004](0004-canonical-pim.md) | Canonical PIM | Accepted | 2026-05-19 | Allocates `pim` as the 6th canonical-module reserved code (joining the 5 in RFC-0001 Decision B). Mini-RFC under RFC-0001 §6 Decision D. PIM is the products / variants / attribute sets / categories / media-asset surface (Akeneo / Pimcore class). Phases A + B + C + D-integration-test-Option-B shipped per [`../modules/canonical/pim.md`](../modules/canonical/pim.md). |
| [0005](0005-docs-site.md) | Documentation site generator + canonical docs URL | Accepted | 2026-05-20 | Docusaurus 3.10.x with v4 future flags enabled day 1; canonical URL `docs.umbraculum.dev` (subdomain shape; flippable to `umbraculum.dev/docs` subpath later); `docs-site/` as a new top-level workspace; publication scope = every `Tier: Public` doc + all 16 per-workspace READMEs + RFCs; per-version snapshots only for `packages/*-contracts/`; i18n machinery enabled but English-only at v1 launch; Algolia DocSearch (free OSS tier) with lunr.js fallback; MDX permitted only for live UI examples (RFCs + READMEs stay pure `.md`); new CI build gate. Scheduled for Week 2 (2026-05-27 → 2026-06-02) of the late-H1 / July-2026 public-alpha tranche per [`../ROADMAP.md`](../ROADMAP.md), ahead of the July 2026 public-alpha release window. |
| [0006](0006-amend-rfc-0002-brewery-file-move-acceleration.md) | Amend RFC-0002 D — brewery file-move acceleration | Accepted | 2026-05-21 | Narrow amendment to [RFC-0002](0002-canonical-module-physical-layout.md) Decision D. Pulls the brewery file-move tranche forward from H1 2027 into Week 1 of the late-H1-2026 tranche, bundled with the web-route-shape audit ([`../design/web-route-group-audit.md`](../design/web-route-group-audit.md)). Brewery's ~14 API route files move into `services/api/src/modules/brewery/routes/`, 6 web segments into `apps/web/app/[locale]/(brewery)/`, native screens into `apps/native/src/modules/brewery/`. URLs preserved end-to-end (β semantics). Prisma `public.*` brewery schema deferral retained. RFC-0002 D's principle ("validate β coexistence in the same window the second canonical module ships") is honored — PIM has already shipped, and the new URL-segment registry's CI collision check needs every module registered. |
| [0007](0007-canonical-document-rendering.md) | Canonical document rendering pipeline and async job runner | Accepted / Implemented | 2026-05-21 | Extends [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2's consumption contract with a new **Document / file rendering** row. Allocates `@umbraculum/rendering` as a new layer-3 horizontal infrastructure package (AGPLv3 implementation; MIT SDK-side types re-exported from `@umbraculum/module-sdk` per [`../LICENSING.md`](../LICENSING.md) §6.2). Adds a `registerDocumentTemplate` slot to `registerModule()`. Commits the engine stack inside the RFC ([RFC-0003](0003-validation-library-adoption.md) shape, not [RFC-0004](0004-canonical-pim.md) shape): **Gotenberg** sidecar for HTML→PDF + DOCX/ODT→PDF; **exceljs** for XLSX; **`@fast-csv/format`** for CSV; **bwip-js** for barcodes / QR; **xmlbuilder2** for XML feeds; **eta** for HTML/email templates; **MJML** for email composition; **BullMQ on existing Redis** for the async job runner (Postgres-persisted job state in a new `rendering` schema per [RFC-0002](0002-canonical-module-physical-layout.md) §4 convention 4). Modules MUST NOT bundle parallel PDF / XLSX / DOCX / CSV / barcode libraries; MUST NOT run a parallel job queue. Implementation PR1-PR7 closed the core pipeline on 2026-05-25: package scaffold, SDK extension, engine adapters, BullMQ/Postgres/Fastify job runner, sync BeerJSON proof, platform-owned `render_document`, and the first async PIM channel-feed consumer. |
| [0008](0008-notifications-outbound-delivery.md) | Notifications and outbound delivery | Accepted | 2026-05-25 | Extends [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2's consumption contract with a new **Notifications / outbound delivery** row. Commits the boundary that email composition from [RFC-0007](0007-canonical-document-rendering.md) is not email transport: modules may contribute notification intents/templates/triggers, but the platform owns provider config, delivery queues, recipient policy, unsubscribe/compliance, audit logs, bounce/complaint handling, rate limits, abuse controls, and billing/cost controls. Public alpha may ship without general email delivery, but not without this contract. |
| [0009](0009-workspace-billing-addons-and-entitlements.md) | Workspace billing add-ons and entitlements | Accepted | 2026-05-28 | Commits `WorkspaceBillingAddon` shape and horizontal ownership for module `addonCodes` + optional managed-AI credit packs. Public α runs `EntitlementsService` in `tier_only` mode; Prisma model, Stripe/RevenueCat wiring, and route enforcement deferred H1 2027. Companion: [`canonical-workspace-billing-addons-surface.md`](../design/canonical-workspace-billing-addons-surface.md). |
| [0010](0010-platform-brewery-postgres-schema-split.md) | Platform and brewery Postgres schema split | Accepted | 2026-05-28 | Closes RFC-0002 §11.4 deferral: horizontal tenancy/auth/billing/ads/AI/integrations models move to `platform.*`; tier-6 brewery domain tables move to `brewery.*`; canonical module schemas unchanged. Forward migration only; `registerModule({ code: "brewery", prismaSchema: "brewery" })` required. Companion runbook: [`platform-brewery-postgres-schema-split.md`](../design/platform-brewery-postgres-schema-split.md). |
| [0011](0011-application-surface-shell-layering.md) | Application-surface shell layering | Accepted | 2026-06-06 | Extends RFC-0002 β with shell conventions: `apps/web/app/_shared-layout/`, `(platform-layout)/`, multi-app native, on-disk package tiers, **`@umbraculum/brewery-contracts`** (closes missing brewery contracts slice), platform-package purity (ui/i18n/contracts), package-layer eslint. Companion: [`pre-flip-application-surface-backbone.md`](../design/pre-flip-application-surface-backbone.md). |

---

## 3. Expected companion artifacts

Accepted RFCs are not self-contained implementation manuals. Each RFC commits *what* the platform or a module must do; companion docs record *how it is built today* and give agents and reviewers stable citation targets. The living inventory and gap scoring live in [`../design/rfc-companion-documentation-audit.md`](../design/rfc-companion-documentation-audit.md).

| Artifact type | Role | When required | Examples |
|---------------|------|---------------|----------|
| **RFC** | Governance commitment | Always | `docs/rfcs/0007-*.md` |
| **Audit / rationale doc** | Deep analysis; RFC is the commitment | Cross-cutting stack picks (RFC-0003 shape) | [`validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md), [`canonical-document-rendering-engine-rationale.md`](../design/canonical-document-rendering-engine-rationale.md) |
| **Module surface doc** | As-built per canonical module | Each allocated canonical code | [`canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md) |
| **Horizontal surface doc** | As-built for platform extension points spanning modules | Horizontal RFCs with `register*` slots | [`canonical-document-rendering-surface.md`](../design/canonical-document-rendering-surface.md), [`canonical-notifications-outbound-delivery-surface.md`](../design/canonical-notifications-outbound-delivery-surface.md) |
| **Execution plan** | Composer/human operational breakdown | Large RFC execution (optional) | [`rfc-0005-execution-plan.md`](../design/rfc-0005-execution-plan.md) |
| **Decision / audit record** | Narrow amendment + bundled work | Amendments, audits | [`web-route-group-audit.md`](../design/web-route-group-audit.md) |
| **Workspace web UI strategy** | Cross-platform delivery decision (non-RFC) | Platform surfaces beyond web + Expo native | [`ubuntu-touch-shell-strategy.md`](../design/ubuntu-touch-shell-strategy.md); reference Click package [`umbraculum-reference/`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) |
| **Build log** | Wave execution record | Multi-phase feature waves | `mrp-crp-wave-*-build-log.md` |
| **Package README** | Workspace consumer surface | Every `packages/*` | Enforced by `scripts/docs/check-readmes.py` |

**When you accept a new RFC**, land or schedule the companion set in the same PR window as implementation (or, for horizontal services, a boundary surface doc before the first consumer wave). **When you add a `documentTemplates` entry or a new `module:template@version` ref**, update the horizontal rendering surface registry in the same PR ([`canonical-document-rendering-surface.md`](../design/canonical-document-rendering-surface.md) §2).

**Gold-standard precedent:** [RFC-0003](0003-validation-library-adoption.md) + [`validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md). **Per-module precedent:** [RFC-0004](0004-canonical-pim.md) → [`canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md).

Feature plans (Cursor `.plan.md` files) MUST include a **Documentation context** table citing the governing RFC, horizontal/module surface docs, and relevant plugin rules — see [`AGENTS.md`](../../AGENTS.md) §"Adjacent context" and umbraculum-toolset-common rule `49-plan-documentation-context.mdc` (after toolset install).

---

## 4. Adding a new RFC

For a new RFC:

1. Copy the structure of [`0002-canonical-module-physical-layout.md`](0002-canonical-module-physical-layout.md) (the most fully-developed template).
2. Use the **next sequential number** — current highest is `0010`, so the next available slot is `0011`.
3. Follow the procedure in [`../LICENSING.md`](../LICENSING.md) §10 (pre-flip: solo-author + core-team approval; post-flip: 30-day public-comment window).
4. After acceptance, add a row to the index table above with the one-line commit and a link to the new file.
5. Update any downstream docs the RFC affects (`MODULES.md`, `PLATFORM-ARCHITECTURE.md`, `REPOSITORY-STRUCTURE.md`, the relevant module page under `docs/modules/`).

---

## 5. Why this index exists

The RFCs above are referenced from many places — `MODULES.md`, `PLATFORM-ARCHITECTURE.md`, `REPOSITORY-STRUCTURE.md`, individual module pages, README files in `packages/<code>-contracts/`. Before this index existed, an evaluator who wanted the full picture had to click through five docs to discover the RFC set. This page is the single artifact that answers "what has Umbraculum formally committed to, and where do I read the full text?"

When a future RFC lands (likely candidates: `0011-managed-ai-credits` or a billing-implementation RFC covering Stripe subscription-item flows for module add-ons; or an eventual successor RFC promoting the route-group β disciplines from plugin-pack rule [46-web-route-shape.mdc](https://github.com/umbraculum-dev/umbraculum-toolset) to RFC-level commitment if third-party modules contest them), it is added here first; the change is not done until this index reflects it. Module add-on **contract** shipped under [RFC-0009](0009-workspace-billing-addons-and-entitlements.md) (2026-05-28); **implementation** remains H1 2027. The brewery Postgres schema split from `public.*` to `platform.*` + `brewery.*` shipped under [RFC-0010](0010-platform-brewery-postgres-schema-split.md) (2026-05-28).

---

## 5. Companion documentation expectations

RFCs record **governance commitments**. Implementations and operators rely on a ladder of companion artifacts so behavior is discoverable without re-reading every Decision section. The living inventory and remediation priorities live in [`../design/rfc-companion-documentation-audit.md`](../design/rfc-companion-documentation-audit.md).

### 5.1 Artifact taxonomy

| Artifact type | Role | When required | Examples |
|---------------|------|---------------|----------|
| **RFC** | Governance commitment | Always | `docs/rfcs/0007-*.md` |
| **Audit / rationale doc** | Deep analysis; RFC is the commitment | Cross-cutting stack picks (RFC-0003 shape) | [`validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md), [`canonical-document-rendering-engine-rationale.md`](../design/canonical-document-rendering-engine-rationale.md) |
| **Module surface doc** | As-built per canonical module | Each allocated canonical code | [`canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md) |
| **Horizontal surface doc** | As-built for platform extension points spanning modules | Horizontal RFCs with `register*` slots | [`canonical-document-rendering-surface.md`](../design/canonical-document-rendering-surface.md), [`canonical-notifications-outbound-delivery-surface.md`](../design/canonical-notifications-outbound-delivery-surface.md) |
| **Execution plan** | Composer/human operational breakdown | Large RFC execution (optional) | [`rfc-0005-execution-plan.md`](../design/rfc-0005-execution-plan.md) |
| **Decision / audit record** | Narrow amendment + bundled work | Amendments, audits | [`web-route-group-audit.md`](../design/web-route-group-audit.md) |
| **Workspace web UI strategy** | Cross-platform delivery decision (non-RFC) | Platform surfaces beyond web + Expo native | [`ubuntu-touch-shell-strategy.md`](../design/ubuntu-touch-shell-strategy.md); reference Click package [`umbraculum-reference/`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) |
| **Build log** | Wave execution record | Multi-phase feature waves | `mrp-crp-wave-*-build-log.md` |
| **Package README** | Workspace consumer surface | Every `packages/*` | Enforced by `scripts/docs/check-readmes.py` |

**Gold standard:** [RFC-0003](0003-validation-library-adoption.md) + audit + contracts migration. **Module pattern:** [RFC-0004](0004-canonical-pim.md) → `canonical-*-module-surface.md` tracks as-built phases.

### 5.2 When you accept or implement an RFC

1. List expected companion types in the RFC (or link this taxonomy).
2. Land or update companions **in the same PR** when the implementation changes operator-visible behavior (template registry rows, new `registerModule` slots, delivery modes).
3. Refresh the audit matrix row and `last reviewed` date.
4. Feature plans for multi-phase work include a **Documentation context** section — template: [`../design/plan-documentation-context-template.md`](../design/plan-documentation-context-template.md) (toolset rule `49-plan-documentation-context.mdc` when installed).

### 5.3 Optional CI

[`scripts/docs/check-rfc-companion-links.py`](../../scripts/docs/check-rfc-companion-links.py) checks that implemented RFCs still link to on-disk companion paths declared in the audit matrix. Non-blocking until one green cycle; then promote in CI alongside `check-readmes.py`.
