# Community forum maintenance (production VPS)

**Host:** Contabo Cloud VPS 10 — `forum.umbraculum.dev`  
**Paths:** `/var/discourse`, config in `containers/app.yml`  
**Related:** [`community-forum-runbook.md`](../../docs/design/community-forum-runbook.md) §10, [`community-forum-vps-security.md`](../../docs/design/community-forum-vps-security.md)

---

## 1. Routine commands

All commands run as **root** on the VPS:

```bash
cd /var/discourse

# View logs
./launcher logs app

# Shell inside container
./launcher enter app

# After app.yml change or Discourse upgrade
./launcher rebuild app
```

Prefer **Admin → Dashboard → Upgrade** when a stable release is offered; then `./launcher rebuild app` if the UI prompts or after pulling discourse_docker updates.

---

## 2. Backup strategy (phased)

| Layer | Bootstrap (pre-kick-off) | Kick-off | Full target |
|-------|--------------------------|----------|-------------|
| **Contabo Auto Backup** | **OFF** — optional while install-only / no governance content | **ON** — daily full-disk, 10-day retention, off-server (+€1.50/mo) | Keep enabled |
| **Discourse → Contabo Object Storage** | **Not configured** | Still deferred unless flip triggers early | Admin → Backups → S3-compatible target (+€2.50/mo) |

### Policy

> **Auto Backup is deferred until forum kick-off** — when `forum.umbraculum.dev` is announced as the canonical governance surface ([`public-alpha-flip-day-runbook.md`](../../docs/design/public-alpha-flip-day-runbook.md)), even if traffic is still zero. Pre-kick-off, the VPS may hold only smoke-test data; losing it means reinstall, not archive recovery.
>
> **Discourse off-site backups to Contabo Object Storage remain deferred** until the first post-flip maintenance window, or before a second maintainer / first governance vote cycle — whichever comes first.

**Why defer Auto Backup pre-kick-off:** saves €1.50/mo while the forum may never receive visitors; install and DNS validation do not need rolling off-server disk backups.

**Why enable Auto Backup at kick-off (not at visitor N):** once the forum is the governance home, categories and pinned policy posts exist even before the first external participant; `./launcher rebuild app` mistakes become costly.

**Why Object Storage still matters (later):** portable `.tar.gz` restores, retention beyond 10 days, independence from whole-VPS rewind, and host migration ([§7](#7-host-migration-entity-owned-vps)).

### Enabling Contabo Auto Backup (at kick-off)

1. Contabo Customer Control Panel → VPS → **Auto Backup** → enable (+€1.50/mo).
2. Confirm status in panel after first nightly run.
3. Restore path: **Restore last backup** ([help article](https://help.contabo.com/en/support/solutions/articles/103000331776-how-can-i-restore-my-vps-to-the-latest-auto-backup-)).

Take a **manual snapshot** before risky `./launcher rebuild app` operations (especially pre-kick-off when Auto Backup is off).

### Contabo Auto Backup restore

Contabo Customer Control Panel → **VPS Auto Backup** → **Restore last backup** ([help article](https://help.contabo.com/en/support/solutions/articles/103000331776-how-can-i-restore-my-vps-to-the-latest-auto-backup-)).

Take a **manual snapshot** before risky `./launcher rebuild app` operations.

### Enabling Discourse → Object Storage (when ready)

1. Order Contabo **Object Storage** (€2.50/mo) if not already active.
2. Create bucket + S3-compatible credentials; store keys in password manager ([`community-forum-secrets-inventory.md`](../../docs/design/community-forum-secrets-inventory.md)).
3. **Admin → Backups** — configure endpoint, bucket, access key; run test backup.
4. Document bucket name and retention in operator notes (not in git).

---

## 3. Monthly cadence (~2–4 h)

| Task | When |
|------|------|
| Apply Discourse stable upgrade | Monthly or on security advisory |
| Verify Contabo Auto Backup status in panel | After kick-off; then after major upgrade |
| `./launcher logs app` review | After each rebuild |
| Spam / CoC moderation | As needed |
| Meeting minutes to **Meetings** category | Per §4.3 cadence |
| Re-run §7.5 hardening spot-check | After major Discourse version jump |

---

## 4. Upgrade procedure

```bash
cd /var/discourse
git pull   # discourse_docker launcher updates
./launcher start app
# Apply version from Admin UI if needed, then:
./launcher rebuild app
```

Upgrades can reset Discourse site settings — re-verify §7 anti-verticality toggles in [`community-forum-runbook.md`](../../docs/design/community-forum-runbook.md) §7.5.

---

## 5. Sync template after config changes

When SMTP, hostname, or material `env:` keys change on the VPS:

1. Diff `/var/discourse/containers/app.yml` against [`app.yml.template`](app.yml.template).
2. Update template in repo with **placeholders only** — never commit live keys.

---

## 6. Infra cost reminder

| Line | €/month |
|------|---------|
| VPS 10 | 3.60 |
| Auto Backup (from kick-off) | 1.50 |
| Object Storage (when enabled) | 2.50 |
| **Bootstrap (VPS only)** | **3.60** |
| **At kick-off (+ Auto Backup)** | **5.10** |
| **Full target** | **7.60** |

Public figure: **~€4/month** bootstrap, **~€10/month** when all backup layers enabled — see [`apps/website/public/support/index.html`](../../apps/website/public/support/index.html).

---

## 7. Host migration (entity-owned VPS)

When the community votes to move off maintainer-operated bootstrap hosting ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../../docs/CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7):

1. Provision **new** VPS under the **Umbraculum legal entity** (or community-approved successor) account — do **not** attempt provider **account/VPS transfer** from the maintainer's personal account.
2. Enable **Discourse Admin → Backups** to S3-compatible storage if not already ([§2](#2-backup-strategy-phased)); take a final backup with forum in **read-only** mode.
3. Install Discourse on the new host with the **same hostname** (`forum.umbraculum.dev`); restore the backup; `./launcher rebuild app` if prompted.
4. Lower Cloudflare TTL on `forum` A record; cut DNS to the new IPv4 (grey cloud per runbook).
5. Smoke-test login, post, and email; announce maintenance complete on the forum.
6. After 24–48h stable operation, cancel the **old** bootstrap VPS.

Demo host (`demo.umbraculum.dev`), if migrated in the same vote, follows the same **new VPS + redeploy/restore + DNS** pattern per [`demo-host-runbook.md`](../../docs/design/demo-host-runbook.md) — not co-mingled with forum restore unless explicitly chosen.
