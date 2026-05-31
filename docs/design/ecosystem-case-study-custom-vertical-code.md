# Ecosystem case study — custom code in vertical delivery (unnamed platforms)

**Tier:** Public  
**Status:** v1.1 — clarify two-failure framing vs Adobe pairing (2026-05-31)  
**Audience:** **young community members first**, agency integrators, vertical builders, clients evaluating software suppliers, maintainers reasoning about **code consistency as a solidarity commitment**  
**Related:** [`MANIFESTO.md`](../../MANIFESTO.md) §2.1–§2.2, [`CONTRIBUTING.md`](../../CONTRIBUTING.md) §"CI must pass", [`design/ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) §3.5, [`design/ecosystem-case-study-drupal-wordpress.md`](ecosystem-case-study-drupal-wordpress.md) §3.2, [`design/ecosystem-case-studies.md`](ecosystem-case-studies.md)

> [!NOTE]
> This document is **gratitude and lesson**, not a product review. **Platform and customer names are deliberately omitted.** The focus is **how code gets written in real vertical delivery** — ERP, ecommerce, line-of-business, custom integrations across many stacks our network worked on for years. We are not scoring vendors. We are naming a **human and economic pattern** that split developer communities in silence — and the guardrails Umbraculum builds against it.

## Scope — what this case study is (and is not)

**What we are describing is what agency and in-house teams felt** when the only goal on the ground was **delivery** — rent and groceries paid for years that way, often honourably — while the **maintainability bill** landed on someone else later.

We are **not** claiming every platform upgrade failure is integrators' fault alone. Stewards fail too ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md)). We **are** claiming, from extensive practice across unnamed verticals:

1. **In ~90% of painful upgrades and rescue projects we audited, the bottleneck was custom integrator code** — not core, not official extensions.  
2. **Two developer camps split the field** — delivery-first vs craft-first — with **no common ground** and **almost no honest discussion inside agencies**.  
3. **The priesthood writes unmaintainable code too** — thousand-line classes, private dialects, "touch it and Pandora opens" — and **young developers are excluded** from the job by design.  
4. **Clients rarely evaluate code quality** the way industrial buyers evaluate suppliers — and software development has not caught up to what quality literature already proved decades ago.

**Same pain, two different failures — read both studies.** Painful upgrades and rescue projects often get blamed on **"the platform"** alone. In our experience **two things went wrong at once** — on Magento under Adobe and on many unnamed verticals — and they are **not** cause and effect:

| Failure | Who this study is about | What it looks like | How big the bill usually is |
|---------|-------------------------|--------------------|-----------------------------|
| **Custom code on the estate** | **This document** (§4.1) | Integrator-written modules, themes, integrations — private dialects, no tests, unmaintainable handoffs | **Usually the largest line item** in our audits |
| **Steward neglect of integrator discipline** | [`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md) (§3.5 names docs, deploy integration, CI) | Hard to learn, hard to deploy cleanly, no shared consistency culture from the vendor | **Real, but indirect** — it makes the custom-code problem **worse**; it does **not replace** it |

**This study does not excuse Adobe-era stewardship** — read the Adobe case study for that lesson. **The Adobe case study does not excuse unmaintainable custom code** — read §4.1 here for that lesson. Umbraculum responds to **both** (§6): apparatus and public code-shape norms **and** first-class developer docs and CI.

**Commercial contrast (separate topic):** Shopify optimised for **store uptime when an extension fails** (§4.3). Umbraculum deliberately takes the opposite stand — **continuous teaching and supervision of code shape** for vertical work too.

---

## 1. Summary

| Dimension | Agency vertical delivery (maintainer network, many platforms, many years) |
|-----------|-------------------------------------------------------------------------------|
| **Setting** | Custom modules, themes, integrations, vertical ERP/ecommerce/LOB delivery — **names omitted** |
| **Camp A — delivery first** | Consistency, docs, and design patterns secondary; **delivery pays the bills** — valid merit |
| **Camp B — craft in pain** | Meets dreadful code written in a **language of its own**; margins eroded by refactor and rescue work |
| **Culture failure** | Skilled craft developers **look down on** Camp A; Camp A **dismisses** Camp B as impractical — **no common ground** |
| **Silent topic** | Rarely discussed in agency stand-ups, rarely at client meetings — **blame flows to "the platform"** instead |
| **Priesthood paradox** | Senior leads — field priesthood — ship **unmaintainable** mega-classes; juniors blocked from entry |
| **Upgrade reality** | Painful upgrades are **failure by design** when custom code is the hardest layer to move — integrators **fail themselves** when they take no responsibility for what they wrote |
| **Umbraculum lesson** | **Ongoing public discussion forever** on code shape; apparatus + docs + CI as **empowerment**, not punishment; **solidarity** — do not discard work onto the next developer; advise clients to **evaluate supplier code quality** |

---

