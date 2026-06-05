# Ecosystem case studies — index

**Tier:** Public  
**Status:** v1.6 — custom vertical code §4.4 SOLID/SRP + yeastEditor example (2026-06-05)  
**Audience:** **young community members first**, then contributors, platform evaluators, vertical builders, learners repositioning in hard times  
**Related:** [`MANIFESTO.md`](../../MANIFESTO.md) §2.2, [`GETTING-STARTED.md`](../GETTING-STARTED.md), [`LICENSING.md`](../LICENSING.md) §5.3, [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1–§2.2

> [!NOTE]
> These documents are **gratitude and lesson**, not product reviews. They record what our reference network **felt and observed** building on or adjacent to other ecosystems — so Umbraculum can name structural commitments (free try, public docs, no certification gate) without polemic.

## For young community members

**You are not supposed to already know why Umbraculum looks the way it does.** We wrote this series so you can see the **why** behind our initial structural choices — not from theory, but from **painful experience**: for some of us directly, for others watching friends and colleagues struggle when they should not have had to.

We are not asking you to join a priesthood or wait three years before your questions count. We **are** asking you — also for your own good — to **try to understand us**: read the map below, open one or two studies that match your background, and meet us on **common ground**. The RFCs, public docs, and apparatus exist so you can ship **structurally similar** work without oral tradition ([`MANIFESTO.md`](../../MANIFESTO.md) §2.2).

That is the strong point we keep coming back to: **horizontal accessibility** — no badge wall, no senior-contempt ritual. If something here does not land yet, say so in the forum; that feedback is part of the design ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4).

### Experience is not superiority — and we are not trying to recruit you

The views in this series come from **years of striving** — wrong turns, repositioning when the market moved, spare-time learning when there was no spare time. That is why we write these lessons down. It does **not** mean we are smarter or better than peers who landed on paths that worked earlier. Some developers picked the right industry, stack, or employer on the **first or second try**. They have the houses, the cars, the family time. Many of us in this network do not. **Modesty is the point:** we are not asking you to admire that gap or to bet your life on closing it through Umbraculum.

Umbraculum is **not** a lottery ticket. Projects like this that grow into something that funds the people who built them are **statistically scarce** — including ones with thoughtful manifestos and disciplined apparatuses. **We do not want to lure you here.** If you read on, contribute, or try the stack, do it with eyes open: **weigh time, money, and opportunity cost carefully.** **Do not let this project cause you hardship.** We say the same elsewhere on purpose ([`MANIFESTO.md`](../../MANIFESTO.md) addendum, 2026-05-20; [`GETTING-STARTED.md`](../GETTING-STARTED.md) §"Who this is for") — *we are offering a tool, not a future.*

Even if Umbraculum succeeds beyond our current hopes, most of us will still pay the bills with **legacy projects and legacy code** — the work clients already fund, the stacks we already know. That is normal, not failure. Learn here if the work itself is worth it on its own terms; do not contribute on the strength of an upside that statistics say is scarce.

## What this series is about

We are **not** scoring ERPs. We are asking one question:

> When a developer must **reposition** — at twenty-five or forty-five, willingly or because the market forced them — can they learn on spare time because **the stack is clear, upstream tools are free, and the community is visible**?

The positive anchor in our network is **Magento** (especially 1.x / Open Source): PHP, MySQL, Community Edition, forums. Most developers who earned a living on it were **hired** at agencies or product companies — not instant agency founders. Learning was often unpleasant; it was still **possible**.

Umbraculum's line: **this makes learning possible for the ones who are willing to do so** — *this is the stack, try it.* You do not need a customer's vertical to grasp the platform.

