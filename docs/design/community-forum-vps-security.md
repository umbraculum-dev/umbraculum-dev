# Community forum VPS security baseline

**Tier:** Public  
**Status:** v1 — Phase 0 (Contabo Cloud VPS 10, Ubuntu 24.04)  
**Audience:** maintainer hardening the forum VPS **before** `./discourse-setup`  
**Related:** [`community-forum-runbook.md`](community-forum-runbook.md) §3.1, [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md), [`community-forum-secrets-inventory.md`](community-forum-secrets-inventory.md), [`infra/community-forum/MAINTENANCE.md`](../../infra/community-forum/MAINTENANCE.md)

> [!IMPORTANT]
> Apply this baseline on a **fresh** Contabo VPS with **no** other web services on ports 80/443. Do **not** co-locate the demo stack ([`demo-host-runbook.md`](demo-host-runbook.md)) on this host at Phase 0.

---

## 1. Scope

| In scope (Phase 0) | Out of scope (Phase 0) |
|--------------------|-------------------------|
| SSH key-only auth | CrowdSec, OSSEC, separate WAF |
| UFW (22, 80, 443) | Non-root Discourse operator (upstream expects root for `./launcher rebuild`) |
| fail2ban `sshd` jail | Orange-cloud Cloudflare proxy |
| unattended-upgrades (security) | In-place Ubuntu release upgrades on a live Discourse host |

---

## 2. Why root + keys (not a sudo deploy user)

[discourse_docker](https://github.com/discourse/discourse_docker) expects the maintainer to run `./launcher` and `./discourse-setup` as **root** on the VPS. We keep root login **key-only** (`PermitRootLogin prohibit-password`) rather than introducing a separate sudo user that still must escalate for every rebuild.

---

## 3. Pre-install checklist

Run as **root** over SSH after Contabo assigns the IPv4:

```bash
# Confirm OS and RAM
lsb_release -a
free -h

# Confirm nothing else binds 80/443
ss -tlnp | grep -E ':80|:443' || true
```

- [ ] Ubuntu **24.04 LTS** (Noble)
- [ ] ~8 GB RAM available
- [ ] Contabo **Auto Backup** enabled at **forum kick-off** (optional pre-kick-off — see [`community-forum-runbook.md`](community-forum-runbook.md) §10, [`MAINTENANCE.md`](../../infra/community-forum/MAINTENANCE.md) §2)
- [ ] SSH public key works; password login will be disabled in §4

---

## 4. SSH hardening

Edit `/etc/ssh/sshd_config` (values below are the Phase 0 minimum):

```
PermitRootLogin prohibit-password
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
```

Apply:

```bash
sshd -t && systemctl reload sshd
```

Verify from a **second terminal** before closing your current session:

```bash
ssh root@<VPS_IP>
```

---

## 5. UFW firewall

```bash
apt-get update
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

After `./discourse-setup`, confirm Docker still publishes 80/443 and `ufw status` shows the rules active.

---

## 6. fail2ban

```bash
apt-get install -y fail2ban
systemctl enable --now fail2ban
fail2ban-client status sshd
```

Optional post-Discourse: add nginx jails only if brute-force patterns appear in `/var/discourse/shared/standalone/log/var-log/nginx/`.

---

## 7. Automatic security updates

```bash
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades   # select Yes
```

---

## 8. Timezone

```bash
timedatectl set-timezone UTC
timedatectl
```

Document a different TZ in the runbook §12 sign-off if you choose maintainer-local time instead.

---

## 9. Contabo Auto Backup

| Item | Detail |
|------|--------|
| **Cost** | €1.50/month add-on |
| **When** | Enable at **forum kick-off** (canonical governance surface live) — may stay **off** during install-only bootstrap |
| **Retention** | Up to 10 daily rolling backups, off-server |
| **Restore** | Contabo Customer Control Panel → VPS Auto Backup → **Restore last backup** |

Take a **manual snapshot** in the Contabo panel before risky `./launcher rebuild app` operations (VPS 10 includes one snapshot slot). **Required** pre-kick-off when Auto Backup is still off.

Auto Backup is **layer 1** — see [`infra/community-forum/MAINTENANCE.md`](../../infra/community-forum/MAINTENANCE.md) for kick-off timing and Discourse → Object Storage backups (layer 2).

---

## 10. Post-install verification

After `./discourse-setup` completes:

```bash
ufw status verbose
fail2ban-client status sshd
curl -sI https://forum.umbraculum.dev/ | head -5
```

Re-run §7.5 hardening in [`community-forum-runbook.md`](community-forum-runbook.md) before public flip.

---

## 11. Sign-off

| Date | Maintainer | SSH keys only | UFW | fail2ban | Auto Backup (kick-off) | Notes |
|------|------------|---------------|-----|----------|----------------------|-------|
| — | — | ☐ | ☐ | ☐ | ☐ | — |
