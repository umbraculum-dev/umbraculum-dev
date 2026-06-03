# Demo host runbook (`demo.umbraculum.dev`)

**Tier:** Public  
**Status:** Operator runbook — **LIVE** on Contabo VPS `84.247.163.121` since 2026-06-03; HTTPS via Traefik v3.6 + Let's Encrypt  
**Audience:** maintainers standing up or resetting the public **demo** stack (not production `cloud`)

> **Resume point:** Native EAS demo work can resume — see [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) §"Where we are".

> [!IMPORTANT]
> **`demo.umbraculum.dev` is a demonstration environment only.**  
> Seed data (recipes, brew sessions, E2E fixtures) exists to build and show Umbraculum—not as a production brewery ledger inside this repository. The database may be wiped or re-seeded without notice. There is no SLA, no backup promise, and no multi-tenant production posture.
>
> **Infrastructure custody (bootstrap).** At Phase 0 the demo host may run on **maintainer-operated provisional VPS** infrastructure (personal billing account). When the community votes for entity-owned hosting ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7; [`LICENSING.md`](../LICENSING.md) §7.6), migration is **redeploy + restore on a new VPS + DNS cutover** — **not** transfer of the existing VPS subscription or provider account between legal entities.
>
> **Future customer-facing hosted product** is tracked separately at [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) (`cloud.umbraculum.dev`) — not this host.

---

## What runs on the demo host

Single HTTPS origin (Traefik → internal nginx) serving:

| Path | Backend |
|------|---------|
| `/api/**` | `services/api` |
| `/{locale}/**` | `apps/web` |
| `/media/**` | synced web static assets |

Required services (production-mode containers): **traefik**, **nginx**, **api**, **web**, **postgres** (pgvector), **redis**, **gotenberg**.

**Clients:**

