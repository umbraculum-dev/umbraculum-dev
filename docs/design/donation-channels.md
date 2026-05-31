# Donation and sponsorship channels

**Tier:** Public  
**Status:** v1.1 — environmental accounting (Stripe Climate, forest stewardship) (2026-05-31)  
**Audience:** maintainers wiring `/support`, prospective sponsors, community members reviewing payment infrastructure  
**Related:** [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §5, [`MANIFESTO.md`](../../MANIFESTO.md) §3.2, [`apps/website/public/support/index.html`](../../apps/website/public/support/index.html), [`community-forum-runbook.md`](community-forum-runbook.md), [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md)

> [!IMPORTANT]
> **§5.3 is unchanged.** Money and in-kind support never buy vote weight, queue priority, veto immunity, private channels, or feature paywalls. Payment rails are operational detail; governance commitments live in §5.3.

---

## 1. Summary

| Kind | Phase 0 channel | URL (target slug) |
|------|-----------------|-------------------|
| **Recurring cash** | [Liberapay](https://liberapay.com/) (0% platform fee) | `https://liberapay.com/Umbraculum/` |
| **One-time cash** | [Buy Me a Coffee](https://www.buymeacoffee.com/) (~5% platform fee) | `https://buymeacoffee.com/Umbraculum` |
| **In-kind (compute / credits / infra)** | Forum topic or email — **no payment button** | [`forum.umbraculum.dev`](https://forum.umbraculum.dev) **Help** or **Community policy** |

Umbraculum is a **solo-maintained** project at public alpha. **Adding or replacing payment channels** (e.g. GitHub Sponsors, Open Collective) is an operational change the **community may propose and vote on** under §4 when documented triggers fire — not a unilateral maintainer upgrade.

**Maintainer runbook for accounts:** §3 below. **In-kind compute:** §4 (read before promising “token donations”).

---

## 2. Phase 0 — why two cash channels

| Need | Liberapay | Buy Me a Coffee |
|------|-----------|-----------------|
| **Recurring support** | **Yes** — designed for weekly/monthly/yearly | Optional memberships exist; not primary here |
| **One-time tip** | **No** — recurring only; one-off workaround (start then cancel) is poor UX | **Yes** — one-tap tips, no supporter account required |
| **Platform fee** | **0%** (+ Stripe ~3% processing) | **~5%** (+ Stripe processing) |
| **OSS alignment** | Non-profit, open-source platform | Commercial; acceptable as **secondary** one-time rail |
| **§5.3 / §6** | Donations only; no perk tiers | Use **single “support” tier** with identical thank-you text only |

**Cost to operate:** €0 fixed until donations arrive. Prefer **Liberapay for recurring** (cheaper); **Buy Me a Coffee for one-time** only.

---

## 3. Account setup (maintainer, before flip)

### 3.0 Email — `finance@umbraculum.dev`

Use **`finance@umbraculum.dev`** for Stripe signup and payment-processor mail — **not** `security@` or `conduct@` (those are vuln-report and CoC enforcement only).

Route via **Cloudflare Email Routing** on `umbraculum.dev` to the maintainer inbox (same pattern as `security@` / `conduct@`). To fix a typo in the custom address, **Edit** the routing rule in the dashboard — no need to delete and recreate.

**Phase 0 payout rail:** **Stripe only** on Liberapay (and on Buy Me a Coffee when offered). PayPal is **not** used at alpha — signup friction, poor donor/recipient privacy on Liberapay ([payment processors](https://liberapay.com/about/payment-processors)), and no mature legal entity for PayPal Business.

**Stripe verification email not arriving at `finance@`?** Manual mail to `finance@` from another address proves Cloudflare routing works; missing Stripe mail is usually **not** DNS cache on Stripe’s side. Check, in order:

1. **Proton spam / quarantine / filters** — automated mail from `stripe.com` is often filtered when forwarded.
2. **Wait + resend** — Stripe dashboard → resend verification (can take several minutes).
3. **Cloudflare Email Routing → Activity** — confirm Stripe’s message was received and forwarded (or rejected).
4. **Workaround:** complete Stripe signup with the **destination inbox directly** (e.g. `umbraculum-dev@proton.me`); after verification, change the Stripe account email to `finance@umbraculum.dev` in Stripe settings (or keep Proton for Stripe login and use `finance@` only on Liberapay profile copy).

### 3.1 Liberapay — `@Umbraculum`

1. Create a [Liberapay](https://liberapay.com) account for the founding maintainer (GitHub OAuth uses your **personal** account; Liberapay does not attach a GitHub **org** as recipient).
2. Public page **`Umbraculum`** at `https://liberapay.com/Umbraculum/` — a Liberapay **Team** is optional for solo maintainers; an individual account named after the project is acceptable at alpha ([Teams](https://liberapay.com/about/teams)).
3. Team / profile description (short):
   - Funds **AI inference**, **maintainer time**, and **infrastructure** (e.g. community forum ~€10/mo fixed hosting — itemized €7.60: VPS, Auto Backup, off-site archive).
   - **Environmental accounting:** **1%** of Stripe-processed payouts via **[Stripe Climate Commitments](https://docs.stripe.com/climate/commitments)**; **1 hectare of forest** under active maintenance; local reforestation scaled to capacity — see §9.
   - **Does not** buy votes, priority, or paywalled features — link to `/support` and §5.3.
   - Link **https://github.com/umbraculum-dev** and **https://umbraculum.dev/support/** in prose (credibility; not a GitHub-org OAuth hook).
4. Connect **Stripe only** as payout processor — account email **`finance@umbraculum.dev`** when forwarding is reliable (§3.0); link bank for payouts.
5. Confirm live URL matches `https://liberapay.com/Umbraculum/` (adjust `/support` if Liberapay assigns a different slug).

### 3.2 Buy Me a Coffee — `Umbraculum`

1. Register [Buy Me a Coffee](https://www.buymeacoffee.com/) page slug **`Umbraculum`** (or nearest available; update links if taken).
2. **Disable** membership tiers and shop at alpha — **one-time tips only** to avoid Patreon-style tier optics (§6).
3. Profile copy: same §5.3 disclaimer as Liberapay; “one-time contribution.” Mention §9 environmental accounting (Stripe Climate 1%, forest stewardship) in one line if space allows.
4. Payout: **Stripe** when offered (same project identity as Liberapay); PayPal not required at alpha.
5. Optional: embed button on `/support` (link-out is enough at v1).

### 3.3 Wire `/support`

Update [`apps/website/public/support/index.html`](../../apps/website/public/support/index.html) — both buttons live, placeholder paragraph removed.

### 3.4 Forum pin

In **Community policy** on `forum.umbraculum.dev`, pin a short **Sponsorship channels (Phase 0)** topic linking Liberapay, Buy Me a Coffee, in-kind §4, and escalation triggers §5.

---

## 4. In-kind sponsorship — especially “API / token” support

**There is no Liberapay, Buy Me a Coffee, or generic OSS button that accepts API tokens or model credits.** Payment platforms move **cash**. Compute sponsorship is always **coordination**, not a checkout flow.

### 4.1 What works (documented paths)

| Form | How it works | Typical sponsor |
|------|----------------|-----------------|
| **Cash → maintainer buys inference** | Liberapay / Buy Me a Coffee; maintainer spends on Cursor/API bills | Individuals |
| **Organizational billing** | Sponsor org adds maintainer to **Cursor Team**, **Anthropic/OpenAI org billing**, or similar — sponsor pays vendor directly | Agencies, employers |
| **Cloud credit programs** | Maintainer applies to **AWS/Azure/GCP** OSS credit programs on behalf of the project; sponsor may help with application or customer reference | Vendors, cloud partners |
| **Infrastructure in-kind** | Sponsor pays Contabo/hosting invoice or provides VPS — earmark “forum host” (~€120/year public figure; itemized ~€91/year at €7.60/mo) | Hosters, consultancies |
| **Public coordination** | Open a **Help** or **Community policy** forum topic: “In-kind compute offer — &lt;vendor&gt;” so the offer is visible (§5.3: no private channel for *decisions*; initial offer can be public) | Anyone |

### 4.2 What we do **not** accept

- **Raw API keys, shared passwords, or “here is my Cursor token”** in email, DM, or forum — security and ToS risk; refuse and point to organizational billing or cash.
- **Gift-card codes** for API vendors unless a documented exception exists — accounting and fraud surface.
- **Earmarks that buy priority** — a sponsor may say “for inference costs” in a message; that does **not** move their proposal up the vote queue (§5.3).

### 4.3 Copy for `/support` (in-kind)

> **Compute and API credits.** Vendors do not provide a standard “donate tokens” button. If you want to sponsor **AI inference** or **Cursor/API usage**, either contribute **cash** (above) or **contact us on the forum** to arrange **organizational billing** or a **cloud credit program** application. We do not accept shared API keys.

---

## 5. Escalation — when the community votes on the next channel

Stay on Phase 0 until a **Proposals** forum topic passes (§4) to add or replace a channel. **Any one trigger** is enough to open that topic:

| Trigger | Likely options to vote on |
|---------|---------------------------|
| **Org sponsor** needs VAT invoice / purchase order | Open Collective or formal legal entity + bank |
| **Sustained volume** — e.g. **>€200/month** equivalent (cash + documented in-kind) for **3 consecutive months** | Add GitHub Sponsors for discoverability; and/or OC for transparency |
| **Payout / split friction** | Liberapay Team expansion vs OC |
| **Accounting** — personal tax handling no longer appropriate | Entity + OC or accountant-approved channel |
| **Donor feedback** — repeated “could not find one-time/recurring option” | UI/copy fix first; second platform only if needed |

**Default if no trigger:** keep Liberapay + Buy Me a Coffee.

**Volume threshold (€200/month × 3 months)** is v0.1 — calibrate at the §9 revisit (first six months after public alpha).

---

## 6. Public acknowledgement (§5.4)

- **Flat list** on `/support` — alphabetical names or orgs only; **no amounts**, **no tiers**.
- **Opt-out:** if a donor asks to stay anonymous, do not list them.
- Liberapay and Buy Me a Coffee do **not** publish donor names by default — listing is **maintainer-curated** from donors who consent (e.g. in donation message or follow-up forum post).

---

## 7. Fees (honest comparison)

| Channel | Platform fee | Processing (typical) | Best for |
|---------|--------------|----------------------|----------|
| Liberapay | **0%** | ~3% Stripe | Recurring |
| Buy Me a Coffee | **~5%** | Stripe ~2.9% + fixed | One-time |
| GitHub Sponsors (deferred) | **~6%** | included in platform cut | Dev discoverability — **community vote** |
| Open Collective (deferred) | **~10%** | varies | Org invoices, public budget — **community vote** |

---

## 8. Flip-day checklist

- [ ] Liberapay **Umbraculum** live; Stripe connected; GitHub linked in profile copy
- [ ] Buy Me a Coffee **Umbraculum** live; tiers/shop off
- [ ] `/support` buttons point to live URLs
- [ ] Forum **Community policy** pins: Phase 0 channels + §5 triggers ([`donation-channels.md`](donation-channels.md) §3); **How we communicate** (§6.1 — [`community-forum-runbook.md`](community-forum-runbook.md) §6 item 5)
- [ ] [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md) mentions `/support`
- [ ] Stripe **Climate Commitments** at **1%** on payout account (§9.2)

---

## 9. Environmental accounting — AI energy, Stripe Climate, forest stewardship

Umbraculum is **human-directed and AI-orchestrated** ([`MANIFESTO.md`](../../MANIFESTO.md) §1.2). That choice has a real **energy cost** — inference, CI, and contributor tooling consume electricity and upstream compute. We are **not indifferent** to that cost because the project also commits to empathy, sustainability, and honest accounting ([`MANIFESTO.md`](../../MANIFESTO.md) §2.1, §3.2).

This section is **not a political manifesto.** It records **admiration for forests** — North American landscapes and forest ecosystems worldwide — and a **consequent** attempt to offset some of what this work emits, without pretending the math is perfect.

**Open discussion is welcome.** If you have better numbers, local knowledge, or disagreement with how we allocate, say so on the **forum** — this topic stays on the public agenda.

### 9.1 What we worry about

- **AI-assisted development and product AI** both draw on energy-intensive compute. Building on AI does not erase that footprint; it **raises the obligation to name it**.
- **Greenhouse gases** and **forest loss** are connected stresses we take seriously as practitioners who spend our lives in front of machines — not as a badge, but as a **worry we act on modestly**.

### 9.2 Stripe Climate Commitments — 1% on processed payouts

On the **Stripe account** that receives Liberapay and Buy Me a Coffee payouts (`finance@umbraculum.dev` rail, §3.0), we enable **[Stripe Climate Commitments](https://docs.stripe.com/climate/commitments)** at **1%** of Stripe-processed volume.

| Channel | Applies? | Notes |
|---------|----------|-------|
| **Liberapay** (recurring) | **Yes** | Payouts via Stripe; Commitments apply to processed volume on that account |
| **Buy Me a Coffee** (one-time) | **Yes** | Same Stripe payout rail when used |
| **In-kind / org billing** | **No automatic %** | Sponsor pays vendor directly — no Stripe Climate hook on our side; discuss openly if sponsor wants parallel giving |

Stripe routes Climate Commitments toward **permanent carbon removal** projects in the **[Stripe Climate](https://stripe.com/climate)** / Frontier portfolio — not a generic “green badge.” Details and dashboard reporting live in Stripe’s docs; we do not duplicate their project-selection mechanics here.

**Honest limit:** 1% of donation volume is **small** relative to total project energy use (maintainer inference bills, CI, hosting, contributors’ own machines). It is a **committed floor**, not a claim of carbon neutrality.

### 9.3 Forest stewardship — 1 hectare today; local reforestation as capacity allows

In parallel with Stripe Climate:

- We maintain **one hectare of forest** under active care **today**.
- **Local reforestation** — planting and tending near where maintainers work — will **increase with our means** (time, sponsorship, and land access). No fixed timeline; **scale honestly** or not at all.

We do **not** frame this as offset marketing for the software product. It is **stewardship we chose** because forests matter to us aesthetically and ecologically.

### 9.4 How this relates to sponsorship §5.3

Environmental giving **does not** buy votes, priority, private channels, or features — same §5.3 wall as every other sponsorship use. Sponsors may **earmark** “environment” in a message; that is **information**, not governance weight.

### 9.5 Maintainer checklist (Stripe Climate)

- [ ] Stripe Dashboard → **Climate** → **Climate Commitments** enabled at **1%**
- [ ] Confirm Liberapay + Buy Me a Coffee payouts land on the same Stripe account
- [ ] Mention §9 briefly on `/support` and in Liberapay / Buy Me a Coffee profile copy (§3.1–§3.2)
- [ ] Forum **Community policy**: welcome open threads on energy accounting and forest stewardship

---

## 10. Sign-off log

| Date | Maintainer | Liberapay | Buy Me a Coffee | `/support` | Forum pin |
|------|------------|-----------|-----------------|------------|-----------|
| — | — | ☐ | ☐ | ☐ | ☐ |
