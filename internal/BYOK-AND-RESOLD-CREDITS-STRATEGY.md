**Tier:** Internal
**Status:** v1.0 (living)
**Audience:** founder + future co-maintainers + close advisors. NOT for contributors, NOT for resellers, NOT for customers.

---

# `<PLATFORM_NAME>` — BYOK and resold-credits strategy

## Why this document is internal

The public documentation ([`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §4.3 and §7) explains *what* the two-mode AI provider architecture is, and the technical-symmetry argument for why BYOK first does not bake an architectural commitment we have to undo later. That public framing is true and is good positioning.

This internal doc adds the **strategic, financial, and regulatory** reasoning that drove the BYOK-first sequence, none of which is appropriate for public consumption. Specifically: the legal-and-regulatory hedge, the pricing-power dynamics under each mode, the conversion-funnel design, and the unspoken "we're not yet an AI reseller until we choose to be" argument.

---

## Summary

| | BYOK | Resold credits |
|---|---|---|
| **Customer pays AI provider** | Yes, directly via their own Anthropic/OpenAI account | No — pays us via Stripe |
| **`<PLATFORM_NAME>` AI margin** | 0% (we charge nothing for AI) | 25–50% retail markup on provider COGS |
| **Stripe/billing surface** | Zero | Subscription items, top-ups, EU VAT, Stripe Tax, dispute handling |
| **Regulatory burden of AI resale** | None | Real and growing (EU AI Act, US state-level AI regs, payment-processing rules for usage-priced AI) |
| **Self-host compatibility** | The only mode that makes sense | Not applicable — self-host can't use our Stripe |
| **Free-tier compatible** | Yes, at zero AI COGS to us | No — every free use is a direct loss to us |
| **Friction at first AI use** | Admin enters provider key + accepts data egress | Workspace already has tier; just toggle on |
| **Upgrade path from free** | "Upgrade to remove BYOK requirement" — clean conversion lever | N/A |
| **Provider price change handling** | Customer absorbs directly | We absorb (via pricebook recalibration) — eats into margin |
| **Token-burst safety** | Customer's own Anthropic rate limit + we cap with role limits | We must implement rate limits + per-workspace hard caps to avoid losing on a burst |
| **Demo-ability** | Easy ("bring a key, see it work") | Harder ("trust us with $20 first") |

The strategic point: these are **complementary modes**, not alternatives. The product wants both for the long term. But the *order* in which they ship matters a great deal, and the rationale below explains why BYOK ships first specifically.

---

## Why BYOK first (the full reasoning)

### 1. Technical simplicity — already in `docs/`

Public version (`docs/PLATFORM-ARCHITECTURE.md` §4.3): "the orchestrator code, tool registry, prompt composition, audit log, and write-action policy are identical in BYOK mode and resold-credits mode. Only the pre-flight key lookup differs." This is true and is the reason BYOK doesn't create technical debt.

### 2. Zero billing surface — already in `docs/`

Public version: "no Stripe AI plumbing in v0; saves weeks of integration, Stripe Tax setup, EU VAT plumbing." Also true.

### 3. The legal-and-regulatory hedge (INTERNAL)

This is the part that does not go in public docs.

Operating as an **AI reseller** — that is, taking customer money and using it to pay an AI provider for service consumed by the customer — incurs a meaningful legal/regulatory surface:

- **EU AI Act** (in force from 2026): obligations on "deployers" of general-purpose AI systems vary by product context. A platform that *resells* AI usage as a metered service has a more visible deployer relationship than a platform that *integrates with* the customer's own provider account. The regulatory posture under BYOK is closer to "we provide UI/orchestration; the customer is the deployer". This is materially simpler.
- **US state AI regulation** (California's SB 1047 was vetoed but successors are inbound; Colorado AI Act effective 2026; New York and others moving): same dynamic. BYOK reduces our regulatory surface; resold credits expands it.
- **Payment processing for usage-based AI**: Stripe's terms and processor-of-record obligations around metered AI billing are still settling. Disputes ("I didn't authorize $40 of AI use") are real risks that affect chargeback rates and processor relationships. Self-service top-ups are particularly exposed.
- **Tax and VAT**: AI services tax classification varies by jurisdiction. In BYOK mode, the customer's Anthropic/OpenAI relationship handles this; in resold mode, we handle it for every jurisdiction we serve. The collection-and-remittance work scales with international footprint.

**Net**: every month we delay becoming an AI reseller, we defer a non-trivial regulatory build-out. BYOK first lets us **validate the moat thesis before committing to that build-out**. If the moat thesis fails, we never have to build it.

This is a real hedge worth months of founder time. It would be reckless to phrase publicly as "we don't want to be an AI reseller yet" — that reads as cold feet. Internally, it's prudent sequencing.

### 4. Self-host is the only growth channel that works on AGPL alone

Per [`../docs/LICENSING.md`](../docs/LICENSING.md): self-host is first-class. Self-hosters can never use our Stripe (they don't have our keys). **For self-hosters, BYOK is the only AI mode that works.** That means: v0 BYOK work IS the self-host AI path. Building resold credits first would have shipped an AI feature that self-hosters can't use, which would have signaled "we're really a hosted product wearing OSS clothing" — the exact open-core-trap signal we are committed not to send.

This is also defensible publicly (and is implied in §2.1 of `docs/PLATFORM-ARCHITECTURE.md`), but the internal version is sharper: this is **a community-trust investment**, not just a feature ordering. Shipping BYOK before resold credits sends a structural signal that we mean the "self-host is first-class" claim.

### 5. Conversion-funnel design (INTERNAL)

Under BYOK, the user journey looks like:

```
Free signup → Try the product (BYOK, customer brings key) →
  Their Anthropic bill rises → They consider whether the value justifies the cost →
    Yes? Upgrade to paid tier with resold credits (one bill, no key management) →
    Yes but small operation? Stay on BYOK indefinitely, pay only platform subscription
```

This is a **structural conversion mechanic**: BYOK creates a natural moment of "I'm paying for this in multiple places and it's annoying — let me consolidate". The annoyance of managing the Anthropic key, the multiple bills, the rate-limit handling, becomes the upgrade prompt.

Important consequence: **do not make BYOK frictionless.** The friction is the conversion lever. A workspace that finds BYOK perfectly smooth has no reason to upgrade. We make BYOK functional and reliable, but we do not invest in making it *delightful*.

Compare to "resold credits as default" alternative: the user signs up, the AI just works (we pay), and they have no natural moment of price-discovery friction. That sounds better as UX but it is worse as conversion funnel — and it costs us COGS from minute one.

### 6. Pricing power signaling (INTERNAL)

Under BYOK: customer sees their own Anthropic bill and learns what AI usage *actually costs at provider prices*. This is calibration for the eventual resold-credits pricing — when we say "$20/month for 5,000 credits at €0.005/credit retail vs €0.003/credit provider cost," they know the math. They feel they understand the markup and the markup feels reasonable.

Under "resold credits from day one": customer never sees provider prices. The retail price we charge feels arbitrary; price increases feel exploitative. The customer's price anchor is our retail price, and we lose room to maneuver.

BYOK first **builds customer literacy in AI pricing**, which makes resold-credits feel fairly-priced when we introduce them later. This is the same dynamic that made Stripe's pricing acceptable (everyone now knows what payment processing costs because Stripe published it before competitors did).

---

## The transition path (BYOK + resold credits coexisting)

Working timeline for adding resold credits **after** the moat thesis is validated:

### Trigger conditions to start resold-credits work

All three must hold:

1. Sprint #2 (memory) has shipped and is collecting from at least 5 active workspaces.
2. At least one workspace has demonstrated continuous BYOK usage for 60+ days (indicates the value is sticking).
3. Founder has committed to the long-term "hosted SaaS + self-host" two-track business; not pivoting to pure-OSS-only or pure-SaaS-only.

If any is missing: continue BYOK-only, do not invest in resold-credits work.

### Implementation outline (high level — full plan in a future internal doc)

1. **`WorkspaceBillingAddon` Prisma model** — already scoped in `docs/PLATFORM-ARCHITECTURE.md` §5.3.
2. **AI credits pricebook** — `pricebook.json` (also scoped publicly). Internal calibration: targeted gross margin per credit at 50-65% on hobbyist segment, 65-75% on professional segment. Strategically, we want the pricebook to encode model preferences (route to Haiku where Sonnet isn't needed) so the credit price hides our cost-saving choices.
3. **Stripe subscription item for credits** — recurring credit allowance plus retail top-up SKUs.
4. **Pre-flight credit-balance check** — added to orchestrator's existing pre-flight middleware (sits alongside role/cap check).
5. **Per-workspace mode selection** — workspace setting: "AI provider mode = BYOK | resold-credits". Default new workspaces to resold-credits when the customer is on a paid tier; default to BYOK when free.
6. **Migration path for existing BYOK customers** — opt-in upgrade flow, never auto-flip. Tell them: "Upgrade to managed AI for €X/month; we handle Anthropic + your bill goes back to one line. Your AI memory stays with you regardless."

### Pricing strategy at the transition (INTERNAL)

When resold credits ship, we set tier pricing such that:

- **Free tier**: BYOK only; small monthly credit allowance NOT included. Forces conversion before AI is convenient.
- **Premium tier** (small business): N credits/month included via resold; BYOK still available as an option for power users; per-month price set so that 80% of customers stay within the included allowance.
- **Pro tier**: ~5× the credit allowance; same structural pattern.
- **Pro+ tier**: ~10× the credit allowance + concurrent-request perks + premium-model defaults.
- **Enterprise**: usage-uncapped + contract pricing + BYOK-or-resold-or-hybrid options + SOC2 / data-residency commitments.

The pricing-power-from-age dynamic from `MOAT-AND-COMPETITIVE-STRATEGY.md` applies: older workspaces with mature memory blobs have higher attachment to the AI consultant and therefore higher willingness to pay for credits. We don't price-discriminate, but we layer features such that the heavier AI users (which correlate with older workspaces) need higher tiers.

---

## Customer support patterns

### BYOK support pattern

- Customer: "Why is my Anthropic bill higher than expected?"
- Support: Direct them to the per-user usage breakdown in their workspace settings. Surface the top 3 users by usage. Suggest role-limit configuration. Self-service.
- Effort per ticket: ~10 minutes; volume should be low.

### Resold-credits support pattern (post-transition)

- Customer: "We blew through our credits."
- Support: Show the usage timeline. Suggest top-up vs tier upgrade. Stripe-mediated transaction.
- Effort per ticket: ~20 minutes (more steps); volume higher because we are now in the AI-billing conversation.
- Dispute risk: real but manageable (Stripe processor terms cover most cases).

**Implication for sequencing**: BYOK ships first and runs longest because the support-burden curve is more favorable. We move customers to resold-credits when we can afford the support cost increase.

---

## What we should NOT publish about this strategy

The cleavages between public and internal here:

| Public ([`../docs/PLATFORM-ARCHITECTURE.md`](../docs/PLATFORM-ARCHITECTURE.md) §4.3, §7) | Internal (this doc) |
|---|---|
| "Both modes supported; BYOK ships first" | Yes |
| "Cheapest v0; saves Stripe integration time" | Yes (technical reason) |
| "Symmetric architecture; no fork-in-the-road" | Yes (technical reason) |
| "Self-hosters need BYOK" | Yes (publish freely) |
| Regulatory hedge | **Do not publish** — reads as cold feet |
| Conversion funnel design | **Do not publish** — telegraphs how we monetize |
| Pricing-power-from-age dynamics | **Do not publish** — telegraphs strategic pricing |
| Friction-as-conversion-lever | **Do not publish** — reads as cynical |
| Target gross margins per segment | **Do not publish** — competitor calibration |
| "We are not yet an AI reseller until we choose to be" | **Do not publish** — reads as hedging weakness |

The public version of "why BYOK first" emphasizes architectural symmetry, simplicity, and self-host first-class status. All true and good positioning. The strategic, conversion-funnel, and regulatory-hedge layers stay here.

---

## Open strategic questions

1. **What's the right friction level for BYOK to maintain conversion pressure?** Too easy = no upgrade lever. Too hard = users churn instead of upgrade. Working hypothesis: ~5-minute onboarding with admin key entry; no key-rotation reminders; no friendly "switch to managed?" prompts in the chat UI (we'd want to gate this — reminders are spammy). Revisit after Sprint #1.
2. **Should BYOK customers see the COGS-equivalent number in their dashboard?** I.e. show them "this conversation cost ~$0.04 in tokens" so they internalize the price. Pro: builds pricing literacy. Con: gives competitors leverage if they undercut on margin. Working hypothesis: yes, show provider-direct cost (already known to them via Anthropic bill anyway).
3. **At what scale does the regulatory burden of resold AI cross a "founder time" cost we can't absorb?** Working assumption: under €500k ARR, we cannot afford a fractional GC; that means resold credits should start at less-regulated jurisdictions first (US + a couple of EU countries where Stripe handles VAT for us) and expand only as ARR justifies. Track this quarterly.
4. **Do we ever go BYOK-only as a permanent strategy?** Probably no — resold credits is required for the conversion funnel and the moat-asset valuation. But if regulatory friction in AI billing rises faster than ARR, BYOK-permanent + tier subscriptions becomes the safe-harbor strategy. Treat as a contingency plan, not a primary plan.
5. **What if Anthropic / OpenAI ship workspace-aware memory features themselves?** Our value-add diminishes. Defense: per-workspace memory tied to *our* tools and *our* schema is the differentiator; the foundation-model providers' memory is generic. We should expect this and not pretend otherwise. Per `MOAT-AND-COMPETITIVE-STRATEGY.md` open question #1, this is a 12-24 month risk to track.

---

## How to act on this document

For the founder, in priority order:

1. **Do not budge from BYOK-first sequencing under product-marketing pressure.** It is tempting to ship resold credits early because "everyone wants the AI to just work without admin setup". Resist. The full regulatory + COGS + support cost is non-trivial and the strategic benefits of BYOK-first are real.
2. **Keep BYOK reliable but not delightful.** Resist designer instinct to polish the BYOK onboarding to zero friction. The friction is the conversion lever.
3. **Surface customer-direct provider costs honestly.** Build the trust deposit now; cash it in later when resold credits ship at a markup that customers recognize as fair because they've seen the underlying numbers.
4. **Track the regulatory environment quarterly.** The transition timing depends substantially on whether AI-reseller regulatory burden in our serving jurisdictions stays manageable. If new laws meaningfully increase it, push the transition further out.
5. **Never publish the contents of "What we should NOT publish" §.** It's a one-way leak; we don't recover from it.
