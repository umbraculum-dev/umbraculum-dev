# Umbraculum documentation

**Tier:** Public

This folder is the canonical reference set for the Umbraculum platform. It is structured so that anyone — a new contributor, a self-hoster, a hosted-service customer, or a future maintainer — can find what they need without reading the whole repository.

Documents are grouped by **purpose**, not by physical location. Most files sit at the top level — they have not been moved into per-purpose subfolders in order to keep cross-links inside the existing codebase stable; this index provides the navigation. The exceptions are `integrations/`, `figma/`, `calculators/` (pre-existing per-asset folders), `archive/` (superseded revisions), and `help/` (end-user / operator help, currently empty placeholder).

> **Brand resolution.** The project's brand was previously tracked via the `<PLATFORM_NAME>` placeholder convention, resolved on 2026-05-18 to **Umbraculum** (wordmark), `umbraculum` (namespace across npm / Composer / PyPI / crates.io / Docker Hub), `umbraculum.dev` (primary domain), and `umbraculum-dev` (GitHub org). See [`RENAME-DILIGENCE.md`](RENAME-DILIGENCE.md) for the full diligence record. Historical token references in this and sibling docs have been substituted in-place.

> **Audience tier.** All documents in this folder are **Tier: Public** by default — written to be surfaceable when the repository flips public. The first content line of each doc carries an explicit `**Tier:** Public` marker for clarity. Other tier values reserved for future use: `Partner-restricted`, `Customer-restricted`. Documentation that is not public-tier lives outside this folder and outside any public-mirror flip; it is intentionally not indexed here.

---

## Start here

If you are new to the project, read these three documents in order:

