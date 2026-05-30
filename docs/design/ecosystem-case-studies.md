# Ecosystem case studies — index

**Tier:** Public  
**Status:** v1.1 — index for practitioner learnability narratives; Adobe → Magento case study (2026-05-29)  
**Audience:** contributors, platform evaluators, vertical builders, learners repositioning in hard times  
**Related:** [`MANIFESTO.md`](../../MANIFESTO.md) §2.2, [`GETTING-STARTED.md`](../GETTING-STARTED.md), [`LICENSING.md`](../LICENSING.md) §5.3, [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1–§2.2

> [!NOTE]
> These documents are **gratitude and lesson**, not product reviews. They record what our reference network **felt and observed** building on or adjacent to other ecosystems — so Umbraculum can name structural commitments (free try, public docs, no certification gate) without polemic.

## What this series is about

We are **not** scoring ERPs. We are asking one question:

> When a developer must **reposition** — at twenty-five or forty-five, willingly or because the market forced them — can they learn on spare time because **the stack is clear, upstream tools are free, and the community is visible**?

The positive anchor in our network is **Magento** (especially 1.x / Open Source): PHP, MySQL, Community Edition, forums. Most developers who earned a living on it were **hired** at agencies or product companies — not instant agency founders. Learning was often unpleasant; it was still **possible**.

Umbraculum's line: **this makes learning possible for the ones who are willing to do so** — *this is the stack, try it.* You do not need a customer's vertical to grasp the platform.

**Bright side for vertical builders:** public try paths let **domain experts knock on your door** with real expertise. In our experience, five minutes of technical conversation beats a certification wall. Umbraculum does **not** operate a certification program ([`MANIFESTO.md`](../../MANIFESTO.md) §2.2, [`GETTING-STARTED.md`](../GETTING-STARTED.md) §"No certification track").

---

## Case study map

| Study | Ecosystem | Primary failure mode (for Umbraculum) | Umbraculum response (starting points) |
|-------|-----------|--------------------------------------|--------------------------------------|
| [Omnis](ecosystem-case-study-omnis.md) | Omnis Studio | Good product; **ecosystem never formed** — Core vs verticals only, doc-site fragility (§3.4–§3.6) | Open backbone, forum, `GETTING-STARTED` |
| [Business Central](ecosystem-case-study-business-central.md) | Microsoft Dynamics 365 BC | Huge partner channel; **opaque external API surface** | `@umbraculum/<code>-contracts`, route tables, OpenAPI alpha |
| [SAP](ecosystem-case-study-sap.md) | SAP ABAP / S/4 / BTP | **One language**, many verticals — but **trials ≠ safe boat** for repositioning | One try path; no cert gate |
| [TeamSystem](ecosystem-case-study-teamsystem.md) | TeamSystem / Polyedro (Europe) | **Partner-only experiment path** — ecosystem is the vertical for outsiders | `docker compose up`; public modules |
| [Odoo](ecosystem-case-study-odoo.md) | Odoo Community | **Partial positive** — CE learnability; we skip cert/partner ladder; **§4.1** platform-shape comparison (not feature scorecard) | Copy ladder, not badges |
| [Adobe → Magento](ecosystem-case-study-adobe-magento.md) | Magento Open Source / Adobe stewardship | **Community lost through stewardship** — dev docs scattered/404, cert churn, **cloud integration pipelines failing**, trademark; **Mage-OS** as fork counter-case | AGPL + DCO; fork rights; no cert gate; **CI by default**; doc redirects |

**Pairings that help:**

- **Omnis + TeamSystem** — capable product, fence around builders.  
- **Business Central + SAP** — big ecosystems, hard entry (API maze vs trial maze).  
- **Magento (MANIFESTO §2.2) + Odoo** — learnability ladders we respect.  
- **Adobe → Magento + Omnis** — docs treated as disposable; Adobe also lost community through stewardship; Mage-OS proves fork path.  
- **Adobe → Magento (LICENSING §5.2)** — community *lost* through stewardship (practitioner narrative: [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md)).

---

## Failure modes → commitments

| Failure mode | Where we saw it | Umbraculum commitment | Mechanism |
|--------------|-----------------|----------------------|-----------|
| Community never formed | Omnis, TeamSystem | Community first-class | [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4 |
| Core vs verticals only (no independent developers) | Omnis (§3.4–§3.6) | Public forum + permissionless modules as **third chair** | [`ecosystem-case-study-omnis.md`](ecosystem-case-study-omnis.md) §4 |
| Single closed doc channel breaks | Omnis 2016 revamp (§3.5) | **Redirect or explained removal** — no silent 404s | [`docs/README.md`](../README.md); [RFC-0005](rfcs/0005-docs-site.md) |
| Integration docs by topic, not by job | Business Central | Integrator-first module docs + contracts | [`MODULES.md`](../MODULES.md) §5, [`API-OPENAPI.md`](../API-OPENAPI.md) |
| Trials without repositioning ladder | SAP | **This is the stack, try it** | [`GETTING-STARTED.md`](../GETTING-STARTED.md) |
| Partner-only platform access | TeamSystem, Omnis (historical) | Free local evaluation | `docker compose up` |
| Certification as sales proxy | SAP, Odoo partners, BC badges | **No Umbraculum certification program** | [`MANIFESTO.md`](../../MANIFESTO.md) §2.2 |
| Expertise hidden in partner tenure | TeamSystem, Omnis | **Expertise offers visible** — learners can find vertical builders | Public repo, Tier 3/6 modules, forum |
| Community lost after acquisition | Adobe → Magento | AGPL + governance + no CLA; fork-friendly posture | [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md); [`LICENSING.md`](../LICENSING.md) §9 |
| Dev docs deprioritized / scattered URLs | Adobe → Magento (Experience League era) | Developer docs first-class; **redirect or explained removal** | [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.2; [`MANIFESTO.md`](../../MANIFESTO.md) §2.2 |
| Certification renewal while ladder narrows | Adobe Commerce / Magento certs | **No Umbraculum certification program** | [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.3 |
| Trademark enclosure after fork | Adobe → Magento → Mage-OS rename | Transparent trademark policy; AGPL fork rights | [`LICENSING.md`](../LICENSING.md) §8–§9 |
| Cloud pipelines broken; official guidance to avoid integration | Adobe ece-tools deploy integration | **Public-repo CI by default** — not broken vendor deploy gate | [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.5; [`TESTING.md`](../TESTING.md) |
| Agency hidden integration cost vs Shopify | Adobe cloud commercial trap | **Integrator sustainability** (§2.1) | [`MANIFESTO.md`](../../MANIFESTO.md) §2.1 |

---

## How to read these docs

1. Start here if you want the **map**.  
2. Read [`MANIFESTO.md`](../../MANIFESTO.md) §2.2 for the **policy** in manifesto voice.  
3. Read [`GETTING-STARTED.md`](../GETTING-STARTED.md) if you want to **try the stack**.  
4. Open individual case studies for **experience and lesson** — each ends with rewrite caution where relevant.

We respect other ecosystems' commercial choices (certifications, partner programs, trial strategies). We document why Umbraculum chooses differently — **by experience**, not to declare winners.

---

## Acknowledgement

These case studies exist because maintainers in this network **repositioned on open stacks** when proprietary fences made that harder elsewhere — and because vertical builders deserve **learners and experts who can find them** without a badge economy in the middle.
