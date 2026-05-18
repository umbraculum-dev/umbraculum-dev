**Tier:** Internal
**Status:** v1.0 (living)
**Audience:** founder + future co-maintainers + close advisors. NOT for contributors, NOT for resellers, NOT for customers.

---

# Umbraculum — moat and competitive strategy

## Why this document is internal

This is the strategic and economic argument **for** the architectural decisions described publicly in [`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §4.3 and §6.5. The public doc says *what* we are building. This doc says *why* it is defensible — including the explicit framing of time as the variable a competitor cannot fast-forward.

The mechanic itself (per-workspace AI memory) is observable from outside the company. A competitor that builds a similar product will arrive at a similar architecture. The competitive sensitivity here is not the mechanism but **the urgency and discipline implied by understanding the mechanism**. A competitor that grasps the time-locked-asset framing as we do, and acts on it as early as we do, removes our timing advantage. So: this stays internal until the timing advantage is structurally locked in (~24-36 months of continuous memory collection across enough workspaces).

---

## The thesis in one paragraph

Per-workspace operational memory — distilled facts about a specific customer's equipment, suppliers, recurring patterns, team, recipe lineup, and recurring failure modes — accumulates as a function of `time × conversation density` and **cannot be backfilled**. Tools and RAG are commodity AI investments (any competitor will have them within 12 months); per-workspace memory is the only AI investment we can make where being early translates to durably-defensible competitive position. The implication for product priorities is sharp: **every day that goes by without memory collection running is a permanently-lost day**, in proportion to active workspaces × turns-per-day. That makes the memory layer the single most time-critical asset to ship — ahead of billing, ahead of federation, ahead of any non-brewery vertical.

---

## Why this *specific* AI investment is the moat (and the others are not)

Three AI investments compete for prioritization. Honest assessment of each:

| Investment | Compounds? | Replicable by competitor? | Time-locked? | Strategic role |
|---|---|---|---|---|
| Better tools (more brewery tools, MRP tools, CRM tools later) | No — flat utility per tool added | Yes, in weeks | No | **Table stakes**. Necessary; not defensible. |
| Better RAG (product docs, industry knowledge) | No — refreshed not grown | Yes, in days | No | **Table stakes**. Necessary; not defensible. |
| **Per-workspace operational memory** | **Yes — daily** | **No — bounded by time** | **Yes** | **Moat investment**. Defensible; compounds. |

The implication: we should be careful not to confuse work on the moat investment with work on the table-stakes investments. Both are needed; their priorities are different; their economic value is different by an order of magnitude.

In the public roadmap (`../docs/ROADMAP.md` "Trajectory 12–30 months") the memory layer is sequenced in H2 2026 with the AI consultant skeleton, alongside the tool layer. Strategically, it could be argued that **memory should ship first and tools second** — because tools without memory still produce a useful product, but memory without tools (in a v0 brewery vertical) is a coherent demo with much smaller competitive exposure of *what we know*. We ship them concurrently for product-experience reasons (one without the other isn't compelling to a customer), but the order of execution within the sprint deliberately puts memory infrastructure on day-one of Sprint #2, not week-three.

---

## The compounding curve, made concrete

Honest model: an active workspace exchanges ~5-10 chat turns/day with the AI consultant. Each turn has some probability `p_extract` of producing a useful stable fact for the memory blob. The writer at v0 is crude — call `p_extract ≈ 0.20` (one useful fact per five turns). Memory bound is ~2k tokens (~50-80 facts). Workspace ages.

| Day | Cumulative turns | Facts captured | Memory state | AI behavior |
|---|---|---|---|---|
| 1 | 7 | 1–2 | Mostly empty | Asks clarifying questions; generic answers |
| 7 | 50 | 8–12 | Equipment, brew cadence, house yeast | Skips a few clarifying questions; tools targeted |
| 30 | 200 | 30–50 | Most equipment, suppliers, lineup, recurring issues | Direct answers using stable facts + live tool calls |
| 90 | 600 | Memory at full bound (~60 facts); writer pruning lowest-relevance | Mature stable facts | Conversation feels like talking to a colleague who's been there 3 months |
| 365 | 2,500 | Bounded; memory has stabilized via prune-and-replace | Curated "best-of" facts about this workspace | Conversation feels like talking to a colleague who's been there a year |
| 1000 | 7,000 | Bounded; very-stable facts dominate | Multi-year operational rhythm | Functionally an experienced ops person; institutional memory captured |

What competitors at day-X observe and *cannot replicate*:

- The conversations producing the facts. They never happened on their platform.
- The interpretive frame the writer used. The writer prompt is replicable; the *judgments* its outputs encoded are not without the source conversations.
- The customer's investment of attention. A customer that has spent a year correcting / editing / curating their memory blob has invested non-trivial effort that does not transfer.

---

## Switching-cost growth as the moat width

The switching cost from a customer's perspective:

```
switching_cost(t) = lost_memory(t) + relearning_time(t) + UI_familiarity(t) + integrations_setup(t)
```

Only the first term is uniquely a function of our memory mechanism. The others are common to any SaaS switching cost; the memory term is the one that grows nonlinearly with `t`.

`lost_memory(t)` is meaningful from approximately day 30 onwards (~30 facts), substantial by day 90 (memory at bound, all stable facts captured), and approaches its asymptote around day 365 (the memory blob has stabilized into the workspace's stable operational frame).

The economic effect:

- A customer at day 7 has effectively zero memory-related switching cost — they can leave us without losing meaningful AI value.
- A customer at day 90+ pays a measurable price to leave (their new AI starts at day 1). For a workspace that has integrated the AI consultant into operational workflow, that price is several weeks of reduced AI utility.
- A customer at day 365+ pays a substantial price. They have likely come to expect AI answers grounded in *their* operational context; resetting that frustrates the team and reduces AI utility for a quarter or more.

This is the only AI-related switching cost we can engineer that grows nonlinearly with workspace age. It is also the one that is hardest for the customer to articulate ("the AI just got it" is a hard thing to lose) and therefore the hardest to negotiate around in a competitive sales situation.

---

## Pricing strategy implications (sensitive)

Three implications fall out, all internal-only:

### 1. Older workspaces have higher pricing power, not lower

The standard SaaS pricing assumption is that established customers can be retained at lower prices because their switching cost limits churn. With per-workspace memory, the opposite is also true: **the value of staying** grows with `t`, not just the cost of leaving. This creates room for tier-creep on older workspaces (gradually moving them up plan levels by adding AI-heavy features) without proportional churn risk.

The execution constraint: don't price-discriminate visibly. The mechanism is "more features land in higher tiers; older workspaces find these compelling for AI-specific reasons; they upgrade voluntarily". This is how Notion, Linear, Figma all work in practice.

### 2. The free tier is the moat's recruitment channel, not a customer-acquisition cost

Standard SaaS thinking: free tier converts X% to paid. With memory mechanics: **free tier accrues moat asset per active workspace, regardless of conversion**. A free workspace at day 365 with 50 captured facts is a higher-conversion target than a free workspace at day 7 with 1 fact, *because the switching cost away from us has already accumulated*. This argues for a more generous free tier than standard SaaS guidance suggests — the unconverted free user is still building moat.

The risk: free-tier abuse and unit-economic drag. Mitigation: BYOK for free tier from day one (zero AI COGS for free users) — this is one of the strategic reasons BYOK-first is the right v0 architecture, see `BYOK-AND-RESOLD-CREDITS-STRATEGY.md`.

### 3. Plan-downgrade should NOT reset memory

A customer that downgrades from Pro to Premium tier expects to lose some features. They do NOT expect to lose their AI's accumulated knowledge of their brewery. **Resetting memory on downgrade would be self-defeating** — it destroys the moat asset we worked to build, in exchange for a price-discrimination win that is small in absolute terms. Memory should be retained across all paid tiers, even free if BYOK is in use. The only legitimate trigger for memory deletion is GDPR right-to-erasure / customer request.

This is a counterintuitive product rule that needs to be encoded explicitly, because the default engineering instinct ("downgrade strips features") will reach for it.

---

## Strategic priorities that fall out

Hard rules implied by the moat thesis, ordered by strength:

1. **Memory collection must start ASAP, even if the writer is crude.** Sprint #2 ships a v0 writer with low `p_extract`; that's fine. What is not negotiable is the calendar date the writer starts running in production. Improving `p_extract` from 0.2 to 0.5 is a 2.5× improvement on the rate; pushing the start date back by 6 months is roughly a 6-month reduction in lock-in for every workspace active in that window. The dates trump the quality.

2. **Memory must not be gated by paid tier in v0.** BYOK + free tier customers should accrue memory from day 1 alongside paid customers. The moat asset grows independent of conversion. Gating memory behind a paid tier slows the moat-building rate by the inverse of the free-to-paid ratio.

3. **Memory survives downgrades.** Hard rule, see §3 of pricing implications above.

4. **Sprint #2 cannot slip in favor of billing or federation work.** Sprint #2 in the H2 2026 plan ([`../.cursor/plans/h2_2026_backbone_a7c4e2f1.plan.md`](../.cursor/plans/h2_2026_backbone_a7c4e2f1.plan.md)) is on the critical path because of memory. If forced to choose between shipping Stripe AI billing (resold-credits) and shipping memory, choose memory every time. Billing scales revenue; memory scales the asset that revenue is collected on. The order matters.

5. **Memory must be portable inside-our-tenancy.** If a workspace migrates from one organization-account to another, memory must travel with it. The asset belongs to the workspace, not the billing relationship. (Note: this is *not* an export feature for departing customers — that would directly subsidize churn.)

6. **Customer-facing UI for memory must build trust.** Workspace admin can see the memory blob, edit it, delete entries. This is non-negotiable on three grounds: (a) GDPR-aligned, (b) builds customer trust in what the AI "knows" about them, (c) lets admins curate the memory blob, which increases its quality over time (the customer becomes an unpaid quality-improver of our moat asset).

---

## What competitors will likely do

The honest read on competitor reaction, by category and likely timeline.

### Within 6-12 months: AI bolt-on incumbents

- **SaaS ERP incumbents** (NetSuite, Odoo, SAP B1, larger) will ship AI assistants. They have tools layers (Layer A) trivially and RAG over their docs (Layer C) within a year. They will **not** ship per-workspace operational memory in this window because: (a) it is an architectural commitment to per-workspace state that fights with their multi-tenant database designs, (b) it requires a continuous-learning-from-operational-data investment that conflicts with their compliance posture (large enterprise customers fear "the AI learned from our data"), (c) their organizational structures (PMs, releases, governance) don't ship that kind of feature in 12 months.
- **Brewery-vertical software** (Beer30, Ekos, OllieOps, Brewmaster) will ship simple AI helpers in 6-9 months. They will not have memory either; brewery-specific verticals typically have ~5-10 engineers and the moat investment doesn't fit their roadmap.

This window is our running room for memory accumulation. ~12 months ahead of likely-named competitors at the time we ship is roughly what we get.

### Within 12-24 months: Mage-OS-style fork or aggressive open-source competitor

- An ambitious team could see our public architecture and build something similar. If they're AGPLv3-licensed they're not undercutting us in the cloud (our deterrent works as designed); they're competing for community share.
- Our defense in this window is **memory + brand + ecosystem velocity**. Memory is the asset they can't backfill. Brand and ecosystem velocity (more module developers, faster iteration) are choices we make in the present that compound.

### Within 24-36 months: hyperscaler reaction (low probability)

- AWS / Azure / GCP launch managed competing services occasionally. AGPLv3 makes the obvious "fork-and-host" attack expensive (they must publish their changes). They could write a competing product from scratch, but ERP-class software is not their wheelhouse — they typically pick a partner (NetSuite, Salesforce, SAP) rather than build their own.
- Realistic probability of this happening: <15% within 36 months. Mitigation: continue building the moat; if it happens, our moat-asset accumulation already protects existing customers.

---

## What we should NOT publish about this thinking

Examples of things that would weaken our position if surfaced publicly, sorted by sensitivity:

1. **The "lost months are permanent" framing.** Phrased that way, it tells a competitor that any week they delay shipping memory is permanent moat for us. Public language should always abstract this to "we believe in AI memory as a product feature" without the time-asymmetry argument.
2. **The pricing-power-grows-with-workspace-age observation.** Standard SaaS communication says exactly the opposite (loyalty → discount). A competitor reading our observation might price aggressively for old-customer migrations.
3. **The "free tier is moat recruitment" framing.** If competitors see this they'll match the generous free-tier and reduce the differential. Public language: "we want the most people possible to use the platform".
4. **Specific `p_extract` numbers or memory-blob mechanics with quantitative parameters.** A competitor that reads "we extract ~0.2 facts/turn, bounded at ~2k tokens" can replicate the architecture with calibration. Public docs describe the mechanism without these calibration knobs.
5. **The "memory survives downgrades" rule.** Competitors that strip features on downgrade are leaving moat on the table. Don't help them realize it.

These are the differentials between public `docs/PLATFORM-ARCHITECTURE.md` §4.3 / §6.5 and this internal doc. The public version is intentionally written one level of abstraction higher.

---

## Open strategic questions

1. **When does memory's defensibility start eroding?** Likely answer: when AI providers ship "long-term memory" features that work across products (Anthropic Projects, OpenAI Memory, Google's equivalents). Today these are per-account, not per-workspace, but the gap will close. Our defense: per-workspace memory tied to *our tools and our schema*, which providers can't replicate without the schema and the tools. Track this quarterly.
2. **Should memory be a SKU?** "Premium memory" tier with larger bound, longer history, faster writer? Or is this confusing the customer (they expect memory to "just work")? Working hypothesis: keep memory uniform across paid tiers; differentiate paid tiers on tools, RAG breadth, model selection, write-action access — not memory size.
3. **Multi-workspace memory aggregation across an org?** A larger customer with multiple breweries / sites / regional plants might benefit from a "fleet memory" that distills patterns across their workspaces. This is a second-order moat (org-scoped, not workspace-scoped) and a Premium-tier feature when it ships. Out of scope for v0.
4. **Memory backup / export for customer comfort?** Customers may ask "can I export my memory?". Tension: yes builds trust; yes also subsidizes churn (they can take it to a competitor that supports import). Working hypothesis: yes export, no import. Asymmetry leans our way.
5. **When does the time-asymmetry argument graduate from internal to public?** Probably at the 24-36 month mark, when our memory accumulation across enough workspaces is enough of a moat-in-being that public discussion can't undo it. At that point this doc (or its successor) becomes a strategic-positioning blog post. Until then, internal.

---

## How to act on this document

For the founder, in priority order:

1. **Never let Sprint #2 (memory) slip.** Push other work — including pricing, billing, federation, even partner outreach — before sliding the memory ship date.
2. **Never gate memory behind a tier.** Argue against this whenever it comes up. The default engineering instinct to align features-with-tier doesn't apply here.
3. **Treat the memory writer's `p_extract` as a tunable, not a launch quality bar.** Ship at 0.2 fact-per-turn; improve to 0.5 over six months by iterating on the writer prompt. The asset value is `time × p_extract`; pushing the start date is far more costly than pushing the quality.
4. **Track competitor memory features quarterly.** If a major incumbent or hyperscaler ships per-workspace operational memory, our window has shifted; respond by accelerating accumulation (e.g. promote BYOK heavily to grow free-tier adoption regardless of conversion).
5. **Do not publish the differentials in §"What we should NOT publish".** When tempted by a marketing or fundraising opportunity to share the strategic clarity here, the cost-benefit is asymmetric: the marketing win is small, the competitor gift is permanent.
