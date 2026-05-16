# `<PLATFORM_NAME>` — Licensing rationale

**Tier:** Public
**Status:** v1.0 (living document, public-facing intent)
**Audience:** prospective contributors, self-hosters, hosted-service customers, enterprise legal teams, and anyone evaluating `<PLATFORM_NAME>` as a long-term operational dependency.
**Token convention:** the placeholder `<PLATFORM_NAME>` is used everywhere the brand will appear; it will be replaced once a name is chosen.

> **Disclaimer.** This document explains the project's licensing **intent and reasoning**. It is not legal advice. If you are making a commercial or regulatory decision that depends on a precise interpretation of any license, please consult a qualified open-source licensing lawyer in your jurisdiction.

---

## 1. Why this document exists

Licensing is the most consequential one-way decision an open-source project makes. It shapes:

- Who can use the software, and on what terms.
- Who will contribute to it, and how comfortable they feel doing so.
- Whether large cloud providers can build competing services on top of it.
- Whether enterprise customers can legally adopt it.
- How the project can be sustainably funded long-term.

We are writing this document **before** we make the license decision public so that the reasoning is in the open, can be challenged, and is durable. When someone asks "why AGPLv3?" or "why not MIT?" five years from now, this is the answer.

This document is intended to be **public**. Wording is aimed at a reader who is technically literate but not necessarily an open-source-licensing specialist. Where a term has a precise meaning, it is defined the first time it is used.

---

## 2. TL;DR

- **Core platform**: **GNU Affero General Public License v3 (AGPLv3)**.
- **SDK / contracts / public interface packages** (the surface third-party modules depend on): **MIT License**.
- **Available alternative for enterprises that cannot adopt AGPLv3**: a **commercial dual license** of the same source code, sold by `<PLATFORM_NAME>`'s legal entity.
- **Trademark**: the `<PLATFORM_NAME>` name and logo are **not** covered by the open-source license; they remain the project's commercial property and are protected separately.
- **Commitments**: no closed-source replacement of public modules, no future-dated re-licensing of existing source, no enterprise-only paywall hiding bug fixes or security patches behind a commercial tier, and any future license change goes through a public RFC.

The remainder of the document explains why.

---

## 3. What we are optimizing for

A licensing decision only makes sense in the context of the goals it serves. `<PLATFORM_NAME>` is optimizing for, in order:

1. **Long-term sustainability for a small team.** The project's economic target is a *bread-and-butter* income — sustainable for a small team over many years, not a venture-scale exit. This shapes everything else.
2. **Survivability beyond any single maintainer.** The project is built to outlive its founders. If a maintainer steps back, retires, or hands off, the community continues. This is structurally only achievable with a real open-source license — not source-available.
3. **Trust with operational customers.** Enterprise process-manufacturing buyers commit to 5–10 year operational dependencies. They will not commit to a project they cannot audit, fork if abandoned, or self-host if they need to.
4. **A defensible position against hyperscalers.** If `<PLATFORM_NAME>` succeeds, large cloud providers (AWS, Azure, GCP) may be tempted to operate it as a managed service themselves, capturing the revenue without contributing back. The license must structurally deter this without alienating end users.
5. **A welcoming environment for module developers.** The platform's defensibility depends on a thriving ecosystem of third-party modules (verticals, integrations, themes). The license terms applicable to *those* modules must be permissive enough that an indie developer or a small consultancy is happy to ship one.
6. **Compatibility with the AI add-on revenue line.** AI usage is metered and resold; the license should not undermine that model.

The choice that best serves all six goals is **AGPLv3 for the core platform, MIT for the SDK**, with a **commercial dual license** available for the narrow set of enterprises whose policies cannot accommodate AGPLv3.

---

## 4. A fair survey of license families

This section is deliberately even-handed. Each family has a legitimate use; this is **not** a "MIT bad, AGPL good" argument. The choice depends on what the project is optimizing for, which is why §3 comes first.