## 2. Two camps — both with merit, neither with honesty

In our network's recurring colleague conversations, two patterns appear:

### 2.1 Delivery first — "what matters is shipping"

Developers who **do not prioritise** code consistency, inline documentation, or shared design patterns — because the sprint, the SOW, and the invoice say **deliver**. Rent and groceries **have been paid for years** that way. That has **merit**. Clients often reward speed and feature checklists, not diff readability.

Umbraculum does **not** moralise Camp A as villains. We **do** say: if you join this platform, **empathy for who comes later** is part of the social contract — not optional polish.

### 2.2 Craft in pain — "every project is a rescue"

Developers who **strive** whenever they inherit **dreadful code** — classes that read like a private language, no tests, no module boundaries — and who see **margin evaporate** on refactor before any new feature ships. They are often right about the economics.

Umbraculum does **not** treat Camp B as a license for **contempt**. Looking down on delivery-first colleagues **repeats the priesthood failure** we name in [`ecosystem-case-study-drupal-wordpress.md`](ecosystem-case-study-drupal-wordpress.md) §3.2. **Common ground** means: shared tools, shared docs, shared CI patterns — not sneering.

### 2.3 What never happened in the room

This split was **rarely named inside agencies** — and **almost never at client meetings**. The safe story was: **"the platform is the problem."** Platform upgrades are **designed to be hard** when custom integrators write the most difficult code to maintain. That is true structurally — and it is also true that **many authors never carried responsibility** for what they wrote.

We want that discussion **always on** — in public docs, in RFCs, in the forum — not in hallway contempt.

---

## 3. Priesthood writes unmaintainable code too

The failure mode is **not only** junior developers who "don't know patterns yet."

We watched **highly skilled, experienced lead developers** — members of the field **priesthood** — write:

- **Single classes with thousands of lines**  
- **Private dialects** no newcomer can read in a week  
- **Touch-one-line, open-Pandora's-box** modules that **exclude young developers** from meaningful work

You cannot welcome the next generation ([`MANIFESTO.md`](../../MANIFESTO.md) §2.2) while shipping artifacts only the author can safely edit. **Seniority is not a substitute for empathy.**

Umbraculum's apparatus ([`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md), [`CONTRIBUTING.md`](../../CONTRIBUTING.md)) exists partly so **structure is enforced before ego** — rules, skills, CI, module layout — not three years of oral tradition before your PR counts.

---

## 4. The platform is rarely the whole story

### 4.1 Custom code is the bottleneck — ~90% in our experience

We despised some platforms in public — sometimes fairly ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md)) — because **upgrade pain** felt like vendor failure. Often it **was** vendor failure. But when we audited rescue projects honestly, **custom integrator code** was the dominant cost: not core, not official extensions, not the release notes headline.

**Upgrading the platform is failure-by-design hard** when the hardest code on the estate is **yours** — or your predecessor's — and nobody documented the assumptions.

That is why **Shopify won market share** in part: merchants experienced **less of your custom code's blast radius**. That commercial outcome is not our product category — Umbraculum is operational/workspace-shaped software — but the **lesson transfers**.

### 4.2 Adobe — second cause, not the same cause (pairing only)

Adobe's Magento stewardship deprioritised **developer-facing consistency** — docs, deploy integration, certification churn ([`ecosystem-case-study-adobe-magento.md`](ecosystem-case-study-adobe-magento.md)). That is an **indirect** cause of integrator pain: harder to learn, harder to deploy cleanly, harder to keep estates aligned with platform patterns.

**Painful upgrades on Magento-shaped estates were still dominated by custom code** — the **direct** cause in §4.1. We can discuss Adobe policy for days; that does **not** make custom code a **consequence** of Adobe's choices. **Both are causes.** Neither absolves the other.

Adobe failed integrators on **tools and governance**; integrators often failed **the next integrator** on **code shape**. Umbraculum tries to **address both** — by design.

### 4.3 Shopify's opposite bet — and Umbraculum's deliberate counter-stand

**Shopify's reasoning (commercial, simplified):** if an app or extension fails, **the storefront stays up** — minimise custom-code failure blast radius; merchant continuity over integrator craft depth.

**Umbraculum's counter-stand:** we want **continuous teaching** and **continuous supervision of code shape** — for **core and canonical modules by enforcement**, and **strongly advised for every vertical module**. Not because we think merchants enjoy refactor bills — because **maintainable code lowers total cost**, makes products **more customizable and marketable**, and keeps **young developers employable** on the same estate.

Quality literature on supplier relationships and total cost is **clear**; **software purchasing** has not caught up. We say that plainly to **clients and employers**, not only to developers.

---

## 5. Clients should ask — Toyota supplier logic, not insult

In total-quality thinking, a buyer **knows their suppliers** — audits process, consistency, defect rates. **Software clients rarely ask:**

