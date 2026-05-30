# Community forum SSL/TLS strategy

**Tier:** Public  
**Status:** v1 — Phase 0 decision record  
**Audience:** maintainers and future operators of `forum.umbraculum.dev`  
**Related:** [`community-forum-runbook.md`](community-forum-runbook.md) §4.1, [`community-forum-vps-security.md`](community-forum-vps-security.md), [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.1

---

## 1. Summary

| Phase | TLS termination | DNS proxy | Certificate |
|-------|-----------------|-----------|-------------|
| **0 — Bootstrap (chosen)** | VPS (Discourse nginx) | Cloudflare **grey cloud** (DNS only) | Let's Encrypt via `./discourse-setup` |
| **1 — Optional later** | Cloudflare edge + origin LE | **Orange cloud** (proxied) | CF edge cert + origin LE (**Full strict**) |

---

## 2. Phase 0 — grey cloud + Let's Encrypt on origin

### Decision

Visitors terminate TLS on the **Contabo VPS**. Cloudflare provides **DNS only** for `forum.umbraculum.dev` — no Cloudflare certificate appears in the browser chain at bootstrap.

### Rationale

- Discourse's `./discourse-setup` obtains and renews **Let's Encrypt** certificates against the origin hostname.
- Orange-cloud (proxied) at first install adds ACME, WebSocket, and upload friction without benefit at alpha scale.
- Brochure and docs remain on **Cloudflare Workers**; only the forum uses an **A → VPS** record.

### Prerequisites

1. Cloudflare **A** record `forum` → VPS IPv4, **proxy off** (grey cloud).
2. DNS resolves to the VPS **before** running `./discourse-setup`:

   ```bash
   dig @1.1.1.1 +short forum.umbraculum.dev A
   ```

3. Ports **80** and **443** reachable on the VPS (UFW allows both per [`community-forum-vps-security.md`](community-forum-vps-security.md)).

### Install flow

Answer **Yes** to Let's Encrypt in `./discourse-setup`. The discourse_docker stack handles ACME issuance and renewal inside the container.

### Smoke tests

```bash
curl -sI https://forum.umbraculum.dev/ | head -5
curl -so /dev/null -w '%{http_code}\n' https://forum.umbraculum.dev/srv/status
```

Browser: padlock valid for `forum.umbraculum.dev`.

### Renewal troubleshooting

If certificates fail to renew:

```bash
cd /var/discourse
./launcher logs app
```

Common causes: DNS no longer points at the VPS; port 80 blocked; orange-cloud enabled without Full (strict) origin config.

---

## 3. Phase 1 — optional Cloudflare proxy (document only)

**Do not implement at bootstrap.** Revisit when **all** criteria apply:

| Criterion | Why |
|-----------|-----|
| DDoS or abuse volume justifies CF edge | Grey cloud exposes origin IP |
| Origin still holds valid LE cert | Discourse continues ACME renewal on VPS |
| Maintainer tested WebSockets + uploads | Discourse uses both; proxied mode can break them |

### If enabled later

1. Keep Discourse Let's Encrypt on the origin.
2. Set Cloudflare SSL mode to **Full (strict)**.
3. Orange-cloud the `forum` A record.
4. Re-run smoke tests from §2 plus: create a post with an attachment, verify live topic updates.

See also [`community-forum-runbook.md`](community-forum-runbook.md) §4.

---

## 4. Related DNS layout

| Hostname | Target | TLS |
|----------|--------|-----|
| `umbraculum.dev`, `www` | Cloudflare Workers (brochure) | Cloudflare |
| `docs.umbraculum.dev` | Cloudflare Workers (docs) | Cloudflare |
| `forum.umbraculum.dev` | Contabo VPS A (grey at Phase 0) | Let's Encrypt on VPS |

---

## 5. Sign-off

| Date | Maintainer | Phase 0 LE live | Grey cloud confirmed | Notes |
|------|------------|-----------------|----------------------|-------|
| — | — | ☐ | ☐ | — |
