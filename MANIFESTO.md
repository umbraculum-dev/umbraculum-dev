# Umbraculum manifesto

**Tier:** Public
**Status:** v0.1 draft (living document)
**Audience:** every contributor, customer, consultant, learner, observer, critic, and future maintainer of Umbraculum. Also: anyone deciding whether to bet a business or a profession on this project.

> *Total Quality says defects are designed-out at the process level, not caught at QA. The AI + rules + skills + agents stack we've been building is literally a process-level defect-prevention apparatus.*

---

## Why this document exists

Most software projects encode their values implicitly — in their licenses, their commit messages, their issue templates, their tone in pull-request reviews. A reader who pays close attention can usually reconstruct what a project believes about quality, contributors, sustainability, and people, but only after spending months inside it.

This manifesto is the explicit version of those implicit values. It says, in plain language, what Umbraculum believes about how software gets built, who the project serves, and who the project's people are. It is a public commitment, written before the project is large enough for us to be tempted to soften any of it.

Three guardrails on how it should be read:

1. **It is not a marketing document.** No hype, no superlatives, no "we are the only", no "we revolutionize". The values it states are deliberately ordinary — quality, sustainability, empathy, inclusivity. The work is in living up to ordinary values consistently, not in claiming extraordinary ones.
2. **It is a living document.** Like [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) and [`docs/LICENSING.md`](docs/LICENSING.md), this is versioned and will evolve. What stays fixed across versions are the *commitments* — the politically-loaded statements in §3 are not softenable, only refinable. What evolves is *language*: as the project grows we will sharpen the prose, add specific examples, and respond to good-faith critique.
3. **It is paired with mechanism.** Values without mechanism are pieties. Each value here points to the concrete artifact that enforces it: the license enforces our sustainability claims ([`docs/LICENSING.md`](docs/LICENSING.md)); the rules + skills + agents apparatus enforces our quality claims ([`.cursor/rules/`](.cursor/rules/) and the [Cursor plugin migration roadmap](docs/PLUGIN-MIGRATION-ROADMAP.md), once published); the architectural decisions in [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) enforce our coherence claims. If you find a value here without a corresponding mechanism, that is a bug in the manifesto.

The brand was resolved on 2026-05-18 to **Umbraculum** ([`docs/RENAME-DILIGENCE.md`](docs/RENAME-DILIGENCE.md)); the wordmark is a Latin diminutive of *umbra* — "small parasol", "small shade" — which is a fitting frame for what the project tries to be: a small, durable shelter under which serious work gets done.

---

## 1. How we build

*Operational philosophy. The non-negotiables of how software gets produced inside this project.*

### 1.1 Quality (Total Quality)

Quality with a capital Q. The lineage we are claiming is specific, and naming it matters more than describing it.

- **Antonio Galgano** — *La qualità totale*, the introduction of TQM thinking into Italian industrial practice in the 1980s and 1990s. Galgano's framing — quality as a property of the whole organization, not a department — is the lens we work through.
- **W. Edwards Deming** — Total Quality Management (TQM) in its mature American form. "You cannot inspect quality into a product" is the line we keep. Defects are upstream of inspection.
- **Toyota Production System** (Taiichi Ohno) — *jidoka* (autonomation: stop the line when a defect appears) and *poka-yoke* (mistake-proofing: design the process so the mistake cannot be made). These are the two ideas that survived the translation from manufacturing to software intact.
- **Kaizen** — continuous incremental improvement. Quality is not a project, it is the default mode.

The shorthand most teams use, when they have not encountered any of the above, is "we care about quality". This is not what we mean. Caring about quality is necessary and insufficient; everyone caring about quality and producing low-quality output is the dominant industry experience. What we mean is **the apparatus**: the rules, the skills, the agents, the lint, the types, the tests, the CI gates, the conventions documented in [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md), [`docs/LINTING.md`](docs/LINTING.md), [`docs/TESTING.md`](docs/TESTING.md), [`docs/TYPING.md`](docs/TYPING.md). The apparatus is how Total Quality lands in code. Without the apparatus, Total Quality is a bumper sticker.

The structural-goal tagline at the top of this document is the literal claim: *the AI + rules + skills + agents stack is a process-level defect-prevention apparatus*. It is *poka-yoke* applied to software. That is the lineage. That is what Quality means here.

### 1.2 AI-orchestrated code as discipline

