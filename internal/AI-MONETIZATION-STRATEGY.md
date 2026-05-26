**Tier:** Internal
**Status:** v2.0 (living — supersedes v1.0 "BYOK and resold-credits strategy", which framed the decision too narrowly)
**Audience:** founder + future co-maintainers + close advisors. NOT for contributors, NOT for resellers, NOT for customers.

---

# Umbraculum — AI monetization strategy

## Why this document is internal

The public documentation ([`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §4.3 and §7) explains the **technical architecture** of the AI consultant — the orchestrator, the tool layer, the audit log, the two-mode (BYOK vs resold credits) provider abstraction. That framing is correct and is what we publish.

This internal doc adds the **monetization strategy** that the public architecture is silent on: how we actually capture margin in v0, how we manage credit risk, how we mature the model over time, and what we deliberately don't say in public.

## Why this supersedes the v1.0 "BYOK vs resold credits" doc

The original v1.0 of this doc framed the choice as binary: BYOK (zero AI margin, zero AI risk) or resold credits (full AI margin, full AI risk). That framing missed the most important option entirely — **the value-layer subscription model** — which captures margin without taking AI cost risk. This v2.0 is the corrected mental model.

---

## The three monetization modes (and why we got the framing wrong at v1.0)

| Mode | What we sell | Who pays AI provider | Our margin source | Risk surface for us |
|---|---|---|---|---|
| **BYOK-only, free platform** | Nothing | Customer (direct to Anthropic) | None | Zero |
| **BYOK + paid value-layer subscription** (recommended v0) | Orchestration + memory + brewery tools + concierge support, as a flat monthly subscription | Customer (direct to Anthropic) | The subscription (~€25/month/workspace, ~100% gross margin) | Bounded — one month subscription per chargeback |
| **Resold credits** | AI access bundled into a credit balance, paid to us | Us (we pay Anthropic on customer's behalf) | Markup on credits (~25–50% of credit revenue) | Real — chargeback exposure per top-up + AR risk if invoiced |

The v1.0 framing implicitly contrasted modes 1 and 3 only, skipping mode 2. Mode 2 is the right answer for a small operator who wants margin without taking on AI cost risk. The reason the v1.0 framing missed it: I (the assistant) was anchored on consumer-AI patterns (Cursor, ChatGPT Plus) where AI margin == token markup. In B2B vertical SaaS with technical SMB buyers, AI margin can come from selling **the layer around the AI** — which is also where our real product value lives.

---

## The breakthrough insight: AI margin does not have to come from reselling AI

What we build *around* the LLM call has independent monetary value to the customer:

- **The brewery-specific tool layer** — recipeLookup, recipeWaterState, equipmentProfileGet, currentBrewSessionStatus, ingredientOnHand. These wrap our schema and our ACL model. A competitor can't ship them without building the brewery domain themselves.
- **The prompt composer** — knows brewery vocabulary, IBU, yeast pitching rates, mash pH, water chemistry. This is a vertical asset.
- **The per-workspace operational memory** — the moat asset (see [`MOAT-AND-COMPETITIVE-STRATEGY.md`](MOAT-AND-COMPETITIVE-STRATEGY.md)). Anthropic's API doesn't have this; only we do, per-workspace.
- **The role/cap policy + audit log** — production-quality controls a brewery owner expects from B2B software, not from a consumer chat app.
- **The web/native chat UX integrated into the brewery app** — the customer doesn't context-switch to chat.anthropic.com.
- **Concierge onboarding (Italian + English)** — a real human helps brewery owners set up their Anthropic account and key, on a video call, in their language. See §"Concierge onboarding as differentiator" below.
- **Future: MRP/CRP tools, supplier integrations, etc.** — the value layer grows over time without changing the AI provider relationship.

A brewery owner pays us **for "a brewing-aware AI consultant integrated into my brewery software"** — not for tokens. The Anthropic API call is a *commodity input* to that product. We charge for the product (subscription); we let the customer pay the commodity-input bill (Anthropic) directly.

This is the same structural pattern used by:

- N8N (BYOK across providers, subscription for the workflow platform)
- LangSmith / Langfuse (BYOK observability, subscription for the platform)
- Vapi, Voiceflow (BYOK voice models, subscription for the platform)
- Bolt.new / v0.dev (BYOK Anthropic/OpenAI, subscription for the IDE wrapper)
- Many internal-tools platforms (Retool's AI features in 2025-2026, Tooljet, etc.)

What it is *not* the pattern of:

- Cursor (resold tokens, subscription bundles them)
- Claude.ai / ChatGPT Plus (resold tokens, consumer subscription)
- GitHub Copilot (resold tokens, B2B subscription)

The cleavage: **consumer-AI products almost always resell tokens** (their customers won't manage an Anthropic key). **B2B-SMB platforms with technical buyers commonly let customers BYOK** (their customers can manage a key, and prefer the cost transparency).

Our customer profile (brewery owners with 1-50 employees, often technical-curious, used to multi-vendor stacks) sits in the second camp. Pattern 2 is right for us.

---

## Risk-adjusted comparison of all four real models

| Model | Monthly revenue from heavy customer | AI COGS to us | Margin to us | Max chargeback exposure per incident | AR exposure | Operational complexity |
|---|---|---|---|---|---|---|
| **Pure BYOK, free** | €0 from AI line | €0 | €0 | €0 | €0 | Low — just orchestration code |
| **BYOK + paid AI subscription (recommended v0)** | **€25 flat** | **€0** | **~€25** (~100% margin) | **€25** (one-month subscription) | **€0** | **Low — Stripe subscription primitive only** |
| Resold credits, prepaid subscription + top-ups | €25 + €40 of top-ups = €65 | €25 (AI cost) | €40 | €25 + last top-up size (€20-200) | Bounded if prepaid, unbounded if NET 30 | High — credit balance ledger, Stripe metered, top-up flows |
| Pure resold, NET 30 invoiced | €100+ | €60+ | €40+ | n/a | **Unbounded** | Highest — collections, dunning, AR ops |

Reading row 2 vs row 3 carefully:

- **Margin per customer is comparable** (€25 vs €40)
- **Risk is dramatically different** (€25 vs €200+)
- **Operational complexity is dramatically different** (no AI billing infra needed for row 2)

Row 2 is **higher margin per euro of revenue** (~100% vs ~60%) and **near-zero risk**. It's only "lower" than row 3 if you count gross revenue, which is the wrong metric for a small operator.

For a "developer + beekeeper" operator profile — wanting bread-and-butter income with manageable risk — row 2 is structurally the right starting point. Row 3 is something to add later, opt-in, after the operational maturity is in place.

---

## Why BYOK + paid AI subscription is the recommended v0 model

Five reasons, ordered by importance for our profile.

### 1. Risk-adjusted return is strictly higher

See the table above. Same order-of-magnitude margin, dramatically lower risk surface, dramatically lower operational complexity. For a small operator, this dominates.

### 2. Brewery SMB buyers actually prefer cost transparency

Small business owners are more often **risk-averse on usage-priced surprises** than they are friction-averse on setup. The brewery owner who's afraid of a €500 AI bill in a heavy month prefers:

> "€25/month flat to Umbraculum + my own Anthropic bill (typically €5-15/month) which I can cap and monitor directly"

over:

> "€60/month to Umbraculum, includes everything, trust us on the AI usage"

The Anthropic bill is the customer's **own safety mechanism**. They feel they control the cost ceiling because Anthropic shows them the bill in real time. This is the same psychology behind "I'd rather buy diesel myself than be on a rental that might surcharge me for fuel."

### 3. ~100% gross margin matches our cost structure

Under this model, our gross margin on the subscription is ~100% (minus Stripe fees ~2-3% + Stripe Tax fees + customer-support cost). There's no AI COGS line. This means:

- Predictable margin per customer (no usage-spike margin compression)
- No exposure to Anthropic price changes (they affect the customer's bill, not ours)
- No need to negotiate volume discounts with Anthropic (we couldn't anyway at our scale)
- Pricing decisions can be made on customer-LTV grounds, not COGS grounds

### 4. Self-host customers slot in for free

Self-hosters running Umbraculum under AGPLv3 on their own infrastructure use BYOK by definition (they don't have access to our Stripe). Under our v0 model:

- Self-host with BYOK = the free path. The community benefits; we get goodwill and contributions; no support burden on AI cost.
- Hosted with BYOK + paid subscription = the paid path. Same orchestrator code; only the subscription gate differs.

Same codebase serves both. The "community version is feature-equivalent" promise stays honest.

### 5. Foundation for the eventual upgrade tier

Once a customer has paid the €25/month subscription for 6+ months and we've watched them as a stable account, we can offer them an **opt-in "Managed AI" upgrade** that switches them to resold credits — at the higher margin but with us underwriting them based on their payment history.

This is functionally a credit check: only customers who've shown they can pay get onto the resold path. Risk concentration is much lower than offering resold credits as a sign-up default.

---

## Concierge onboarding as differentiator (real human, IT + EN minimum)

We have a human available — multilingual (Italian + English at minimum) — to help workspace admins set up:

- Their Anthropic account (5 minutes guided walk-through)
- The provider API key entry into Umbraculum
- The data-egress notice review
- Role limits and per-user-daily-cap configuration
- A first real chat session, showing the AI working

This is a strategic asset, not a soft footnote. Three reasons:

### Reason 1 — removes the "BYOK friction" objection

The textbook objection to BYOK from a non-technical customer is: "I don't know what an Anthropic account is, I don't want to manage another API key, please just bill me." With a human available to walk them through it on a 15-minute call, this objection evaporates. The customer doesn't have to figure it out alone.

Crucially, **this is cheap to deliver but hard to commoditize**. Most software vendors (especially horizontal infrastructure plays) don't offer human-led onboarding — they ship docs and a video. We offer the human. The brewery owner remembers the call, names the person, refers their brewery friends ("call X at Umbraculum, they walked me through it").

### Reason 2 — captures a market segment competitors can't

The Italian (and broader Southern European) SMB brewery market is **dramatically underserved** by English-only software with English-only docs. Competing brewery-vertical tools (Beer30, Ekos, OllieOps, etc.) are US-built and US-supported. A brewery owner in Trentino or Friuli or Sicilia who:

- Prefers to talk to a person in Italian
- Doesn't want to email US-based support at 3am their time
- Wants help understanding what Anthropic is and whether to trust them with brewing data
- Wants a relationship, not a chatbot ticket queue

...is **structurally invisible** to the US-only competition. We can be that person. This is a beachhead-market asset that grows organically with each happy customer ("call X, they speak Italian and they're patient").

### Reason 3 — early-warning signal for retention/churn

A human-led onboarding builds direct relationship with the customer-side admin. That admin will then escalate to our human first when something goes wrong, instead of churning silently. We get the early warning, we get the chance to fix it, we keep the customer.

This is operationally equivalent to having a Customer Success function at zero additional cost — the onboarder is the same person who hears retention signals.

### Operational implications

- Onboarder time per new paid workspace: ~30 minutes (15-minute call + 15 minutes prep/followup).
- At €25/month subscription, the first month covers ~1 hour of onboarder time at a fully-loaded €50/hour rate.
- The break-even is ~1 month of subscription; after that the customer is contributing pure margin.
- Scaling cap: roughly 4-6 new paid workspaces per onboarder-day, or ~80-120 per month per onboarder. This is plenty of headroom for the brewery-vertical addressable market in year 1-2.

### What we should NOT say publicly (sensitivity)

Two things stay internal:

1. **"Concierge onboarding is a moat" framing.** Publicly, it's a service offering ("we'll help you set up"). Internally, it's a deliberate competitive asset that captures a market segment competitors can't reach economically.
2. **Italian-specific positioning.** Publicly the product is English-first with Italian (and other languages) available; internally we know the IT market is the strategic beachhead and the IT-native onboarder is the wedge.

### Acknowledged risks

- **Bus factor.** One human is one human. If they're sick / on holiday / leave, onboarding stops. Mitigation: documented playbook so a replacement can take over within a day; eventually a second person.
- **Scaling ceiling.** Concierge doesn't scale infinitely. Above ~200 active paid workspaces, we need to either grow the team or shift to self-service onboarding as the default with concierge as an opt-in for enterprise tier.
- **Time-cost burden if customers churn.** If a customer churns within 30 days, we've spent ~30 minutes of onboarder time on no return. Mitigation: not committed annually; we set up a brief "fit check" call before scheduling the full onboarding.

---

## Risk analysis: NET 30 trap, prepaid discipline, chargeback boundedness

### The NET 30 trap (don't do this)

Inviting NET 30 invoicing for AI usage is structurally dangerous because **AI COGS are 40-80% of AI revenue**, vs ~5-15% for typical SaaS. So a 60-day non-paying customer with heavy usage isn't a small absolute loss; it's a near-total loss on that customer.

Worse: AI usage is bursty (heavy month before default is common — cash flow stress correlates with operational stress). Realistic worst case for a NET 30 + 15-day-grace customer who never pays: **€1000+ of AI we paid Anthropic for, recoverable through nothing because customer was already insolvent**.

**Hard rule: NEVER offer NET 30 on usage-priced AI to the SMB segment.** This applies if/when we add resold credits. NET 30 stays for enterprise tier only, with a credit check and a reserve balance.

### Prepaid discipline (mandatory if/when we ship resold credits)

When (if) we move to resold credits, the implementation is non-negotiable:

1. **Credit balance is a Postgres column** decremented on every AI call. When it hits zero, AI stops.
2. **Subscription tiers refill the balance** on each billing cycle (subscription payment IS the prepayment).
3. **Card on file required** for any paid plan; Stripe charges before service.
4. **Top-ups are explicit purchases** with card-on-file auto-charge or manual confirmation.
5. **NET 30 invoicing only for enterprise** with credit check + usage cap + reserve balance contract.

This means worst-case exposure under resold credits ≈ **the customer's balance the day they stopped paying** (max one billing cycle + one top-up). Not multi-month accrual.

### Chargeback risk — bounded but real

Even with prepaid, customers can dispute the charge with their bank (not us) up to ~120 days later. Walked through in detail in this conversation's exchange:

- Customer pays $200 for credits via Stripe; uses all of them; we pay Anthropic ~$120 over the period.
- Customer files chargeback; Stripe immediately pulls $200 back; charges us a $15 chargeback fee.
- Net loss to us: ~$120 (Anthropic paid) + $15 (chargeback fee) — even after defending the dispute, we eat the fee.

Standard industry rate: **0.1-0.3% of B2B transactions** are chargebacks. Stripe enforces a hard cap at ~1% (or they close our account), so the rate is self-policing. Mitigations: clear ToS, usage logs, 3D Secure where available, customer name vs card name match check.

**Honest assessment**: at our expected scale (50-500 paid workspaces in years 1-2), chargeback losses are €50-500/year of total revenue. Absorbed in margin. Not strategic.

But: **this risk is structurally absent under BYOK + paid subscription**. There's no AI top-up to chargeback. The only chargeback exposure is the €25 monthly subscription — which is small per incident and Stripe Tax handles the cross-border headaches.

### The chargeback comparison that matters

| Risk | BYOK + subscription | Resold credits |
|---|---|---|
| Customer doesn't pay NET 30 invoice on AI usage | **Impossible** (no AI invoice from us) | High exposure — solved by prepaid |
| Customer chargebacks AI consumption | **Impossible** (no charge from us to dispute) | Real — bounded per top-up, absorbed in margin |
| Customer chargebacks platform subscription | Possible, ~€25 exposure per incident | Possible, similar small exposure |
| Customer chargebacks AI prepaid top-up | **N/A** (no top-up exists) | Real — the residual risk |
| AI provider price increase | Customer absorbs directly | We absorb (eats margin) |
| AI provider rate-limits the customer | Customer's problem | Becomes our support burden |

Almost every "Real" row on resold-credits becomes "Impossible" / "N/A" under BYOK + subscription. This is the structural argument for our v0 model.

---

## Transition path: BYOK+subscription → optional managed AI → enterprise

```
v0 (Sprint #1):    BYOK + €25/month "AI features" subscription
                   Concierge onboarding in IT + EN.
                   Free tier: BYOK works at API level but
                              AI feature gated behind subscription
                              (memory still collects for free workspaces
                              that have a key for the moat asset)
                   ~100% gross margin. Bounded ~€25 chargeback exposure.

v1.5 (later — gated on Sprint #1+#2 demonstrating moat thesis):
                   Add OPTIONAL "Managed AI" tier (resold credits)
                   For customers who explicitly request one bill.
                   Prepaid balance only. Hard caps. Card on file.
                   Higher margin (~50-65%), real risk (chargebacks),
                   small ops burden (top-up flows, dunning).
                   Initially: only offered to customers with 6+ months
                   of clean subscription payment history.

Enterprise (much later):
                   Custom contracts, NET 30 OK, reserved capacity,
                   reserve balance, usage caps in contract.
                   Only for customers who pass credit check.
                   Run by a sales/CS person, not by self-service flows.
```

### Trigger conditions to move from v0 to v1.5 (resold credits)

All three must hold:

1. Sprint #2 (memory) has shipped and is collecting from at least 5 active workspaces.
2. At least one paid subscription has run 6+ continuous months without payment failure.
3. We have explicit customer demand for "one bill, please" — not a hypothesis, an actual request from a willing-to-pay customer.

If any is missing: stay at v0. Resold credits is an upgrade we *can* ship, not one we *must* ship.

---

## Pricing strategy implications (sensitive — internal only)

Three implications fall out, all internal.

### 1. The subscription number lives independently of token cost

Under BYOK + subscription, our price (€25 or €19 or €39, whatever we land on) is set by **value delivered**, not by underlying AI cost. We don't need to fear Anthropic price changes; we don't need to adjust our pricing to track theirs.

This is genuinely freeing. Compare to the resold model: every Anthropic price change forces a pricebook rebalance, customer comms, and either margin compression (if we absorb) or price-increase friction (if we pass through). Under BYOK+subscription, none of that.

### 2. Tiered subscriptions can layer on more value over time

Future tier ladder (illustrative):

| Tier | Monthly | What's included beyond the previous tier |
|---|---|---|
| Free | €0 | Brewery app core, no AI features |
| Brewery Pro | €25 | AI consultant (BYOK), memory, all brewery tools, audit log, role/cap controls, concierge onboarding |
| Brewery Pro+ | €49 | Multi-user concurrent AI, priority concierge support, custom prompts, advanced reporting |
| Enterprise | Contract | Single bill (resold AI), data residency, SOC2 commitments, custom integrations |

The pricing power grows because **older workspaces accrue moat asset (memory)** that makes upgrading more compelling (see [`MOAT-AND-COMPETITIVE-STRATEGY.md`](MOAT-AND-COMPETITIVE-STRATEGY.md) §"Pricing strategy implications"). A 2-year-old workspace with a mature memory blob has higher willingness to pay for a higher tier than a 2-week-old workspace.

### 3. Free tier mechanics need rethinking

Original v1.0 reasoning assumed free tier = BYOK active, accruing moat regardless of conversion. Under v0 model (subscription-gated AI), free tier looks different:

**Option A — strict gate** (recommended): Free tier has no AI features at all. Free tier accrues only the umbraculum-dev value. Memory doesn't compound for free workspaces.

**Option B — limited free AI**: Free tier can use AI but with very low caps (e.g., 50 messages/month) and BYOK required. Memory still compounds.

The moat-thesis argument favors B (memory compounds for all workspaces, conversion is the secondary game). The bread-and-butter argument favors A (free customers cost concierge time and offer nothing back; better to gate).

**Working hypothesis: B, with a low cap.** Free workspaces with BYOK can use AI up to 50 messages/month (Anthropic costs them ~€1-2/month). Memory compounds. The €25/month upgrade unlocks unlimited (capped only by their own Anthropic budget). The concierge onboarding is paid-only.

This needs revisit after Sprint #1 demo to a friendly brewery.

---

## What we should NOT publish about this strategy

Cleavages between public and internal:

| Public ([`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §4.3, §7) | Internal (this doc) |
|---|---|
| "Both BYOK and resold modes supported architecturally" | Yes |
| "BYOK ships first" | Yes |
| "Architecture is symmetric; no fork-in-the-road" | Yes (technical reason) |
| "Self-hosters need BYOK" | Yes (publish freely) |
| **"AI feature is a paid subscription line"** | Yes (publish as pricing announcement when Sprint #1 ships) |
| **Concierge onboarding offering** | Yes (publish as service offering) |
| Regulatory hedge | **Do not publish** — reads as cold feet |
| Conversion-funnel design (friction as upgrade lever) | **Do not publish** — telegraphs how we monetize |
| Pricing-power-from-age dynamics | **Do not publish** — telegraphs strategic pricing |
| Target gross margins per tier | **Do not publish** — competitor calibration |
| "Concierge as moat" framing | **Do not publish** — telegraphs strategic asset |
| Italian-market-as-beachhead framing | **Do not publish** — telegraphs geographic strategy |
| "We are not yet an AI reseller until we choose to be" | **Do not publish** — reads as hedging weakness |
| The four-row risk-adjusted comparison table | **Do not publish** — internal decision framework |

The public version of "why BYOK + subscription" emphasizes value-layer pricing, customer-cost-transparency, and self-host first-class status. All true and good positioning. The strategic, conversion-funnel, and regulatory-hedge layers stay here.

---

## Open strategic questions

1. **What's the right subscription price?** €25/month is a working anchor. €19 maximizes signups but compresses margin. €39 maximizes margin but slows signup velocity. Run a price-discovery cycle with 3-5 friendly breweries once Sprint #1 ships.
2. **When does concierge onboarding become a bottleneck?** Working hypothesis: at ~150-200 paid workspaces. Plan: at ~100 active paid workspaces, start documenting the onboarding playbook for delegation; at ~150, hire a second onboarder.
3. **Should free tier include AI at all?** Working hypothesis: yes with a low monthly cap (option B above). Revisit after first 3 months of paid customers — if conversion is healthy at <1% free→paid, lean further into "free is moat farming". If conversion is unhealthy at >5% free→paid, lean further into "free is cost center, tighten the gate".
4. **What's the right friction level for BYOK to maintain conversion pressure (when we eventually offer managed AI as an upgrade)?** Working hypothesis: BYOK is functional and reliable but not delightful. We don't proactively prompt managed-AI upgrades in the chat UI. Customers who want it ask for it.
5. **How does the IT-language concierge generalize to other languages?** Working hypothesis: Italian + English is sufficient for years 1-2. Spanish, French, German added when we have a customer in those markets willing to absorb some onboarding-quality friction (e.g., English call with bilingual customer-side admin) in exchange for the platform. Hire native-language onboarders when revenue justifies (~50 paid workspaces in that language market).
6. **Stripe Billing API: subscription primitive only, or include Stripe Tax from day 1?** Working hypothesis: Stripe Tax from day 1. The cost is small (~0.5% on EU transactions); the alternative is a VAT-compliance fire drill at 6 months. Decide before Sprint #1 implementation work begins.
7. **What happens to "AI features" on subscription cancellation?** Working hypothesis: at end of current billing period, AI feature gates off. Memory is preserved (don't destroy moat asset on cancellation). Brewery app core remains usable on free tier. Resubscription within 30 days = no friction; after 30 days = re-onboard.

---

## How to act on this document

For the founder, in priority order:

1. **Lock the v0 monetization shape: BYOK + €25/month paid AI subscription.** Don't waffle into "free BYOK forever, we'll figure out monetization later" or "let's ship resold credits in v0 for simplicity". The first is uncashed margin; the second is uncashed risk. Sprint #1 ships the subscription gate from day 1.
2. **Lock the concierge offering as a service deliverable, not a "nice to have".** Document the onboarding playbook before the first paid customer. Track concierge hours per customer in a simple spreadsheet; revisit unit economics quarterly.
3. **Resist the urge to add resold credits early.** Customer demand will come ("can you just bill me?"). The polite answer for v0 + v1 is "we're starting with BYOK because we believe it gives you better cost visibility — we're considering a managed option for v1.5 and would love your input on what would make it work for you". This collects demand-signal while deferring the build.
4. **Treat the concierge onboarder as a critical resource.** Bus-factor risk is real. Document the playbook; cross-train a second person before reaching ~50 paid workspaces.
5. **Do not publish the "what we should NOT publish" §.** The marketing/fundraising temptation to share strategic clarity will recur. The cost-benefit is asymmetric.

---

## Changelog

- **v2.0 (2026-05-15)**: Complete rewrite. Original v1.0 framed BYOK-vs-resold-credits as the binary; this version introduces the value-layer subscription as the actually-recommended v0 path, adds concierge onboarding as differentiator, and reframes the chargeback/AR risk analysis in the context of the value-layer model.
- **v1.0 (2026-05-15)**: Initial draft of "BYOK and resold-credits strategy" — superseded by v2.0 within hours of writing once the value-layer-subscription path was identified in conversation.
