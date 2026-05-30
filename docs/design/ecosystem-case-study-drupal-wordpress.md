# Ecosystem case study — Drupal and WordPress (stewardship positives, design lessons)

**Tier:** Public  
**Status:** v1.0 — practitioner + PHP-community observation; open questions on core scale (2026-05-30)  
**Audience:** contributors, platform evaluators, module authors, future maintainers reasoning about **what to copy** (community, modularity) vs **what to avoid** (plugin hell) vs **what remains unsettled** (core-team size vs contribution volume)  
**Related:** [`LICENSING.md`](../LICENSING.md) §5.1 (sustained successes), [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision F (WordPress-hell warning), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.2, [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md), [`design/ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) (stewardship failure contrast)

> [!NOTE]
> This document is **gratitude and lesson**, not a product review. **Drupal and WordPress are positive anchors** for open-source stewardship and community longevity ([`LICENSING.md`](../LICENSING.md) §5.1). Umbraculum copies parts of their shape — and names **design failures** (especially WordPress-style horizontal reimplementation) and **debates we do not pretend are settled** (especially Drupal-era arguments about core size and review load).

## Scope — what this case study is (and is not)

**What we are describing** is what our reference network learned from **two mature PHP CMS ecosystems** — mostly from **building adjacent to them** (agencies, extension authors, PHP conference culture) rather than from claiming insider Drupal core status.

We are **not** scoring Drupal vs WordPress as products for a greenfield site today. We **are** asking:

1. **What did they get right** on stewardship, community, and learnability?  
2. **What design shape must Umbraculum avoid** (WordPress plugin hell on auth, billing, sessions)?  
3. **What governance tension is still an open discussion** (Drupal's "small core team" vs massive core contribution volume) — especially for **welcoming the next generation**, not senior developers dismissing juniors?

**Contrast with Adobe → Magento** ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md)): there, **stewardship failed** while the license looked fine. Here, **stewardship largely worked** — the lessons are **architecture and culture**, not enclosure.

---

## 1. Summary

| Dimension | Drupal (maintainer network, ~Drupal 7 era + after) | WordPress (maintainer network, ~2010s–2020s) |
|-----------|--------------------------------------------------|-----------------------------------------------|
| **Stewardship** | **Strong positive** — Foundation + commercial steward (Acquia); GPLv2+; long-lived contributor economy | **Strong positive** — Foundation + Automattic separation; GPLv2; hosting + ecosystem at scale |
| **Modularity lesson** | **Contrib modules**, open paths into core over time; **one module per concern** discipline Umbraculum echoes via **canonical codes** ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md)) | **Permissionless plugins** — enormous surface; **horizontal reimplementation hell** when every plugin ships its own auth |
| **Culture tension (Drupal)** | **"Small core team"** advocated by parts of core; **thousands of core PRs/year** decried as "hell" at PHP conferences — **applauded by audiences**; observers saw **seniors despising juniors** — **we do not treat either pole as settled truth** | Less centralised core-review drama in our memory; failure mode is **ecosystem fragmentation**, not core queue size |
| **Umbraculum takeaway** | Copy **modularity + public contribution**; use **RFC + community proposals** instead of pretending core scale has one answer | Copy **governance separation**; enforce **Decision F consumption contract** so modules cannot ship parallel auth |

---

## 2. What both ecosystems got right (why LICENSING cites them)

[`LICENSING.md`](../LICENSING.md) §5.1 lists **WordPress** and **Drupal** under sustained successes. That is not politeness — it reflects what our network actually saw.

### 2.1 Community and stewardship that lasted

- **Public contribution remained plausible** for years — themes, plugins/modules, docs, events, agency hiring.  
- **Trademark held separately from license** — commercial hosting and services could exist without enclosing the source ([`LICENSING.md`](../LICENSING.md) §5.3 lesson 4).  
- **Repositioning ladder** — unpleasant, but **possible**: PHP, MySQL/MariaDB or PostgreSQL (Drupal), visible forums, "WordPress developer" / "Drupal developer" job posts. Same family of learnability Umbraculum names in [`MANIFESTO.md`](../../MANIFESTO.md) §2.2 (Magento anchor) and [`ecosystem-case-study-odoo.md`](ecosystem-case-study-odoo.md) (Community Edition).

### 2.2 Livelihood — agencies, extensions, hosting

Agencies, theme shops, plugin/module vendors, and hosts built **multi-year careers**. When stewardship is credible, **the ecosystem pays groceries and rent** — the opposite of Adobe-era Magento's hidden integration subsidy ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.5).

Umbraculum §2.1 (**sustainability for the whole ecosystem**) treats integrators and module authors as **first-class stakeholders**, not friction to remove — a lesson WordPress and Drupal mostly got right at the governance layer even when architecture hurt at the edges.

---

## 3. Drupal — modularity, core contribution, and an unsettled debate

### 3.1 What Umbraculum copies — modular discipline and open contribution

Drupal's enduring design lesson for this project is **modularity with naming discipline**:

- **Contributed modules** (`modules/contrib/<name>/`) — permissionless innovation below core's reserved concerns ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md) cites Drupal's layout).  
- **Paths for work to enter core** — controversial, slow, political — but **public**; not reseller-only oral tradition (contrast Omnis).  
- **"One module per functionality"** — no parallel competing implementations of the same domain without pain. Umbraculum enforces that at the **canonical-module** layer via reserved codes ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision A) — the Drupal lesson **without** copying every Drupal internal.

That is a **positive** Umbraculum inherits deliberately.

### 3.2 "Small core team" vs massive core volume — we do not claim this is solved

Around the **Drupal 7** era and after, our network (especially **PHP conference audiences**, not only Drupal insiders) heard a recurring argument:

- Part of **Drupal core leadership** pushed for a **smaller core team** — fewer people gatekeeping what enters core.  
- Others in core **openly despised** that direction — wanting core to remain a broad collaboration surface.  
- Meanwhile, **core contribution volume** could reach **thousands of pull requests per year** — cited on PHP stages as **"hell"**, **unmaintainable**, **a bad example**, often **applauded** by listeners who never maintained a CMS core.

**Our position:** that applause is **not** a settled engineering verdict Umbraculum adopts.

The tension is real and **still open**:

| Pole | Claim | Risk if taken as gospel |
|------|--------|-------------------------|
| **Small core team** | Reviewable, coherent core | Juniors and new contributors ** bounced to the fringe**; "core" becomes a senior priesthood |
| **Very large core PR volume** | Maximum openness | Review fatigue; **seniors burn out**; juniors submit into a void |
| **PHP conference "hell" narrative** | Discipline through shame | **Welcoming the next generation** becomes optional |

We were **not** Drupal core contributors, but we **were** in the PHP community — and what struck many of us as **strange** was **senior developers despising juniors** in public discourse: mockery of "too many PRs," contempt for newcomers' patches, applause for shrinking the table. That is the **opposite** of horizontal accessibility ([`MANIFESTO.md`](../../MANIFESTO.md) §2.2).

**How do you welcome a new generation of developers?** Umbraculum's answer is **not** "7000 core PRs good" or "small core team good." It is a **different shape**:

- **Canonical layer** — small, RFC-gated, reserved codes (Drupal-like discipline **without** infinite core merge queue).  
- **Permissionless Tier 3/6 modules** — contribution welcome **below** canonical domains ([`MODULES.md`](../MODULES.md)).  
- **Community proposal + vote mechanism** — agenda influence without every debate becoming a core merge fight ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4).  
- **Apparatus (rules, skills, CI)** — lowers the bar so juniors ship **structurally similar** code ([`MANIFESTO.md`](../../MANIFESTO.md) §1.3, §2.2) — not "learn our oral tradition for three years before your PR counts."

We record the Drupal-era debate as **evidence that governance culture matters as much as module layout** — and as a warning against conference-stage certainty.

---

## 4. WordPress — stewardship good, plugin hell on horizontal concerns

### 4.1 What Umbraculum copies — governance separation

WordPress's **Foundation / Automattic** split is a **positive precedent** for long-term OSS B2B ([`LICENSING.md`](../LICENSING.md) §5.1, §445 patterns): community trust, commercial hosting, trademark discipline, **without** the Adobe → Magento stewardship collapse.

Umbraculum's deferred foundation question ([`MANIFESTO.md`](../../MANIFESTO.md) §2.3) is informed by this shape — not by copying WordPress's PHP runtime choices.

### 4.2 What Umbraculum rejects — parallel auth (and friends)

WordPress's permissionless plugin economy produced immense good — and a **specific architectural failure mode** this project names explicitly in [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md):

> **Cross-cutting fragmentation — the WordPress plugin-hell warning.** … modules silently reimplement auth, sessions, billing, ACL, i18n, observability … **N parallel implementations** a hosting team cannot operate coherently.

In practitioner terms: **anyone shipping their own auth** (and their own session model, and their own role system) is **hell for operators**, integrators, and security reviewers — even when each plugin author had good local reasons.

That is **not** a WordPress license failure. It is a **missing platform consumption contract**. Drupal, Salesforce, AWS IAM, and mobile OSes all impose **"consume the platform's horizontal services"** obligations; WordPress's permissive substitution model produced an ecosystem the **hosted layer cannot unify**.

Umbraculum **Decision F** ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2) is the structural answer: modules **must consume** platform auth, billing, notifications, rendering, etc.; **must not** ship parallel implementations; **may** extend via SDK-declared extension points.

**Pair with Adobe → Magento ece-tools** ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.5): different symptom — vendor integration broken — same integrator pain: **you cannot run a coherent hosted product** when every module lives in its own horizontal universe.

---

## 5. Umbraculum structural response

| Lesson | Source | Umbraculum commitment | Mechanism (starting points) |
|--------|--------|----------------------|------------------------------|
| Long-lived community + stewardship | Drupal, WordPress | **Governance + license = single decision** | DCO not CLA; public RFCs; [`LICENSING.md`](../LICENSING.md) §9 |
| Modular discipline | Drupal | **Canonical-module rule** — one reserved code per domain | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision A |
| Permissionless innovation below core | Drupal contrib | **Tier 3/6 permissionless modules** | [`MODULES.md`](../MODULES.md) |
| Plugin hell on auth/sessions/billing | WordPress | **Decision F consumption contract** | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2; horizontal services table |
| Core queue "hell" vs small core dogma | Drupal-era PHP culture | **No pretended single answer** — split canonical RFC gate from permissionless contribution | [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md); community proposals §4 |
| Seniors despising juniors | PHP conference observation | **Horizontal accessibility** — apparatus lowers bar; public forum | [`MANIFESTO.md`](../../MANIFESTO.md) §2.2; [`GETTING-STARTED.md`](../GETTING-STARTED.md); forum at `forum.umbraculum.dev` |
| Trademark + hosting without enclosure | WordPress, Drupal | **AGPL backbone + trademark policy** | [`LICENSING.md`](../LICENSING.md) §8–§9 |

**What we still do not copy:** WordPress-style **parallel horizontal stacks per plugin**; Drupal conference certainty that **large core volume is simply hell**; **small core team** as unchallengeable gospel without a **junior on-ramp**.

**What we do copy:** **stewardship that keeps contribution welcome**; **modularity with domain discipline**; **hosted-operator coherence** via platform services.

---

## 6. Open questions (deliberately not closed)

Umbraculum does **not** publish a mock answer to Drupal's core-scale debate. We publish **where we stand**:

1. **Welcoming juniors is non-negotiable** ([`MANIFESTO.md`](../../MANIFESTO.md) §2.2). Contempt as community norm is a failure mode — whether it targets "too many PRs" or "not enough seniority."  
2. **Core merge volume and core team size are trade-offs**, not morality plays. The project's split — **RFC-gated canonical surface** + **permissionless modules below** + **community agenda votes** — is our attempt to **avoid both priesthood and review collapse**.  
3. **WordPress plugin hell on auth is not an open question** — Decision F is committed. Operators cannot run twenty auth systems.

If future maintainers find this split wrong, the change path is a **public RFC** ([`LICENSING.md`](../LICENSING.md) §10) — not a keynote applause line.

---

## 7. Word of caution — "We run Drupal/WordPress; should we replatform to Umbraculum?"

**No.**

Mature Drupal or WordPress estates should be evaluated on their own merits. This case study informs **Umbraculum's platform shape** for **new operational / workspace-shaped work** — not CMS rip-and-replace.

---

## 8. Acknowledgement

Drupal and WordPress **sustained careers** across decades of PHP — and gave the open-source world **positive stewardship examples** Adobe later failed to match. The PHP conference culture that **applauded** shrinking core and **mocked** contribution volume also taught us what **not** to normalize.

Umbraculum exists in part to combine **Drupal-like modularity discipline** and **WordPress-like community longevity** with **explicit rejection of plugin hell** — and to keep **"how do we welcome the next generation?"** an honest, public question rather than a settled sneer.