> [!NOTE]
> This section is about how **the project itself is built** — AI-orchestrated code as an authoring discipline. For the AI consultant as a **product feature** in the running platform (chat surface, registered tools, per-workspace operational memory, BYOK + paid-tier unlock), see [`docs/AI-CONSULTANT.md`](docs/AI-CONSULTANT.md). The two AI stories are related but distinct, and the gap between them is the most common reading mistake people make about Umbraculum — *one* is about how the code gets written, *the other* is about what the code does for an operator. Keep them apart while reading §1.2.

This is the section that will be misread the most, so it is the one we must write the most carefully. The distinction below is not optional, not deferrable, and not softenable in voice review. **It is the only way the rest of the manifesto holds together.**

**What we mean by "AI-orchestrated code".** The default authoring path in this project is: a human consultant (developer + AI orchestrator + quality manager, increasingly one figure) directs an AI assistant — currently Cursor's main agent and its specialized subagents — to produce code, under the enforcement of:

- **Rules** ([`.cursor/rules/*.mdc`](.cursor/rules/)) — guardrails that fire on every prompt or on globbed file types. They encode "must / must not" constraints (style, safety, structure, tone, scope).
- **Skills** ([`.cursor/skills/*.md`](.cursor/skills/)) — runbooks the AI executes step-by-step when the task matches. They encode procedure: "to do X, run these specific commands in this order, against this container, with these stop conditions".
- **Subagents** ([`.cursor/agents/*.md`](.cursor/agents/)) — specialists with their own context window and tool access (verifier, debugger, test-runner, etc.). The main agent delegates to them when the task shape matches their `description`.
- **CI gates** — lint, types, tests, contracts, accessibility checks. The AI's output passes through them; what does not pass does not land.

