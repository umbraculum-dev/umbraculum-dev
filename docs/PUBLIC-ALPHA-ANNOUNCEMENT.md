# Public alpha announcement (maintainer draft)

**Tier:** Public  
**Status:** **Published** — GitHub Release [`v0.0.1-alpha`](https://github.com/umbraculum-dev/umbraculum-dev/releases/tag/v0.0.1-alpha) (2026-06-27); forum [topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) (2026-06-28)  
**Audience:** contributors, evaluators, press, community channels  
**Related:** [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 checklist item 5, [`LICENSING.md`](LICENSING.md), [`GETTING-STARTED.md`](../GETTING-STARTED.md)

> [!NOTE]
> **Flip complete (2026-06-27).** This document is the canonical announcement copy. Live distribution: GitHub Release, forum cross-post, indexed brochure/docs. Pre-flip gate checklist below is **historical record**.

---

## Suggested title

**Umbraculum public alpha — open-source toolset for workspace-shaped operational applications**

---

## Body (edit before publish)

Today we are opening the **Umbraculum** monorepo, the **umbraculum-toolset** Cursor plugin pack, and the **umbraculum-brochure** marketing site repository as a **public alpha** (`v0.0.1-alpha`).

**What Umbraculum is.** A toolset for building workspace-shaped operational applications — horizontal platform services (auth, workspaces, rendering, i18n) plus composable canonical modules (MRP, CRP, PIM, automation, and more) and a unified **AI consultant** with BYOK. Manufacturing is our stress test (brewery vertical configuration), not our identity.

**What public alpha is — and is not.**

- **Is:** source visibility, contributor docs at [docs.umbraculum.dev](https://docs.umbraculum.dev), MIT SDK packages on npm ([`LICENSING.md`](LICENSING.md) §6.2.1), local-install or marketplace Cursor plugins, a self-build path (`docker compose up`), and a **committed partial OpenAPI catalog** — platform spec plus optional brewery add-on ([`API-OPENAPI.md`](API-OPENAPI.md)).
- **Is not:** hosted-service GA, feature-complete ERP, or a promise that every module is production-ready. MRP/CRP ship as a **read-only alpha proof**; write workflows land in H1 2027.

**Students and university experimentation.** Clone, self-host, and build Tier 6 vertical prototypes in your own repo at **no platform fee** for learning — capstones, labs, portfolio work. Alpha depth is acceptable when the goal is to learn the stack, not to replace production ERP next quarter. See [`ACADEMIC-AND-EXPERIMENTATION.md`](ACADEMIC-AND-EXPERIMENTATION.md) for free-vs-paid boundaries, suggested projects, and a fit filter.

**Licensing (read this before you fork).**

- **AGPLv3** — monorepo core (API, web app, modules, database schemas).
- **MIT** — published SDK packages (`@umbraculum/module-sdk`, `@umbraculum/ai-tool-sdk`, `@umbraculum/*-contracts`, …).
- **Commercial dual license** — optional for organizations that cannot use AGPLv3; see [`LICENSING.md`](LICENSING.md).

No CLA. Contributions use **DCO sign-off** only ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

**How to start.**

1. Clone `git@github.com:umbraculum-dev/umbraculum-dev.git`
2. Follow [`GETTING-STARTED.md`](../GETTING-STARTED.md)
3. Install the Cursor apparatus per [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) (marketplace when listings are live; local install until then)
4. Read [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) and the living [`ROADMAP.md`](ROADMAP.md)

**How to help without buying priority.** Collaborate via issues and PRs; optional sponsorship for AI compute and maintainer time is welcome and **does not** buy votes, queue priority, or feature paywalls — see [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) §5 and [umbraculum.dev/support/](https://umbraculum.dev/support/).

**Links**

| Resource | URL |
|----------|-----|
| Source | `https://github.com/umbraculum-dev/umbraculum-dev` |
| Toolset plugins | `https://github.com/umbraculum-dev/umbraculum-toolset` |
| Brochure source | `https://github.com/umbraculum-dev/umbraculum-brochure` |
| Documentation | `https://docs.umbraculum.dev` |
| Brochure | `https://umbraculum.dev` |
| Community forum | `https://forum.umbraculum.dev` |
| Open-source stack recap | [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) |
| Students & university labs | [`ACADEMIC-AND-EXPERIMENTATION.md`](ACADEMIC-AND-EXPERIMENTATION.md) |
| Security | [`SECURITY.md`](../SECURITY.md) |

**Maintainer sign-off:** [Name] · [Date] · [Contact]

---

## Distribution checklist (flip day)

| Channel | Action | Done? |
|---------|--------|-------|
| GitHub release notes | Paste adapted body; attach `v0.0.1-alpha`; link [forum topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) in body | ☑ **2026-06-27** publish · **2026-06-28** forum link in [release body](https://github.com/umbraculum-dev/umbraculum-dev/releases/tag/v0.0.1-alpha) |
| Brochure / docs | Remove `noindex`; link announcement from home if desired | ☑ **2026-06-27** — SEO gates removed; indexed on [umbraculum.dev](https://umbraculum.dev/) + [docs.umbraculum.dev](https://docs.umbraculum.dev/) |
| [Community forum](https://forum.umbraculum.dev) | Cross-post announcement; open **Proposals** category | ☑ **2026-06-28** — [topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) (**Community policy**, pinned 6 months) |
| Social / newsletter | Optional short version | ☐ |