- Browser — MRP/CRP walkthroughs, full web app ([`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md))
- EAS `preview` APK — brewery native; `EXPO_PUBLIC_API_BASE_URL` = `https://demo.umbraculum.dev` ([`apps/native/eas.json`](../../apps/native/eas.json))
- Native **Open on web** — must use the **same** origin ([`openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts))
- **Ubuntu Touch** — Click webapp over the same web origin (cookie session, online-first); reference package [`packaging/ubuntu-touch/umbraculum-reference/`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) ([`ubuntu-touch-shell-strategy.md`](ubuntu-touch-shell-strategy.md))

---

## Demo accounts (credentials)

Demo logins use the **E2E seed personas** (defaults; ship-safe — same on every demo). Source of truth: [`apps/web/e2e/personas.json`](../../apps/web/e2e/personas.json) and `services/api/src/cli/seedE2eFixture.ts`.

| Role | Email | Default password |
|------|-------|------------------|
| **Brewery admin (primary demo)** | `e2e-admin@brewery.local` | `e2e-admin-pw!` |
| Member | `e2e-member@brewery.local` | `e2e-member-pw!` |
| Viewer | `e2e-viewer@brewery.local` | `e2e-viewer-pw!` |
| Multi-workspace admin (SelectWorkspace flow) | `e2e-multi-admin@brewery.local` | `e2e-multi-admin-pw!` |

**Active workspace (fixtures):** `e2e00000-0000-0000-0000-0000000000aa`.

These credentials are **public by design** — they exist only on the demo host whose DB may be wiped at any time. They are intended for the header banner once added to the web shell. To override on a private install, set `E2E_ADMIN_PASSWORD` etc. in `/opt/umbraculum-hosting-demo/.env` and re-run `seed:e2e` (upsert hashes the new value into the same user row, no data loss).

**Native login:** `POST /api/auth/login/native` with the same email/password as web.

---

## Current status (last checked 2026-06-03)

Run from repo root:

```bash
./scripts/demo-host-verify.sh
BASE_URL=https://demo.umbraculum.dev ./scripts/demo-native-api-smoke.sh
```

| Check | Result |
|-------|--------|
| DNS `A` | `84.247.163.121` (Contabo VPS 10, `vmi3344577`) |
| `https://demo.umbraculum.dev/api/health` | **`{"ok":true}`** — Traefik v3.6 + Let's Encrypt |
| Browser `https://demo.umbraculum.dev/en` | `307 → /en/login` for anonymous; dashboard after login |
| `demo-native-api-smoke.sh` (5/5) | health, native login, `/auth/me`, `/recipes`, `/auth/webview-exchange` all green |

**Stack:** umbraculum-hosting-demo `main` (compose + Traefik v3.6 + nginx) at `/opt/umbraculum-hosting-demo`; umbraculum-dev `master` at `/opt/umbraculum-dev`; volumes `umbraculum_demo_*` (data) + reused `umbraculum_root_node_modules`/`umbraculum_npm_cache` (build).

**Local preflight (optional):** `BASE_URL=http://localhost:18080 ./scripts/demo-native-api-smoke.sh` — proves API paths against your dev stack; does **not** close G1.

---

## Open follow-ups (non-blocking for demo)

### 1. Phase 0 Step 2 — SSH key-only hardening

**Status:** keys installed and working; password SSH is still enabled as a fallback. Close this before treating the VPS as long-lived.

**Procedure:**

1. From your **laptop**, open a **second** terminal (keep your existing root SSH session open in the first):

   ```bash
   ssh -o PreferredAuthentications=publickey -o PasswordAuthentication=no umbdemo 'echo OK && hostname'
   ```

   Must print `OK` and `vmi3344577` with no password prompt. **Do not proceed otherwise** — you risk a permanent lockout.

2. On the VPS:

   ```bash
   cd /opt/umbraculum-hosting-demo
   bin/harden --ssh-hardening
   ```

   This applies the `umbraculum-hosting-common` security baseline plus `PasswordAuthentication no` in `/etc/ssh/sshd_config.d/99-umbraculum-hosting.conf`. The script's post-flight check fails the run if SSH did not reload cleanly.

3. Verify from a **third** terminal that password login is now refused:

   ```bash
   ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no umbdemo
   # expect: Permission denied (publickey).
   ```

**Recovery if locked out:** Contabo VNC console → log in as root → restore `/etc/ssh/sshd_config.d/99-umbraculum-hosting.conf` (or `systemctl edit ssh` to override `PasswordAuthentication yes`) → `systemctl restart ssh`.

### 2. Pin Traefik image to a digest

**Status:** **DONE** as of 2026-06-03 — [`docker-compose.demo.yml`](https://github.com/umbraculum-dev/umbraculum-hosting-demo/blob/main/docker-compose.demo.yml) pins `traefik:v3.6@sha256:802adc80a7bb20a6766c9385c2ad547f0de98564cd20d31d0b6d8f726f906f66`. Bump procedure (when a v3.6.x release lands):

```bash
docker pull traefik:v3.6
docker inspect traefik:v3.6 --format '{{index .RepoDigests 0}}'
# update the image: line in docker-compose.demo.yml, commit, push, then on VPS:
cd /opt/umbraculum-hosting-demo && bin/pull
docker compose -f docker-compose.demo.yml --env-file .env up -d traefik
```

### 3. Revoke the temporary GitHub PAT (after `umbraculum-dev` flips public)

**Status:** while `umbraculum-dev` is private, the VPS clones it over HTTPS with a classic PAT (org policy disables deploy keys). When the repo flips public:

1. **GitHub** → Profile → **Settings** → **Developer settings** → **Personal access tokens (classic)** → revoke `umbdemo-read` (or whatever you named it).
2. **VPS** — wipe stored credentials:

   ```bash
   git config --global --unset credential.helper
   rm -f /root/.git-credentials
   ```

3. Confirm anonymous clone still works:

   ```bash
   cd /opt/umbraculum-dev && git fetch origin && git status
   ```

---

## Infra bring-up checklist (maintainer)

1. **DNS** — `demo.umbraculum.dev` → A/AAAA or CNAME to the host running Docker Compose (must reach **your** Umbraculum nginx, not a registrar parking page).
2. **TLS** — HTTPS at Traefik (Let's Encrypt HTTP-01). Android EAS builds require HTTPS.
3. **Deploy** — Follow [umbraculum-hosting-demo `docs/OPERATOR.md`](https://github.com/umbraculum-dev/umbraculum-hosting-demo/blob/main/docs/OPERATOR.md) C1–C7.
4. **Env** — Production env in `/opt/umbraculum-hosting-demo/.env`: `ACME_EMAIL`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `APP_AI_KEY_SECRET`, `RENDERING_SIGNING_SECRET`.
5. **Migrate + seed** — `prisma migrate deploy` then `npm run seed:e2e -w @umbraculum/api`.
6. **Verify**
   ```bash
   curl -fsS https://demo.umbraculum.dev/api/health    # {"ok":true}
   ./scripts/demo-host-verify.sh
   BASE_URL=https://demo.umbraculum.dev ./scripts/demo-native-api-smoke.sh
   ```
7. **Smoke web** — Log in at `https://demo.umbraculum.dev/en` as `e2e-admin@brewery.local` and run [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) steps 1–4.
8. **Smoke native** — Install EAS `preview` APK; follow [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5.1.

---

## Reset policy

- Demo data may be **deleted and re-seeded** at any time for demos or CI parity.
- Do not store data on demo that you cannot afford to lose.
- Your **real operational brewery** (outside this repo) will use **`cloud.umbraculum.dev`** when that track ships—not demo.

---

## Related docs

- [`demo-host-ssl-strategy.md`](demo-host-ssl-strategy.md) — Traefik v3.6 + ACME ADR
- [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) — EAS build IDs and device smoke status
- [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5 — native demo scope and checklist
- [`ubuntu-touch-shell-strategy.md`](ubuntu-touch-shell-strategy.md) — UT webapp shell strategy
- [`packaging/ubuntu-touch/umbraculum-reference/README.md`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) — reference Click package (demo origin default)
- [`NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md) §5 — EAS profiles and CI workflow
- [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) — future hosted product (not demo)