The same discipline-apparatus applies to the OpenPLC + Python sister-repo (`tanks-pump-priority-and-low-high-levels-sensors-alarms`, the brewery vertical's automation layer; see its `DEVELOPMENT.md`). The convictions in this manifesto are project-wide, not language-specific.

The combination is what makes AI authoring trustworthy. The AI is not asked to "write good code" (a request no one knows how to verify); it is asked to produce code that satisfies a long list of explicit, machine-checkable constraints. When the constraints are insufficient, we extend the apparatus, not the AI's leash.

**What we do NOT mean by "AI-orchestrated code".** The following are explicitly outside what this project endorses:

- **Drive-by Copilot paste.** Asking an AI inside an editor for a snippet, accepting the suggestion without review, and committing. No lint, no tests, no rules, no human reading. This is the failure mode that has poisoned most of the public discourse about "AI coding". We are against it; saying so is part of why this manifesto exists.
- **AI as shortcut.** "Just have the AI do it" used to mean "I do not want to think about this". When the AI is run without the apparatus, the absence of thought transfers to the output. The apparatus is the refusal of the shortcut.
- **AI replacing the human practitioner.** The AI does not have a stake. The human does. The orchestrator-developer-quality-manager is the person whose name is on the work, who signs the commit, who carries the consequences. The AI is a powerful, fallible authoring tool; the human is the practitioner.
- **AI-as-magic.** Treating AI output as authoritative because it sounds confident. This project's apparatus exists in part because we have watched AI output be confidently wrong, often.

**Manual writing in this project.** Manual writing — code typed by a human without AI assistance — is **welcomed for learning** and **discouraged for committing**. This is not a rhetorical inversion of common sense; it is a deliberate choice we ask new contributors to internalize.

- *Welcomed for learning*: writing code by hand is how you build the mental model that makes you a competent reviewer of AI output. A practitioner who has never written the kind of code the AI produces cannot evaluate whether it is right. The manifesto does not discourage learning; the manifesto requires learning.
- *Discouraged for committing*: when committing, the apparatus must apply. AI-orchestrated authoring means the rules + skills + agents fire, the lint and types and tests gate the change, and the prose conventions land consistently. Manual hand-typed commits, by definition, bypass parts of that apparatus (the rules fire, but the AI's habit of running them does not). The cost-benefit, after years of running it both ways, comes down on the AI-orchestrated side.

**Why this is the inverse of the typical OSS norm.** Most open-source projects assume manual authoring is the default and AI is a discouraged shortcut. We are saying the opposite: AI authoring under enforced discipline is the default, manual authoring is welcomed for learning. The reason is consistency. AI authoring under the apparatus produces code with one voice — one bracing-style, one comment-density, one error-handling pattern, one logging-format. Manual authoring across many contributors produces code with many voices, and the empathy that should go to design conversations gets consumed instead by formatting and structure debates. This connects directly to §3.1.

**For sympathetic readers**: yes, that is exactly what we mean.

**For skeptical readers**: read the four bullets under "What we do NOT mean". Then read the [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md), [`docs/LINTING.md`](docs/LINTING.md), [`docs/TESTING.md`](docs/TESTING.md), [`docs/TYPING.md`](docs/TYPING.md) trio. Then read the rules under [`.cursor/rules/`](.cursor/rules/). Then disagree with us, with specifics. We commit to engaging the disagreement substantively.

### 1.3 Simplicity without sacrificing complex tasks

The ordinary trade-off in software is "simple to use" versus "powerful enough to handle complexity". Most projects pick a side. We refuse the trade-off, and the refusal has a mechanism.

The mechanism is the open-source toolset. Cursor + plugins + the rules-skills-agents apparatus is the equalizer that dissolves the simple/complex tradeoff: a complex task becomes approachable when the discipline-apparatus makes it safe to attempt. A first-time contributor working through the apparatus can ship a recipe import that respects accessibility constraints, type contracts, the testing strategy, and the licensing posture — without having read every doc end-to-end first. The apparatus carries that knowledge so the human does not have to.

This is not "AI assistance" as the marketing term. It is closer to *poka-yoke* applied to a contributor's first day: the difficult parts of the codebase are difficult to do *wrong*, because the rules / skills / agents / CI gates intercept the wrong path. The contributor's attention can go to the part that genuinely requires their judgment.

The promise this section makes: **as Umbraculum grows, the toolset stays the entry point**. We will not progressively raise the bar of "you must read these N documents before you contribute". The documents will exist (they already do), but the apparatus carries them. This commitment is what keeps the project horizontal — see §2.2.

### 1.4 Open source as discipline-enabler

§1.3 promised the toolset stays the entry point as Umbraculum grows. This section names what the toolset structurally depends on for that promise to hold: every load-bearing dependency is open source, and that is not a sentimental choice. **When the source is readable, the discipline-apparatus extends to the dependency. When the source is closed, the apparatus halts at the boundary.**

This is a different argument from §2.3's licensing argument. §2.3 is about *who gets to fork*; §1.4 is about *what an AI agent can reason over*. Both are open-source arguments, but they are different arguments with different mechanisms. We list them separately because conflating them buries the part that is genuinely new in the AI era.

**The mechanism.** A Cursor agent operating under our rules / skills / agents (§1.2) can:

- **Read a dependency's source to learn its actual behavior** — not just its documented behavior, but its actual behavior in the cases where the two diverge. Open source is the only condition under which the agent can resolve that gap without guessing.
- **Reverse-engineer a toolchain that has no native agent integration.** There is no Cursor plugin for OpenPLC's Editor; there is no Copilot for ladder logic; there is no IDE-level AI for Structured Text. But because the OpenPLC project is open source, an agent armed with a sensible rules set ([`.cursor/rules/`](.cursor/rules/) — see the OpenPLC sister repo's rule set for the worked example) can produce correct ladder, structured-text, and serialized-XML output by reading the toolchain's source and the project's serialized formats. The agent's leverage compounds against the openness of what it operates on.
- **Extend the rules / skills / agents stack to the dependency itself.** A rule that constrains how the project uses Zod can be authored *because Zod is open source and its surface is readable*. A skill that automates a Docker workflow exists *because Docker's behavior can be examined and pinned*. A subagent that diagnoses Prisma migration failures works *because Prisma's source resolves any ambiguity its documentation leaves*.

The proprietary alternative forecloses each of these. A closed-source PLC stack (Siemens TIA Portal, Allen-Bradley Studio 5000), a closed-source database, a closed-source validator: the agent can *use* them, with luck; it cannot *reason over* them. The discipline-apparatus halts at the proprietary boundary, and the contribution surface narrows accordingly.

**Recursive principle.** Every load-bearing dependency this project picks is open source. The list is not sentimental:

- **Linux (Ubuntu)** at the bottom of the stack — the OS layer the apparatus runs on, and the only layer where reproducibility claims are fully verifiable end-to-end.
- **Docker** — the containerization layer the runtime decisions commit to ([`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md)).
- **Postgres** — the database, with the corresponding architecture in [`docs/postgres-replication-architecture.md`](docs/postgres-replication-architecture.md).
- **Node.js, React, React Native, Next.js, Fastify** — the platform runtime.
- **Tamagui, Zod, Prisma, Vitest, ESLint, Playwright** — the application-layer libraries.
- **OpenPLC** — the brewery vertical's PLC layer (see [`docs/modules/verticals/brewery.md`](docs/modules/verticals/brewery.md) §3.7).

Each entry could in principle be replaced with a proprietary equivalent. Each replacement would shrink the apparatus's reach. We pick open source not because we have a moral preference (we have one — that lives in §2.3 — but it is not what we are arguing here); we pick open source because it is the structural precondition for the apparatus to do its job.

The list above is intentionally representative. For the **exhaustive per-dependency rationale** — every load-bearing dependency, with the same three questions answered for each (role in the apparatus, why over proprietary, what shrinks if swapped for closed source) — see [`docs/OPEN-SOURCE-STACK.md`](docs/OPEN-SOURCE-STACK.md).

**OpenPLC as an accessibility note.** OpenPLC is worth singling out, even though §2.2 (horizontal accessibility) carries the accessibility argument generally. OpenPLC is, today, brewery-vertical-tied — the safety-validated ladder logic for tanks, pumps, and level sensors lives in a sister repo coupled to the platform's `automation` canonical module by the `PI_*` mailbox contract. That coupling is real and the brewery vertical's page documents it. But the OpenPLC project is also something else: a free, readable, deeply-related-to-automation-and-manufacturing entry point that lets a developer, a returner-to-industry, or a student build real industrial-control intuition without paying for a $1,500-per-seat proprietary toolchain. That is the Magento-1.x low-bar lesson (§2.2) applied to a different domain. We name it here because the AI-orchestration angle compounds the accessibility: a practitioner with a commodity laptop, Ubuntu, Cursor, our rules, and OpenPLC's open source can actually ship safety-relevant ladder logic that runs on a real PLC. The learning curve becomes scalable in a way it has not been for a generation — and it is not gatekept by employment at a vendor.

**Neutrality clarification.** None of this is an argument against Windows or Mac developers. Contributors using either are welcome on the same terms as Linux contributors; the apparatus runs on all three; the practitioner is what matters, not the OS lineage. What this section claims is that *open source unlocks AI-orchestration potential* in a way proprietary stacks cannot, regardless of which OS hosts the orchestrator. Ethics, vendor relationships, surveillance posture, and the broader politics of operating systems are separate concerns — addressed elsewhere where relevant ([`docs/LICENSING.md`](docs/LICENSING.md), §2.3, §3.x of this document) — and this section deliberately does not close doors on contributors whose ethical or practical accounting on those questions differs from the maintainers'.

**Onboarding mechanism — landed.** Per the §"Why this document exists" guardrail #3, values pair with mechanism. The *contributor-facing* mechanism for this section — a comprehensive developer-onboarding doc that walks a new contributor from "Ubuntu laptop, nothing installed" to "first commit landing with the apparatus running" — now exists as [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md). It is a living document; extensions and clarifications are welcome. The reference docs it links into and ties together are [`DEVELOPMENT.md`](DEVELOPMENT.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), and the [`docs/modules/contribute/`](docs/modules/contribute/) sub-tree.

---

## 2. Who we serve

*Ecosystem ethics. The set of people whose long-term interest the project is built around, and the structural commitments that bind us to them.*

### 2.1 Sustainability for the whole ecosystem

The phrase "sustainable open source" is usually heard as a question about the maintainers: can the small core team keep funding their own work? That question matters and we take it seriously — it is part of why [`docs/LICENSING.md`](docs/LICENSING.md) settles on AGPLv3 + MIT SDK + commercial dual license rather than permissive-only or source-available. But that question is too narrow.

**Sustainability for the whole ecosystem** means the project must be a sustainable bet for *everyone* who invests in it:

- **For the core team** — bread-and-butter income, durable governance, no boom-bust pressure to over-monetize.
- **For module developers** (independents, small consultancies, agencies) — clear SDK contracts, permissive SDK license (MIT), no mid-stream re-licensing, no enterprise paywall on core functionality. Their products built on top of the platform must remain viable for as long as their customers need them.
- **For consultants and integrators** — a profession built on Umbraculum integration work must remain a profession. The project commits not to absorb integrator margins into a managed service that prices integrators out. The platform's economic model assumes integrators are part of the ecosystem, not friction to be removed.
- **For self-hosting customers** — the right to fork, the right to audit, the right to leave. Five-to-ten-year operational dependencies need this.
- **For learners** — the path from "I am curious about this" to "I can earn a living on this" must remain open. The deepest sustainability question is whether the next generation can join.

The negative example is concrete and recent: **Adobe's stewardship of Magento Open Source**. Adobe acquired Magento in 2018. Over the following years, the public-facing developer relationship eroded — documentation strategy shifted toward merchant-only audiences, the official line on whether Magento Open Source had a future relative to Adobe Commerce stayed deliberately ambiguous, and the consequence in the wider ecosystem was the slow exit of much of the experienced developer community. The technical artifact is still open-source AGPL, but the *ecosystem* — the part that actually sustains a project — was no longer being invested in.

The positive example is **Mage-OS**, the community-led Magento Open Source fork led by Wilhelm Wittwer, Vinai Kopp, Anton Kril, and contributors. Mage-OS exists because part of the community refused to accept that the developer-friendly trajectory had to die. It is also the proof that an ecosystem-grade fork is possible when the license preserves the right to fork — which is exactly what AGPLv3 protects, and exactly why permissive licenses do not protect against the failure mode Adobe represents.

**What we commit to (and where the mechanism lives):**

- **No closed-source replacement of public modules** — [`docs/LICENSING.md`](docs/LICENSING.md) §9 #1.
- **No enterprise-only paywall on core functionality** — [`docs/LICENSING.md`](docs/LICENSING.md) §9 #2.
- **No retroactive license changes** — [`docs/LICENSING.md`](docs/LICENSING.md) §9 #3, §10. Source committed under AGPLv3 stays AGPLv3.
- **No CLA granting unilateral re-licensing rights** — [`docs/LICENSING.md`](docs/LICENSING.md) §9 #4. We use [Developer Certificate of Origin (DCO)](https://developercertificate.org/) sign-off; contributors retain copyright.
- **Public RFC for any licensing change** — [`docs/LICENSING.md`](docs/LICENSING.md) §9 #5, §10.

These are not aspirations. They are commitments backed by the license itself, which is the mechanism. The license is the manifesto's enforcement: if the project tried to violate any of the above, the AGPLv3 grant on existing source preserves the community's right to fork the violating maintainer out and continue.

### 2.2 Horizontal accessibility

The project must remain horizontally accessible. *Horizontal* means: the surface area of the project is wide; many roles and skill levels can find a foothold inside it. *Accessible* means: the path from "I want to learn this" to "I can build a profession on this" stays open.

The lesson we are claiming here is the **Magento 1.x lesson**, and naming it specifically is the point. Magento 1 — for all its technical compromises, all its EAV and old-PHP debt — was installable on a $5/month shared host by a teenager who had never run a server. Many people in this project's reference network learned what they know about ecommerce, about merchandising, about software architecture, about running a consultancy, *because* the bar was that low. Magento 2 raised the bar — partly for legitimate technical reasons, partly because the post-acquisition direction did not prioritize keeping the bar low — and the result was a generational reduction in how many new practitioners entered the field through that doorway.

Umbraculum makes the inverse commitment. The toolset (Cursor + plugins + rules + skills + agents + the foundation docs trio) **is** the low bar. It does not require the contributor to assemble five pieces of infrastructure first; the apparatus carries the knowledge. This is the same idea as §1.3, applied to people instead of tasks.

**Concretely:**

- We will not narrow the project to "deep stack only". The [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) module SDK and the canonical-module surface are designed so that a tier-3 community module or a tier-6 vertical configuration can be built without modifying the platform core.
- We will not make documentation that assumes the reader has already read the rest of the documentation. New docs link explicitly to their prerequisites; the audience-tier convention in [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §10.1 ("Tier: Public" et al.) is a forcing function for prose discipline.
- We will not shift, over time, toward operator-only documentation at the expense of developer documentation. Both audiences are first-class.
- We will keep the AI-orchestration apparatus (§1.2) as the equalizer. A new contributor with the toolset can ship correct work; that is how the bar stays low.

The inverse commitment, stated plainly: **the project will not narrow over time**. If you can ship to it today, you can ship to it in five years. If you can learn from it today, your kids can learn from it in fifteen.

### 2.3 Open by license, open by foundation

The license — AGPLv3 for the core platform, MIT for the SDK, with a commercial dual license available — is documented in detail in [`docs/LICENSING.md`](docs/LICENSING.md). The reasoning, the alternatives surveyed, and the explicit commitments are all there; this manifesto does not repeat them. What this manifesto does is name the license as the **mechanism** of the ethics it states.

A manifesto without mechanism is a piety. The mechanism here is structural:

- **AGPLv3 for the core** is what prevents silent enclosure. A hyperscaler running Umbraculum as a managed service must publish their modifications back; the community is protected from the Elasticsearch / Redis / MongoDB pattern.
- **MIT for the SDK** is what makes module development viable as a business. An indie module developer can ship a closed-source vertical without legal friction; the third-party module marketplace (when it exists) is not a hostile licensing environment.
- **Commercial dual license** is the off-ramp for enterprises whose policies prohibit AGPLv3. Same source, different license terms. It is not a feature ladder.
- **No CLA** preserves contributor copyright; the project legally cannot unilaterally re-license the work.

The **foundation question** — transferring the trademark and governance to a foundation (Linux Foundation, Software Freedom Conservancy, or a dedicated Umbraculum Foundation) — is not the right move at the project's current stage (pre-revenue, pre-community). It is also not denied. [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §10.1 records the architectural choices that keep that path open: AGPLv3, public SDK, DCO sign-off rather than CLA, governance principles documented separately. When the project's scale and community make foundation governance a meaningful upgrade — likely 2028 or beyond, with evidence — the question reopens.

The two-sentence summary: **the license guarantees the present, the deferred foundation transfer guarantees the future.** The combination is the structural answer to "how do we know the project will still be ours in ten years?"

---

## 3. Who we are

*Human values. The set of explicit convictions about people that this project commits to.*

This section will read as politically loaded to some readers. That is an accepted cost. The convictions below are deliberate, not accidental; the project would be a different project without them; we are stating them publicly so that nobody — contributor, customer, observer — has to guess whether we mean them.

### 3.1 Empathy

The thread is from Chris Hartjes — *the grumpy programmer* — and his line of thought (across his testing books, his conference talks, and a long thread of practitioners adjacent to him) about empathy in technical communities. In short: the coding community has, over the past decade, become measurably less empathetic. People are increasingly reduced to tickets, output, throughput. The interpersonal cost of code review has grown. The tone of public technical disagreement has hardened. The space for "let's talk about this carefully because the tradeoff is hard" has shrunk.

We agree with the diagnosis. We disagree with the resignation that often accompanies it. There is a structural reason empathy has eroded, and there is a structural intervention that can put it back.

The structural reason: a large fraction of the friction in technical collaboration is consumed by **debates that should not require empathy at all** — formatting, indentation, brace style, comment density, error-handling structure, naming conventions, import ordering, how verbose a docblock is. These debates are real, they have legitimate technical content, and they also absorb the human warmth that should go to the conversations that actually require it: the design tradeoffs, the architectural choices, the "is this the right abstraction" question.

The structural intervention is the apparatus from §1.2. **The rules + skills + agents + lint + types make the formatting / structure / style debates impossible.** Not in the sense of preventing disagreement — in the sense of pre-resolving it before the human-to-human conversation begins. The formatter ran. The lint ran. The types ran. The rules fired. By the time two practitioners are looking at the same diff, the only thing left to discuss is what genuinely requires their judgment.

Empathy is what is left over when the trivial disagreements are gone. The project's discipline-apparatus is, among other things, an empathy-protection system. We are explicit about this because the connection — between deeply boring lint-rule decisions and the warmth of a code review conversation — is not obvious unless someone says it.

This is also why §1.2's distinction matters so much. Drive-by Copilot paste *destroys* empathy: someone has to clean up code that was committed without being read, and that cleanup interaction is corrosive. Disciplined AI orchestration *protects* empathy: the AI's output passes through the apparatus before the human ever sees it, and the human-to-human conversation that follows is about substance.

### 3.2 People, family, unionism welcomed

We say "welcomed" deliberately. The word is doing work.

- **People** — practitioners are people. They have lives outside the work. They will get sick, take care of relatives, raise children, lose people, hit burnout, recover from burnout. The work accommodates this; it does not extract human time as if it were a resource.
- **Family** — practitioners have families. Family time is not a productivity loss to be minimized. The project commits to schedules, deliverables, and contribution norms that assume practitioners have lives. The maintainer who is offline for a week because their kid is sick is doing the project's culture as much good as the maintainer who shipped a feature that week, possibly more.
- **Unionism welcomed** — labor organizing is a normal, legitimate form of practitioner self-organization, including in software. We welcome it. Practitioners building Umbraculum, paid or unpaid, hosting their work or being hired to work on it, who choose to organize collectively, do so without being treated as adversarial to the project. This is a deliberate inclusion and we expect it to be misread by some readers as performative or as ideological signaling. It is neither. It is a structural commitment that exists because labor relations in the broader software industry have hardened and because we have watched practitioner well-being compromised by employer-side power imbalances. The project's stance is on the practitioner's side.

The word "welcomed" — versus "tolerated", "accommodated", "respected" — is the calibration. We are not saying these things are acceptable. We are saying they are *good*. A project that draws people who have full lives outside it is healthier than a project staffed by people who do not.

This is the section a reader who disagrees will most likely point at and call ideological. We disagree, but we are not going to litigate the framing here. We are going to do what we said: state the conviction clearly, accept the cost, and move on.

### 3.3 Inclusivity

We are inclusive. Explicitly, not implicitly.

The implicit version — "of course we are inclusive, why wouldn't we be?" — is the version a project leaves on the table when it has not yet thought about inclusivity hard enough to commit. It is the version that lets contributors of underrepresented backgrounds wonder, in the silence, whether they are actually welcome here. We are not leaving it on the table.

**What inclusivity means in practice in this project:**

- The project is for anyone who wants to do the work, regardless of national origin, ethnicity, race, religion, gender, gender identity, sexual orientation, age, disability, neurodivergence, family status, or socioeconomic background. This list is intentionally explicit; abstracting it into "everyone" lets people imagine themselves as the implicit "everyone" and skip past whether they actually included anyone they would not have on their own.
- The contribution surface is designed for accessibility. The accessibility-first stance documented in [`docs/DEVELOPMENT-ACCESSIBILITY.md`](docs/DEVELOPMENT-ACCESSIBILITY.md) (WCAG 2.2 AA + EN 301 549) is not just for end-user UIs — it shapes the contributor experience too. Tooling that excludes a contributor with low vision, motor differences, or cognitive load is broken tooling. We treat that as we treat any other broken tooling: as a bug to fix, not a contributor to filter.
- Code of conduct is taken seriously. [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) is not boilerplate. The mechanisms for raising concerns are real; the consequences for violations are proportionate; we are not a community that protects abusive contributors because they ship features.
- Empathy (§3.1) extends to inclusivity. The protection of human attention through discipline-apparatus is not just a "nice culture" thing — it disproportionately benefits contributors who do not arrive with the full social-capital stack that makes "casually correcting someone's PR style" easy.

Inclusivity is not the absence of exclusion. It is the **active commitment** to a contribution surface where the people who would have been excluded by an absent commitment are first-class participants. We commit to that.

---

## Appendix: Letter to fellow practitioners

*Personal, time-stamped, polemical voice. Suitable for excerpting on a blog, in a launch announcement, or in social media without rewriting. Same convictions as §§1–3, restated in the register a person uses when speaking directly to other people.*

**Date**: 2026-05-18

---

Fellow practitioners,

I am writing this on the day this project's brand resolved to *Umbraculum* — Latin for a small parasol — and the day the manifesto became a real document instead of an item on a sub-plan. The two things are connected. Naming a project is also naming what you commit it to.

I have been around this industry long enough to have watched a few cycles. I have watched a generation of merchants and developers learn ecommerce on Magento 1 and build careers on it, then watched the post-acquisition direction make that doorway harder to walk through. I have watched a community refuse to let the developer-friendly trajectory die — Wilhelm Wittwer, Vinai Kopp, Anton Kril, the Mage-OS contributors — and prove that an ecosystem-grade fork is possible when the license preserves the right to fork. I have watched permissive licenses get turned into hyperscaler enclosures: Elasticsearch, Redis, MongoDB. I have watched conference culture in our community harden, and I have watched Chris Hartjes and a handful of others insist, repeatedly, that empathy is not optional.

So here is what we are doing differently, and why it is worth saying out loud.

**On AI.** This is the part most people will get wrong. Yes, this project is AI-orchestrated. No, that does not mean what most people think it means. We are not endorsing drive-by Copilot paste. We are not endorsing "AI as shortcut". We are not saying the AI replaces the practitioner. We are saying that AI authoring under enforced discipline — the rules + skills + agents + lint + types + tests + CI gates apparatus we have built — is the way *poka-yoke* applies to software in 2026. Defects are designed-out at the process level, not caught at QA. The AI is not the practitioner. The AI is the saw. The practitioner is the carpenter. We are choosing better saws so the carpenter can spend their attention on the parts of carpentry that require it.

If you want to hand-write code, do it. Do it because you are learning. Do it because the manual mental model is what makes you a competent reviewer of AI output. We welcome that. What we do not welcome is hand-writing as a substitute for the discipline-apparatus when committing — because that is when the apparatus matters.

**On ecosystems.** The project is committed to being a sustainable bet for everyone who invests in it, not just for the core team. Module developers, consultants, integrators, self-hosters, learners — if they cannot make a long bet on Umbraculum, the project failed at sustainability even if the maintainers got paid. The license is the mechanism. AGPLv3 prevents the silent enclosure pattern. MIT for the SDK keeps module development viable as a business. The commercial dual license is a license-terms alternative, not a feature ladder. There will be no enterprise-only paywall on core functionality. There will be no retroactive license change. There will be no CLA letting us unilaterally re-license your contributions. These are commitments, in the open, before the temptation to soften them gets large.

**On accessibility.** I learned from a generation of practitioners who got their start on cheap shared hosting because the bar was low enough to climb. The bar should be low enough now, too. The toolset — Cursor + plugins + the rules-skills-agents apparatus — is what keeps it low. Not the documentation length. Not the prerequisite list. The apparatus carries the knowledge. A new contributor can ship correct work on day one, because the discipline that lives in the apparatus catches the mistakes the contributor has not yet learned to avoid. This is not a future plan. This is how the project already works. We commit to keeping it that way.

**On people.** Practitioners are people. They have families. They get sick. They burn out and recover. They organize labor when they need to, including unionizing, and we welcome that — not tolerate it, not accommodate it, *welcome* it. The contribution surface is for anyone who wants to do the work: women, men, non-binary practitioners, queer practitioners, neurodivergent practitioners, disabled practitioners, immigrants, working-class developers, religious practitioners, secular practitioners. The list is explicit because abstracting it into "everyone" lets people imagine themselves as the implicit *everyone* and skip past whether they actually included anyone. We are not skipping past it.

**On empathy.** Most of the friction that has hardened our community is consumed by debates that should not require empathy at all — formatting, structure, style, comment density. We are using the apparatus to pre-resolve those debates so empathy has room to go where it actually matters: the design conversations, the architectural tradeoffs, the moments where two practitioners disagree about something that genuinely requires their judgment. Empathy is what is left over when the trivial fights are gone. We are clearing space for it.

**On the politically-loaded parts.** Some of what is in this manifesto will read as ideological to some readers. The §3 inclusions — empathy as a structural commitment, family time as good rather than tolerated, unionism welcomed, inclusivity stated explicitly with a list — are deliberate. They are not soft. They are not softenable. They are not a marketing posture and they are not a hiring filter; they are how we run the project. If those convictions are not yours, the project will not change them to fit. There are other places to take your work. We respect that, and we are clear about who we are.

**On the long arc.** I do not know whether Umbraculum will reach the scale where a foundation transfer is the right move. I do not know whether the project will be primarily core-funded or community-funded ten years from now. I do not know which verticals will be configured on top of it or which integrators will build on the SDK. What I know is that we are setting the structural decisions now — license, governance, AI discipline, ecosystem ethics, human values — so that the future of the project is the project's, not anyone else's. The architectural decisions in [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) and the licensing posture in [`docs/LICENSING.md`](docs/LICENSING.md) are deliberately compatible with whichever version of that future arrives.

If you have read this far, you are someone the project wants. Welcome.

— signed by the people building this, on behalf of the people who will

**Living document.** This letter, like the rest of the manifesto, is versioned. It will be edited. The convictions are durable; the language is not. If you read a future version that has softened any of the §3 commitments, that is a defect, and the right response is a public RFC.

