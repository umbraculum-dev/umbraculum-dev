# Demo host SSL/TLS strategy (`demo.umbraculum.dev`)

**Tier:** Public  
**Status:** v1 — Phase 0 decision record  
**Audience:** maintainers operating the demo VPS  
**Related:** [`demo-host-runbook.md`](demo-host-runbook.md), [`production-hosts.md`](production-hosts.md), [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md) (forum contrast)

---

## Summary

| Host | TLS termination | Certificate |
|------|-----------------|-------------|
| **demo.umbraculum.dev** | **Traefik** on demo VPS (:80 / :443) | Let's Encrypt HTTP-01 (`certificatesresolvers.le`) |
| **forum.umbraculum.dev** | Discourse nginx (separate VPS) | Let's Encrypt via `./discourse-setup` |

Local **umbraculum-dev** `docker-compose.yml` stays on **:18080** without Traefik — intentional dev-only posture.

---

## Phase 0 — grey DNS + Traefik ACME

1. Cloudflare (or registrar) **A** record `demo` → demo VPS IPv4, **proxy off** (grey cloud).
2. UFW allows **22, 80, 443** (`bin/bootstrap` in umbraculum-hosting-demo).
3. Only **Traefik** publishes host 80/443; internal **nginx** has no host ports.
4. Traefik routes `Host(\`demo.umbraculum.dev\`)` → `nginx:80`; nginx proxies `/api` and `/` to api/web.
5. **nginx** trusts `X-Forwarded-Proto` from Traefik ([`infra/nginx/demo.conf`](../../infra/nginx/demo.conf) `map`).

Operator compose: **umbraculum-hosting-demo** `docker-compose.demo.yml` + `.env` (`ACME_EMAIL`).

---

## Smoke tests

```bash
dig +short demo.umbraculum.dev A
curl -fsS https://demo.umbraculum.dev/api/health
# expect {"ok":true}
```

From umbraculum-dev clone: `./scripts/demo-host-verify.sh`

---

## Out of scope

- Cloudflare orange-cloud on demo (defer)
- Traefik on local dev compose
- Sharing forum or demo on one VPS