1. [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — the **vision and shape**: horizontal platform with vertical modules, AI consultant blueprint, BYOK + paid tier unlock, and the future managed-AI path.
2. [`ROADMAP.md`](ROADMAP.md) — the **direction of travel**: what is shipped, what is next, the 12–30 month trajectory.
3. [`LICENSING.md`](LICENSING.md) — the **licensing posture and reasoning**: AGPLv3 core + MIT SDK, commercial dual license, and what these choices imply for contributors, self-hosters, module developers, and enterprises.

The brewery-vertical implementation log lives in [`architecture-Rev02.md`](architecture-Rev02.md) — that is the source of truth for *what is wired up today* in the brewery vertical, and complements the platform-wide perspective above.

---

## Vision & strategy

*Audience: technical decision-makers, platform evaluators, future module developers.*

The high-level direction, business model, and license posture.

- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — Platform vision, AI consultant, distribution model.
- [`ROADMAP.md`](ROADMAP.md) — Living roadmap with 12–30 month trajectory.
- [`LICENSING.md`](LICENSING.md) — Licensing rationale (AGPLv3 + MIT SDK, dual license, RFC change process).
- [`TIER-PRICING-ANALYSIS.md`](TIER-PRICING-ANALYSIS.md) — Base subscription tiers and pricing analysis (the current AI tier unlock and future managed-AI overlay are described in `PLATFORM-ARCHITECTURE.md` §7).

## Modules ecosystem

*Audience: anyone evaluating, contributing to, or building on top of the module set — the analog of `drupal.org/project/project_module` for Umbraculum.*

- [`MODULES.md`](MODULES.md) — **entry point for the module ecosystem.** Vocabulary (`package` vs `canonical module` vs `vertical configuration` vs `reserved canonical code` vs `module SDK`), the catalog (canonical modules + vertical configurations + horizontal packages), the "I want to build a ___" decision tree, and a worked example.
- [`modules/`](modules/) — per-module pages linked from `MODULES.md` (one page per canonical module / vertical configuration as each ships; today: `modules/canonical/automation.md`).

## Stack & dependencies

*Audience: evaluators, future maintainers, partners — anyone who wants to know **what** the platform is built on and **why** each open-source choice was made.*

- [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) — **per-dependency rationale.** Exhaustive companion to [`MANIFESTO.md`](../MANIFESTO.md) §1.4: for every load-bearing dependency (OS, runtime, data layer, backend, frontend web + native, validation, tests, lint, industrial automation, build, brewery-domain, docs/CI), answers three questions — role in the discipline-apparatus, why this over the proprietary alternative, what shrinks if swapped for closed source. Includes the single closed-source exception (Cursor itself) and the posture toward it.

## Governance (RFCs)

*Audience: contributors, module developers, platform evaluators.*

Public architectural and governance commitments. Process: [`LICENSING.md`](LICENSING.md) §10.

- [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) — Canonical-module rule, reserved codes, tier model, governance, consumption contract, automation placement (Accepted 2026-05-18).
- [`rfcs/0002-canonical-module-physical-layout.md`](rfcs/0002-canonical-module-physical-layout.md) — Physical layout (β three-tree), naming conventions, `module-sdk` location, H1 2027 migration sequencing (Accepted 2026-05-19).

## Design (pre-RFC / follow-on)

*Audience: core team, module authors implementing RFC decisions.*

- [`design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) — Canonical `automation` module surface (RFC-0001 Decision E §7.2): adapter SDK, Vessel vs EquipmentProfile, OpenPLC seam, AI tools, tier limits (**Accepted design** 2026-05-19; implementation phased per doc §9).
- [`design/openplc-mailbox-emitter-pr-shape.md`](design/openplc-mailbox-emitter-pr-shape.md) — sister-repo PR shape for the mailbox-artifact emitter (Phase A step 4 hand-off; pairs with [`packages/automation-contracts/`](../packages/automation-contracts/)).

## Product

*Audience: product readers, evaluators, hosted-service operators.*

User-facing product surfaces and operational concerns at the product level.

- [`ROLLOUT.md`](ROLLOUT.md) — Rollout plan and staged-launch notes.
- [`SEO.md`](SEO.md) — SEO posture for the marketing/public surfaces.
- [`agentic-jobs.md`](agentic-jobs.md) — Agentic / scheduled-job notes.

## Architecture — platform-wide

*Audience: contributors, self-hosting operators, module developers.*

Cross-cutting architectural decisions that apply to every module.

- [`architecture-Rev02.md`](architecture-Rev02.md) — Brewery-vertical implementation log and cross-platform (web + native) boundary decisions. The current source of truth for "what is wired up". (Historical versions: [`archive/architecture-Rev00.md`](archive/architecture-Rev00.md), [`archive/architecture-Rev01.md`](archive/architecture-Rev01.md).)
- [`NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md) — Native strategy and CI pipeline notes.
- [`REACT-NATIVE-KICKOFF-READINESS.md`](REACT-NATIVE-KICKOFF-READINESS.md) — Readiness criteria for the React Native kickoff.

## Architecture — auth & security

*Audience: contributors, self-hosting operators, module developers.*

- [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) — Authentication strategy (cookie web + bearer native + webview bridge).
- [`AUTH-HARDENING-ASSESSMENT.md`](AUTH-HARDENING-ASSESSMENT.md) — Hardening review and findings.
- [`AUTH-QA.md`](AUTH-QA.md) — Auth QA notes.

## Architecture — data & infrastructure

*Audience: contributors, self-hosting operators, module developers.*

- [`postgres-replication-architecture.md`](postgres-replication-architecture.md) — Postgres primary + replica architecture.
- [`DB-REPLICATION-AND-ROUTING-VERIFICATION.md`](DB-REPLICATION-AND-ROUTING-VERIFICATION.md) — Replication and read-routing verification.
- [`PGPOOL-VERIFICATION.md`](PGPOOL-VERIFICATION.md) — pgpool-II verification steps.
- [`Redis-architecture.md`](Redis-architecture.md) — Redis usage, key namespaces, caching pattern.

## Architecture — billing

*Audience: contributors, hosted-service operators.*

- [`org-billing-stripe-revenuecat-fastify.md`](org-billing-stripe-revenuecat-fastify.md) — Stripe + RevenueCat + Fastify billing source-of-truth design.

## Domain — brewery vertical

*Audience: brewery-vertical contributors and operators. These will move into a `brewery/` module documentation set at the H1 2027 platform reframe per [`ROADMAP.md`](ROADMAP.md); until then they live here.*

Brewery-specific modeling, data formats, and analytical models.

- [`BEERJSON-FIRST.md`](BEERJSON-FIRST.md) — BeerJSON-first data model and strict export discipline.
- [`EQUIPMENT-AND-GRAVITY-ANALYSIS.md`](EQUIPMENT-AND-GRAVITY-ANALYSIS.md) — Equipment + gravity analysis (efficiency, losses, yields).
- [`WATER-CHEM-MASH-PH-MODEL.md`](WATER-CHEM-MASH-PH-MODEL.md) — Water chemistry and mash pH model.
- [`YEAST-MATH.md`](YEAST-MATH.md) — Yeast pitching and propagation math.
- [`RAW-MATERIALS-SEEDABLE-SOURCES.md`](RAW-MATERIALS-SEEDABLE-SOURCES.md) — Seed data sources and licensing notes for raw materials.

## Engineering — development

*Audience: contributors only.*

Day-to-day engineering conventions and runbooks.

- [`GETTING-STARTED.md`](GETTING-STARTED.md) — **First-time contributor tutorial.** Linear walkthrough from "Ubuntu laptop, nothing installed" to "first commit landing with the apparatus running". Targets the [`MANIFESTO.md`](../MANIFESTO.md) §1.4 gap directly. Read this if you have never opened the repo before.
- [`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) — Synthesis layer for the four-slice foundation-hardening pass (lint + types + tests + docs) plus the orthogonal validation axis. Single entry point for the bird's-eye narrative; per-slice docs below remain the sources of truth. Includes the plugin-pack handoff manifest (slice → rule/skill/subagent mapping).
- [`CODING-STANDARDS.md`](CODING-STANDARDS.md) — Coding standards (TypeScript, conventions, file layout).
- [`LINTING.md`](LINTING.md) — ESLint setup, scope tiers (HIGH-light → HIGH-staged → HIGH-full), value/cost analysis, and how to extend the strict gate.
- [`TYPING.md`](TYPING.md) — TypeScript strict-flag rollout, per-workspace `tsc --noEmit` baseline + canonical measurement methodology, the 6 candidate stricter flags + their rollout state, and the per-workspace CI typecheck gate.
- [`TAMAGUI.md`](TAMAGUI.md) — Tamagui type-system caveats, our adaptation strategy, and what to watch upstream.
- [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) — Why `packages/contracts` uses hand-rolled validators today, candidate libraries (Zod, Valibot, TypeBox), trigger criteria for revisiting, and migration mechanics if we go.
- [`TESTING.md`](TESTING.md) — Test layers, frameworks, conventions; see also the `Tests must follow code changes` rule in `.cursor/rules/`.
- [`DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) — Module-level README standard (template + audit checklist) and the structural CI gate (`scripts/docs/check-readmes.py` + `.github/workflows/docs-readmes.yml`).
- [`DEVELOPMENT-ACCESSIBILITY.md`](DEVELOPMENT-ACCESSIBILITY.md) — Accessibility constraints (hard requirements).
- [`DEVELOPMENT-NATIVE-LOCAL.md`](DEVELOPMENT-NATIVE-LOCAL.md) — Local development for the native app.
- [`I18N-AUDIT.md`](I18N-AUDIT.md) — Internationalization audit and guardrails.

## Help & guides (operator-facing)

*Audience: workspace members and admins using the app's UI to perform operational work, regardless of whether their workspace is on free, paid, or self-hosted infrastructure.*

- [`help/`](help/) — End-user / operator help documentation. Currently empty placeholder; content lands here as the brewery vertical UI matures and as additional vertical configurations land.

## Integrations

*Audience: integration developers, hardware vendors, module developers.*

Per-integration design notes.

- [`integrations/INTEGRATION-TOKENS.md`](integrations/INTEGRATION-TOKENS.md) — Integration token model.
- [`integrations/TILT.md`](integrations/TILT.md) — Tilt hydrometer integration.
- [`integrations/FLOATING-HYDROMETERS.md`](integrations/FLOATING-HYDROMETERS.md) — Floating hydrometer family.

## Design assets

*Audience: contributors, designers.*

- [`figma/`](figma/) — Figma exports for the three UI pillars (dashboard, edit-recipe, water-calculator).

## Reference

*Audience: contributors, archaeology readers.*

- [`calculators/`](calculators/) — Calculator references and source materials (e.g. BrunWater spreadsheet, mash-pH paper).
- [`archive/`](archive/) — Superseded architecture revisions (Rev00, Rev01) and the canonical architecture-revision PDF (`archive/architecture-Rev02.pdf`). Kept for historical reference; not load-bearing for current decisions.

---

## Contributing to the documentation

- Documentation lives in this folder (`docs/`); top-level files (`DEVELOPMENT.md`, `DEVELOPMENT-LOCAL.md`, repository `README.md`) cover repo-level mechanics and link back here for everything platform-level.
- When adding a new document, also add a link to it from this index in the appropriate category. Each category is intended to stay small enough to scan.
- New documents should follow the existing tone: precise about decisions, honest about trade-offs, and explicit about what is *not* settled.
- For any document that may be surfaced publicly in the future (Vision & strategy, License, parts of Architecture), assume the audience is technically literate but not specialist, and define terms on first use.
- Substantive licensing or governance changes follow the RFC process described in [`LICENSING.md`](LICENSING.md) §10.

## Audience for this set

This documentation is written with three audiences in mind, in approximately this priority order:

1. **Future maintainers and contributors** — the people who will keep this project alive across decades. The docs are the durable artifact; the chat history is not.
2. **Self-hosting operators and platform evaluators** — technical decision-makers assessing Umbraculum as a long-term dependency.
3. **Prospective module developers** — partners building verticals or integrations on top of the platform.

If a document does not serve at least one of these audiences clearly, it should be revised or moved out of the docs tree.
