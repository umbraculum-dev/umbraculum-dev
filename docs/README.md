# `<PLATFORM_NAME>` documentation

**Tier:** Public

This folder is the canonical reference set for the `<PLATFORM_NAME>` platform. It is structured so that anyone — a new contributor, a self-hoster, a hosted-service customer, or a future maintainer — can find what they need without reading the whole repository.

Documents are grouped by **purpose**, not by physical location. Files have not been moved into subfolders in order to keep cross-links inside the existing codebase stable; this index provides the navigation.

> **Token convention.** The placeholder `<PLATFORM_NAME>` appears throughout these docs. It will be replaced with the chosen brand name once one is selected; until then, treat it as a search/replace token.

> **Audience tier.** All documents in this folder are **Tier: Public** by default — written to be surfaceable when the repository flips public. The first content line of each doc carries an explicit `**Tier:** Public` marker for clarity. Other tier values reserved for future use: `Partner-restricted`, `Customer-restricted`. Documentation that is not public-tier lives outside this folder and outside any public-mirror flip; it is intentionally not indexed here.

---

## Start here

If you are new to the project, read these three documents in order:

1. [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — the **vision and shape**: horizontal platform with vertical modules, AI consultant blueprint, BYOK + paid tier unlock, and the future managed-AI path.
2. [`ROADMAP.md`](ROADMAP.md) — the **direction of travel**: what is shipped, what is next, the 12–30 month trajectory.
3. [`LICENSING.md`](LICENSING.md) — the **licensing posture and reasoning**: AGPLv3 core + MIT SDK, commercial dual license, and what these choices imply for contributors, self-hosters, module developers, and enterprises.

The brewery-vertical implementation log lives in [`architechture-Rev02.md`](architechture-Rev02.md) — that is the source of truth for *what is wired up today* in the brewery vertical, and complements the platform-wide perspective above.

---

## Vision & strategy

The high-level direction, business model, and license posture.

- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — Platform vision, AI consultant, distribution model.
- [`ROADMAP.md`](ROADMAP.md) — Living roadmap with 12–30 month trajectory.
- [`LICENSING.md`](LICENSING.md) — Licensing rationale (AGPLv3 + MIT SDK, dual license, RFC change process).
- [`TIER-PRICING-ANALYSIS.md`](TIER-PRICING-ANALYSIS.md) — Base subscription tiers and pricing analysis (the current AI tier unlock and future managed-AI overlay are described in `PLATFORM-ARCHITECTURE.md` §7).

## Product

User-facing product surfaces and operational concerns at the product level.

- [`ROLLOUT.md`](ROLLOUT.md) — Rollout plan and staged-launch notes.
- [`SEO.md`](SEO.md) — SEO posture for the marketing/public surfaces.
- [`agentic-jobs.md`](agentic-jobs.md) — Agentic / scheduled-job notes.

## Architecture — platform-wide

Cross-cutting architectural decisions that apply to every module.

- [`architechture-Rev02.md`](architechture-Rev02.md) — Brewery-vertical implementation log and cross-platform (web + native) boundary decisions. The current source of truth for "what is wired up". (Historical versions: [`architechture-Rev00.md`](architechture-Rev00.md), [`architechture-Rev01.md`](architechture-Rev01.md).)
- [`NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md) — Native strategy and CI pipeline notes.
- [`REACT-NATIVE-KICKOFF-READINESS.md`](REACT-NATIVE-KICKOFF-READINESS.md) — Readiness criteria for the React Native kickoff.

## Architecture — auth & security

- [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) — Authentication strategy (cookie web + bearer native + webview bridge).
- [`AUTH-HARDENING-ASSESSMENT.md`](AUTH-HARDENING-ASSESSMENT.md) — Hardening review and findings.
- [`AUTH-QA.md`](AUTH-QA.md) — Auth QA notes.

## Architecture — data & infrastructure

- [`Posgres-master-slave-replicas-architechture.md`](Posgres-master-slave-replicas-architechture.md) — Postgres primary + replica architecture.
- [`DB-REPLICATION-AND-ROUTING-VERIFICATION.md`](DB-REPLICATION-AND-ROUTING-VERIFICATION.md) — Replication and read-routing verification.
- [`PGPOOL-VERIFICATION.md`](PGPOOL-VERIFICATION.md) — pgpool-II verification steps.
- [`Redis-architecture.md`](Redis-architecture.md) — Redis usage, key namespaces, caching pattern.

## Architecture — billing

- [`org-billing-stripe-revenuecat-fastify.md`](org-billing-stripe-revenuecat-fastify.md) — Stripe + RevenueCat + Fastify billing source-of-truth design.

## Domain — brewery vertical

Brewery-specific modeling, data formats, and analytical models. These will move into a `brewery/` module documentation set once the platform reframe lands; until then they live here.

- [`BEERJSON-FIRST.md`](BEERJSON-FIRST.md) — BeerJSON-first data model and strict export discipline.
- [`EQUIPMENT-AND-GRAVITY-ANALYSIS.md`](EQUIPMENT-AND-GRAVITY-ANALYSIS.md) — Equipment + gravity analysis (efficiency, losses, yields).
- [`WATER-CHEM-MASH-PH-MODEL.md`](WATER-CHEM-MASH-PH-MODEL.md) — Water chemistry and mash pH model.
- [`YEAST-MATH.md`](YEAST-MATH.md) — Yeast pitching and propagation math.
- [`RAW-MATERIALS-SEEDABLE-SOURCES.md`](RAW-MATERIALS-SEEDABLE-SOURCES.md) — Seed data sources and licensing notes for raw materials.

## Engineering — development

Day-to-day engineering conventions and runbooks.

- [`CODING-STANDARDS.md`](CODING-STANDARDS.md) — Coding standards (TypeScript, conventions, file layout).
- [`TESTING.md`](TESTING.md) — Test layers, frameworks, conventions; see also the `Tests must follow code changes` rule in `.cursor/rules/`.
- [`DEVELOPMENT-ACCESSIBILITY.md`](DEVELOPMENT-ACCESSIBILITY.md) — Accessibility constraints (hard requirements).
- [`DEVELOPMENT-NATIVE-LOCAL.md`](DEVELOPMENT-NATIVE-LOCAL.md) — Local development for the native app.
- [`I18N-AUDIT.md`](I18N-AUDIT.md) — Internationalization audit and guardrails.

## Integrations

Per-integration design notes.

- [`integrations/INTEGRATION-TOKENS.md`](integrations/INTEGRATION-TOKENS.md) — Integration token model.
- [`integrations/TILT.md`](integrations/TILT.md) — Tilt hydrometer integration.
- [`integrations/FLOATING-HYDROMETERS.md`](integrations/FLOATING-HYDROMETERS.md) — Floating hydrometer family.

## Design assets

- [`figma/`](figma/) — Figma exports for the three UI pillars (dashboard, edit-recipe, water-calculator).

## Reference

- [`calculators/`](calculators/) — Calculator references and source materials (e.g. BrunWater spreadsheet, mash-pH paper).
- PDF copies of architecture revisions (kept for historical reference): [`architecture.pdf`](architecture.pdf), [`architecture-Rev02.pdf`](architecture-Rev02.pdf), [`brewing-app-architecture-and-plan.pdf`](brewing-app-architecture-and-plan.pdf).

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
2. **Self-hosting operators and platform evaluators** — technical decision-makers assessing `<PLATFORM_NAME>` as a long-term dependency.
3. **Prospective module developers** — partners building verticals or integrations on top of the platform.

If a document does not serve at least one of these audiences clearly, it should be revised or moved out of the docs tree.
