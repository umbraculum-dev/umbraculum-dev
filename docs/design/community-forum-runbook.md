# Community forum runbook (`forum.umbraculum.dev`)

**Tier:** Public  
**Status:** v1 — Phase 0 bootstrap (Discourse on Contabo); execute before or during public-alpha flip comms  
**Audience:** maintainer standing up the canonical community surface per [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6  
**Related:** [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md), [`community-forum-vps-security.md`](community-forum-vps-security.md), [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md), [`community-forum-secrets-inventory.md`](community-forum-secrets-inventory.md), [`../../infra/community-forum/README.md`](../../infra/community-forum/README.md), [`donation-channels.md`](donation-channels.md), [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md)

> [!IMPORTANT]
> **Governance record lives here.** Proposals, vote threads, meeting minutes, and vetoes (§4.4) are canonical on the forum. GitHub Issues track implementation; external Jitsi links are provisional until Phase 2 (§4.6.4).

---

## 1. Summary

| Item | Value |
|------|--------|
| **URL** | `https://forum.umbraculum.dev` |
| **Software** | [Discourse](https://www.discourse.org/) (GPL, self-host via official Docker launcher) |
| **VPS** | Contabo **Cloud VPS 10** — Ubuntu **24.04 LTS**, 75 GB NVMe, Auto Backup on |
| **Infra cost (itemized)** | **€7.60/month** — VPS €3.60 + Auto Backup €1.50 + Object Storage €2.50 (planned) |
| **Infra cost (public round figure)** | **~€10/month** (~€120/year) for support/donation copy |
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
| Contabo VPS ordered | Cloud VPS 10 + Auto Backup; IPv4 assigned |
| Brevo + `forum@` smoke-tested | Test send/receive before `./discourse-setup` |

**Checklist before VPS work:**

- [ ] Brevo domain authenticated; SMTP key in password manager
- [ ] `forum@` Email Routing delivers to maintainer inbox
- [ ] Contabo VPS provisioned (24.04, NVMe, Auto Backup)
- [ ] VPS IPv4 recorded in password manager

---

## 3. Contabo VPS

1. Order **Cloud VPS 10** (auto backup enabled, 12-month term, **75 GB NVMe**).
2. Choose **Ubuntu 24.04 LTS** (Noble).
3. Note the **public IPv4** — needed for Cloudflare DNS.
4. SSH as root; apply security baseline per **[§3.1 VPS security](#31-vps-security)**.
5. Confirm **8 GB RAM** free: `free -h`.

**Do not** co-locate the demo stack ([`demo-host-runbook.md`](demo-host-runbook.md)) on this VPS at Phase 0 — keep the community forum isolated from demo resets.

### 3.1 VPS security

Apply **[`community-forum-vps-security.md`](community-forum-vps-security.md)** **before** `./discourse-setup`: SSH key-only, UFW (22/80/443), fail2ban, unattended-upgrades, confirm Auto Backup in Contabo panel.

---

## 4. Cloudflare DNS

In the **`umbraculum.dev`** zone:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| **A** | `forum` | Contabo VPS IPv4 | **DNS only** (grey cloud) |

Wait for propagation; verify:

```bash
dig +short forum.umbraculum.dev A
```

**Why grey cloud at bootstrap:** Discourse's `./discourse-setup` obtains Let's Encrypt certificates directly against the origin. See **[§4.1 SSL/TLS](#41-ssltls)** and [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md).

**Existing records (unchanged):**

| Host | Target |
|------|--------|
| `umbraculum.dev`, `www` | Cloudflare Workers (brochure) |
| `docs.umbraculum.dev` | Cloudflare Workers (docs) |

### 4.1 SSL/TLS

Phase 0: **grey cloud** + **Let's Encrypt on the VPS** (Discourse nginx). Full decision record: [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md). Orange-cloud proxy is optional later only.

---

## 5. Discourse install (official launcher)

### 5.1 Brevo SMTP (Phase 0 — before `./discourse-setup`)

| Role | Address | Notes |
|------|---------|--------|
| **Brevo account login** | `umbraculum-dev@proton.me` (or maintainer Proton) | Dashboard, billing, alerts from `brevo.com` — **not** a sender |
| **Verified sender (From)** | **`forum@umbraculum.dev`** | Only sender needed; delete any accidental `@proton.me` senders in Brevo |
| **Domain** | `umbraculum.dev` | Authenticated in Brevo; DNS records **DNS only** (grey cloud) in Cloudflare |

Create an **SMTP key** in Brevo → **Transactional** → **SMTP & API** ([keys page](https://app.brevo.com/settings/keys/smtp)).

| Brevo field | Value for Discourse |
|-------------|---------------------|
| SMTP server | `smtp-relay.brevo.com` |
| Port | `587` (STARTTLS). If the VPS blocks 587, try `2525` |
| SMTP login (username) | Brevo **SMTP login** (usually your **Proton** account email — not `forum@`) |
| SMTP password | Brevo **SMTP key** (not your Brevo account password) |
| **From / notification address** | **`forum@umbraculum.dev`** (must be a verified sender in Brevo) |

Official Discourse + Brevo template: [INSTALL-email.md — Brevo](https://github.com/discourse/discourse/blob/main/docs/INSTALL-email.md).

### 5.2 `./discourse-setup` on the VPS

On the VPS as root:

```bash
apt-get update
apt-get install -y git

git clone https://github.com/discourse/discourse_docker.git /var/discourse
cd /var/discourse
./discourse-setup
```

Interactive prompts — use:

| Prompt | Value |
|--------|--------|
| Hostname | `forum.umbraculum.dev` |
| Admin email | **`forum@umbraculum.dev`** |
| SMTP server | `smtp-relay.brevo.com` |
| SMTP port | `587` |
| SMTP username | Brevo SMTP login (Proton email) |
| SMTP password | Brevo SMTP key |
| Let's Encrypt | **Yes** (requires DNS A record already pointing here) |

After `./discourse-setup`, confirm **`containers/app.yml`** includes (add or verify if missing):

```yaml
  DISCOURSE_NOTIFICATION_EMAIL: forum@umbraculum.dev
  DISCOURSE_SMTP_ADDRESS: smtp-relay.brevo.com
  DISCOURSE_SMTP_PORT: 587
  DISCOURSE_SMTP_USER_NAME: '<brevo-smtp-login>'
  DISCOURSE_SMTP_PASSWORD: '<brevo-smtp-key>'
  DISCOURSE_SMTP_ENABLE_START_TLS: true
  DISCOURSE_SMTP_DOMAIN: umbraculum.dev
```

Then rebuild if you edited `app.yml` manually:

```bash
cd /var/discourse
./launcher rebuild app
```

### 5.3 Discourse Admin → Email (after first login)

**Admin → Settings → Email** — search and set:

| Setting | Value |
|---------|--------|
| `notification email` | **`forum@umbraculum.dev`** |
| `site contact email` | **`forum@umbraculum.dev`** (or `conduct@umbraculum.dev` if you prefer CoC contact separate) |
| `email posting and replying` | **disabled** (per §7.3) |

Send **Test email** from Admin → Email; confirm From shows **Umbraculum Forum** / `forum@umbraculum.dev` and delivery to Proton.

After setup completes, browse to `https://forum.umbraculum.dev`, complete admin registration, and confirm email delivery (invite yourself as a second user).

**Rebuild reference** (after other `containers/app.yml` edits):

```bash
cd /var/discourse
./launcher rebuild app
```

Official docs: [Discourse self-host install](https://github.com/discourse/discourse_docker/blob/main/README.md).

### 5.4 Sync `app.yml.template` after material changes

When hostname, SMTP, or other `env:` keys change on the VPS:

1. Update `/var/discourse/containers/app.yml` and `./launcher rebuild app`.
2. Sync **non-secret** structure to [`infra/community-forum/app.yml.template`](../../infra/community-forum/app.yml.template) (placeholders only — see [`community-forum-secrets-inventory.md`](community-forum-secrets-inventory.md)).

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

1. **Community policy** — link [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md), §6 anti-verticality summary, §6.1 authentic representation.
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
| Brochure / docs nav | Optional footer link: **Community forum** → `https://forum.umbraculum.dev` |
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
| Contabo Auto Backup verification in panel | After major upgrade |
| **Discourse → Contabo Object Storage** (€2.50/mo) | Enable post-flip — deferred at bootstrap; see [`infra/community-forum/MAINTENANCE.md`](../../infra/community-forum/MAINTENANCE.md) |
| Review `./launcher logs app` after rebuild | Per upgrade |
| Spam / CoC moderation | As needed |
| Publish meeting minutes to **Meetings** | Per §4.3 cadence |

**Backup policy (phased):** Contabo Auto Backup is sufficient to **launch**. Object Storage off-site backups are **deferred for maintainer convenience at alpha bootstrap**, not because skipping them is acceptable long-term — enable within the first post-flip window or before second maintainer / first governance vote.

**Infra cost (itemized):** €7.60/month (VPS €3.60 + Auto Backup €1.50 + Object Storage €2.50 planned). Public/support copy: **~€10/month**.

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
