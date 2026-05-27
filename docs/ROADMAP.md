# Roadmap (living)

**Tier:** Public

This roadmap captures the agreed “direction of travel” for the product so implementation stays coherent and we avoid rework.

## Big picture

- Platform vision (horizontal-platform-with-vertical-modules + AI consultant + add-on pricing): `docs/PLATFORM-ARCHITECTURE.md`
- Licensing posture and rationale (AGPLv3 core + MIT SDK + commercial dual license): `docs/LICENSING.md`
- Source of truth (brewery-vertical implementation log): `docs/ARCHITECTURE-REV02.md`
- Accessibility hard constraint: `docs/DEVELOPMENT-ACCESSIBILITY.md`
- Seed data sources + licensing notes: `docs/modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md`
- Full doc index: `docs/README.md`

## Trajectory (12–30 months)

This is the agreed direction of travel at the platform level. It is intentionally short on implementation detail and long on sequencing — implementation specifics land in domain docs and per-quarter planning. The trajectory exists to keep parallel work coherent and to make explicit which decisions need to happen *before* the second vertical lands.

### Late H1 / July 2026 — public-alpha preparation and release tranche

Goal: land three load-bearing, mostly-independent slices in a one-per-week cadence so the project is structurally and operationally ready for the H2 2026 AI-consultant work and for a **July 2026 public alpha** (brought forward from the original H1 2027 horizon). June remains the preparation / earliest cutover / marketplace-submission window; July is the realistic external release window because plugin-marketplace approval, DNS propagation, and final publication checks can tail beyond the cutover day. The order is intentional — internal-architectural first, then publication-infrastructure, then external/irreversible — so each week's output unblocks the next.