**Students and university labs** — free self-host experimentation, capstone-friendly project shapes, and an honest fit filter vs production ERP: [`ACADEMIC-AND-EXPERIMENTATION.md`](../ACADEMIC-AND-EXPERIMENTATION.md) (also linked from the [brochure](https://umbraculum.dev/)).

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
| [Drupal + WordPress](ecosystem-case-study-drupal-wordpress.md) | Drupal, WordPress | **Partial positive** — stewardship + community; **WordPress plugin hell** (auth); **Drupal core-scale debate unsettled** | RFC-0001 Decision F; canonical modules; community proposals; no junior contempt |
| [Custom vertical code](ecosystem-case-study-custom-vertical-code.md) | **Unnamed platforms** (agency delivery) | **Delivery vs craft split**; priesthood unmaintainability; **custom code ~90% of upgrade pain**; Shopify contrast §4.3; **SOLID/SRP code shape** §4.4 | Apparatus + CI + [`CODING-STANDARDS.md`](../CODING-STANDARDS.md) SOLID; yeastEditor worked example |

**Pairings that help:**

- **Omnis + TeamSystem** — capable product, fence around builders.  
- **Business Central + SAP** — big ecosystems, hard entry (API maze vs trial maze).  
- **Magento (MANIFESTO §2.2) + Odoo** — learnability ladders we respect.  
- **Adobe → Magento + Omnis** — docs treated as disposable; Adobe also lost community through stewardship; Mage-OS proves fork path.  
- **Drupal + WordPress + Adobe → Magento** — stewardship contrast: WP/Drupal longevity vs Adobe collapse; shared PHP-era lessons.  
- **Drupal + WordPress (RFC-0001)** — modularity yes; parallel auth hell no.  
- **Adobe → Magento + Custom vertical code** — **two independent causes**: stewardship/CI (**indirect**) and integrator custom code (**direct**); not one consequence of the other; Shopify contrast (§4.3); **SOLID/SRP** as the code-shape mechanism (§4.4).  
- **Custom vertical code + Drupal §3.2** — priesthood contempt vs **common ground** via apparatus.

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
| Parallel auth/session per module | WordPress plugin ecosystem | **Decision F consumption contract** | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2; [`ecosystem-case-study-drupal-wordpress.md`](ecosystem-case-study-drupal-wordpress.md) §4 |
| Core PR volume vs small core dogma; senior contempt for juniors | Drupal-era PHP culture | **Open governance shape** — RFC canonical gate + permissionless modules + apparatus | [`ecosystem-case-study-drupal-wordpress.md`](ecosystem-case-study-drupal-wordpress.md) §3.2, §6; [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) |
| Delivery-first vs craft split; silent agency blame of platform | Many unnamed vertical stacks | **Common ground** — apparatus, docs, CI; **ongoing public discussion** | [`ecosystem-case-study-custom-vertical-code.md`](ecosystem-case-study-custom-vertical-code.md) §2–§3, §6 |
| Unmaintainable mega-classes by senior leads | Rescue / handoff projects | **Structural similarity before merge**; empathy for next developer | [`ecosystem-case-study-custom-vertical-code.md`](ecosystem-case-study-custom-vertical-code.md) §3; [`CONTRIBUTING.md`](../../CONTRIBUTING.md) |
| Upgrade pain blamed on core; custom code dominant cost | Agency estates (unnamed) | **Honest bottleneck naming**; vertical modules advised same discipline | [`ecosystem-case-study-custom-vertical-code.md`](ecosystem-case-study-custom-vertical-code.md) §4; [`MODULES.md`](../MODULES.md) |
| Clients never evaluate supplier code quality | Software procurement norms | **Respectful quality questions documented** — Toyota supplier logic | [`ecosystem-case-study-custom-vertical-code.md`](ecosystem-case-study-custom-vertical-code.md) §5 |
| Discarding unmaintainable work onto next developer | Handoff culture | **Solidarity guardrail** — tools were public; fix bill is fair | [`ecosystem-case-study-custom-vertical-code.md`](ecosystem-case-study-custom-vertical-code.md) §5–§6; [`MANIFESTO.md`](../../MANIFESTO.md) §3.x |

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