Definitions used throughout this section:

- **Copyleft**: a license condition that requires derivatives of the licensed work to also be released under the same (or a compatible) license. The aim is to preserve user freedoms across the whole derivative chain.
- **Permissive**: a license that imposes few obligations on downstream users — typically attribution only. Derivatives may be relicensed under any terms, including proprietary.
- **OSI-approved**: a license listed at [opensource.org/licenses](https://opensource.org/licenses) as conforming to the [Open Source Definition](https://opensource.org/osd). This is the community-consensus criterion for "is this actually open source?"

### 4.1 Permissive licenses (MIT, BSD, Apache 2.0)

**Examples**: MIT License, BSD-2-Clause, BSD-3-Clause, Apache License 2.0 (Apache 2.0 adds a patent grant and an explicit notice file requirement; MIT and BSD do not).

**Obligations.** Distribute the original license text and copyright notice with copies of the software. Apache 2.0 additionally grants and revokes a patent license.

**Strengths.**

- Largest possible user base. Permissive licenses are accepted by virtually every enterprise legal team.
- Maximum contributor permissiveness — a contributor's downstream users can do whatever they want, which is attractive to library authors.
- No friction for embedding the code into proprietary products.

**Trade-offs.**

- A large competitor (including hyperscalers) can fork the code, host it commercially, never contribute anything back, and out-distribute the original maintainers. This has happened repeatedly: Elasticsearch → AWS OpenSearch, Redis → AWS ElastiCache, MongoDB → AWS DocumentDB.
- The project is wholly reliant on **brand, momentum, governance, and the cost of catching up** as its competitive advantages.

**Best fit.** Libraries, tools, and frameworks where the goal is the broadest possible adoption and the project's revenue model does not depend on hosting.

### 4.2 Weak copyleft (LGPL, MPL 2.0)

**Examples**: GNU Lesser General Public License v2.1 and v3 (LGPL), Mozilla Public License 2.0 (MPL 2.0).

**Obligations.** Modifications to the licensed files themselves must be released under the same license. Files combined with proprietary code (linking, embedding) do not "infect" the proprietary parts. MPL 2.0 operates at *file* granularity; LGPL operates at *library* granularity.

**Strengths.**

- Encourages contributions back to the modified files without forcing the consuming application to be open source.
- Generally well-accepted by enterprise legal teams (more than strong copyleft, less than permissive).

**Trade-offs.**

- Does not deter network-service operators (a hyperscaler running the software as a service is not "modifying the file you would distribute"), which means it does not solve the hyperscaler concern.
- Determining what counts as "the library" versus "the application" is subtle and contested.

**Best fit.** Component libraries that want to enforce returns of bug fixes without restricting what calls them.

### 4.3 Strong copyleft (GPLv2, GPLv3)

**Examples**: GNU General Public License v2 (Linux kernel, WordPress, MySQL), GNU General Public License v3 (GCC, Bash).

**Obligations.** Any work that is a derivative of a GPL-licensed work and is *distributed* must also be released under the GPL, with complete corresponding source. GPLv3 adds anti-tivoization, explicit patent grants, and clarified compatibility provisions.

**Strengths.**

- Very large and mature ecosystem (Linux, WordPress, Drupal, MySQL, Inkscape, Audacity, ERPNext, Mautic).
- Forces contributions back when modifications are distributed.
- Familiar to enterprise legal teams via the Linux precedent.

**Trade-offs.**

- The "distribution" trigger is the historical one: it only fires when a binary or source is *handed over* to someone else. Running a modified version *as a network service* without distributing it does not trigger GPL.
- This is exactly the gap that AGPLv3 was created to close. For a modern hosted-service product, plain GPL is insufficient as a hyperscaler deterrent.

**Best fit.** Software that is distributed as a binary or source artifact (operating systems, end-user applications, CLI tools, libraries that ship with applications). Less ideal for SaaS-shaped products.

### 4.4 Network copyleft (AGPLv3)

**Examples**: Plausible Analytics, Cal.com, Mautic, MongoDB (until 2018), Mastodon, Nextcloud.

**Obligations.** Same as GPLv3, **plus** §13: if you modify the software and let users interact with the modified version "remotely through a computer network", you must offer those users the modified source code under AGPLv3. This is the **network use clause**.

**Strengths.**

- Closes the GPL "SaaS loophole". A hyperscaler operating a modified version of `<PLATFORM_NAME>` as a managed service must release their modifications. This removes the easy "fork-and-host-quietly" attack vector.
- Fully [OSI-approved](https://opensource.org/license/agpl-v3) and [FSF-recommended](https://www.gnu.org/licenses/why-affero-gpl.html). Counts as open source by every credible definition.
- Has a large, growing track record in SaaS-shaped projects: Plausible (analytics), Cal.com (scheduling), Mautic (marketing), Nextcloud (file sync), Mastodon (social), Frappe Cloud's underlying products in some configurations.
- Imposes obligations only on *modifications*. A self-hoster running the unmodified software has no obligation to publish anything.

**Trade-offs.**

- Some enterprise legal teams have AGPLv3 on a "do not use" list, often inherited from policies drafted in the early 2010s when AGPL was unfamiliar. This concern is real and is addressed below in §6.3 (dual licensing) and §7.5.
- The "modification + network interaction" trigger is broader than plain GPL's "distribute" trigger, which requires clear thinking about what counts as a modification (configuration vs source change) and what counts as "network interaction" (an internal back-office tool used by 50 employees is still network interaction).

**Best fit.** Network-delivered software where the operator typically modifies the code (configuration extensions, integrations, custom workflows) and the maintainers want to ensure those modifications return to the commons. This is exactly `<PLATFORM_NAME>`'s situation.

### 4.5 Source-available, *not* open source (BSL, SSPL, Elastic License)

**Examples**: Business Source License (BSL) — used by CockroachDB, HashiCorp Terraform (since 2023), Sentry, Couchbase. Server Side Public License (SSPL) — used by MongoDB (since 2018), Elastic (Elasticsearch since 2021). Elastic License 2.0 — used by Elastic for some products.

**Obligations.** Vary widely. Common shapes:

- **BSL**: source is published, commercial *production* use is restricted (typically: not allowed to offer a competing managed service), and the license **automatically converts to a permissive open-source license after a delay** (e.g. 4 years).
- **SSPL**: looks like AGPL, but extends the network copyleft to "all programs you use to make the software available as a service", including operational tools. Universally considered to make the code non-portable.
- **Elastic License 2.0**: source-available with three restrictions, most notably "no providing the software as a managed service".

**Strengths.**

- Source visibility (you can read the code, file bug reports, propose patches).
- Strongest deterrent against hyperscaler competition.
- Allows commercial use by end users (with restrictions).

**Trade-offs.**

- **Not open source by the OSI definition.** The OSI has explicitly rejected SSPL and Elastic License 2.0. BSL conforms only *after* its open-source conversion date, which means present-day BSL is not OSI-conformant.
- Excluded from Linux distribution repositories that require OSI-conformant licenses (Debian, Fedora, etc.). MongoDB was removed from Debian after the SSPL relicense.
- Community trust impact is severe and persistent. The HashiCorp Terraform → BSL move (August 2023) led to a hard fork (OpenTofu, now Linux Foundation-stewarded) within weeks. Redis's 2024 move to a non-OSI license similarly triggered the Valkey fork (also Linux Foundation). Once trust is broken, it is not rebuilt.
- Often pitched as "more pragmatic than AGPL". In practice, the community reaction has been "this is closed source with extra steps".

**Best fit.** Mature commercial projects with an existing paid customer base and brand strength sufficient to absorb the community-trust hit. Generally **not** a good fit for a new project trying to *build* a community.

### 4.6 Summary table

| Family | Examples | Network-service trigger? | Hyperscaler deterrent? | OSI-approved? | Enterprise-friendly? |
|---|---|---|---|---|---|
| Permissive | MIT, Apache 2.0 | No | None | Yes | Maximum |
| Weak copyleft | LGPL, MPL 2.0 | Only on modified files | Weak | Yes | High |
| Strong copyleft | GPLv2, GPLv3 | No | Weak (distribution only) | Yes | Moderate (Linux precedent) |
| Network copyleft | **AGPLv3** | **Yes (§13)** | **Strong** | **Yes** | **Moderate (mitigated via dual license)** |
| Source-available | BSL, SSPL, Elastic License | Varies | Strongest | **No** | Varies (often blocked) |

---

## 5. What real OSS B2B projects chose, and what happened

License choices are easier to reason about with the benefit of hindsight from projects similar in shape to `<PLATFORM_NAME>`.

### 5.1 Sustained successes

| Project | License | Revenue model | Team size | Lesson |
|---|---|---|---|---|
| **WordPress** | GPLv2 | Hosting (Automattic = WordPress.com), commercial themes/plugins, professional services | Foundation + Automattic large | A permissive *enough* copyleft that ecosystem flourished; brand and trademark held by the Foundation; community contribution > company control. |
| **Drupal** | GPLv2+ | Hosting (Acquia), enterprise support, professional services | Foundation + Acquia | Similar shape to WordPress; commercial steward must continually re-earn community trust. |
| **Plausible Analytics** | AGPLv3 | Hosting + self-host paid support | ≈4 people | **Bread-and-butter shape proven**: ~$3M ARR on AGPLv3 + cloud + no enterprise paywall on core. The clearest precedent for `<PLATFORM_NAME>`'s economic target. |
| **Cal.com** | AGPLv3 | Hosting + enterprise tier | ≈40 people, started smaller | AGPL did not deter enterprise adoption; the enterprise tier provides features that genuinely require operator support (SAML, audit logs, dedicated infrastructure). |
| **Mautic** | GPLv3 | Hosting (Acquia after acquisition), services | Foundation + Acquia | Community survived ownership change; GPLv3 + governance held the line. |
| **Frappe / ERPNext** | GPLv3 core + permissive licenses for some libs | Frappe Cloud hosting, enterprise support | ≈30 people | Closest functional precedent: real ERP, modest team, profitable, AGPL-adjacent. Demonstrates that ERP-class software can sustain on copyleft + hosting. |
| **Ghost** | MIT (with non-profit Foundation) | Hosting + paid support | ≈25 people | MIT works *if* there is a strong foundation and brand. The non-profit Foundation prevents capture; the trademark is the defensible asset. |
| **Sidekiq** | LGPL core + commercial Pro/Enterprise | Pro/Enterprise tier sales | ≈1–2 people | **Single-developer shape proven**: ~$10M+ revenue from one full-time maintainer for many years, on LGPL + paid tiers. The cleanest "bread and butter" precedent in dollar terms. |
| **GitLab** | MIT (CE) + proprietary (EE) | Hosting + EE subscriptions | Large (~1500 people) | Open-core works at scale, but the friction between CE and EE is continuous community discussion; viable only with a large brand and team. |

### 5.2 Cautionary tales

| Project | What happened | Lesson |
|---|---|---|
| **Magento → Adobe → Mage-OS** | Adobe acquired Magento (2018), closed contribution doors, prioritized commercial Magento Commerce over community Magento Open Source. Community lost trust, forked to Mage-OS (2022). Adobe is now losing market share to Shopify. | License (OSL 3.0) was fine. **Governance failed.** A welcoming contribution process matters at least as much as the license. |
| **MongoDB → SSPL (2018)** | Relicense to deter AWS DocumentDB. Removed from Debian, Fedora. AWS launched DocumentDB anyway. | Hostile relicense did not deter the hyperscaler and did alienate the open-source community. **Source-available is not the same as open source** to the community. |
| **Elasticsearch → SSPL/Elastic License (2021)** | Same logic, same outcome: AWS forked → OpenSearch (now broadly adopted in the AWS ecosystem and stewarded by the Linux Foundation). Elastic eventually re-added AGPLv3 in 2024 as an alternative. | AGPL would have been a better choice from the start. |
| **HashiCorp Terraform → BSL (August 2023)** | Community forked within weeks → OpenTofu (Linux Foundation, 2024). Many CIO offices put Terraform on a "no new adoption" list. HashiCorp later acquired by IBM. | Re-licensing an established project erodes brand trust persistently; community will fork rather than accept it. |
| **Redis → SSPL/RSALv2 (2024)** | Community forked → Valkey (also Linux Foundation, joined by AWS, Google, Oracle as backers). Redis reverted to AGPLv3 in 2025. | If your license choice would invite a Linux-Foundation-backed fork, you have the wrong license. |
| **Sentry → BSL (2019)** | Less severe community backlash than HashiCorp's, partly because Sentry simultaneously expanded paid features. Some community fragmentation persists. | BSL is survivable for a project with a strong product and clear value-add in the paid tiers, but it costs community goodwill. |

### 5.3 What we learn

Five lessons drawn from these case studies:

1. **License + governance is a single decision.** Magento Open Source had a fine license and a broken governance model; ecosystem fled. AGPLv3 with hostile governance would fare equally badly.
2. **Source-available is not a stable equilibrium.** The community treats it as closed-source with a window dressing, and a Linux-Foundation fork follows within months once enough infrastructure depends on the project.
3. **AGPLv3 is the modern correct answer for SaaS-shaped projects.** The pattern has been ratified by Plausible, Cal.com, Mautic, Nextcloud, Mastodon, and (in 2024-2025) by Elastic's partial return and Redis's full return.
4. **Brand and trademark matter as much as code license.** WordPress, Linux, and Plausible all defend their trademarks separately from their source license. The trademark is the durable economic asset.
5. **Enterprise legal teams' AGPL aversion is real but manageable.** The standard answer is dual licensing — same source, two license offers, customer picks. This was developed by MySQL in the early 2000s and refined by hundreds of projects since.

---

## 6. Our decision

### 6.1 Core platform: AGPLv3

The platform monorepo — Fastify API, Next.js web app, React Native app, Prisma schemas, brewery vertical, and all platform services — is licensed under [GNU Affero General Public License version 3](https://www.gnu.org/licenses/agpl-3.0.html).

**Reasoning, in plain terms:**

- **Hyperscaler defense**: if AWS / GCP / Azure ever operates a modified version of `<PLATFORM_NAME>` as a managed service, AGPLv3 §13 forces them to release the modifications. They keep the option to do it, but they cannot do it without contributing back to the commons. This is the deterrent that protects the hosting revenue line.
- **Real open source**: AGPLv3 is OSI-approved and FSF-recommended. Linux distributions accept it. Universities use it. There is no "is this actually open source?" question.
- **Proven economic shape**: Plausible, Cal.com, and others demonstrate that AGPL + hosting + optional enterprise support is a sustainable model for small teams.
- **Sufficient permissiveness for end users**: a brewery that self-hosts and tweaks the platform for its internal operations has no obligation to publish anything until they redistribute the modified version to others or operate a modified version *for other parties as a network service*.
- **Trust signal**: AGPL says "we trust the community more than we fear it". This pays off in contributions over the long term.

**Honest acknowledgement of the cost:**

- AGPL is on some enterprise "do not use" lists, mostly drafted before AGPL had a track record. Mitigation: dual licensing (see §6.3 and §7.5).
- AGPL's network use clause requires modification-tracking discipline operationally (if we host a modified version, our customers — who are users — can request the source). This is a feature, not a bug: it forces clean release management.

### 6.2 SDK / contracts / public interfaces: MIT License

A specific subset of packages — the ones third-party module developers must depend on to ship a module — is dual-released under the [MIT License](https://opensource.org/license/mit) **in addition** to AGPLv3.

**Which packages.** The SDK package set is the *minimum* surface a module needs:

- The module-SDK contracts: types, registration interfaces, the `registerModule()` declaration shape.
- The AI tool interface (`AiTool<I, O>`, `AiToolContext`, scope types).
- The API client public types and route-ID conventions.
- The i18n key-and-namespace conventions.
- The DTOs shared with module developers.

**What this is *not*.** The MIT-licensed packages do **not** include the platform implementation — the API server, the database schema, the orchestrator, the billing service, the brewery vertical, the web app, the native app. Those remain AGPLv3.

**Why MIT for the SDK specifically.**

- A third-party module developer (an indie consultancy, a hobbyist, a vertical-specific software vendor) needs to write their own module's source code without that source code becoming AGPLv3 by virtue of importing our types.
- The same pattern is used by Frappe (GPL core, MIT for `frappejs`-style libraries), ERPNext (similar), and several other large copyleft-cored projects.
- It does not weaken the core's protection: the *runtime* dependency from a module to the platform is mediated by network calls or by being loaded into an AGPL-licensed host process; the *source-level* dependency is via types and interfaces, which is the MIT scope.

**Concrete example.** A brewery consultancy wants to ship a closed-source module that does specialized water-chemistry calculations for distillers. They depend on `<PLATFORM_NAME>`'s MIT-licensed SDK packages for the types and registration. Their module's own source code can be MIT, Apache 2.0, or fully proprietary. When the module runs inside a `<PLATFORM_NAME>` host, the *host* is AGPLv3 — the consultancy's source code is not.

### 6.3 Available alternative: commercial dual license

For enterprises whose policies cannot accommodate AGPLv3, `<PLATFORM_NAME>`'s legal entity offers a **commercial license** for the same source code. The commercial license:

- Removes AGPL §13's "share source with users" obligation, replacing it with a commercial contract.
- Includes the same features and security patches as the AGPL version (no enterprise-only feature paywall — see §9 commitments).
- Is paid via subscription; revenue flows to the project's sustainability.
- Is offered on equal terms to all customers; it is not a tool of competitive favoritism.

This is the same dual-licensing pattern that MySQL pioneered, that Sidekiq, Mautic, and many others use today. It is well-understood by enterprise legal teams.

### 6.4 What we explicitly did not pick, and why

**MIT for the whole project** — no hyperscaler deterrent. A cloud provider could fork, host, and undercut without contributing anything back. Long-term project survival depends on the hosting revenue line, which a permissive license cannot defend.

**SSPL** — not OSI-approved. Banned from Debian/Fedora repositories. Community treats it as closed-source. Adoption rate would be a fraction of AGPL's.

**BSL with delayed conversion to open source** — community trust hit (see Terraform → OpenTofu, Redis → Valkey). The "future-dated open conversion" promise is widely seen as a marketing artifact, not a structural protection.

**Elastic License 2.0** — same OSI-rejection problem as SSPL, with the additional issue of vague "managed service" wording.

**Open-core with proprietary enterprise edition** — the path that broke Magento community trust. We commit explicitly (§9) **not** to gate features required for production use behind a commercial-only tier. The dual-licensing offer (§6.3) gives enterprises legal flexibility, not extra features.

**AGPLv3 with a contributor license agreement (CLA) that lets us re-license unilaterally** — this is what Elastic and HashiCorp did, and what made their subsequent re-licensing legally possible without community consent. We are intentionally not setting up a CLA that grants us unilateral re-licensing rights (see §9, §10).

---

## 7. Practical implications

### 7.1 For self-hosters

You can:

- Download, install, run, and modify the software on your own infrastructure.
- Use it for any purpose, commercial or non-commercial.
- Modify it for your internal needs without publishing modifications.
- Keep your data, your configurations, and your custom integrations entirely private.
- Stop using it at any time without ongoing obligation.

You must:

- Preserve copyright notices and license text in copies of the software.
- **If you modify the software and provide network access to the modified version to people outside your organization**, offer them the modified source under AGPLv3 §13. (This is the only AGPL-specific obligation that doesn't also exist in plain GPL.)

You do not have to:

- Publish modifications you do not network-serve to outside parties.
- Pay license fees of any kind.
- Have a commercial relationship with `<PLATFORM_NAME>`'s legal entity.

### 7.2 For hosted-by-us customers

If you use the managed `<PLATFORM_NAME>` hosting:

- You are using software hosted by us; you are a user, not a distributor. AGPL obligations do not apply to you as the customer.
- The standard hosting contract governs your relationship with the operator.
- AI is available through the paid workspace tiers using BYOK provider keys in the H2 2026 model; optional managed-AI credits are deferred and described in [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7.

### 7.3 For module developers (the most important audience)

You can:

- Build modules against the MIT-licensed SDK packages.
- License your module's source code under any license you choose: MIT, Apache 2.0, BSD, GPL, AGPL, commercial — whatever fits your business.
- Distribute your module via npm, GitHub, your own website, or a future `<PLATFORM_NAME>` module marketplace.
- Charge for your module, charge for support, or release it for free — your call.

You must:

- When your module is loaded into a `<PLATFORM_NAME>` host process, the host process as a whole is AGPLv3-licensed. This means: the *operator* of that host process (typically the end customer) has AGPL obligations toward *their* users. Your module's own source license is unaffected.
- Comply with the SDK's API contracts and versioning conventions (these are technical, not legal, requirements).

The practical effect: you can ship a closed-source vertical module without legal friction.

### 7.4 For competitors and hyperscalers

You can:

- Use the software internally for any commercial purpose without restriction.
- Fork it under AGPLv3 and host your own modified version, **provided you publish your modifications under AGPLv3 to the users of your service**.
- Compete with our hosting service on price, support, performance, geography, or any other axis — but on a level playing field where your modifications also flow back to the commons.

The license is not designed to prevent competition. It is designed to ensure competition happens on the merits, not by free-riding on closed-source modifications of our work.

### 7.5 For enterprises with restrictive legal policies

If your organization's open-source policy prohibits AGPLv3 adoption:

- The commercial dual license (§6.3) is available. It is the same code, on commercial terms instead of AGPL terms.
- Many enterprise legal teams that initially reject AGPL accept it after reviewing the obligations in detail — AGPL's network use clause typically applies only to operations the legal team would have wanted disclosed anyway (modifications to externally-network-served software).
- We are happy to engage with your legal team to clarify any specific concern.

---

## 8. Trademark and brand

The `<PLATFORM_NAME>` **name**, **logo**, and any future brand assets are **separate from** the source-code license. They are owned by the project's legal entity (currently a single-founder company; eventually possibly a foundation; see §10).

What this means in practice:

- You may build, distribute, and host a fork of the AGPL source code. You **may not** call your fork `<PLATFORM_NAME>` or use the logo. (This is the same protection WordPress.org applies to "WordPress" — derivative projects must use different names.)
- A modified version intended for internal use does not need a different name; trademark obligations apply to **public** distribution and presentation.
- Quotation, reference, attribution, and good-faith descriptions of the project ("we use `<PLATFORM_NAME>` internally", "this connector is for `<PLATFORM_NAME>`") are explicitly fine and welcomed.
- A future trademark policy document will codify these rules in detail. The Mozilla, Linux Foundation, and Plausible trademark policies are the reference set.

Trademark is the project's durable commercial asset. It is what makes "use our hosting" a coherent product offer in a world where anyone can fork the source.

---

## 9. Our commitments — what this license is *not*

To make the licensing posture credible and stable, we make the following commitments publicly. These are intended to be durable; any change requires a public RFC (§10).

1. **No closed-source replacement of public modules.** Any feature, fix, or extension that is part of the platform stays AGPLv3 (and, for SDK packages, MIT). We do not plan to deprecate a public module in favor of a closed-source replacement.
2. **No enterprise-only paywall on core functionality.** Bug fixes, security patches, and features required for production use are available to all AGPL users. The commercial dual license (§6.3) is a license-terms alternative, not a feature-set alternative.
3. **No future-dated re-licensing of existing source.** Source code that has been released under AGPLv3 stays AGPLv3. We commit not to retroactively close source that the community is depending on.
4. **No unilateral re-licensing via CLA.** We will not adopt a Contributor License Agreement that grants the project's legal entity the right to unilaterally re-license contributors' work. We will use [Developer Certificate of Origin](https://developercertificate.org/) (DCO) sign-off instead, which preserves contributor copyright.
5. **Public RFC for any licensing change.** Any change to this licensing posture — including adding new license alternatives, changing the SDK license, or modifying the commercial license terms — goes through a public RFC with a comment window of at least 30 days.
6. **Trademark policy will be written and published** before the first stable release. Trademark enforcement before then is informal; afterward, formal.

These commitments are themselves licensed CC0 / public domain — anyone may quote, fork, or adapt them.

---

## 10. How this can change

Licensing posture is a living governance decision, not a frozen artifact. The process for changing it:

1. **Proposed change** — written as a Markdown RFC in `docs/rfcs/NNNN-<title>.md`, with sections for motivation, alternatives considered, impact on contributors / self-hosters / module developers / hosted customers / enterprises, and migration plan.
2. **Public comment period** — minimum 30 days, hosted publicly (GitHub Discussions or equivalent). The project commits to engaging in good faith with substantive feedback.
3. **Resolution** — accepted, declined, or revised. Decisions and reasoning are published in the RFC.
4. **Forward-only application** — if the change is accepted, it applies to source committed *after* the change date. Source committed before that date remains under its original license. This protects users and contributors who relied on the prior terms.

This process mirrors the patterns adopted by Linux Foundation projects, Rust, and the IETF.

---

## 11. References and further reading

**Definitions and authority:**

- [Open Source Definition](https://opensource.org/osd) (Open Source Initiative).
- [Free Software Definition](https://www.gnu.org/philosophy/free-sw.html) (Free Software Foundation).
- [List of OSI-approved licenses](https://opensource.org/licenses).

**License texts:**

- [GNU AGPLv3 full text](https://www.gnu.org/licenses/agpl-3.0.html).
- [GNU AGPLv3 commented version](https://www.gnu.org/licenses/agpl-3.0-standalone.html).
- [MIT License full text](https://opensource.org/license/mit).

**Case studies and post-mortems:**

- [Plausible Analytics: "Why we picked AGPL"](https://plausible.io/blog/open-source-licenses) — closest precedent for `<PLATFORM_NAME>`.
- [Cal.com licensing discussion](https://github.com/calcom/cal.com/blob/main/LICENSE) and team blog posts.
- [OpenTofu manifesto](https://opentofu.org/manifesto/) — the community response to Terraform's BSL move.
- [Valkey announcement (Linux Foundation, 2024)](https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community) — community response to Redis's relicense.
- [Mage-OS project](https://mage-os.org/) — the Magento community fork's reasoning.

**Patterns we are emulating:**

- Frappe / ERPNext licensing structure (GPL core + permissive libs).
- WordPress + Automattic governance separation (Foundation owns trademark; commercial entity owns hosting business).
- Sidekiq dual-licensing (single-developer-friendly).

---

*This document is part of the `<PLATFORM_NAME>` platform documentation set. See [`docs/README.md`](README.md) for the full doc index, and [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) for the platform vision this licensing serves.*
