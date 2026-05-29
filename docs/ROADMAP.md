# Roadmap (living)

**Tier:** Public

This roadmap captures the agreed “direction of travel” for the product so implementation stays coherent and we avoid rework.

## Big picture

- Platform vision (horizontal-platform-with-vertical-modules + AI consultant + add-on pricing): `docs/PLATFORM-ARCHITECTURE.md`
- Licensing posture and rationale (AGPLv3 core + MIT SDK + commercial dual license): `docs/LICENSING.md`
- Cross-platform boundaries: `docs/CROSS-PLATFORM-BOUNDARIES.md`
- Brewery-vertical implementation log: `docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`
- Accessibility hard constraint: `docs/DEVELOPMENT-ACCESSIBILITY.md`
- Seed data sources + licensing notes: `docs/modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md`
- Full doc index: `docs/README.md`

## Trajectory (12–30 months)

This is the agreed direction of travel at the platform level. It is intentionally short on implementation detail and long on sequencing — implementation specifics land in domain docs and per-quarter planning. The trajectory exists to keep parallel work coherent and to make explicit which decisions need to happen *before* the second vertical lands.

### Late H1 / July 2026 — public-alpha preparation and release tranche

Goal: land three load-bearing, mostly-independent slices in a one-per-week cadence so the project is structurally and operationally ready for the H2 2026 AI-consultant work and for a **July 2026 public alpha** (brought forward from the original H1 2027 horizon). June remains the preparation / earliest cutover / marketplace-submission window; July is the realistic external release window because plugin-marketplace approval, DNS propagation, and final publication checks can tail beyond the cutover day. The order is intentional — internal-architectural first, then publication-infrastructure, then external/irreversible — so each week's output unblocks the next.

