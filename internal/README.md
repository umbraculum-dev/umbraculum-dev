**Tier:** Internal
**Status:** v1.0 (living)
**Audience:** founder + future co-maintainers + close advisors only. NOT for contributors, NOT for resellers, NOT for customers.

---

# Umbraculum — internal business documentation

This folder is the home for documentation that is **not safe to publish**: business strategy, competitive analysis, margin math, customer notes, pricing-power reasoning, regulatory hedges, and any material whose value depends on competitors *not* reading it.

Everything in this folder is **internal-only**. If you are reading this and you are not (a) the founder, (b) an explicitly-named co-maintainer, or (c) an explicitly-named close advisor, you should not be reading this folder.

---

## Why this folder exists

The platform's public documentation (under [`../docs/`](../docs/)) is written to be surfaceable when the repo flips public. That is the right tier for architecture, license rationale, roadmap-at-the-trajectory-level, contribution rules, and product positioning at the abstraction level.

What is **not** safe to publish at any tier above "internal":

- **The economic argument for our moat.** It is fine to say publicly "we believe per-workspace AI memory is a defensible product moat". It is reckless to publish the math, the time-locked-asset framing, the switching-cost growth curve, and the explicit "lost months are permanent" guidance — that's a competitor's playbook gift-wrapped.
- **Margin numbers and pricing power.** Public `docs/TIER-PRICING-ANALYSIS.md` says "AI add-ons typically run 50–75% gross margin". Internal `PRICING-MARGINS.md` (future) will say which segment runs at which margin, where the breakeven points are, and which SKUs we under-price strategically to win pull-through.
- **Customer notes.** Specific brewery names, conversations, support tickets, and sales objections are obviously not for public consumption.
- **Regulatory hedges.** Why we ship BYOK first is *partly* about technical simplicity (public-doc-safe) and *partly* about deferring the legal/regulatory burden of being an AI reseller until the moat thesis is validated (internal-only). Both reasons coexist; only the first goes in `docs/`.
- **Anticipated competitor moves.** Reasoning about what specific named competitors are likely to do, and how we plan to respond, is sensitive and motivating only when internal.

---

## Conventions

### Tier marking (all docs, both folders)

Every Markdown document in this repository starts with a `**Tier:**` marker on its first content line, where the value is one of:

- **Internal** — this folder. Reckless to publish.
- **Public** — `docs/` and repo root. Safe to publish; safe to link from internal docs.
- **Partner-restricted** — *(reserved; no content yet)* — for module developers and resellers, behind partner-portal authentication when that exists.
- **Customer-restricted** — *(reserved; no content yet)* — for paying customers behind product-account authentication when that exists.

**Default rule.** Any doc under `docs/` is implicitly `**Tier:** Public` unless otherwise marked. Any doc under `internal/` is implicitly `**Tier:** Internal`. The explicit markers are for clarity at first-line-glance; the folder is the source of truth.

### Cross-link discipline (the one rule that matters)

- **Internal docs may freely reference public docs.** A `MOAT-AND-COMPETITIVE-STRATEGY.md` paragraph saying "see `docs/PLATFORM-ARCHITECTURE.md` §4.3 for the technical mechanism" is fine.
- **Public docs MUST NEVER reference internal docs.** Not by name, not by path, not even by ambiguous hint ("see our internal strategy notes"). If a public doc needs to make a point that would otherwise require linking internal material, it must either (a) re-express that point at an abstraction level appropriate for public reading, or (b) not make the point.

This is the only invariant whose violation is a one-way data leak. When the repo flips public, an internal-doc link in a public file would either become a broken link (best case) or, if the internal-doc path is preserved in the public history, would publicly expose the existence and name of internal content.

### Gitignore-on-public-flip

When the repo flips to a public-facing repository (currently planned around H1 2027 per [`../docs/ROADMAP.md`](../docs/ROADMAP.md)), `internal/` is excluded from the public mirror. Three mechanisms enforce this:

1. The public flip is done by **copying selected paths into a fresh repo**, not by making this one public. So inclusion is opt-in per file, never opt-out.
2. The fresh public repo's `.gitignore` will list `internal/` as a belt-and-braces guard against accidental drag-and-drop.
3. The repo go-public checklist (in [`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §10.1) explicitly verifies that no file under `internal/` is present in the public-target tree.

Until the public flip happens, this repo is private and the internal-folder content carries normal-private-repo risk only. The discipline is established now so the flip is a checklist, not a refactor.

---

## What goes here

Use these guidelines to decide whether new content belongs in `internal/` or `docs/`:

| Type of content | Goes in |
|---|---|
| Architectural decisions stated at a level any contributor can read | `docs/` |
| The economic / strategic reasoning **for** an architectural decision (why this protects margin, why this widens the moat) | `internal/` |
| License rationale, governance principles, contribution rules | `docs/` |
| Competitive analysis: named competitors, anticipated countermoves, our response plans | `internal/` |
| Pricing analysis at the segment/tier level (broad ranges, model) | `docs/` |
| Pricing analysis at the SKU/margin level (actual numbers, breakeven points, strategic loss-leaders) | `internal/` |
| Roadmap at the "trajectory" level (12-30 month phases, milestones) | `docs/` |
| Roadmap at the "specific commitments and customer-tied dates" level | `internal/` |
| End-user / operator help (UI-driven, role-defined, public) | `docs/help/` (Public) |
| Customer-account-gated operational mechanics (paying-only ops content) | `docs/customers/` (Customer-restricted, reserved — not yet created) |
| Partner / module-developer-restricted material | `docs/partners/` (Partner-restricted, reserved — not yet created) |
| Customer-specific notes, conversations, sales objections | `internal/CUSTOMER-NOTES/` (when populated) |
| Public-product-positioning copy | `docs/` |
| Investor / partner pitch material, fundraising notes (if/when relevant) | `internal/` |

**When in doubt, default to internal**. Moving a doc from internal to public later is a deliberate redaction pass; moving a doc from public to internal after the fact is an information-spill remediation.

---

## Current contents

- [`MOAT-AND-COMPETITIVE-STRATEGY.md`](MOAT-AND-COMPETITIVE-STRATEGY.md) — per-workspace operational memory as the time-locked moat asset; compounding curve; anticipated competitor moves; strategic priorities that fall out.
- [`AI-MONETIZATION-STRATEGY.md`](AI-MONETIZATION-STRATEGY.md) — the three monetization modes (BYOK-only, BYOK + paid AI subscription, resold credits); the value-layer-subscription insight; the four-row risk-adjusted comparison; concierge onboarding (IT + EN) as differentiator; chargeback / AR / NET 30 risk analysis; transition path from v0 to optional managed-AI tier to enterprise. **Supersedes** the v1.0 "BYOK and resold-credits strategy" doc.
- [`working-notes/`](working-notes/) — active TODO scratchpads and feature-debt working notebooks moved out of repo root in the 2026-05-18 docs hygiene pass: `TODOs.md`, `TODOs-TAMAGUI.md`, `RECIPES-IMPORT-TODO.md`, `CURSOR-RULES-SKILLS-TODO.md`. Internal-tier by folder convention; not surfaceable at the public flip.

Anticipated future additions (do not exist yet):

- `PRICING-MARGINS.md` — actual COGS per SKU, gross-margin floors, segment-specific pricing power.
- `OPEN-SOURCE-PLAYBOOK.md` — the business plan around AGPL-as-distribution; when to flip public; brand-launch timing; foundation transfer trigger conditions.
- `CUSTOMER-NOTES/` — per-customer files when conversations start.
- `COMPETITORS/` — per-competitor profile: their pricing, positioning, perceived weaknesses, how we win against them in a head-to-head.

---

## How this folder evolves

- Treat it as a working notebook for the founder, not a polished publication.
- Stale content stays unless it's wrong; archive (don't delete) when superseded.
- When something graduates to "ready to say publicly" — usually because the public-doc abstraction has caught up, or because the competitive sensitivity has decayed — move the doc (or the relevant section) to `docs/` and update the tier marker.
- The number of files here should stay small. If it grows beyond ~10 documents, that's a sign that operational reality is outrunning documentation and some of this content should either graduate or be retired.
