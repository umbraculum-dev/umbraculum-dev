# Community forum production infra (`forum.umbraculum.dev`)

**Purpose:** Maintainer reference for the **production** Discourse stack on Contabo (or equivalent bootstrap VPS). Phase 0 may be **maintainer-operated provisional** hosting until entity-owned migration ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../../docs/CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7). This tree is **not** deployed via root [`docker-compose.yml`](../../docker-compose.yml) (local monorepo dev only).

---

## Architecture

```
Browser → forum.umbraculum.dev (Cloudflare DNS grey) → Contabo VPS :443
                                                              ↓
                                                    /var/discourse (discourse_docker)
                                                              ↓
                                                    containers/app.yml → Docker
                                                              ↓
                                                    Discourse + Postgres + Redis + nginx + LE
```

| Component | Location |
|-----------|----------|
| Official launcher | `/var/discourse` on VPS (clone [discourse/discourse_docker](https://github.com/discourse/discourse_docker)) |
| Live config | `/var/discourse/containers/app.yml` (**secrets — not in git**) |
| Redacted template | [`app.yml.template`](app.yml.template) (this repo) |
| Shared data | `/var/discourse/shared/standalone` on VPS |

---

## Operator docs

| Doc | Role |
|-----|------|
| [`docs/design/community-forum-runbook.md`](../../docs/design/community-forum-runbook.md) | End-to-end bootstrap, categories, §6 hardening |
| [`docs/design/community-forum-vps-security.md`](../../docs/design/community-forum-vps-security.md) | SSH, UFW, fail2ban **before** install |
| [`docs/design/community-forum-ssl-strategy.md`](../../docs/design/community-forum-ssl-strategy.md) | Grey cloud + Let's Encrypt decision record |
| [`docs/design/community-forum-secrets-inventory.md`](../../docs/design/community-forum-secrets-inventory.md) | Vault labels, keyring migration |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Upgrades, backups, monthly cadence, §7 host migration |
| [`docs/CORE-DEVELOPMENT-AND-COMMUNITY.md`](../../docs/CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7 | Bootstrap custody; entity-owned migration policy |

---

## Phase 0 stack cost (itemized)

| Line | €/month |
|------|---------|
| Contabo Cloud VPS 10 | 3.60 |
| Contabo Auto Backup (from kick-off) | 1.50 |
| Contabo Object Storage (planned) | 2.50 |
| **Bootstrap (VPS only)** | **3.60** |
| **Full target** | **7.60** |

Public/support copy: **~€4/month** bootstrap, **~€10/month** full target — see [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../../docs/CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.5.

---

## Not the monorepo compose file

Root [`docker-compose.yml`](../../docker-compose.yml) runs the Umbraculum **development** API, web, Postgres, etc. The forum is an **isolated VPS** managed by Discourse's `./launcher` — do not merge the two stacks.

---

## After material config changes

When you change SMTP, hostname, or env vars on the VPS:

1. Edit `/var/discourse/containers/app.yml`
2. `./launcher rebuild app`
3. Sync **non-secret** structure to [`app.yml.template`](app.yml.template) in a follow-up PR (placeholders only)

See runbook §5.4.