- **Week 1 (2026-05-20 → 2026-05-26) — Web route shape audit + brewery file-move acceleration.** ✅ Done in tree (2026-05-27): `(brewery)/` web routes, `registerBreweryModule`, URL-segment CI — verify with `npm run check-web-url-segments` before marking the tranche line fully closed in git history. Commits the β-discipline filesystem-axis route groups (`(<code>)/` with NO group-root `page.tsx` and NO group-root dynamic segment), the full URL-segment registry in `@umbraculum/module-sdk` + CI collision check (`scripts/check-web-url-segments.ts`), the `RouteId` growth in `@umbraculum/navigation`, the `(automation)/` and new `(pim)/` refactors, the brewery API/web/native file-move tranche (~14 API routes → `services/api/src/modules/brewery/routes/`, 6 web segments → `apps/web/app/[locale]/(brewery)/`, ~6–10 native screens → `apps/native/src/modules/brewery/`), the matching Cursor plugin rule (`46-web-route-shape.mdc` in `umbraculum-platform-tsjs-cursor-assistant`), and a successor RFC amending [`docs/rfcs/0002-canonical-module-physical-layout.md`](rfcs/0002-canonical-module-physical-layout.md) Decision D to record the brewery file-move acceleration. Pulls the brewery file-move from its original H1 2027 slot into this week — RFC-0002 D contemplated this trajectory; the new collision-check infrastructure makes it cheap to land now alongside the route-shape audit. URLs are preserved end-to-end (β semantics for brewery; `/automation/*` becomes the canonically-named `/vessels/*`; PIM gains `/products/*`, `/categories`, `/attribute-sets/*` in place of the legacy `/pim/*` prefix). Plan internal estimate: 14–18 days in a single PR; the one-week budget trades calendar surface for focused execution.
- **Week 1 tail (2026-05-28) — Platform + brewery Postgres schema split ([RFC-0010](rfcs/0010-platform-brewery-postgres-schema-split.md)).** ✅ Done in tree (2026-05-28): horizontal tenancy/auth/billing/ads/AI/integrations models → `platform.*`; tier-6 brewery domain tables → `brewery.*`; forward migration `20260528170000_split_platform_brewery_schemas`; `registerBreweryModule({ prismaSchema: "brewery" })`; cross-schema FK `automation.vessels` → `brewery.equipment_profiles`; `reporting.brewery_inventory_summary` recreated; companion runbook [`platform-brewery-postgres-schema-split.md`](design/platform-brewery-postgres-schema-split.md); toolset rule `47-prisma-multischema-module-schemas.mdc`. Closes RFC-0002 §11.4 first deferral before the July 2026 public seed so external clones never start from a `public.*`-mixed layout. Pre-flip `pg_dump -Fc` backup discipline per runbook §3 (gitignored `backups/`).
- **Week 1 tail (2026-05-28) — OpenAPI alpha partial (F1).** ✅ Done in tree (2026-05-28): committed [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) (~40 paths / 58 operations — canonical modules + rendering + `/health`); `@fastify/swagger` + `fastify-type-provider-zod`; CI `openapi:check`; canonical doc [`API-OPENAPI.md`](API-OPENAPI.md). Full F1 closure grows with PR3 platform/brewery route migration. Recommended pre-flip hygiene item (not flip-blocking — distinct from npm SDK publish batch).
- **Week 2 (2026-05-27 → 2026-06-02) — Docs site (Docusaurus 3.10.x) per [`docs/rfcs/0005-docs-site.md`](rfcs/0005-docs-site.md).** P1–P4 ✅ (2026-05-25). **In tree 2026-05-27:** Umbi branding, lunr local search, `noIndex` + `robots.txt`, DocSearch apply draft ([`docsearch-application-draft.md`](design/docsearch-application-draft.md)), [`rfc-0005-build-log.md`](design/rfc-0005-build-log.md). **Remaining this week / Phase 2:** production deploy to `docs.umbraculum.dev`, Algolia form **submit** (2f), P7 indexing flip at α. RFC-0005 is **Accepted**; `Tier: Public` is load-bearing for published content.
- **Week 3 (2026-06-03 → 2026-06-09) — Org transfer + public-alpha cutover prep + brochure site + marketplace submission.** **Stage 0 ✅ Done 2026-05-27** — transferred to `github.com/umbraculum-dev/umbraculum-dev` (private); git history rewritten via orphan `main` before transfer; commits + tags preserved; sister-repo `github.com/umbraculum-dev/umbraculum-toolset` confirmed org-hosted (private, no transfer needed); org push verified; **`docs-readmes`** Actions workflow green. **Stage 0 remainder:** URL canonicalization ✅ in tree (`package.json` `repository`/`bugs`, [`GETTING-STARTED.md`](GETTING-STARTED.md) clone URL → `umbraculum-dev`). **Stage 1** (pre-flip hygiene scan — git-history secret scan, `.gitignore` audit, Tier-Public/internal link-graph audit, personal-identifier audit — **scoped across both `umbraculum-dev` and the sister-repo `umbraculum-toolset`** (same hygiene gate applies before its visibility flips at Stage 2, and the toolset repo's own LICENSE / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / README parity is audited as part of this scan); plus the docs-only roadmap/RFC update for the July public-alpha window) lands mid-week. **Stage 2** (atomic public-alpha cutover: `umbraculum-dev` visibility → public + `v0.0.1-alpha` tag when hygiene gates pass + **the sister-repo `umbraculum-toolset` visibility → public in the same atomic moment** + **MIT npm SDK publish batch** to the public registry (`@umbraculum/ai-tool-sdk`, `@umbraculum/i18n-keys`, `@umbraculum/module-sdk`, `@umbraculum/<code>-contracts` per [`LICENSING.md`](LICENSING.md) §6.2.1) + `apps/website/` brochure at `umbraculum.dev` via **Cloudflare Pages** + DNS + HTTPS (see [`public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md)) + **submission of the four umbraculum-toolset Cursor plugins to the Cursor marketplace** per [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md)) lands at the end of the week, gated on Stage 1 complete and on Weeks 1–2 above being merged. This brings the public-alpha working assumption forward from the original H1 2027 horizon ([`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1) to **July 2026**.

If Week 1 overruns, Weeks 2–3 slide one-for-one rather than the cadence breaking — RFC-0005 acceptance and the public-alpha cutover both tolerate a 1–2-week slip, and Stage 2 of the org-transfer is independently gated on the brewery-migration slots regardless. The roadmap is updated in-place at each week's close to mark the corresponding entry `✅ Done <date>` with the same discipline used for the foundation-hardening entries below.

**Post-Week-3 tail — public-alpha closure criterion.** The public-alpha procedure is **COMPLETE only when all four umbraculum-toolset plugins are live on the Cursor marketplace** (recorded as the architectural closure criterion in [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1). Marketplace submission happens during the Week 3 cutover-prep window; marketplace approval timing is Cursor-side and may extend the procedure's tail by days to weeks. This approval tail is why the external release window is **July 2026**, not a single June date. Until the listings publish, [`AGENTS.md`](../AGENTS.md)'s apparatus self-check continues to instruct new contributors via the local-install fallback per [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md). When the four listings go live, this tranche is closed end-to-end: the corresponding entry gains its `✅ Done <date>` marker, the install-path canonical-for-now flips from local-from-source to marketplace-first across [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md), [`docs/GETTING-STARTED.md`](GETTING-STARTED.md), and [`AGENTS.md`](../AGENTS.md), and the *post-marketplace-flip*-gated work below ([`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §"Future: minimum-version enforcement" — the `.cursor/required-plugins.json` manifest + the CI parity check + the AGENTS.md version-pinned upgrade) is unblocked.

**Public-alpha support and orientation pages.** Before the public alpha is announced, add or link a public **support / donations** page from the website and docs. **Phase 0 channels** (Liberapay recurring + Buy Me a Coffee one-time; in-kind via forum) are documented in [`donation-channels.md`](design/donation-channels.md); copy and buttons are **shipped in tree** on `/support/`. **Maintainer TODO before flip (roadmap Phase 2 `2d`, priority):** create Liberapay **`Umbraculum`** team + Buy Me a Coffee page, verify URLs, forum pin — **gate for Stage 2** so announcement links do not 404. Principles: [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) §5. Further channels (GitHub Sponsors, Open Collective) require a community vote when runbook triggers fire. In the same public-alpha pass, keep [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) public-ready as the technology recap page and make sure the website/docs navigation links it prominently.

**Public-alpha outbound-delivery clarity.** The public alpha is not blocked on a general email-delivery implementation, but it is blocked on a clear contract that prevents modules and vertical configurations from filling the gap privately. [RFC-0008](rfcs/0008-notifications-outbound-delivery.md) is that contract: email-ready rendering from [RFC-0007](rfcs/0007-canonical-document-rendering.md) means composition only, while SMTP/provider transport, recipient policy, unsubscribe/compliance handling, audit logs, abuse/rate limits, and delivery billing belong to a future horizontal notifications / outbound-delivery service. Until that service lands, `delivery.mode: "email"` remains intentionally disabled and modules may only prepare templates/intents.

**MIT npm SDK packages — publication status (2026-05-29).** The third-party module spine is **on the public npm registry** (batch landed pre–public-alpha flip):

| Package | Landed in repo | On npm registry |
|---------|----------------|-----------------|
| `@umbraculum/ai-tool-sdk` | ✅ 2026-05-21 | ✅ `0.1.0` (2026-05-29) |
| `@umbraculum/i18n-keys` | ✅ 2026-05-27 | ✅ `0.1.0` (2026-05-29) |
| `@umbraculum/module-sdk` | ✅ | ✅ `0.0.1` (2026-05-29) |
| `@umbraculum/automation-contracts` | ✅ | ✅ `0.0.1` (2026-05-29) |
| `@umbraculum/pim-contracts` | ✅ | ✅ `0.0.1` (2026-05-29) |
| `@umbraculum/mrp-contracts` | ✅ | ✅ `0.0.1` (2026-05-29) |
| `@umbraculum/crp-contracts` | ✅ | ✅ `0.0.1` (2026-05-29) |
| `@umbraculum/api-client` | ✅ in monorepo | ❌ deferred post-α (subset split TBD) |

**Ready for external module authors via `npm install`?** **Yes** — pin versions per [`third-party-module.md`](modules/contribute/third-party-module.md). Monorepo contributors still use workspace `file:` links. See [`LICENSING.md`](LICENSING.md) §6.2.1 and [`npm-sdk-publish-execution-plan.md`](design/npm-sdk-publish-execution-plan.md) SP-3.

### H2 2026 — AI consultant hardening and module-pluggable expansion

Goal: harden the shipped v0 AI consultant into the platform's cross-module connective tissue. The backbone is no longer future-state: `/ai/chat`, BYOK Anthropic settings, usage ledger, per-workspace memory, `@umbraculum/ai-tool-sdk`, module-owned AI-tool registration, brewery tools, automation tools, PIM tools, and the platform-owned `render_document` tool all exist. H2 work is about making that surface durable, more module-pluggable, and less brewery-shaped at the prompt/reporting layer.

- **Architecture**: AI platform backbone per `docs/PLATFORM-ARCHITECTURE.md` §4.3 and §5.3 — one orchestrator, one tool registry, module-contributed AI tools via `registerModule({ registerAiTools })`, usage ledger, encrypted BYOK settings, workspace memory, Anthropic-only v0 provider path, and future-ready seams for managed AI.
- **Tools layer first** (`Layer A`): roughly 80% of value, lowest risk. Read-scope, ACL-aware, deterministic domain tools are now contributed by brewery, `automation`, `pim`, `mrp`, and `crp`; `render_document` is the controlled platform write tool that submits rendering jobs rather than mutating domain records.
- **Prompt / knowledge hardening**: move beyond the current brewery-weighted prompt composition toward module overlays, per-route overlays, and knowledge-source registration. This is the next step before MRP/WMS/CRM/CRP add richer cross-module reasoning.
- **Semantic reporting / RAG**: design the typed reporting DSL and full RAG layer so the AI can answer ad-hoc operational questions safely without raw SQL, cross-tenant leakage, or unbounded scans.
- **Managed-AI and provider router**: keep BYOK Anthropic as the shipped v0 path; defer provider routing, managed-AI credits, and add-on billing until BYOK demand validates the product surface.
- **Write-action drafts with human-in-the-loop confirmation** from the first AI feature that touches mutable domain state. No autonomous domain writes in v0 or v1.
- **License + governance** as a parallel track: publish `docs/LICENSING.md` publicly, adopt DCO sign-off on contributions, write the contributor README, and pick the AGPLv3 + MIT SDK split intentionally before the first community contribution arrives (much harder to retrofit after).

**Status snapshot (2026-05-27, updated pre–public-alpha hardening):**

**Shipped at public α (prompt + Layer A):**

- **Module-owned AI-tool registration** — brewery, `automation`, `pim`, `mrp`, and `crp` via `registerModule({ registerAiTools })`; platform `render_document` in API boot.
- **Module-pluggable prompt composition** — `registerModule({ aiPrompts })` with module + route overlays; neutral base prompt; platform overlay; orchestrator composition per [`canonical-ai-prompt-composition-surface.md`](design/canonical-ai-prompt-composition-surface.md).
- **Optional route context** — `routeId` on `POST /ai/chat`; web `?fromRoute=` on `/ai`.
- **Static knowledge snippets** — `aiPrompts.knowledge` (boot-time, capped); not pgvector RAG.
- **BYOK, tier unlock, usage ledger, workspace memory** — unchanged v0 backbone.

**Post-α H2 waves (Aug–Dec 2026 calendar):**

| Wave | Scope | Dependency | Target | Exit criterion | Status |
|------|--------|------------|--------|----------------|--------|
| **A** | Design surfaces (reporting, RAG, propose-write) + ROADMAP | Public α prompts | Aug 2026 | Three `canonical-ai-*` surfaces merged | **Shipped** |
| **B** | MRP/CRP propose-write (human-in-the-loop) | Wave A; read tools | Sep–Oct 2026 | Operator Apply/Dismiss from chat | **Shipped** |
| **C** | Reporting DSL MVP (Layer B) | Wave A; replica RO URL | Oct–Nov 2026 | One bounded analytics question via `platform.reportingQuery` | **Shipped** |
| **D1** | RAG product docs + pgvector | Wave A; compose pgvector | Nov–Dec 2026 | `platform.searchProductDocs` over public help | **Shipped** |
| **D2–D3** | Timeline RAG + memory unify | D1 | H1 2027 | — | **Deferred** |
| **E** | Multi-provider BYOK router | BYOK demand signal | Dec 2026 | Anthropic + OpenAI BYOK selectable | **Shipped** |
| **E-full** | Managed-AI credits + pricebook | `WorkspaceBillingAddon` (priority **7**); [RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md) contract | H1 2027 | Credits + Stripe top-up | **Deferred** |
| **—** | WMS/CRM AI tool bundles | WMS/CRM modules | H2 2027+ | — | **Blocked** |

Surface docs: [`canonical-ai-propose-write-surface.md`](design/canonical-ai-propose-write-surface.md), [`canonical-ai-reporting-dsl-surface.md`](design/canonical-ai-reporting-dsl-surface.md), [`canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md). Build log: [`ai-consultant-post-alpha-h2-build-log.md`](design/ai-consultant-post-alpha-h2-build-log.md).

Already shipped in this phase (recorded in `docs/PLATFORM-ARCHITECTURE.md` §8): BYOK + paid tier unlock, Anthropic-only v0, opt-in workspace enablement, usage ledger, per-workspace memory, module-owned AI-tool registration for shipped domain modules, MRP/CRP read-only planning advisor tools, controlled rendering-job submission through `render_document`, and no net-new Stripe surface for v0 AI.

### H2 2026 — First-class MRP/CRP (alpha) + platform repositioning

**Renamed from:** *H1 2027 — Brewery production planning is promoted to first-class MRP/CRP, and the platform is repositioned* (original calendar). Structural and alpha work accelerated to **May–August 2026**; production-ready / commercial scope stays in [§ H1 2027 mature scope](#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027) below.

**Goal:** realize the [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §1.1 reframe in code (brewery → canonical `mrp` + `crp` modules) and, by July public alpha, in external positioning. Same product, much larger addressable market — but **alpha ≠ mature**: August 2026 is a bounded brewery proof and co-design target, not a ready-to-sell MRP/CRP suite.

**Planning package:** [`mrp-crp-august-2026-co-design-plan.md`](design/mrp-crp-august-2026-co-design-plan.md) · [`canonical-mrp-module-surface.md`](design/canonical-mrp-module-surface.md) · [`canonical-crp-module-surface.md`](design/canonical-crp-module-surface.md) · operator runbook [`mrp-crp-alpha-demo-walkthrough.md`](design/mrp-crp-alpha-demo-walkthrough.md)

**Status snapshot (2026-05-27):** Alpha demo walkthrough is **automatable and ready for a human run**; it is **not alpha-complete** until gap-log sign-off and the TODO items below close.

#### Done (H2 2026 alpha track)

- **Canonical `mrp` + `crp` modules exist** — contracts, Prisma schemas, read-only API routes, module/web registration, L2 isolation tests ([wave 1](design/mrp-crp-wave-1-build-log.md)).
- **Brewery read-time projection** — recipes-as-BOMs, brew-sessions-as-production-orders, vessels-as-resources, session steps as schedule/load/conflicts ([wave 2](design/mrp-crp-wave-2-brewery-projection-build-log.md)).
- **Read-only web UX** — production orders, material requirements, resources, capacity, schedule pages ([wave 3](design/mrp-crp-wave-3-read-only-alpha-experience-build-log.md)).
- **Deterministic proof** — fixture-backed API/UI/E2E for MRP material + CRP capacity/schedule/conflict paths ([wave 4](design/mrp-crp-wave-4-alpha-proof-hardening-build-log.md)).
- **Read-only AI planning advisor** — module-owned MRP/CRP tools over the same read services ([wave 5](design/mrp-crp-wave-5-ai-planning-advisor-build-log.md)); cross-module reasoning with brewery/automation is shipped at the tool layer (prompt hardening is a separate H2 2026 AI-consultant TODO above).
- **RFC-0007 rendering** — eight templates + module render-job routes ([wave 6](design/mrp-crp-wave-6-rendering-templates-build-log.md)).
- **Alpha demo closure (2026-05-27)** — browser async export buttons, full render-job API matrix, Playwright export smoke ([closure log](design/mrp-crp-alpha-demo-closure-build-log.md)).
- **`@brewery/*` → `@umbraculum/*` scope migration** — ✅ 2026-05-19 ([`brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md)).
- **RFC-0002 canonical module layout** — Accepted 2026-05-19; brewery β file-move scheduled in Late H1 2026 Week 1 (see tranche above).
- **`@umbraculum/ai-tool-sdk` carve-out** — ✅ 2026-05-21 in repo; **npm `0.1.0`** 2026-05-29.
- **`@umbraculum/i18n-keys` SDK surface** — ✅ 2026-05-27 in repo; **npm `0.1.0`** 2026-05-29 (`ModuleNavLabelKey` wired into `module-sdk` nav/tab entries; locale content remains in `@umbraculum/i18n`; brewery content split still deferred).
- **Foundation hardening (lint, types, tests, docs)** — ✅ feature-complete May 2026 ([`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md); phase logs in [`LINTING.md`](LINTING.md), [`TYPING.md`](TYPING.md), [`TESTING.md`](TESTING.md)).

#### TODO — what to do next (pair with an agent)

Two phases: **Phase 1** is safe for agents while a maintainer is away (code, docs, CI, static assets). **Phase 2** groups manual / irreversible / human-judgment work for when you are back.

##### Phase 1 — autonomous (agent or CI; no flip credentials)

| # | Item | Status | Why it matters | Entry points |
|---|------|--------|----------------|--------------|
| **1a** | **Brochure site scaffold** (`apps/website/`) + Cloudflare Pages runbook | **Shipped** | Static `umbraculum.dev` marketing shell; deploy in Phase 2 ([`public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md)) | `apps/website/`, `.github/workflows/website-build.yml` |
| **1b** | **RAG D1 ingest wiring** (`rag:ingest`, optional `AI_RAG_INGEST_ON_BOOT`) | **Shipped** | Run `docker compose exec -T api npm run rag:ingest` after migrate | [`canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md) |
| **1c** | **Week 1 closure audit** — route-shape + brewery β file-move | **Verified** (2026-05-27) | `npm run check-web-url-segments` → 0 violations | `scripts/check-web-url-segments.ts`, RFC-0006 |
| **1d** | **Docs-site P5 prep** — DocSearch draft + lunr fallback | **Shipped** | Form answers in [`docsearch-application-draft.md`](design/docsearch-application-draft.md); submit in Phase 2 **2f** | [`rfcs/0005-docs-site.md`](rfcs/0005-docs-site.md) P5, `docs-site/` |
| **1e** | **ROADMAP / architecture hygiene** | **Shipped** (2026-05-27) | Week 2/Stage 0 prose, doc paths, companion audit pointers | This table, [`rfc-0005-build-log.md`](design/rfc-0005-build-log.md) |
| **1f** | **MRP/CRP propose-write — domain apply** | **Deferred H1 2027** | Chat Apply is **preview-only** until MRP PATCH routes exist | [`canonical-ai-propose-write-surface.md`](design/canonical-ai-propose-write-surface.md) |
| **1g** | **Docs-site pre-flip SEO** (`noIndex`, `robots.txt`) | **Shipped** | Flip with Phase 2 **2c** | `docs-site/docusaurus.config.ts`, `static/robots.txt` |
| **1h** | **Support page scaffold** (brochure `/support/`) | **Shipped** | Copy + buttons in tree; **live accounts** → Phase 2 **2d** (before flip) | `apps/website/public/support/`, [`donation-channels.md`](design/donation-channels.md) |
| **1i** | **Stage 1 hygiene checklist** (agent-prepared) | **Shipped** | Maintainer runs sign-off in **2b** | [`public-alpha-preflip-hygiene-checklist.md`](design/public-alpha-preflip-hygiene-checklist.md) |
| **1j** | **Flip announcement + P6 runbook skeletons** | **Shipped** (2026-05-27) | Publish / execute in Phase 2 **2c**–**2d** / first contracts release | [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md), [`docs-site-contracts-versioning-runbook.md`](design/docs-site-contracts-versioning-runbook.md) |
| **1k** | **Flip-day + npm preflight + toolset audit + support copy** | **Shipped** (2026-05-27) | Execute **2c** / **2d**–**2f** / toolset CoC+SECURITY from maintainer docs | [`public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md), [`donation-channels.md`](design/donation-channels.md), [`npm-sdk-publish-preflight.md`](design/npm-sdk-publish-preflight.md), [`toolset-preflip-hygiene-audit-2026-05-27.md`](design/toolset-preflip-hygiene-audit-2026-05-27.md) |

**Phase 1 complete** except **1f** (deferred H1 2027). Remaining work is Phase 2 (manual).

**Priority before flip:** **2d** (donation-channel accounts) should land in the **same window as 2b–2c** and **before** removing brochure `noindex` — public `/support` already links to Liberapay and Buy Me a Coffee; dead links at announcement are worse than no buttons.

##### Phase 2 — manual (group when back; flip week)

| # | Item | Why it matters | Entry points |
|---|------|----------------|--------------|
| **2a** | **Human alpha walkthrough + gap-log sign-off** | Closes MRP/CRP α proof without claiming mature product | [`mrp-crp-alpha-demo-walkthrough.md`](design/mrp-crp-alpha-demo-walkthrough.md) |
| **2b** | **Stage 1 hygiene** — secrets scan, Tier: Public link audit, toolset repo parity | Automated pass 2026-05-27 ([`public-alpha-preflip-hygiene-audit-2026-05-27.md`](design/public-alpha-preflip-hygiene-audit-2026-05-27.md)); maintainer sign-off + toolset + gitleaks remain | [`public-alpha-preflip-hygiene-checklist.md`](design/public-alpha-preflip-hygiene-checklist.md) |
| **2c** | **Stage 2 atomic flip** — repos public, `v0.0.1-alpha`, toolset marketplace submit, **Cloudflare deploy** (remove `noindex`) | July public α; **gate:** **2d** complete so `/support` donation URLs resolve | [`public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md), [`public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md) |
| **2d** | **Donation channel accounts (before flip)** — Liberapay **`Umbraculum`** team + Buy Me a Coffee **`Umbraculum`**; verify live URLs; forum pins: **Community policy**, **Sponsorship channels (Phase 0)**, **How we communicate** (§6.1 — [`community-forum-runbook.md`](design/community-forum-runbook.md) §6 item 5); sign-off §9 | **Priority:** blocks credible `/support` + announcement at flip; ~30–60 min maintainer | [`donation-channels.md`](design/donation-channels.md) §3, §8–§9 |
| **2e** | **Launch comms** — publish announcement; cross-post forum; optional sponsors list seed | After **2c** + **2d** | [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md), flip-day runbook §8 |
| **2f** | **MIT npm SDK publish batch** | **Pre-completed 2026-05-29** (before Stage 2 flip) — registry install live | [`npm-sdk-publish-execution-plan.md`](design/npm-sdk-publish-execution-plan.md), [`LICENSING.md`](LICENSING.md) §6.2.1 |
| **2g** | **DocSearch application submit** (Algolia) | Replaces lunr fallback on docs site | RFC-0005 P5 |
| **2h** | **`WorkspaceBillingAddon` + managed-AI** | Not required for α flip | H1 2027 — **contract ✅ [RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md)**; implementation deferred |
| **2i** | **Tamagui intra-RC bump** | Hygiene | [`TAMAGUI.md`](TAMAGUI.md) |

**Not in this H2 alpha slice:** WMS, native MRP/CRP operator screens, irreversible brewery→MRP schema migration, scheduling optimizer, ready-to-sell commercial MRP/CRP — see [§ H1 2027 mature](#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027) below.

### H1 2027 — Mature MRP/CRP + WMS + commercial scope (deferred from original H1 2027) {#h1-2027--mature-mrp-crp--wms--commercial-scope-deferred-from-original-h1-2027}

Goal: move from **read-only alpha proof** to **production-ready** manufacturing modules and the WMS pairing described in [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §5.2.

- MRP/CRP **write workflows** (UI + API + AI propose/confirm), not only read projections from brewery/automation.
- **WMS** integration — stock-on-hand, receipts/issues reconciling MRP material requirements ([`H2 2027 — WMS`](#h2-2027--wms-as-second-native-mandatory-vertical-federation-decision) is the next native-mandatory vertical).
- **Native** MRP/CRP screens where floor UX research demands them (default remains web-first per standing principles below).
- **Entitlement billing** tied to module add-ons once `WorkspaceBillingAddon` ships.
- **Irreversible** promotion of brewery brew-session/recipe data into MRP-owned tables (alpha stays read-time projection; brewery remains source of truth today).
- **Ready-to-sell** MRP/CRP product depth (optimizers, mature scheduling, multi-vertical configurations beyond brewery proof).

**Foundation hardening — Tamagui RC → stable (ongoing hygiene, not blocking alpha):** On Tamagui v2 RC; committed ladder in [`TAMAGUI.md`](TAMAGUI.md) — **(1)** intra-RC bump experiment scheduled July 2026; **(2)** adopt v2 stable when upstream ships; **(3)** conditional project-local shorthand wrapper only if (1)+(2) leave `apps/web` well above the documented >1000-error trigger.

### H2 2027 — WMS as second native-mandatory vertical; federation decision

Goal: validate the "modules expand by config and SDK, not by core rewrite" promise, and decide native packaging strategy with evidence.

- Spike Re.Pack module federation against the platform shell (expecting roughly 30 months of post-MF-release tooling hardening by this point). Decision gate: if the Expo + Re.Pack story is genuinely smooth, federate WMS as the second native module in the same shell; if not, ship WMS as web + PWA + a thin native scanner companion. Either way, the AI consultant sees both modules.
- Brewery + WMS overlap on tooling, packaging, and AI tool registry — the strongest test of whether the platform shape genuinely supports multi-module operation or whether brewery still leaks across boundaries.
- First third-party-built vertical configuration accepted (likely distillery or kombucha) — the proof that the SDK is a public contract, not a private convention.

### 2028 and beyond — CRM, additional vertical configurations, foundation question

- CRM module: native-shipped only if customer ICP demand justifies it; otherwise web-only with PWA on mobile. The decision depends on the segment we actually win, not on hopes.
- Additional operational and manufacturing vertical configurations onboarded primarily through **configuration and seed data**, not code (food, cosmetics, supplements, fragrance, fine chemical batch, quality assurance).
- Ecommerce surfaces (if pursued) are explicitly **separate apps** — different audience (shopper vs operator), different ASO, different auth model. Not added to the workspace-member app shell. Out of scope for this roadmap.
- Foundation transfer question (`docs/PLATFORM-ARCHITECTURE.md` §10.1) reopened with evidence: by this point the project either has a community large enough that foundation governance is a meaningful upgrade, or it does not, and the decision becomes much easier than speculating about it now.

### Standing principles across the whole trajectory

- **Project values are versioned alongside the architecture.** [`MANIFESTO.md`](../MANIFESTO.md) carries the explicit commitments — Total Quality with capital Q (§1.1), AI-orchestrated code as discipline (§1.2), sustainability for the *whole ecosystem* (§2.1), horizontal accessibility (§2.2), and the §3 human-values commitments (empathy, family-friendly schedules, welcomed unionism, explicit inclusivity). The roadmap milestones below are how those commitments land in calendar time; the manifesto is why the milestones are shaped the way they are. The public flip (§10.1.1) is the manifesto's first public-launch occasion.
- **Web-first for the heavy desktop workflows.** Native apps exist only where workflows are intrinsically mobile (offline operation, BLE, scanning, push notifications, on-the-floor input).
- **One audience per app.** Workspace-member modules share one shell. Shopper-facing surfaces (if any) are separate apps.
- **AI consultant is the cross-module connective tissue.** The architectural and economic case for one shell over a "myriad of apps" rests on the AI seeing all modules in one workspace context.
- **No retroactive license changes.** Anything committed under AGPLv3 stays AGPLv3 (`docs/LICENSING.md` §9–10).
- **Invest in foundations alongside features, not at the end.** Lint, type safety, test coverage, and developer-facing documentation compound — every bit of foundation paid down now makes every future feature cheaper and safer. The opposite — accumulating debt until "later" — never goes well. Living foundation docs: `docs/LINTING.md`, `docs/TAMAGUI.md`, `docs/TESTING.md`, `docs/DEVELOPMENT-ACCESSIBILITY.md`.
- **Tamagui for product UI; static brochure until triggers.** Tamagui (`@umbraculum/ui`, `apps/web`, `apps/native`) is the **go-to** cross-platform UI stack — do not substitute another component library for operational app surfaces without an RFC. The **umbraculum.dev brochure** (`apps/website/`) stays static HTML/CSS by design; that is not an alternative UI philosophy. Re-open a Tamagui-based brochure only when explicit triggers in [`TAMAGUI.md`](TAMAGUI.md) §"UI stack choice — product vs public surfaces" fire (page count, live product embeds, shell parity, token drift). Docs site remains Docusaurus.
- **RFC companion documentation quality (2026-05-27, docs-only, non-blocking for July alpha code paths).** Accepted RFCs are paired with surface/audit/build-log artifacts per [`docs/rfcs/README.md`](rfcs/README.md) §5 and the living matrix [`docs/design/rfc-companion-documentation-audit.md`](design/rfc-companion-documentation-audit.md). P0 horizontal surfaces shipped: [`canonical-document-rendering-surface.md`](design/canonical-document-rendering-surface.md) (RFC-0007) and [`canonical-notifications-outbound-delivery-surface.md`](design/canonical-notifications-outbound-delivery-surface.md) (RFC-0008 boundary, transport deferred). Plan citation template: [`plan-documentation-context-template.md`](design/plan-documentation-context-template.md). Optional CI: `scripts/docs/check-rfc-companion-links.py` (blocking gate deferred per audit P2). Toolset rules `48-rfc-companion-documentation-gate.mdc` and `49-plan-documentation-context.mdc` in the umbraculum-toolset sister-repo reduce agent/human drift on RFC-0007/0008 boundaries.
- **The tone of this roadmap is honest commitment, not aspiration.** If a phase moves, the doc moves. If the underlying assumptions change, the trajectory changes openly via the same RFC process used for governance changes (`docs/LICENSING.md` §10).

## UI pillars

The v0 UI is organized around three pillars:
1) Dashboard with simple navigation
2) Recipe editor (complex)
3) Water calculator / mash chemistry (complex)

## Agreed UI/UX decisions (important)

### Navigation (web)
- **Primary nav only** (no extra row of big buttons).
- **Dashboard** is the first/left-most nav item.
- Mobile-friendly by default (nav collapses later, but IA should not change).

### Recipe editing (v0)
- Single edit route with a left-side section list (in-page nav).
- Sections (initial):
  - Basics
  - Fermentables
  - Hops
  - Yeast (may start stubbed)
  - Other ingredients
  - Notes
  - Water chemistry (link-out)

### Water calculator
- Water calculator has its **own page** and is considered part of the recipe.
- The recipe editor should **not** embed the full water calculator; water chemistry in recipe edit is a link to the full calculator.
- UI preference: **dark grey background** (Cursor-like) is desired for recipe + water calculator UIs, **as long as** accessibility constraints are met.

### Recipe import/export (v1)
- Import/export actions live under **Recipes** (not the Dashboard).
- Import UX is split into:
  - **Import single recipe**: user selects a style (default Custom).
  - **Bulk import**: multi-recipe files; style is auto-matched to **BJCP 2021** (name-first, then code), else Custom.
- Export uses **strict BeerJSON** for interoperability (internal addition row `id` fields are stripped).

### Offline-forward constraint (future)
Even though v0 is server-backed, we want to design pages so we can later support offline drafts:
- Each page can maintain a clear “draft saved” model (local-first draft state, explicit save events).
- Avoid duplicated editable sources of truth (aligns with the architecture doc).

## Data prerequisites: seedable raw materials DB

To make recipes and water chemistry usable, we need canonical datasets for:
- Fermentables (malts, sugars, extracts, adjuncts)
- Hops
- Yeast (soon)
- Salts + acids for water correction (curated, small set)
- Water profiles (optional seed)

Approach (agreed direction):
- Start with **BeerProto dataset (MIT)** as the base seed where applicable.
- Preserve provenance for all imported records (source name/url/license/retrieved_at/source_key/raw payload).
- Use a crosswalk table (`ingredient_source_map`) so we can enrich from other sources later without losing traceability.
- Treat non-clear licensing sources as reference-only until confirmed.

