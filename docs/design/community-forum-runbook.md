# Community forum runbook (`forum.umbraculum.dev`)

**Tier:** Public  
**Status:** v1 — Phase 0 bootstrap (Discourse on Contabo); **LIVE** at [forum.umbraculum.dev](https://forum.umbraculum.dev/) since 2026-06-08 (§7.5 governance pins complete)  
**Audience:** maintainer standing up or operating the canonical community surface per [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6  
**Related:** [`production-hosts.md`](production-hosts.md), [umbraculum-hosting-forum](https://github.com/umbraculum-dev/umbraculum-hosting-forum) (`docs/OPERATOR.md` — VPS steps), [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md), [`community-forum-vps-security.md`](community-forum-vps-security.md), [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md), [`community-forum-secrets-inventory.md`](community-forum-secrets-inventory.md), [`donation-channels.md`](donation-channels.md), [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md)

> [!IMPORTANT]
> **Governance record lives here.** Proposals, vote threads, meeting minutes, and vetoes (§4.4) are canonical on the forum. GitHub Issues track implementation; external Jitsi links are provisional until Phase 2 (§4.6.4).

---

## 1. Summary

| Item | Value |
|------|--------|
| **URL** | `https://forum.umbraculum.dev` |
| **Software** | [Discourse](https://www.discourse.org/) (GPL, self-host via official Docker launcher) |
| **VPS** | Contabo **Cloud VPS 10** — Ubuntu **24.04 LTS**, 75 GB NVMe; **Auto Backup optional until kick-off** (§10) |
| **Infra cost (itemized)** | **€3.60/month** at bootstrap (VPS only) → **€5.10** after kick-off (+ Auto Backup) → **€7.60** full target (+ Object Storage planned) |
| **Infra cost (public round figure)** | **~€4/month** bootstrap → **~€10/month** when backup layers fully enabled |
| **Infrastructure custody** | Phase 0 may run on **maintainer-operated provisional VPS**; entity-owned hosting after community vote — [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7; [`LICENSING.md`](../LICENSING.md) §7.6 |
| **DNS** | Cloudflare **A** record `forum` → VPS IPv4, **proxy off** (grey cloud) at bootstrap |
| **Brochure / docs** | Cloudflare **Workers** — do **not** route the forum through Workers/Pages |

**Phase 0 scope:** Discourse only. No Matrix chat, no self-hosted Jitsi on this VPS until §4.6.3 / §4.6.4 triggers fire.

---

## 2. Prerequisites

| Gate | Notes |
|------|--------|
| `umbraculum.dev` zone on Cloudflare | Same account as brochure + docs Workers |
| SMTP credentials | [Brevo](https://www.brevo.com/) free tier (~300 emails/day). **Account login:** maintainer Proton inbox. **Sender:** `forum@umbraculum.dev` only (domain authenticated in Brevo). See §5.1 |
| Admin email | `forum@umbraculum.dev` (monitored via Cloudflare Email Routing → maintainer inbox) |
| Ubuntu **24.04 LTS** on VPS | Discourse official path; fresh VM, no conflicting web servers on :80/:443 |
| Contabo VPS ordered | Cloud VPS 10; IPv4 assigned (**Auto Backup** may wait until kick-off — §10) |
| Brevo + `forum@` smoke-tested | Test send/receive before `./discourse-setup` |

**Checklist before VPS work:**

- [ ] Brevo domain authenticated; SMTP key in password manager
- [ ] `forum@` Email Routing delivers to maintainer inbox
- [ ] Contabo VPS provisioned (24.04, NVMe; Auto Backup at kick-off if not yet enabled)
- [ ] VPS IPv4 recorded in password manager

---

## 3. Contabo VPS

> **Operator steps (VPS install, DNS, `./discourse-setup`, smoke tests)** are canonical in **[umbraculum-hosting-forum](https://github.com/umbraculum-dev/umbraculum-hosting-forum)** — [`docs/OPERATOR.md`](https://github.com/umbraculum-dev/umbraculum-hosting-forum/blob/main/docs/OPERATOR.md). Hardening: `bin/harden` (scripts from [umbraculum-hosting-common](https://github.com/umbraculum-dev/umbraculum-hosting-common)). Index: [`production-hosts.md`](production-hosts.md).

> **Custody.** At bootstrap the forum may run on a **maintainer-operated** VPS (personal Contabo or equivalent). Migration to **Umbraculum entity-owned** hosting is by **Discourse backup + restore + DNS cutover**, not VPS/account transfer — see [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7.

**Do not** co-locate the demo stack ([`demo-host-runbook.md`](demo-host-runbook.md)) on this VPS at Phase 0.

### 3.1 VPS security

Apply hardening **before** `./discourse-setup` — see hosting-forum [`docs/VPS-SECURITY.md`](https://github.com/umbraculum-dev/umbraculum-hosting-forum/blob/main/docs/VPS-SECURITY.md) and [`community-forum-vps-security.md`](community-forum-vps-security.md). Enable **Auto Backup** at **kick-off** (§10).

---

## 4–5. DNS, Discourse install, smoke tests

Moved to **[umbraculum-hosting-forum `docs/OPERATOR.md`](https://github.com/umbraculum-dev/umbraculum-hosting-forum/blob/main/docs/OPERATOR.md)** (sections 3–5). SSL decision record remains [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md). Template sync: hosting-forum `templates/app.yml.template`.

---

## 6. Category bootstrap

Create categories in **Admin → Categories** (order matters for navigation):

| Category | Purpose | Suggested permissions |
|----------|---------|------------------------|
| **Community policy** | CoC reminders, governance updates, monthly policy email targets | Staff post; everyone read |
| **Proposals** | §4.1 well-formed proposals | Everyone create topic; staff pin templates |
| **Meetings** | Agendas, live AV links, transcripts/minutes | Staff create; everyone reply |
| **Help** | Informal questions (Phase 0 chat substitute) | Everyone |
| **Introductions** | New participants | Everyone |

**Pinned topics to create:**

1. **Community policy** — link [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md), §4.6.7 infrastructure custody (bootstrap VPS → entity-owned migration via backup + restore), §6 anti-verticality summary, §6.1 authentic representation.
2. **How to write a proposal** — template:

   ```markdown
   ## What
   (concrete change)

   ## Why
   (user / contributor / operator value)

   ## Scope hint
   (module, package, doc, RFC — best effort)

   ## Optional offers
   (collaboration and/or sponsorship — informational only)

   ## GitHub tracker
   (link to Issue once opened)
   ```

3. **Meeting cadence** — monthly; N + T vote thresholds published before each meeting (§4.2).
4. **Sponsorship channels (Phase 0)** — link [`donation-channels.md`](donation-channels.md): Liberapay (recurring), Buy Me a Coffee (one-time), in-kind compute §4, escalation triggers §5.

5. **How we communicate** — short human-readable summary + links (required before first public proposal cycle; tracked on [`ROADMAP.md`](../ROADMAP.md) Phase 2 **2d** / **2c** and [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §8–§9). Use this body (edit only if policy text changes):

   ```markdown
   ## How we communicate on this forum

   Umbraculum community spaces are for **real people talking to real people**.

   - You represent **only yourself** (or someone who explicitly asked you to post for them).
   - **Do not** use AI or automation to post, reply, or vote as another person or as an unnamed “member.”
   - **Do not** run AI-generated replies in threads (Proposals, Meetings, Help, Introductions) as if a human wrote them.
   - If a post is **automated** (release bot, meeting reminder), say so at the top: `Automated post — not written by a human`.
   - If **AI helped you draft** a post you publish, say so briefly (e.g. “Drafted with AI assistance; reviewed and posted by me”).

   The in-app **AI consultant** is a product feature inside workspaces — not a forum participant.

   Full policy: [CORE-DEVELOPMENT-AND-COMMUNITY.md §6.1](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/CORE-DEVELOPMENT-AND-COMMUNITY.md) (link will work after public flip; until then use the doc in your clone).
   Code of Conduct: [CODE_OF_CONDUCT.md](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/CODE_OF_CONDUCT.md).

   Questions about conduct: conduct@umbraculum.dev
   ```

**Voting (§4.2):** For each proposal cycle, staff publishes whether that cycle uses **topic likes (reactions)** or a **single-choice poll** (Discourse built-in poll). Record the choice in the meeting-prep topic so thresholds are auditable.

---

## 7. §6 anti-verticality hardening (required before public launch)

These settings implement [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §6 on Discourse. Apply in **Admin → Settings** (search box finds most keys).

### 7.1 Fixed avatar (Umbraculum logo)

1. Upload [`docs/media/umbi.png`](../media/umbi.png) (or a square-cropped Umbraculum mark) via **Admin → Settings → Files → Default avatar**.
2. Set:

   | Setting | Value |
   |---------|--------|
   | `allow uploaded avatars` | **disabled** |
   | `automatically downloaded gravatars` | **disabled** |
   | `allow profile background images` | **disabled** |

3. Spot-check: new test user shows the default avatar only; profile edit has no custom avatar upload.

### 7.2 No badges, ranks, or leaderboard surfaces

| Setting | Value |
|---------|--------|
| `enable badges` | **disabled** (or disable badge granting if your Discourse version splits the toggle) |
| `display trust level badges` | **disabled** |
| `enable user directory` | **disabled** |
| `enable user status` | **disabled** |
| `enable discourse connect` | **disabled** until SSO is deliberately chosen for Sybil mitigation (§6) |

Trust levels may remain **internally** for anti-spam (Discourse default) — they must not be visible prestige signals on profiles or posts.

### 7.3 Minimal system email (monthly policy only)

Default new users to **no digests**; staff posts the monthly policy update as a public topic in **Community policy** (subscribers opt in manually if they want topic notifications).

| Setting | Value |
|---------|--------|
| `default email digest frequency` | **never** (or lowest frequency your version offers) |
| `disable emails` | Review toggles — disable **marketing** / **miscellaneous** digests; keep **security** and **account** emails enabled |
| `email posting and replying` | **disabled** (discussion stays on web) |

The §6 commitment is: the only **system-initiated** outreach beyond account/security mail is the **monthly policy link** — send that as a staff announcement topic, not an automated engagement drip.

### 7.4 Maintainer visibility

- Mark core-team accounts with the **admin** / **moderator** role where operationally needed (PR coordination, CoC, vetoes).
- Do **not** introduce custom titles, flair, or "core contributor" badges — procedural role labels only.

### 7.5 Hardening sign-off checklist

- [ ] Default avatar is Umbi / Umbraculum mark; uploads and Gravatar off
- [ ] Badges off; trust badges off; user directory off
- [ ] New user digest default = never (or equivalent)
- [ ] Categories + pinned proposal template live
- [ ] Pinned **How we communicate** topic live in **Community policy** (§6 item 5 — §6.1 authentic representation)
- [ ] Test registration + password reset email delivers
- [ ] CoC, §6.1, and §4.6 policy links visible without login (or in pinned **Community policy** / **How we communicate** topics readable by all)

---

## 8. Link graph (flip week)

After the forum is live, wire links from existing surfaces:

| Surface | Action |
|---------|--------|
| [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md) | Cross-post; add forum URL to release notes |
| [`CONTRIBUTING.md`](../../CONTRIBUTING.md) | Already points to forum for governance questions |
| Brochure / docs nav | **Done** — brochure [`index.html`](https://github.com/umbraculum-dev/umbraculum-brochure/blob/main/public/index.html) header + footer; docs site navbar + footer in [`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts) |
| GitHub org README | Link forum alongside docs |

Each **Proposal** topic should link to its GitHub Issue; each Issue should link back to the forum topic.

---

## 9. Smoke tests

```bash
# DNS
dig +short forum.umbraculum.dev A

# TLS + HTTP
curl -sI https://forum.umbraculum.dev/ | head -5

# Discourse health (expect 200)
curl -so /dev/null -w '%{http_code}\n' https://forum.umbraculum.dev/srv/status
```

Manual:

- [ ] Register a non-admin test account; confirm default avatar
- [ ] Create a topic in **Proposals** using the template
- [ ] Add a reaction or poll; confirm counts behave as expected for that cycle
- [ ] Confirm no badge UI on profile

---

## 10. Ongoing ops (~2–4 h/month)

| Task | Cadence |
|------|---------|
| `./launcher rebuild app` when **Admin → Dashboard → Updates** shows a stable upgrade | Monthly or when security advisory lands |
| Contabo Auto Backup verification in panel | After kick-off and after major upgrade |
| **Discourse → Contabo Object Storage** (€2.50/mo) | Enable post-flip — deferred at bootstrap; see [hosting-forum MAINTENANCE.md](https://github.com/umbraculum-dev/umbraculum-hosting-forum/blob/main/docs/MAINTENANCE.md) |
| Review `./launcher logs app` after rebuild | Per upgrade |
| Spam / CoC moderation | As needed |
| Publish meeting minutes to **Meetings** | Per §4.3 cadence |

**Backup policy (phased):**

| Layer | When | Cost |
|-------|------|------|
| **VPS only** | Bootstrap — provision, install, smoke-test | €3.60/mo |
| **Contabo Auto Backup** | **Kick-off** — forum announced as canonical governance home ([`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md)); enable **before** first `./launcher rebuild app` once posts/categories matter | +€1.50/mo |
| **Discourse → Object Storage** | Post-flip window or before first governance vote — see MAINTENANCE | +€2.50/mo |

**Kick-off** means the public flip points contributors at `forum.umbraculum.dev`, not a visitor-count threshold — an empty forum still gets Auto Backup once it is the governance surface.

**Pre-kick-off without Auto Backup:** acceptable while the host is install-only or disposable smoke-test data. Take a **manual snapshot** before risky rebuilds (VPS 10 includes one snapshot slot). If the VPS is lost, reinstall `./discourse-setup` — no archive obligation yet.

**Infra cost (itemized):** €3.60 bootstrap → €5.10 at kick-off → €7.60 full target. Public/support copy: **~€4/month** at bootstrap, **~€10/month** when backup layers are fully enabled.

**Upgrade command:**

```bash
cd /var/discourse
./launcher start app   # if stopped
# Apply update from admin UI or pull discourse_docker, then:
./launcher rebuild app
```

Re-run §7.5 spot-check after major Discourse version jumps — upgrades can re-enable default settings.

---

## 11. Phase 1 / 2 pointers (out of scope for this runbook)

| Phase | Trigger | Runbook action |
|-------|---------|----------------|
| **1 — Chat** | §4.6.3 | Add `chat.umbraculum.dev` A record; deploy Conduit (or Zulip Cloud sponsorship) — separate doc when triggered |
| **2 — AV** | §4.6.4 | Upgrade to VPS 20 or second VPS 10; `meet.umbraculum.dev` — separate doc when triggered |

---

## 12. Sign-off log

| Date | Maintainer | Forum live? | §7 hardening | Notes |
|------|------------|-------------|--------------|-------|
| — | — | ☐ | ☐ | Not executed yet |