- Is this module **consistent** with the platform's patterns?  
- Are there **tests and CI**?  
- Can a **different developer** maintain this in six months without the original author?  
- Was the **apparatus** (docs, contracts, module layout) **used**, or bypassed?

There is **nothing disrespectful** in those questions. It is **quality**. It is how we keep the **contribution bar low** — because **code consistency** is what lets the *next* person join without a priesthood gate.

Umbraculum empowers developers to tell employers and clients, calmly:

> **The docs were always there. The tools were always there. If someone wrote unmaintainable or buggy code, you will probably pay to fix it now — and that is fair, not a platform betrayal.**

That is **not an anti-pattern**. It is a **guardrail** and a **solidarity** norm: **we do not accept discarding work onto the next person** when the platform already supplied the means to do better.

**Shit happens.** Buggy code will ship. **Empathy** means: make the next fix **possible** — tests, module boundaries, public contracts, CI green — not **heroic archaeology**.

---

## 6. Umbraculum commitments — discussion forever, tools on the table

| Failure mode | What we saw (unnamed verticals) | Umbraculum commitment | Mechanism |
|--------------|--------------------------------|----------------------|-----------|
| Delivery vs craft split with contempt | Agency culture, many stacks | **Common ground via shared apparatus** — not priesthood, not sneering | [`CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md); [`GETTING-STARTED.md`](../GETTING-STARTED.md); forum |
| Unmaintainable mega-classes by seniors | Rescue projects | **Structural similarity enforced** before merge | Rules, skills, [`MODULES.md`](../MODULES.md), RFC-0002 layout |
| Platform blamed; custom code ignored | Upgrade/rescue audits | **Honest public case study** — custom layer named | This document; [`ecosystem-case-studies.md`](ecosystem-case-studies.md) |
| No ongoing code-shape discussion | Silent agency norms | **Core keeps this discussion ongoing forever** | Public RFCs ([`LICENSING.md`](../LICENSING.md) §10); [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4 |
| Vertical modules exempt from discipline | Tier 3/6 "just ship it" | **Same advice for verticals** — continuous teaching + supervision | [`MODULES.md`](../MODULES.md); module README gates; CI patterns |
| Client never evaluates code quality | RFP feature lists only | **Document supplier-quality questions** — respectful, normal | This §5; [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) |
| Integrator cannot point to platform tools | Oral tradition blame game | **Docs + CI + contracts always public** | [`docs/README.md`](../README.md); [`API-OPENAPI.md`](../API-OPENAPI.md); [`CONTRIBUTING.md`](../../CONTRIBUTING.md) §"CI must pass" |
| Community accepts dumping work | "Not my problem" handoffs | **Solidarity guardrail** — do not discard work to others | [`MANIFESTO.md`](../../MANIFESTO.md) §3.x empathy commitments |

### 6.1 Consultancy provocation (intentional)

We state that Umbraculum is **available for consultancy on custom vertical code** — **partly as provocation**. In reality we will **rarely have capacity** to audit every agency estate. The point is **cultural and contractual**:

- The platform **already gives** the tools.  
- **Using them is the norm**, not elite optional behaviour.  
- **Canonical, core, and vertical** work all inherit the same **maintainability guarantee** when you follow the apparatus — your client's estate stays **transferable** to the next developer.

If you need help, **ask in the forum** first. If you need paid rescue, **bill honestly** — and show the client **where platform docs existed before the rescue**.

### 6.2 What we enforce vs what we advise

- **Enforced on merge to the public backbone:** CI green, contract validation, module README structure, RFC-gated canonical surface ([`CONTRIBUTING.md`](../../CONTRIBUTING.md)).  
- **Strongly advised for Tier 3/6 vertical modules:** same patterns — tests, contracts consumption, apparatus-loaded authoring — because **your margin and your juniors' employability** depend on it more than ours do.

---

## 7. Word of caution — "Should we blame our old agency code on Umbraculum?"

**No.**

If you inherit a legacy estate on **any** platform, this case study is not a **replatform sales pitch**. It is a **quality and empathy** lesson:

- Audit **custom code first** before blaming core.  
- **Young developers:** you are not supposed to already know — but you **are** invited to use the tools and ask ([`ecosystem-case-studies.md`](ecosystem-case-studies.md) §"For young community members").  
- **Clients:** evaluating **code consistency** is **respectful supplier management**, not an insult to your agency.

Umbraculum targets **new platform-shaped work** and teams choosing **how to write going forward** — not retroactive absolution for every past sprint.

---

## 8. Acknowledgement

This case study exists because **many of us paid rent through delivery-first sprints** — and because **many of us burned margin rescuing code we did not write** — and because **both camps watched juniors get locked out** while seniors wrote unmaintainable artifacts and called it expertise.

Umbraculum exists in part to keep **code writing, empathy, and economic honesty** in **public, ongoing discussion** — with **tools on the table**, **no priesthood**, and **common ground** for the developers who come next.
