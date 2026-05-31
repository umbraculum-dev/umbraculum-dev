# Core development and community — what we ask, what we promise, how decisions get made

**Tier:** Public
**Status:** v0.1 draft (working agreement; living document). This document is **not** an RFC. See §9 for the promotion path to RFC-NNNN if/when the mechanism stabilizes.
**Audience:** prospective contributors, prospective sponsors (compute / AI tokens / money / time), community members evaluating "can I influence what gets built?", and the core team itself (this document is also the explicit codification of the bounds of core-team authority).
**Owners:** maintainers
**Related:** [`MANIFESTO.md`](../MANIFESTO.md) §2.1 (sustainability for the whole ecosystem), §2.2 (horizontal accessibility), §1.2 (AI-orchestrated code as the default authoring path); [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §2.2 (governance principles); [`docs/LICENSING.md`](LICENSING.md) §9–10 (license commitments + RFC change procedure); [`docs/rfcs/README.md`](rfcs/README.md) (RFC scope — *downstream consumption contract*, distinct from this doc's scope of *roadmap sequencing*).

> [!NOTE]
> This document is the project's honest answer to two questions a prospective contributor or sponsor reasonably asks early: *"can I influence what gets built next?"* and *"what kind of help is the project actually asking for?"* The short answers are **yes, through a documented mechanism** and **collaborators AND sponsors, including for AI compute** — the long answers are §3–§5 below. The mechanism here governs *roadmap sequencing*; it is **not** a substitute for the [RFC process](rfcs/README.md), which governs durable architectural and governance commitments.

---

## 1. Summary

The project is community-first in **agenda** (what gets built next is proposed and voted on by the community) and honest about **capacity** (core development is bounded by architecture, human labor, and AI token cost). The mechanism that holds both together:

1. **Community proposes.** Anyone may propose a piece of work for the project to pick up. Proposals are public.
2. **Community votes on what reaches the meeting.** A regular public meeting (cadence in §4.2) takes up the top-voted proposals; voting is open to the project's community channel, not gated by sponsorship.
3. **Meeting decides.** At the meeting, the community votes on which proposals the core team commits to next.
4. **Core team holds a bounded veto.** The core team may veto a proposal that is *not coding-appropriate* (e.g. requires architectural commitments that should go through the RFC process first; falls outside the canonical-module discipline of [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md); raises licensing, security, or accessibility concerns that need separate work first; or simply needs more discussion before it is well-formed). **The veto can only say "not this one"; it cannot substitute the core team's own preferred work in its place.** Vetoed proposals return to the discussion queue with a recorded, citable reason; the next-highest-voted unvetoed proposal moves forward.
5. **Sponsorship is invited alongside contribution, not as a substitute for it.** The project asks for **collaborators** (PRs, reviews, designs, documentation, translations) AND for **sponsors** (money, AI compute / tokens, paid time on the project). Sponsorship pays for the *capacity* to do more of what the community has already voted on — it does **not** purchase queue priority, vote weight, or veto immunity (§5.3).
6. **The mechanism is provisional.** It is written down v0.1 at a moment when the project is essentially solo-developed and needs to take off without derailing on early-governance debates. It is explicitly recallable, refinable, and on a documented path to RFC promotion if and when it stabilizes (§9).

The opening paragraph of [`MANIFESTO.md`](../MANIFESTO.md) §2.2 is the line this mechanism is calibrated against: **"the project will not narrow over time."** The community-proposes-and-votes part is what keeps the project's surface wide; the bounded core-team veto is what keeps wide-surface proposals from quietly violating the project's architectural and licensing commitments. Neither half works without the other.

---

## 2. Why this document exists

[`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §2.2 names *governance principles* — public contribution, RFC process for breaking changes, decision transparency, trademark separate from license. It does not specify the operational mechanism by which the community influences *what gets built next*. [`ROADMAP.md`](ROADMAP.md) names *trajectory* — what the core team is doing in 12–30 months. It does not document the procedure by which a community-proposed item enters that trajectory. [`CONTRIBUTING.md`](../CONTRIBUTING.md) names *how to contribute* — PR conventions, DCO sign-off, branch naming, tests-must-follow-changes. It does not say which work is open to be picked up.

This document fills that operational gap. It is the project's honest answer to: *"how does a proposal that does not originate inside the core team become work the core team commits to?"*

It also addresses a less-comfortable companion question. [`MANIFESTO.md`](../MANIFESTO.md) §1.2 commits the project to **AI-orchestrated code as the default authoring path**. That commitment makes AI compute a real production input, not a nice-to-have — comparable in scope to CI minutes, hosting, or maintainer time. A project that pretends this cost does not exist will end up either (a) silently rationing what the community sees, or (b) silently extracting unpaid AI-token cost from the maintainer's personal finances. The first failure mode breaks transparency; the second breaks sustainability (§2.1 of the manifesto). The honest alternative is to name the cost, ask the community to help carry it where the community can, and document publicly what the ask is for and what it does not buy.

---

## 3. The three constraints (architecture, human labor, AI tokens)

The project is constrained on what it can build. The constraints are real, and treating them as if they were not is the failure mode this document is designed to prevent.

### 3.1 Architecture

The project commits to specific architectural shapes that bound what work it can accept:

- **Canonical-module discipline** ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md)). The reserved canonical-module codes (`mrp`, `wms`, `crm`, `crp`, `automation`, `pim`) are allocated; new ones require an RFC. A proposal to build a wholly new canonical module is not a community-vote item — it is an RFC item with a 30-day public comment window per [`LICENSING.md`](LICENSING.md) §10.
- **β layout for modules** ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md)). The three-tree + contracts-package physical layout is committed. A proposal to restructure that layout is an RFC item, not a community-vote item.
- **License posture** ([`LICENSING.md`](LICENSING.md)). AGPLv3 + MIT SDK + commercial dual license is the committed posture, with explicit §9 commitments backing it. A proposal that depends on a license change is an RFC item.
- **AI-orchestrated authoring** ([`MANIFESTO.md`](../MANIFESTO.md) §1.2). The apparatus (rules + skills + agents + CI gates) is load-bearing for code quality. A proposal that requires bypassing the apparatus is not in scope.

The architectural constraints are not a "core team mood"; they are **public, documented, RFC-protected commitments**. The community-vote mechanism in §4 respects them by construction — the core-team veto exists in part to surface these RFC boundaries explicitly when a well-meant proposal crosses one, and to route that proposal into the RFC process rather than silently declining it.

### 3.2 Human labor

The project is, today and at the time of this document's first writing, essentially solo-developed under [`MANIFESTO.md`](../MANIFESTO.md) §1.2's AI-orchestrated discipline. The maintainer's wall-clock time is the project's hardest constraint. Even with the apparatus carrying a meaningful fraction of authoring cost, every shipped feature requires maintainer attention to (a) decide, (b) review the AI-orchestrated output, (c) verify against the CI gates, and (d) integrate with the rest of the codebase. That attention does not scale linearly with sponsorship money. It does scale meaningfully with **community collaboration** — additional reviewers, additional plan-authors, additional skill / rule contributors to the apparatus itself — and that is the highest-leverage thing the community can offer (§5.1).

### 3.3 AI tokens

The apparatus runs on inference calls. Frontier-model plan-authoring and reviewer-quality verification, in particular, consume real compute. At the project's current scale this is a personal-finance line item on the maintainer's account, and that is **structurally incompatible** with [`MANIFESTO.md`](../MANIFESTO.md) §2.1 over the medium term. The project asks the community to help carry this cost (§5.2), explicitly and openly, in the same way one would ask a community to help carry hosting cost for a self-hosted forum — except the unit is inference tokens rather than CPU-hours.

This is **not** an enterprise-feature paywall (the §9 commitments in [`LICENSING.md`](LICENSING.md) explicitly forbid that). It is a transparent request for help paying for production input the project openly depends on. Anyone may decline; declining does not change the contributor's standing or the proposal's vote weight (§5.3).

---

## 4. The mechanism

### 4.1 Anyone may propose

Proposals are opened publicly on the **canonical community forum** ([`forum.umbraculum.dev`](https://forum.umbraculum.dev) — see §4.6) in the **Proposals** category, starting at the public-alpha flip ([`ROADMAP.md`](ROADMAP.md) Phase 2 **2c**). Each forum topic links to a companion GitHub Issue when the proposal touches code (label TBD at flip); the forum topic is the durable discussion and voting surface; the GitHub Issue is the implementation tracker. A proposal is well-formed if it states:

1. **What** — the change the project should make, concretely enough that a core-team reviewer can size it.
2. **Why** — the user / contributor / operator value the change unlocks.
3. **Scope hint** — what the proposer believes it touches (a module, a package, a doc, an RFC). Best-effort; the core team will refine.
4. **Optional offers** — whether the proposer can collaborate on it (code, design, docs, review) and/or sponsor part of its compute or maintainer-time cost. Optional offers are *informational* — they do not move the proposal up or down the vote (§5.3).

There is no minimum size. A typo fix is a proposal; a new canonical module is an RFC. Most things are in between.

### 4.2 Community votes on what reaches the meeting

A regular public meeting takes up the top-voted proposals. The starting cadence is **monthly** — small enough to be sustainable for a small team, large enough to accumulate a meaningful queue between meetings. The cadence is revisable (§9).

Voting between meetings happens on the proposal forum topic itself (Discourse reactions or a pinned poll — whichever the core team publishes in the meeting-prep post for that cycle). Vote weight is **one vote per real participant** — no sponsorship-weighted voting, no organization-weighted voting. The project uses [DCO sign-off discipline](../CONTRIBUTING.md) for the same reason it uses one-vote-per-participant here: the unit of trust is a real person who can be reached at a real address.

A proposal needs **N upvotes by T days before the meeting** to be slated for that meeting. Initial N + T are deliberately not over-specified at v0.1 — they will be calibrated by the first few cycles. The discipline that matters is that the **threshold is published in advance of each meeting** and **does not move retroactively**.

### 4.3 At the meeting, the community decides

The meeting is **public** (live, recorded, transcript published — same transparency discipline as [PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md) §2.2 principle 5). The slated proposals are discussed; community participants present at the meeting vote on which ones the core team commits to for the next cycle.

The community vote is **binding** modulo §4.4. "Binding" means: the proposal enters the active backlog the core team draws from. It does not bypass per-PR review, CI gates, or — for proposals that turn out to require RFC-grade commitments mid-implementation — the RFC process. It does mean that the core team cannot quietly drop the proposal in favor of something else.

### 4.4 Bounded core-team veto

The core team holds a **veto, not a substitution right**. Specifically:

- The core team may veto a proposal **for cause**. Recognized causes (non-exhaustive, evolving with experience):
  - The proposal requires a change to an RFC-committed surface (canonical-module list, β layout, license, contracts-validation library, etc.) and should go through the RFC process first.
  - The proposal violates the [Code of Conduct](../CODE_OF_CONDUCT.md), the [accessibility discipline](DEVELOPMENT-ACCESSIBILITY.md), or the [licensing posture](LICENSING.md).
  - The proposal is not coding-appropriate as written — e.g. it is a UX research question, a market question, or a not-yet-well-formed idea that needs more discussion before it can be sized.
  - The proposal has a hidden architectural cost the proposers and voters were not aware of (silent cross-module coupling; would require major refactor; would dead-end a documented roadmap item).
  - The proposal has known-bad interactions with in-flight RFC work scheduled for the same window.
- The core team **may NOT** veto a proposal in order to commit instead to a different proposal that the community did not vote in. The veto closes a door; it does not open a different door. The next slot is filled by **the next-highest-voted unvetoed proposal**, not by core-team substitution.
- **Every veto must be recorded** — the proposal's forum topic (and linked GitHub Issue, if any) carries a comment with: which member of the core team vetoed, the cause from the recognized list above (or a clearly-stated new cause), the link to the relevant RFC / commitment / discipline if applicable, and — if the proposal can be reshaped to land — a sentence on what reshaping would unblock it.
- **Vetos are reviewable.** A proposer (or any community member) may request a meeting agenda item to review a veto. Review is not a re-vote; it is an opportunity to challenge the cause, surface information the core team did not have, or convert a "needs more discussion" veto into a follow-on RFC.

This shape — community decides, core team can only stop for cause, every stop is recorded and reviewable — is what makes "community-first" a *mechanism* rather than a *posture*. It is the same shape (in spirit) that the [Linux kernel maintainer model](https://www.kernel.org/doc/html/v4.13/process/8.Conclusion.html), the [Apache foundation project model](https://www.apache.org/foundation/how-it-works.html), and the [Mozilla module ownership model](https://www.mozilla.org/en-US/about/governance/policies/module-ownership/) take: ownership is real, ownership is bounded, ownership is publicly accountable.

### 4.5 What the core team does between meetings

The core team is **not** idle between community-voted slots. It runs the apparatus, lands routine maintenance (security patches, dependency bumps, CI fixes, foundation-hardening work per [`docs/FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md), accessibility-correctness regressions, etc.), and authors / executes RFCs for the architectural commitments the platform needs to honor its public-facing promises. Those are not vetoed-because-substituted work — they are the **standing maintenance and architectural commitments** the project signed up for when it published its license, manifesto, and RFCs. The community-vote mechanism allocates **new feature scope**, not **maintenance budget**. Maintenance is non-discretionary.

If the line between "maintenance" and "new feature scope" turns out to be contested in practice — a real risk — the §9 RFC-promotion path is how that line gets sharpened.

### 4.6 Community channels — where discussion lives

This section names the **operational surfaces** the §4 mechanism runs on. It is deliberately **cost-contained until traction is proven** — the project may not take off, and community infrastructure should not front-load spend or ops burden the way a mature foundation would.

**Design constraints (non-negotiable for Umbraculum-owned surfaces):**

- **Open source** for the canonical forum and any later chat/AV self-host paths (no proprietary chat platform as the system of record).
- **Not inside the product.** Community discussion is **not** a module feature and **not** covered by [RFC-0008](rfcs/0008-notifications-outbound-delivery.md) (product outbound email). The running app's notification service may eventually webhook *release/RFC reminders* to community channels; it does not host governance.
- **§6 anti-verticality applies** on Umbraculum-owned surfaces: fixed Umbraculum avatar, no stars/karma/badges/ranks, no system pings beyond the monthly policy email. Discourse trust levels and badges are **disabled or visually neutralized** at bootstrap.
- **Brochure and docs stay on Cloudflare Pages** per [`public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md) — community infra is a **separate subdomain on a separate VPS**, not mixed into the static-site pipeline.

#### 4.6.1 DNS and domain layout (Cloudflare)

The apex domain **`umbraculum.dev`** is already registered; DNS stays on **Cloudflare** (same zone as brochure and docs **Workers**).

| Hostname | Target | Pattern |
|----------|--------|---------|
| `umbraculum.dev`, `www` | Cloudflare Workers (brochure) | Custom domain on Worker (existing) |
| `docs.umbraculum.dev` | Cloudflare Workers (Docusaurus) | Custom domain on Worker (existing) |
| **`forum.umbraculum.dev`** | Community VPS (Contabo) | **A record** → VPS public IPv4; **DNS only** (grey cloud) at bootstrap so Discourse's Let's Encrypt workflow stays straightforward |
| `chat.umbraculum.dev` | Same VPS (Phase 1) | A record when chat lands |
| `meet.umbraculum.dev` | Same or second VPS (Phase 2) | A record when self-hosted AV lands |

**Bootstrap DNS steps (maintainer):** create the Contabo VPS → note its IPv4 → in Cloudflare, add `forum` **A** → that IP, proxy **off** → run Discourse install with `forum.umbraculum.dev` as hostname → verify HTTPS. Revisit Cloudflare proxy (orange cloud) only if abuse or DDoS appears; if proxied, use **Full (strict)** TLS to origin.

#### 4.6.2 Phase 0 — bootstrap (public alpha default)

Run **one service** on **one VPS** until the community proves it needs more.

| Layer | Platform | URL | Role |
|-------|----------|-----|------|
| **Governance + archive** | [Discourse](https://www.discourse.org/) (self-host, GPL) | `https://forum.umbraculum.dev` | Proposals (§4.1), vote threads (§4.2), meeting agendas/minutes/transcripts (§4.3), policy posts, general help |
| **Code + PRs** | GitHub (`umbraculum-dev` org) | Issues / PRs / Discussions for code-shaped Q&A | Implementation tracker linked from forum topics; DCO on commits ([`CONTRIBUTING.md`](../CONTRIBUTING.md)) |
| **Informal talk** | Discourse categories (e.g. **Help**, **Introductions**) | on forum | **No separate chat app** at Phase 0 |
| **Live meetings** | **Provisional external AV** (e.g. public Jitsi meeting link announced in the forum **Meetings** category) | link posted per meeting | Convenience only — **not** the canonical record. Recording and transcript (or detailed minutes) are **published on the forum** |
| **Transactional email** | Free-tier SMTP (e.g. Brevo, Mailgun trial) | — | Required for Discourse invites/digests; free tier is sufficient at alpha scale |

**Hosting (Phase 0):** Contabo **Cloud VPS 10** — Ubuntu 24.04 LTS, 75 GB NVMe, Auto Backup on. Spec: 4 vCPU, **8 GB RAM**, 1 manual snapshot slot.

**Maintainer runbook:** [`community-forum-runbook.md`](design/community-forum-runbook.md) (install, DNS, §6 Discourse hardening, smoke tests). Supporting docs: [`community-forum-vps-security.md`](design/community-forum-vps-security.md), [`community-forum-ssl-strategy.md`](design/community-forum-ssl-strategy.md), [`community-forum-secrets-inventory.md`](design/community-forum-secrets-inventory.md), [`infra/community-forum/`](../../infra/community-forum/).

**Phase 0 infra total (itemized):** **€7.60/month** — VPS €3.60 + Auto Backup €1.50 + Contabo Object Storage €2.50 (planned for Discourse off-site backups). **Published round figure for support/donations:** **~€10/month (~€120/year)**. Brevo SMTP stays on free tier at alpha scale. Plus maintainer ops time (~2–4 h/month for forum patches/backups; ~2 h/meeting when a public meeting runs).

#### 4.6.3 Phase 1 — real-time chat (deferred)

**Trigger (any one is enough):** sustained need for real-time coordination that clogs forum categories; or **≥10 monthly active forum participants** and repeated "we need a chat" signal at a community meeting.

| Add | Platform | URL | Hosting |
|-----|----------|-----|---------|
| Real-time chat | [Matrix](https://matrix.org/) via a lightweight homeserver (e.g. Conduit) | `https://chat.umbraculum.dev` | Same **VPS 10** if RAM stays comfortable; else upgrade (§4.6.4) |

**Alternative:** apply for [Zulip open-source project sponsorship](https://zulip.com/for/open-source/) — if accepted, chat may run on Zulip Cloud at **€0** infra while the forum stays self-hosted on Contabo.

Chat is **informal**; binding votes and meeting records remain on the forum.

#### 4.6.4 Phase 2 — self-hosted meetings (deferred)

**Trigger:** the monthly public meeting (§4.2) is an established ritual **and** provisional external AV is no longer acceptable (retention, branding, or reliability).

| Option | Platform | Infra |
|--------|----------|-------|
| **A (preferred)** | [Jitsi Meet](https://jitsi.org/) on upgraded VPS | Upgrade VPS 10 → **Cloud VPS 20** (**€5.60/month**, 12 GB RAM) — Discourse + chat + light Jitsi co-hosted |
| **B** | Jitsi on second VPS 10 | **€7.20/month** (2× €3.60) — isolates video load from the forum |

Add **Jibri** (recording) only when published recordings become policy, not at first self-hosted AV.

#### 4.6.5 Cost summary (published expectation)

| Phase | Contabo plan | Infra / month (itemized) | Public round figure | When |
|-------|--------------|--------------------------|---------------------|------|
| **0 — Alpha** | Cloud VPS 10 + Auto Backup + Object Storage (planned) | **€7.60** | **~€10** | Public-alpha flip |
| **1 — Chat** | VPS 10 (same) or VPS 20 if tight | **€7.60–9.60** (VPS tier may change) | **~€10–12** | Chat trigger (§4.6.3) |
| **2 — Own AV** | VPS 20 upgrade or 2× VPS 10 | **€9.60–14.40** | **~€12–18** | Meeting trigger (§4.6.4) |

Phase 0 itemized breakdown: VPS €3.60 + Auto Backup €1.50 + Object Storage €2.50. Object Storage may be wired after bootstrap; it is still budgeted in the published ~€10 figure.

These figures assume the existing `umbraculum.dev` zone (no new domain purchase) and free-tier Brevo SMTP. Sponsorship may expand capacity later; it does **not** change vote weight (§5.3).

#### 4.6.6 Revisit

Channel choices, vote tooling on Discourse, Sybil mitigation (§6), and Phase 1/2 triggers are **revisited** on the §9 schedule (first comprehensive revisit within six months after the July 2026 public alpha). Upgrades are **additive** — the forum URL remains the canonical governance home across phases.

---

## 5. What we ask the community for

### 5.1 Collaborators (the highest-leverage ask)

The project asks for what every healthy open-source project asks for, with one project-specific intensifier:

- **Code, reviews, documentation, translations, accessibility audits, tests, bug reports.** Standard. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the PR conventions.
- **Plan authors.** Per [`MANIFESTO.md`](../MANIFESTO.md) §1.2 and [`docs/NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md), the project's authoring path benefits disproportionately from well-drafted plans that AI executors can land. A contributor who can write a high-quality execution plan (worked example: [`docs/design/rfc-0005-execution-plan.md`](design/rfc-0005-execution-plan.md)) is unblocking *many* downstream commits, not just one.
- **Rule / skill / subagent authors for the apparatus.** The `umbraculum-toolset` Cursor plugin pack ([`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md)) is itself open source and welcomes contributions. A new rule, skill, or subagent that prevents a class of bug at authoring time pays compounding dividends across every future contributor's work.
- **RFC authors.** The community can author RFCs against the project's `docs/rfcs/` set per the [RFC index](rfcs/README.md) §3 procedure. RFCs are the project's most durable artifact; authoring one is a first-class contribution.

The intensifier specific to this project: a thoughtful collaborator working *inside* the apparatus does more work per wall-clock hour than the same collaborator would in a similarly-sized project that lacks the apparatus. That asymmetry is the whole [`MANIFESTO.md`](../MANIFESTO.md) §1.3 simplicity-without-sacrificing-complex-tasks argument, made concrete on the contributor side.

### 5.2 Sponsors (including for AI compute)

The project asks the community, openly, to help carry the cost of the inputs the apparatus consumes:

- **AI compute / tokens.** Inference cost for frontier-model plan-authoring, verification, and (where future-staged) the AI consultant's hosted-service path. The unit is inference tokens — denominated in dollars but spent on compute.
- **Maintainer time.** Sponsorship that lets the maintainer spend more wall-clock hours on the project versus on consulting / day-job work. This is the most direct way to convert sponsorship into shipped work the community voted on. If at some future point sponsorship is sufficient to fund paid maintainer time beyond the current maintainer's own hours, long-tenured contributors will be considered fairly for those slots — a contingent fairness commitment, not a directional intent to grow the project into an employer (see the [`MANIFESTO.md`](../MANIFESTO.md) addendum, *Fair consideration if paid time ever exists* bullet).
- **Infrastructure.** Hosting, CI minutes, monitoring, etc. — the standard list. Less unique to this project than the first two, but real.
- **Environmental accounting.** A **1% [Stripe Climate Commitments](https://docs.stripe.com/climate/commitments)** allocation on Stripe-processed sponsorship payouts; **forest stewardship** (one hectare maintained today; local reforestation as means allow) — not a governance perk, not offset marketing; open forum discussion welcome. Full policy: [`donation-channels.md`](design/donation-channels.md) §9.
- **Specific named line items.** When a community-voted proposal has a knowable compute or hosting cost, the project will say so (e.g. "this proposal requires roughly $X in inference for the plan-authoring + verification pass"). Sponsors may earmark to specific line items if they wish; they may also sponsor general-purpose capacity.

**Payment channels (Phase 0 — solo project).** At public alpha, financial sponsorship uses two low-overhead rails documented in [`donation-channels.md`](design/donation-channels.md):

- **[Liberapay](https://liberapay.com/Umbraculum/)** (`Umbraculum` team) — **recurring** donations; **0%** platform fee (payment-processor fees only).
- **[Buy Me a Coffee](https://buymeacoffee.com/Umbraculum)** — **one-time** tips; ~5% platform fee (Liberapay is recurring-only).

**In-kind** (AI/API organizational billing, cloud credit programs, infrastructure) is **not** a checkout button — sponsors coordinate via the public forum or `/support` per the runbook. **No shared API keys.**

Umbraculum is **solo-maintained** at this stage. **Adding or replacing channels** (e.g. GitHub Sponsors, Open Collective for org invoices and public budget) follows a **community proposal and vote** (§4) when the triggers in [`donation-channels.md`](design/donation-channels.md) §5 fire — not a unilateral maintainer change. §5.3 disciplines apply to all channels.

What this document commits is the **principle**: sponsorship is an honest ask, recorded publicly, with the §5.3 disciplines.

### 5.3 What sponsorship does NOT buy

To prevent the failure modes that have made other community projects' sponsorship arrangements feel extractive, this document is explicit about what sponsorship does **not** purchase:

- **No vote weight.** Sponsorship does not increase a sponsor's vote in §4.2 / §4.3. One sponsor's vote weighs the same as one volunteer reviewer's vote and the same as one user who has never contributed anything but reactions on issues.
- **No queue priority.** Sponsorship does not move a sponsor's preferred proposal ahead of others in the vote queue. The community vote is the queue.
- **No veto immunity.** The core team's veto applies equally to sponsored and unsponsored proposals. A sponsor cannot purchase a "no veto" guarantee.
- **No private channel.** Decisions about what the project commits to are made in the public meeting (§4.3), not in sponsor-private conversations. Sponsors who want to discuss work with the core team do so on the same public surfaces everyone else does.
- **No feature paywall.** This is already a [`LICENSING.md`](LICENSING.md) §9 commitment, restated here: nothing built with sponsorship dollars becomes a sponsor-only feature. All AGPLv3 work stays AGPLv3, available to every user under the same terms.

These five "does not buy" lines are the **structural** protection against sponsorship corrupting the community-first agenda. Without them, "community-first with sponsorship welcomed" silently becomes "core team builds what sponsors want, votes are theatre" — the exact failure mode every honest open-source project tries to avoid and the cynical reading every potential community member arrives with. We name the protection explicitly so it can be held to.

### 5.4 What sponsorship DOES buy (for the sponsor)

So that the ask is honest in both directions, the things sponsorship does buy:

- **Public acknowledgement** (with explicit opt-out for sponsors who prefer to remain anonymous). Names listed on a project-side sponsors page; nothing more aggressive than that.
- **A line in the meeting transcript** if the sponsor wishes to publicly explain *why* they sponsor what they sponsor — useful for sponsors whose own community wants to know where their money is going.
- **The same visibility into in-flight work everyone else has.** Sponsors see exactly what the rest of the community sees — the public roadmap, the public meetings, the public issue tracker, the public RFC discussions.
- **The non-trivial satisfaction of knowing they are helping a project's foundation hold under [`MANIFESTO.md`](../MANIFESTO.md) §2.1 sustainability terms** — which is the only psychic reward the project promises and the only one it can promise without violating §5.3.

---

## 6. Anti-verticality on community surfaces — seniority does not buy attention

Communities that accrete "seniors", "super-starred" profiles, karma scores, or visible reputation badges measurably suppress newcomer participation: people wait for the senior to weigh in, the senior dismisses the newcomer who tried to help. We treat this as a structural defect of the platform, not a failure of the participants, and design it out:

- All community participants display the Umbraculum logo as their avatar on Umbraculum-owned community surfaces (forum, voting UI, meeting transcripts, etc.). Avatars are not customizable.
- No stars, karma, reputation scores, badges, ranks, or master-profile pages on community surfaces.
- The only system-initiated outreach is a **monthly email** carrying the link to the most recently updated community policy. No other system pings.
- Tenure does not buy floor time, agenda weight, vote weight, or veto immunity. The §4.2 one-vote-per-participant property is preserved against tenure as strictly as §5.3 preserves it against sponsorship.

**Two layers, named explicitly.** Anonymity here applies to the *discussion / display* layer. The *commit* layer remains [DCO](../CONTRIBUTING.md)-bound (real name + monitored email — anonymous sign-offs cannot be accepted). Two different surfaces, both intended.

**Maintainers as a *role* remain identifiable** on the surfaces where role-identity is operationally needed (PR review, security disclosure, license questions). The commitment is the absence of *implicit prestige hierarchy among community participants*, not the absence of *operational responsibility*. Maintainers exercise their bounded authority under §4.4; that authority is procedural, not prestige-derived.

**Open at v0.1 — anti-Sybil mitigation for the community-voting mechanism.** With visual anonymity (above) and no reputation, the §4.2 one-vote-per-participant property is gameable by one person opening multiple accounts. We do not consider this resolved at v0.1. One real candidate under consideration is binding voting eligibility to a verified GitHub account, since [DCO](../CONTRIBUTING.md) already grounds commit-layer identity there and reusing that identity layer would be cheap to implement; the tradeoff is that GitHub literacy is unevenly distributed — non-developer community members (operators, brewers, evaluators) may not have or want a GitHub account, and making it the voting prerequisite would re-introduce a form of verticality favoring developers over non-developers, which is at odds with the [`MANIFESTO.md`](../MANIFESTO.md) §2.2 horizontal-accessibility commitment in spirit. Lightweight alternatives (verified email + minimum-account-age-before-voting + manual review on suspicious patterns) are also on the table. This is explicitly open; resolution before the first contested community vote runs in anger; tracked under §9 (revisit cycle).

### 6.1 Authentic representation in community discourse

On Umbraculum **community surfaces** (forum, public meetings, governance threads, official community email), trust attaches to **real people**. A participant is represented only by themselves — or by a **human delegate they have explicitly authorized**. Automated or AI-generated messages must not create the impression that a specific person wrote something they did not.

This is separate from the **in-product AI consultant** ([`AI-CONSULTANT.md`](AI-CONSULTANT.md)) and from **AI-orchestrated code authoring** ([`MANIFESTO.md`](../MANIFESTO.md) §1.2). Those are product and engineering disciplines. This section governs **human-to-human community trust**.

**Rules**

1. **No impersonation.** Do not use AI, scripts, or third-party tools to post, reply, vote, or message **as** another person or as an unnamed “community member.”
2. **No undisclosed automation.** If a message is sent by a bot, scheduler, or automation on behalf of a role (release notifier, meeting reminder), it must **state that clearly** at the top (e.g. `Automated post — not written by a human`).
3. **No AI as a faux thread participant (Umbraculum-owned forums).** **Not allowed:** AI-generated replies inside discussion threads (proposals, meetings, Help, Introductions) presented as ordinary human participation. Humans may use AI privately to draft text; what they publish is **their** message and they remain accountable for it.
4. **Disclosure when AI helped you write.** If you used AI substantially to draft a community post, say so briefly (e.g. “Drafted with AI assistance; reviewed and posted by me”). Light editing of your own words does not require a disclaimer.
5. **Maintainers and employment.** Official replies from the project (security, conduct, vetoes) come from **identified humans** in maintainer/mod roles — not from AI pretending to be “the team” or a named individual. If the project ever has paid community-facing roles, **representation stays human**; AI will not simulate staff or volunteers in community spaces ([`MANIFESTO.md`](../MANIFESTO.md) §5.2 fair-consideration note).
6. **Product AI stays in the product.** The workspace AI consultant must not be pointed at community forums or used to answer on behalf of the project or a member in community spaces.

**Enforcement.** Undisclosed AI impersonation and undisclosed bots in threads are [**Code of Conduct**](../CODE_OF_CONDUCT.md) issues (deception / misrepresentation), not preferences.

**Forum bootstrap (do not forget).** When `forum.umbraculum.dev` goes live, pin the **How we communicate** topic in **Community policy** per [`community-forum-runbook.md`](design/community-forum-runbook.md) §6 (pinned topic 5) and §7.5. Tracked on the public-alpha path in [`ROADMAP.md`](ROADMAP.md) Phase 2 **2d** / **2c** and [`public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md) §8–§9.

---

## 7. Why this is community-first, and the specific failure mode it avoids

Two readings of this document are possible. The first reading — *"core team decides what to build, community is consulted"* — would contradict community-first. The second reading — *"community decides what to build, core team can only stop a proposal for documented cause"* — is what this document actually establishes. The difference between the two readings is mechanical, not rhetorical, and the §4 mechanism is structured to make the second reading the only one consistent with the words on the page:

- The agenda is set by community proposals (§4.1), not by the core team's preferences.
- Voting on what reaches the meeting is open and weighted one-per-participant, not weighted by sponsorship or organization (§4.2).
- Meeting decisions are binding on the core team's commitment (§4.3) — "binding" in the operational sense that proposals enter the backlog the core team draws from, not the optimistic sense that everything else stops.
- The core team's authority is **a veto, not a substitution right** (§4.4). Vetos are public, citable, reviewable, and cannot reroute the slot.
- Sponsorship is structurally walled off from vote weight, queue priority, veto immunity, private channels, and feature paywalls (§5.3).

The failure mode that "community-first" can hide, in projects that say it without mechanism, is **silent core-team substitution**: community proposes A, B, C; community votes A; core team quietly ships X instead "because we know best"; the community vote becomes a polite ritual that justifies whatever the core team was going to do anyway. The §4.4 bounded-veto property is the structural prevention of that mode. If a proposal is not coding-appropriate, the core team says so, on record, and the slot goes to the next-highest-voted unvetoed proposal — *not* to whatever the core team would have preferred to ship in that slot. The community's agenda survives the core team's intervention.

The companion failure mode — **silent capacity-hiding** — is when a project pretends every proposal is equally implementable while quietly rationing what it actually picks up. The §3 explicit-three-constraints framing prevents that: architecture, human labor, and AI-token cost are named upfront, and the §5 sponsorship ask is the honest path to expanding what the project can carry rather than rationing in silence.

The project is community-first **because** the agenda is the community's; it is honest **because** the capacity is bounded and the bounds are named; it is sustainable **because** sponsorship is a real channel with real disciplines around what it does and does not buy.

---

## 8. What this document is NOT

To prevent scope creep on this mechanism itself, the explicit non-scope:

- **Not a substitute for the RFC process.** [Architectural and governance commitments](rfcs/README.md) go through RFCs with a minimum 30-day public comment window per [`LICENSING.md`](LICENSING.md) §10. The community-vote mechanism above governs roadmap *sequencing*; the RFC process governs the *contract*. A proposal that requires RFC-grade commitments mid-implementation must be routed through the RFC process (this is one of the recognized veto causes in §4.4).
- **Not a feature paywall mechanism.** The §9 [`LICENSING.md`](LICENSING.md) commitments — no closed-source replacement of public modules, no enterprise-only paywall on core functionality, no future-dated re-licensing, no unilateral re-licensing via CLA, no licensing change without RFC, public trademark policy — are stronger than this document and remain authoritative.
- **Not a sponsor-priority mechanism.** §5.3 is explicit on this.
- **Not a permanent fixture.** §9.
- **Not a substitute for the [Code of Conduct](../CODE_OF_CONDUCT.md).** All meeting, voting, and discussion channels operate under the CoC. CoC enforcement is independent of this document.
- **Not a substitute for [`CONTRIBUTING.md`](../CONTRIBUTING.md).** The PR-conventions / DCO / tests-must-follow-changes disciplines apply to all work landed under any voted proposal.

---

## 9. Provisional discipline — when this changes, and how it becomes an RFC

This document is written, at v0.1, by the founding maintainer **before there is a meaningful community to write it with**. That is the honest framing. The mechanism here is the starting condition the project boots from, not the rule the community agreed to. Two things follow:

### 9.1 It will be revisited

The mechanism is on a deliberate revisit schedule. The first comprehensive revisit happens **within the first six months after the July 2026 public alpha** (per [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" — the public alpha moves forward from its original H1 2027 horizon). The revisit asks: who has actually shown up? what worked? what failed? what did the community itself prefer to have looked different?

The revisit is itself a public process — held in the same public meeting (§4.3) by which the regular work is voted on, with a longer dedicated agenda slot. Outcomes of the revisit are recorded inline in this document as a new version (v0.2, v0.3, …) with the date of the revisit and a short changelog at the top.

### 9.2 Promotion to RFC

If the revisit (or a later one) finds that the mechanism has **stabilized** — i.e. it has been running for at least one full cadence without controversial cases that required reshaping it on the fly — the document is promoted to an RFC: `docs/rfcs/NNNN-core-development-and-community.md`. Promotion follows the [RFC index](rfcs/README.md) §3 procedure: copy the structure of [`0002-canonical-module-physical-layout.md`](rfcs/0002-canonical-module-physical-layout.md), use the next sequential RFC number, follow the [`LICENSING.md`](LICENSING.md) §10 acceptance procedure (post-public-flip: minimum 30-day public comment window). After promotion, this `CORE-DEVELOPMENT-AND-COMMUNITY.md` file is rewritten as a short pointer to the RFC and an operational addendum (e.g. the current meeting cadence, the current vote threshold N + T from §4.2) that the RFC explicitly delegates to operational guidance.

If the mechanism is found to be **destabilized** — e.g. a recurring failure mode that the current shape does not address, or a contested interpretation that keeps recurring — the revisit produces a v0.X with the change, and the RFC-promotion timer effectively restarts at the new stable shape. There is no penalty for needing to iterate; there is a discipline against pretending nothing iterated.

### 9.3 Hard rule on changes during the provisional period

Until promotion to RFC, changes to this document are made under the same discipline as [`MANIFESTO.md`](../MANIFESTO.md) — **the commitments are durable, the language is not**. The §4.4 bounded-veto property, the §6 anti-verticality commitments (fixed avatar, no stars / no master profiles, no system-pings beyond the monthly policy email, tenure-does-not-buy-attention), the §6.1 authentic-representation commitments (no AI impersonation of members, no undisclosed bots in threads, labeled automation only), the §5.3 "sponsorship does not buy" list, and the §7 community-first reading are the commitments; their exact phrasing is editorial. A change to any of those commitments is not an editorial change — it is treated as if it were an RFC-grade change even though this document is not yet an RFC, meaning: the change is proposed publicly, given a 30-day comment window before landing, and recorded with the rationale. This is stricter than the document's own provisional status would technically require, and deliberately so: the commitments are the substance, and the substance does not get to migrate quietly.

---

## 10. Acknowledgements

The shape of this document — *community-proposes-and-votes + bounded-core-team-veto + explicit sponsorship-doesn't-buy-priority* — owes substantively to long-standing patterns in well-functioning open-source governance: the [Linux kernel maintainer model](https://www.kernel.org/doc/html/v4.13/process/8.Conclusion.html) (ownership is real, bounded, public), the [Apache Software Foundation project model](https://www.apache.org/foundation/how-it-works.html) (community over code; commits don't equal ownership), and the [Mozilla module-ownership policy](https://www.mozilla.org/en-US/about/governance/policies/module-ownership/) (owners are stewards, not gatekeepers). The bounded-veto language in §4.4 in particular is a deliberate echo of [Mozilla module ownership "the module owner has the final say in disputes within their module"](https://www.mozilla.org/en-US/about/governance/policies/module-ownership/) — narrowed here, for a smaller project at an earlier stage, to *veto, not substitution right*.

The "sponsorship does not buy X" disciplines in §5.3 are calibrated against the failure-mode pattern documented in [`LICENSING.md`](LICENSING.md) §3 (Adobe → Magento, HashiCorp → Terraform / OpenTofu, Redis → Valkey) — projects whose community sustainability eroded when commercial / sponsor influence quietly replaced community influence on direction. The structural protections here are the upstream-of-license version of what AGPLv3 protects downstream-of-license: both are written to keep the project's agenda the community's.

A complementary practitioner lesson — **capable product, ecosystem never formed** (documentation, community, tryability absent; locked code did not retain customers who switched products) — is in [`design/ecosystem-case-study-omnis.md`](design/ecosystem-case-study-omnis.md); see also [`LICENSING.md`](LICENSING.md) §5.3 lesson 6 and [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §2.1.

**Learnability and repositioning** — whether developers forced to move can learn on spare time because the stack is free and clear — is documented in [`design/ecosystem-case-study-sap.md`](design/ecosystem-case-study-sap.md), [`design/ecosystem-case-study-teamsystem.md`](design/ecosystem-case-study-teamsystem.md), and the partial positive [`design/ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md). Umbraculum commits to **no certification program**; expertise offers from learners and domain specialists are preferred over badge walls ([`MANIFESTO.md`](../MANIFESTO.md) §2.2, [`GETTING-STARTED.md`](GETTING-STARTED.md) §"No certification track").

This document is itself a v0.1 working agreement, written by the founding maintainer; it expects to be challenged in good faith by the community that shows up post-flip, and to be sharpened (or replaced) by that conversation. The §9 promotion path is the structural commitment to that openness.
