# Demo host runbook (`demo.umbraculum.dev`)

**Tier:** Public  
**Status:** Operator runbook — **Phase 0 not started** (DNS/host not live as of 2026-05-27); repo `eas.json` already points `preview` APK at this URL  
**Audience:** maintainers standing up or resetting the public **demo** stack (not production `cloud`)

> **Resume point:** Native EAS demo work is **paused** until you complete this runbook’s infra checklist. Track overall progress in [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) §“Where we are”.

> [!IMPORTANT]
> **`demo.umbraculum.dev` is a demonstration environment only.**  
> Seed data (recipes, brew sessions, E2E fixtures) exists to build and show Umbraculum—not as a production brewery ledger inside this repository. The database may be wiped or re-seeded without notice. There is no SLA, no backup promise, and no multi-tenant production posture.
>
> **Infrastructure custody (bootstrap).** At Phase 0 the demo host may run on **maintainer-operated provisional VPS** infrastructure (personal billing account). When the community votes for entity-owned hosting ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6.7; [`LICENSING.md`](../LICENSING.md) §7.6), migration is **redeploy + restore on a new VPS + DNS cutover** — **not** transfer of the existing VPS subscription or provider account between legal entities.
>
> **Future customer-facing hosted product** is tracked separately at [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) (`cloud.umbraculum.dev`) — not this host.

---

## What runs on the demo host

Single HTTPS origin (nginx) serving:

| Path | Backend |
|------|---------|
| `/api/**` | `services/api` |
| `/{locale}/**` | `apps/web` |
| `/media/**` | synced web static assets |

Required services (same as local dev): **api**, **web**, **nginx**, **postgres**, **gotenberg**, **redis**.

**Clients:**

- Browser — MRP/CRP walkthroughs, full web app ([`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md))
- EAS `preview` APK — brewery native; `EXPO_PUBLIC_API_BASE_URL` = `https://demo.umbraculum.dev` ([`apps/native/eas.json`](../../apps/native/eas.json))
- Native **Open on web** — must use the **same** origin ([`openWebFallback.ts`](../../apps/native/src/navigation/openWebFallback.ts))
- **Ubuntu Touch** — Click webapp over the same web origin (cookie session, online-first); reference package [`packaging/ubuntu-touch/umbraculum-reference/`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) ([`ubuntu-touch-shell-strategy.md`](ubuntu-touch-shell-strategy.md))

---

## Demo accounts (credentials)

Demo logins use the **E2E seed personas** ([`apps/web/e2e/personas.json`](../../apps/web/e2e/personas.json)). After deploy, you may change emails to `@umbraculum.dev` in the database; update this table when you do.

| Role | Email (default seed) | Password source |
|------|----------------------|-----------------|
| Admin (primary demo) | `e2e-admin@brewery.local` | `E2E_ADMIN_PASSWORD` env on API, else default in personas: `e2e-admin-pw!` |
| Member | `e2e-member@brewery.local` | `E2E_MEMBER_PASSWORD` / `e2e-member-pw!` |
| Viewer | `e2e-viewer@brewery.local` | `E2E_VIEWER_PASSWORD` / `e2e-viewer-pw!` |

**Do not commit production passwords to git.** Set strong passwords via server env or post-deploy `DEVELOPMENT-LOCAL.md` private notes; share demo credentials through your agreed channel (password manager, secure chat).

**Active workspace (fixtures):** `e2e00000-0000-0000-0000-0000000000aa` (see personas `fixture` block).

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
| Browser `https://demo.umbraculum.dev/en` | Dashboard renders (App permissions, API health, Brew-day shelves) |
| `demo-native-api-smoke.sh` (5/5) | health, native login, `/auth/me`, `/recipes`, `/auth/webview-exchange` all green |

**Stack:** umbraculum-hosting-demo `main` (compose + Traefik v3.6 + nginx) at `/opt/umbraculum-hosting-demo`; umbraculum-dev `master` at `/opt/umbraculum-dev`; volumes `umbraculum_demo_*` (data) + reused `umbraculum_root_node_modules`/`umbraculum_npm_cache` (build).

**Open follow-ups (non-blocking for demo):**

- **Phase 0 Step 2 — SSH key-only hardening:** verify key login from a second terminal then run `bin/harden --ssh-hardening` on the VPS to disable password SSH.
- **Pin Traefik image to a digest** when tagging hosting-demo for the public flip.
- **Revoke the temporary GitHub PAT** used to clone the private umbraculum-dev repo when the repo flips public.

**Local preflight (optional):** `BASE_URL=http://localhost:18080 ./scripts/demo-native-api-smoke.sh` — proves API paths; does **not** close G1.

---

## Infra bring-up checklist (maintainer)

1. **DNS** — `demo.umbraculum.dev` → A/AAAA or CNAME to the host running Docker Compose (must reach **your** Umbraculum nginx, not a registrar parking page).
2. **TLS** — HTTPS at nginx (e.g. Let's Encrypt). Android EAS builds require HTTPS.
3. **Deploy** — On the demo host: `docker compose up -d` (api, web, nginx, postgres, gotenberg, redis). Default **`reference`** profile includes brewery; see [`platform-module-profile.md`](platform-module-profile.md). Mount [`infra/nginx/demo.conf`](../../infra/nginx/demo.conf) (or equivalent `server_name demo.umbraculum.dev`).
4. **Env** — Production-like env for API/web: `DATABASE_URL`, session secrets, `E2E_*` passwords if overriding defaults. Enable **gotenberg** + **redis** for PDF export smoke.
5. **Seed** — Ensure E2E/brewery seed has run (`docker compose` seed/migrate per [`DEVELOPMENT.md`](../../DEVELOPMENT.md)).
6. **Verify**
   ```bash
   curl -sS https://demo.umbraculum.dev/api/health
   # expect {"ok":true}
   ```
7. **Smoke web** — Log in at `https://demo.umbraculum.dev/en` with demo admin; run [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) steps 1–4.
8. **Smoke native** — Install EAS `preview` APK; follow [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5.1.
9. **Verify gate** — `./scripts/demo-host-verify.sh` exits 0; optional `BASE_URL=https://demo.umbraculum.dev ./scripts/demo-native-api-smoke.sh`.

---

## Reset policy

- Demo data may be **deleted and re-seeded** at any time for demos or CI parity.
- Do not store data on demo that you cannot afford to lose.
- Your **real operational brewery** (outside this repo) will use **`cloud.umbraculum.dev`** when that track ships—not demo.

---

## Related docs

- [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) — EAS build IDs and device smoke status
- [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5 — native demo scope and checklist
- [`ubuntu-touch-shell-strategy.md`](ubuntu-touch-shell-strategy.md) — UT webapp shell strategy
- [`packaging/ubuntu-touch/umbraculum-reference/README.md`](../../packaging/ubuntu-touch/umbraculum-reference/README.md) — reference Click package (demo origin default)
- [`NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md) §5 — EAS profiles and CI workflow
- [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) — future hosted product (not demo)
