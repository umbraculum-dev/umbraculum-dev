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

| Layer | Phase 0 (bootstrap) | Phase 0+ (target) |
|-------|---------------------|-------------------|
| **Contabo Auto Backup** | **ON** — daily full-disk, 10-day retention, off-server | Keep enabled |
| **Discourse → Contabo Object Storage** | **Not configured at launch** | Admin → Backups → S3-compatible target (**€2.50/mo** add-on) |

### Policy

> Contabo Auto Backup is **sufficient to launch** the governance forum. **Discourse off-site backups to Contabo Object Storage are deferred for maintainer convenience at alpha bootstrap**, not because skipping them is acceptable long-term. Enable object-storage backups within the first post-flip maintenance window, or before a second maintainer / first governance vote cycle — whichever comes first.

**Why defer is tolerable short-term:** low pre-flip content volume; Auto Backup covers catastrophic VPS loss and bad rebuilds for ~10 days.

**Why Object Storage still matters:** portable `.tar.gz` restores, retention beyond 10 days, independence from whole-VPS rewind.

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
| Verify Contabo Auto Backup status in panel | After major upgrade |
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
| Auto Backup | 1.50 |
| Object Storage (when enabled) | 2.50 |
| **Itemized** | **7.60** |

Public figure: **~€10/month** — see [`apps/website/public/support/index.html`](../../apps/website/public/support/index.html).
