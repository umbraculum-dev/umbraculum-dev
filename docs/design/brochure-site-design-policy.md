# Brochure site design policy (`umbraculum.dev`)

**Tier:** Public  
**Status:** v1 (living)  
**Audience:** maintainers, contributors, and agents editing `apps/website/` or reviewing brochure deploys  
**Related:** [`MANIFESTO.md`](../../MANIFESTO.md) §1 guardrails, [`DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) §6, [`apps/website/README.md`](../../apps/website/README.md), [`docs-site/README.md`](../../docs-site/README.md) § Theme customization (swizzled docs announcement bar; shared `announcement.config.json`)

---

## 1. Summary

The brochure at **umbraculum.dev** is a **modest orientation surface**, not a growth-marketing landing page. The project speaks to **developers and technicians** who evaluate substance — architecture, licenses, modules, runbooks — not hype.

**Mindset:** **less ego, more facts.**

Copy and visuals should stay calm, readable, and honest. If a design choice exists mainly to impress or inflate, it does not belong on the brochure.

### Groceries, not jackpots

Much public software marketing leans on **cosmetics** — polish that makes a project look bigger, hotter, or more inevitable than the evidence supports — and on **deal theatre** (“once in a lifetime”, urgency timers, jackpot framing).

Umbraculum is **not** against funding, sponsorship, or commercial use. [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §5 welcomes sponsors for **capacity** (inference, maintainer time, modest infra such as the forum). The **primary** brochure message is not “catch the big win” but **sustain the ordinary work** — commit to buying groceries, not to pointing at big deals and big money.

Convey: what exists, what is next, how to contribute, honest pre-alpha posture, support as optional help with **running costs** ([`/support/`](../../apps/website/public/support/index.html)), not a hype funnel.

Do not convey: inflated scale, fake urgency, prestige signalling to attract “whales” before substance exists.

This is the same **deliberately ordinary values** posture as [`MANIFESTO.md`](../../MANIFESTO.md) §1 guardrail #1 — applied to the brochure surface.

---

## 2. Why this policy exists

[`MANIFESTO.md`](../../MANIFESTO.md) states that public values documents are **not marketing documents** — no hype, no superlatives, no “we revolutionize”. The brochure is the first public HTML many visitors see; it must follow the same discipline.

Umbraculum is a **solo-maintained, community-governed open-source toolset** preparing a public alpha. Over-styled “startup” aesthetics signal a different kind of project than the one we are building. Our credibility comes from **what ships in the repo and docs**, not from conversion-optimized chrome.

---

## 3. Visual design — prefer, avoid

### Prefer

- **Restrained palette** — muted text on a calm background (the current dark theme in `apps/website/public/styles.css` is the reference).
- **System or unobtrusive typography** — readable body copy; no display-font hero theatrics.
- **Simple layout** — single column, clear hierarchy, generous whitespace; no parallax, no autoplay video, no scroll-jacking.
- **Functional UI** — links to docs, source, support, and forum; buttons that look like buttons, not billboards.
- **Umbi** — the mascot in the header and favicon is the **only** deliberate playful element (see [`DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) §6).

### Avoid

- **Startup marketing tropes** — rocket icons, “launch” metaphors, confetti, trophy badges, “#1 platform” ribbons.
- **Super-impactful color** — neon gradients, high-saturation hero backgrounds, aggressive contrast for attention rather than readability.
- **Motion for motion’s sake** — animated backgrounds, bouncing CTAs, carousel hero slides.
- **Stock-photo hero panels** — especially generic “team high-fiving in open plan office” imagery.
- **Dark patterns** — urgency timers, fake scarcity, email gates on public orientation pages.
- **Deal theatre** — “once in a lifetime”, “limited time”, “invest now”, jackpot or whale-hunting framing on an orientation page.

When in doubt: **would a senior engineer trust this page**, or would they assume vaporware?

---

## 4. Copy and tone

Inherit the public-doc voice from [`DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) §6:

- **Precise** — claims match what exists in the repo or roadmap.
- **Honest about trade-offs** — public alpha, self-build today, not all modules shipped.
- **Explicit about what is not settled** — pre-release, `noindex`, Phase 2 gates.

**Do not use on the brochure:**

- Superlatives (“best”, “only”, “revolutionary”, “game-changing”).
- Scarcity or jackpot language (“don’t miss out”, “once in a lifetime”, “exclusive opportunity”).
- Vague promises (“enterprise-grade” without defining what that means here).
- Brewery-only positioning — manufacturing/brewery is the stress test, not the identity ([`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md)).

**Do use:**

- Concrete nouns — modules, workspaces, AGPLv3, MIT SDK, compose, docs links.
- Links to authoritative docs rather than repeating long explanations on the brochure.

Positioning copy source of truth: [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1.

---

## 5. Scope — brochure only

This policy applies to **`apps/website/`** (static umbraculum.dev brochure).

It does **not** override product UI in `apps/web/` (operational app chrome follows platform UX patterns; **Tamagui is the go-to** — see [`TAMAGUI.md`](../TAMAGUI.md) §"UI stack choice — product vs public surfaces"). It **does** align with docs-site tone — Docusaurus theme choices should stay similarly restrained; see RFC-0005 and the docs build log for docs-specific decisions.

---

## 6. Review checklist (before merge or deploy)

- [ ] No rocket / hype iconography or “launch” marketing language added.
- [ ] Colors remain readable and muted; no new neon or full-bleed gradient heroes.
- [ ] Copy is factual; links point to docs/runbooks for depth.
- [ ] Umbi present in header + favicon on every page ([`apps/website/README.md`](../../apps/website/README.md)).
- [ ] `dist/` rebuilt after `public/` edits (compose `website` restart or `npm run build -w @umbraculum/website`).
- [ ] Pre-flip: `noindex` / `robots.txt` gating unchanged unless flip runbook says otherwise.

---

## 7. Cross-references

- [`apps/website/README.md`](../../apps/website/README.md) — build, deploy, header convention.
- [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) — Cloudflare Pages deploy.
- [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) — flip-day smoke URLs.
- [`MANIFESTO.md`](../../MANIFESTO.md) §1 — “not a marketing document” guardrail; deliberately ordinary values.
- [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §5 — sponsorship for capacity, not priority or deal theatre.
