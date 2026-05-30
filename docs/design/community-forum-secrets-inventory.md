# Community forum secrets inventory

**Tier:** Public (labels only — **no secret values in git**)  
**Status:** v1 — Phase 0  
**Audience:** maintainers; future second admin after org keyring migration  
**Related:** [`community-forum-runbook.md`](community-forum-runbook.md), [`community-forum-vps-security.md`](community-forum-vps-security.md), [`donation-channels.md`](donation-channels.md), [`infra/community-forum/app.yml.template`](../../infra/community-forum/app.yml.template)

> [!CAUTION]
> **Never commit** vault exports, SMTP keys, SSH private keys, or Discourse admin passwords. The live `containers/app.yml` on the VPS contains secrets — sync structure to [`app.yml.template`](../../infra/community-forum/app.yml.template) only with placeholders.

---

## 1. Inventory (labels only)

| Secret / credential | Stored in | Used for | Rotate when |
|---------------------|-----------|----------|-------------|
| Contabo panel login | Password manager | VPS billing, Auto Backup, Object Storage | Credential leak; staff change |
| Contabo VPS IPv4 | Password manager + operator notes | DNS A record, SSH | IP change (rare) |
| VPS root SSH **private** key | Password manager + maintainer `~/.ssh` | SSH to VPS | Key compromise; second maintainer onboarding |
| Discourse admin password | Password manager | Admin UI | After first login; keyring migration |
| Brevo SMTP key | Password manager | `./discourse-setup`, `DISCOURSE_SMTP_PASSWORD` | Leak; periodic rotation |
| Brevo account (Proton login) | Password manager | Brevo dashboard | Account compromise |
| Cloudflare account | Password manager | DNS, Email Routing | Account compromise |
| Stripe (Liberapay / Buy Me a Coffee) | Password manager (Proton) | Donation dashboards | Provider requirement |
| Contabo Object Storage keys | Password manager | Discourse Admin → Backups (Phase 0+) | When enabling layer-2 backups |
| `forum@` Email Routing | Cloudflare UI (no secret) | Inbound admin mail | N/A |

---

## 2. Operator-only notes (optional)

Non-secret operational metadata (VPS service ID, order ID, renewal date) may live in a **gitignored** maintainer note, e.g. `internal/working-notes/community-forum-operator-inventory-YYYY-MM-DD.md`, or in the password manager secure note attached to the Contabo entry.

**Do not** put IPv4-only notes in public docs if you treat origin IP as sensitive before optional Cloudflare proxy.

---

## 3. Keyring migration (required before second maintainer)

### Current state (Phase 0)

Credentials live in a **solo maintainer LastPass** vault. Acceptable for solo bootstrap and public-alpha flip.

### Target state

**Umbraculum org-managed** password manager before a **second maintainer** receives VPS or Discourse admin access.

### Evaluate (criteria)

| Criterion | Notes |
|-----------|--------|
| MFA enforcement | Required for all org members |
| Shared collections | `forum-infra`, `donations`, `cloudflare` |
| Emergency access | Break-glass for org continuity |
| Audit log | Who accessed which entry |
| EU data option | Prefer EU-friendly vendor if available |
| Cost at 2–5 seats | Bitwarden Organizations, 1Password Business, Dashlane Business |

### Migration steps

1. Create org vault and collections.
2. Invite or import entries from solo vault (Contabo, Brevo, Cloudflare, SSH key backup, Discourse admin).
3. **Rotate** Brevo SMTP key and Discourse admin password after migration.
4. Revoke solo-vault copies of shared infra secrets.
5. Update this doc §1 with vault product name only (not master password).
6. Track deadline on [`ROADMAP.md`](../ROADMAP.md) — **org keyring before second admin**.

---

## 4. What must not go in git

| Never commit | Instead |
|--------------|---------|
| Live `containers/app.yml` from VPS | Redacted [`app.yml.template`](../../infra/community-forum/app.yml.template) |
| Brevo SMTP key | Placeholder `<BREVO_SMTP_KEY>` in template |
| SSH private keys | Password manager + local `~/.ssh` |
| Object Storage access/secret keys | Password manager; configure in Discourse Admin UI |
| LastPass / vault export CSV | Delete after import |

---

## 5. Sign-off

| Date | Maintainer | Solo vault complete | Org migration deadline set | Notes |
|------|------------|---------------------|----------------------------|-------|
| — | — | ☐ | ☐ | — |
