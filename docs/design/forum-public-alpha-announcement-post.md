# Forum post — public alpha announcement (C3)

**Tier:** Public  
**Status:** Ready to paste — **Community policy** category on [forum.umbraculum.dev](https://forum.umbraculum.dev/)  
**Related:** [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md), [`community-forum-runbook.md`](community-forum-runbook.md) §8

> Paste the **Title** and **Body** below into a new topic in **Community policy**. Pin for 2–4 weeks optional. Record the topic URL in `PUBLIC-ALPHA-ANNOUNCEMENT.md` and flip runbook §11 **C3**.

---

## Title

Umbraculum public alpha — open-source toolset for workspace-shaped operational applications

---

## Body (Discourse markdown)

Today we are opening the **Umbraculum** monorepo, the **umbraculum-toolset** Cursor plugin pack, and the **umbraculum-brochure** marketing site repository as a **public alpha** ([`v0.0.1-alpha` release](https://github.com/umbraculum-dev/umbraculum-dev/releases/tag/v0.0.1-alpha)).

**What Umbraculum is.** A toolset for building workspace-shaped operational applications — horizontal platform services (auth, workspaces, rendering, i18n) plus composable canonical modules (MRP, CRP, PIM, automation, and more) and a unified **AI consultant** with BYOK. Manufacturing is our stress test (brewery vertical configuration), not our identity.

**What public alpha is — and is not.**

- **Is:** source visibility, contributor docs at [docs.umbraculum.dev](https://docs.umbraculum.dev/), MIT SDK packages on npm, local-install or marketplace Cursor plugins (marketplace pending review), a self-build path (`docker compose up`), and a committed partial OpenAPI catalog.
- **Is not:** hosted-service GA, feature-complete ERP, or a promise that every module is production-ready. MRP/CRP ship as a **read-only alpha proof**; write workflows land in H1 2027.

**Students and university experimentation.** Clone, self-host, and build Tier 6 vertical prototypes in your own repo at **no platform fee** for learning. See [Academic use and experimentation](https://docs.umbraculum.dev/ACADEMIC-AND-EXPERIMENTATION/) on the docs site.

**Licensing (read this before you fork).**

- **AGPLv3** — monorepo core (API, web app, modules, database schemas).
- **MIT** — published SDK packages (`@umbraculum/module-sdk`, `@umbraculum/ai-tool-sdk`, `@umbraculum/*-contracts`, …).
- **Commercial dual license** — optional for organizations that cannot use AGPLv3; see [Licensing](https://docs.umbraculum.dev/LICENSING/).

No CLA. Contributions use **DCO sign-off** only ([CONTRIBUTING.md on GitHub](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/CONTRIBUTING.md)).

**How to start.**

1. Clone `https://github.com/umbraculum-dev/umbraculum-dev.git`
2. Follow [Getting started](https://docs.umbraculum.dev/GETTING-STARTED/) on the docs site
3. Install the Cursor apparatus per [CURSOR-PLUGINS](https://docs.umbraculum.dev/CURSOR-PLUGINS/) (marketplace when listings are live; local install until then)
4. Read [Platform architecture](https://docs.umbraculum.dev/PLATFORM-ARCHITECTURE/) and the living [Roadmap](https://docs.umbraculum.dev/ROADMAP/)

**How to help without buying priority.** Collaborate via issues and PRs; optional sponsorship for AI compute and maintainer time is welcome and **does not** buy votes, queue priority, or feature paywalls — see [Support & sponsorship](https://umbraculum.dev/support/).

**Links**

| Resource | URL |
|----------|-----|
| Source | https://github.com/umbraculum-dev/umbraculum-dev |
| Release | https://github.com/umbraculum-dev/umbraculum-dev/releases/tag/v0.0.1-alpha |
| Toolset plugins | https://github.com/umbraculum-dev/umbraculum-toolset |
| Brochure source | https://github.com/umbraculum-dev/umbraculum-brochure |
| Documentation | https://docs.umbraculum.dev/ |
| Brochure | https://umbraculum.dev/ |
| Public demo | https://demo.umbraculum.dev/ |
| Security | https://github.com/umbraculum-dev/umbraculum-dev/blob/master/SECURITY.md |

**Maintainer sign-off:** Umbraculum maintainers · 2026-06-27 · toolset@umbraculum.dev

---

## After posting

1. Paste topic URL into [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md) distribution checklist.
2. Mark **C3 ☑** in [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §11.
3. Optional: enable Contabo **Auto Backup** on forum VPS ([`community-forum-runbook.md`](community-forum-runbook.md) §10).