- **Week 1 (2026-05-20 → 2026-05-26) — Web route shape audit + brewery file-move acceleration.** Commits the β-discipline filesystem-axis route groups (`(<code>)/` with NO group-root `page.tsx` and NO group-root dynamic segment), the full URL-segment registry in `@umbraculum/module-sdk` + CI collision check (`scripts/check-web-url-segments.ts`), the `RouteId` growth in `@umbraculum/navigation`, the `(automation)/` and new `(pim)/` refactors, the brewery API/web/native file-move tranche (~14 API routes → `services/api/src/modules/brewery/routes/`, 6 web segments → `apps/web/app/[locale]/(brewery)/`, ~6–10 native screens → `apps/native/src/modules/brewery/`), the matching Cursor plugin rule (`46-web-route-shape.mdc` in `umbraculum-platform-tsjs-cursor-assistant`), and a successor RFC amending [`docs/rfcs/0002-canonical-module-physical-layout.md`](rfcs/0002-canonical-module-physical-layout.md) Decision D to record the brewery file-move acceleration. Pulls the brewery file-move from its original H1 2027 slot into this week — RFC-0002 D contemplated this trajectory; the new collision-check infrastructure makes it cheap to land now alongside the route-shape audit. URLs are preserved end-to-end (β semantics for brewery; `/automation/*` becomes the canonically-named `/vessels/*`; PIM gains `/products/*`, `/categories`, `/attribute-sets/*` in place of the legacy `/pim/*` prefix). Plan internal estimate: 14–18 days in a single PR; the one-week budget trades calendar surface for focused execution.
- **Week 2 (2026-05-27 → 2026-06-02) — Docs site (Docusaurus 3.10.x) per [`docs/rfcs/0005-docs-site.md`](rfcs/0005-docs-site.md).** Scaffolds `docs-site/` as a new top-level monorepo workspace, ships v1 at the canonical `docs.umbraculum.dev` rendering every `Tier: Public` doc + all 16 per-workspace READMEs + the accepted RFCs, lands the build CI gate (`.github/workflows/docs-site-build.yml`), enables every available v4 future flag from day 1 (so the v3 → v4 bump becomes a near-zero-diff maintenance task), and submits the Algolia DocSearch application with the lunr.js `@easyops-cn/docusaurus-search-local` plugin as the in-the-meantime fallback. The site may stay live under `noindex`/`robots.txt` until the July public-alpha release is declared per RFC-0005 §14 P7. RFC-0005 moves from `WIP draft` to `Accepted` with this week's work; the `Tier: Public` marker becomes load-bearing (it becomes the mechanical filter the build uses to decide what to publish). Active engineering effort per RFC-0005 §14: ~3 days before the DocSearch-application waiting window — well-sized for the one-week budget.
- **Week 3 (2026-06-03 → 2026-06-09) — Org transfer + public-alpha cutover prep + brochure site + marketplace submission.** Stage 0 (transfer `github.com/rfumb/umbraculum-dev` → `github.com/umbraculum-dev/umbraculum-dev`, stay private; audit-only confirmation that the sister-repo `github.com/umbraculum-dev/umbraculum-toolset` — which hosts the four Cursor plugins submitted to the marketplace in Stage 2 — is already hosted under the `umbraculum-dev` GitHub org (no transfer needed; the toolset repo was created directly under the org, only its visibility flip remains and is paired with Stage 2 below); URL-canonicalization PR touching `package.json` + `docs/LINTING.md`) lands at the top of the week. Stage 1 (pre-flip hygiene scan — git-history secret scan, `.gitignore` audit, Tier-Public/internal link-graph audit, personal-identifier audit — **scoped across both `umbraculum-dev` and the sister-repo `umbraculum-toolset`** (the latter already under the `umbraculum-dev` GitHub org but currently private; same hygiene gate applies before its visibility flips at Stage 2, and the toolset repo's own LICENSE / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / README parity is audited as part of this scan); plus the docs-only roadmap/RFC update for the July public-alpha window; new `docs/WEBSITE.md` committing the static-React + GH Pages decision) lands mid-week. Stage 2 (atomic public-alpha cutover preparation: `umbraculum-dev` visibility → public + `v0.0.1-alpha` tag on the migration-complete commit when the hygiene gates pass + **the sister-repo `umbraculum-toolset` visibility → public in the same atomic moment** (prerequisite for both the local-install fallback URL in [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §Install resolving for new contributors, and for the four marketplace listings' source-code pointers below) + `apps/website/` brochure-site at `umbraculum.dev` via Next.js 15 static export on GitHub Pages + DNS at registrar + Pages custom domain + HTTPS enforcement + **submission of the four umbraculum-toolset Cursor plugins to the Cursor marketplace** per [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §Install — `umbraculum-toolset-common`, `umbraculum-node-react-cursor-assistant`, `umbraculum-platform-tsjs-cursor-assistant`, `rf-magento-cursor-assistant`) lands at the end of the week, gated on slots 6–14 of [`docs/design/brewery-scope-migration-per-package-handoff.md`](design/brewery-scope-migration-per-package-handoff.md) being complete and on Weeks 1–2 above being merged. This brings the public-alpha working assumption forward from the original H1 2027 horizon ([`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1) to **July 2026** — the foundation-hardening pass, the docs site, the canonical module layout, the umbraculum-scoped packages, RFC-0007 rendering, and the AGPLv3+MIT-SDK license posture are all in place by then, so the flip's original "H1 2027 set of prerequisites" is satisfied ~6 months early.

If Week 1 overruns, Weeks 2–3 slide one-for-one rather than the cadence breaking — RFC-0005 acceptance and the public-alpha cutover both tolerate a 1–2-week slip, and Stage 2 of the org-transfer is independently gated on the brewery-migration slots regardless. The roadmap is updated in-place at each week's close to mark the corresponding entry `✅ Done <date>` with the same discipline used for the foundation-hardening entries below.

**Post-Week-3 tail — public-alpha closure criterion.** The public-alpha procedure is **COMPLETE only when all four umbraculum-toolset plugins are live on the Cursor marketplace** (recorded as the architectural closure criterion in [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1). Marketplace submission happens during the Week 3 cutover-prep window; marketplace approval timing is Cursor-side and may extend the procedure's tail by days to weeks. This approval tail is why the external release window is **July 2026**, not a single June date. Until the listings publish, [`AGENTS.md`](../AGENTS.md)'s apparatus self-check continues to instruct new contributors via the local-install fallback per [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md). When the four listings go live, this tranche is closed end-to-end: the corresponding entry gains its `✅ Done <date>` marker, the install-path canonical-for-now flips from local-from-source to marketplace-first across [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md), [`docs/GETTING-STARTED.md`](GETTING-STARTED.md), and [`AGENTS.md`](../AGENTS.md), and the *post-marketplace-flip*-gated work below ([`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §"Future: minimum-version enforcement" — the `.cursor/required-plugins.json` manifest + the CI parity check + the AGENTS.md version-pinned upgrade) is unblocked.

**Public-alpha support and orientation pages.** Before the public alpha is announced, add or link a public **support / donations** page from the website and docs. The exact mechanism is deliberately deferred until after the alpha-release discussion (GitHub Sponsors, Open Collective, direct donation link, or another route), but the page must make the principle from [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) §5 clear: small donations are welcome to improve the core and help carry AI-compute / maintainer-time / infrastructure costs, while never buying priority, vote weight, or governance rights. In the same public-alpha pass, keep [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) public-ready as the technology recap page and make sure the website/docs navigation links it prominently.

**Public-alpha outbound-delivery clarity.** The public alpha is not blocked on a general email-delivery implementation, but it is blocked on a clear contract that prevents modules and vertical configurations from filling the gap privately. [RFC-0008](rfcs/0008-notifications-outbound-delivery.md) is that contract: email-ready rendering from [RFC-0007](rfcs/0007-canonical-document-rendering.md) means composition only, while SMTP/provider transport, recipient policy, unsubscribe/compliance handling, audit logs, abuse/rate limits, and delivery billing belong to a future horizontal notifications / outbound-delivery service. Until that service lands, `delivery.mode: "email"` remains intentionally disabled and modules may only prepare templates/intents.

**MIT npm SDK packages — publication status (2026-05-27).** The third-party module spine is **source-ready in the monorepo** but **not npm-registry-ready**:

| Package | Landed in repo | On npm registry |
|---------|----------------|-----------------|
| `@umbraculum/ai-tool-sdk` | ✅ 2026-05-21 | ❌ deferred → July 2026 α |
| `@umbraculum/i18n-keys` | ✅ 2026-05-27 | ❌ deferred → July 2026 α |
| `@umbraculum/module-sdk` | ✅ (depends on both leaves via workspace `file:`) | ❌ deferred → July 2026 α |
| `@umbraculum/<code>-contracts` | ✅ per canonical | ❌ same batch |
| `@umbraculum/api-client` | ✅ in monorepo | ❌ deferred post-α (subset split TBD) |

**Ready for external module authors via `npm install`?** **Not yet** — use monorepo workspaces / `file:` until the cutover checklist in [`LICENSING.md`](LICENSING.md) §6.2.1 completes. **Ready for in-repo and public-source contributors?** **Yes** — packages build, test, and document the MIT contract. Publish is tracked as roadmap priority **6** and pre-flip checklist item **6** in [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1.

### H2 2026 — AI consultant hardening and module-pluggable expansion

Goal: harden the shipped v0 AI consultant into the platform's cross-module connective tissue. The backbone is no longer future-state: `/ai/chat`, BYOK Anthropic settings, usage ledger, per-workspace memory, `@umbraculum/ai-tool-sdk`, module-owned AI-tool registration, brewery tools, automation tools, PIM tools, and the platform-owned `render_document` tool all exist. H2 work is about making that surface durable, more module-pluggable, and less brewery-shaped at the prompt/reporting layer.

- **Architecture**: AI platform backbone per `docs/PLATFORM-ARCHITECTURE.md` §4.3 and §5.3 — one orchestrator, one tool registry, module-contributed AI tools via `registerModule({ registerAiTools })`, usage ledger, encrypted BYOK settings, workspace memory, Anthropic-only v0 provider path, and future-ready seams for managed AI.
- **Tools layer first** (`Layer A`): roughly 80% of value, lowest risk. Read-scope, ACL-aware, deterministic domain tools are now contributed by brewery, `automation`, `pim`, `mrp`, and `crp`; `render_document` is the controlled platform write tool that submits rendering jobs rather than mutating domain records.
- **Prompt / knowledge hardening**: move beyond the current brewery-weighted prompt composition toward module overlays, per-route overlays, and knowledge-source registration. This is the next step before MRP/WMS/CRM/CRP add richer cross-module reasoning.
- **Semantic reporting / RAG**: design the typed reporting DSL and full RAG layer so the AI can answer ad-hoc operational questions safely without raw SQL, cross-tenant leakage, or unbounded scans.
- **Managed-AI and provider router**: keep BYOK Anthropic as the shipped v0 path; defer provider routing, managed-AI credits, and add-on billing until BYOK demand validates the product surface.
- **Write-action drafts with human-in-the-loop confirmation** from the first AI feature that touches mutable domain state. No autonomous domain writes in v0 or v1.
- **License + governance** as a parallel track: publish `docs/LICENSING.md` publicly, adopt DCO sign-off on contributions, write the contributor README, and pick the AGPLv3 + MIT SDK split intentionally before the first community contribution arrives (much harder to retrofit after).

**Status snapshot (2026-05-27):**

- **Done — module-owned AI-tool registration.** The shipped domain tools for brewery, `automation`, `pim`, `mrp`, and `crp` now register through `registerModule({ registerAiTools })`, and API boot composes those module-owned registrars into the single platform AI registry. The horizontal `render_document` tool remains platform-owned in the API boot path, preserving the distinction between module-contributed domain tools and cross-cutting platform services.
- **TODO — prompt / knowledge hardening.** Module overlays, per-route overlays, and knowledge-source registration are still future work.
- **TODO — semantic reporting / RAG.** Typed reporting DSL, curated reporting views, full product-doc / timeline RAG, and pgvector-backed retrieval remain unshipped.
- **TODO — managed-AI and provider router.** BYOK Anthropic is the shipped v0 path; provider routing, managed-AI credits, pricebook, and add-on billing remain deferred.
- **TODO — future module expansion.** WMS/CRM tool bundles and richer cross-module reporting/RAG are still tied to later module milestones. MRP/CRP Waves 5–6 shipped read-only advisor tools, RFC-0007 rendering templates, and alpha-demo browser exports (operator runbook + full render-job CI); propose/write tools and human walkthrough gap-log sign-off remain future work.

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
- **`@umbraculum/ai-tool-sdk` carve-out** — ✅ 2026-05-21 (workspace-only; npm publish deferred to July public alpha).
- **`@umbraculum/i18n-keys` SDK surface** — ✅ 2026-05-27 (greenfield conventions package; `ModuleNavLabelKey` wired into `module-sdk` nav/tab entries; locale content remains in `@umbraculum/i18n`; brewery content split still deferred; **npm publish deferred to July public alpha** — see [`LICENSING.md`](LICENSING.md) §6.2.1 and the tranche table above).
- **Foundation hardening (lint, types, tests, docs)** — ✅ feature-complete May 2026 ([`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md); phase logs in [`LINTING.md`](LINTING.md), [`TYPING.md`](TYPING.md), [`TESTING.md`](TESTING.md)).

#### TODO — what to do next (pair with an agent)

Ordered for typical execution; pick the row that matches what you want this week.

| Priority | Item | Why it matters | Primary docs / entry points |
|---|---|---|---|
| **1** | **Human alpha walkthrough + gap-log sign-off** | Closes "alpha proof" without claiming mature product | [`mrp-crp-alpha-demo-walkthrough.md`](design/mrp-crp-alpha-demo-walkthrough.md) |
| **2** | **Late H1 2026 Week 1** — brewery file-move + route-shape audit | Unblocks canonical layout parity with `mrp`/`pim`/`automation` | [Late H1 / July 2026 tranche](#late-h1--july-2026--public-alpha-preparation-and-release-tranche) above |
| **3** | **Weeks 2–3** — docs site + July public-alpha cutover | External flip, marketplace plugins, brochure site | [`rfcs/0005-docs-site.md`](rfcs/0005-docs-site.md), [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 |
| **4** | **MRP/CRP propose/write AI tools** (human-in-the-loop) | First mutable-domain AI surface; read-only advisor is not enough for scheduling edits | [`canonical-mrp-module-surface.md`](design/canonical-mrp-module-surface.md), [`AI-CONSULTANT.md`](AI-CONSULTANT.md) |
| **5** | **Platform repositioning on public surfaces** | Marketing site, docs copy, App Store framing as workspace-shaped toolset (not "brewery app only") | [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §1.1, Week 3 `apps/website/` |
| **6** | **MIT npm SDK publish batch** (`module-sdk`, `ai-tool-sdk`, `i18n-keys`, `<code>-contracts`) | Registry install for out-of-repo module authors; in-repo source is ready | [`LICENSING.md`](LICENSING.md) §6.2.1, [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 checklist **6** |
| **7** | **`WorkspaceBillingAddon` + Stripe + RevenueCat** | Per-module entitlements + optional managed-AI credits | [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) billing sections |
| **8** | **Tamagui intra-RC bump experiment** (July) | Scheduled hygiene before long-term RC drift | [`TAMAGUI.md`](TAMAGUI.md) |

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

