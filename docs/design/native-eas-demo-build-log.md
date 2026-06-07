# Native EAS demo build log

**Tier:** Public  
**Status:** **G1 core closed 2026-06-03** — EAS `preview` APK + device §5.1 (rows 1–5) PASS on demo; optional row 6 (native PDF) **FAIL** — tracked [below](#known-gaps-address-later)  
**Started:** 2026-05-27  
**Last updated:** 2026-06-03 (device smoke + native PDF gap)  
**Scope:** July 2026 native EAS demo closure — `preview` APK → `https://demo.umbraculum.dev`

> [!NOTE]
> This log tracks the **demo-only** EAS loop. It does **not** start [`cloud.umbraculum.dev`](cloud-hosted-product-track.md).

---

## Where we are (resume here for G1)

| Track | State | What happens next |
|-------|--------|-------------------|
| **Repo / docs (this commit)** | **Done** | `eas.json` → demo URL; runbooks; surface doc §5.2; [`EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md) |
| **Pre-build gates (local)** | **Done** (2026-05-27) | Re-run before EAS if `packages/**` or `apps/native/**` changed |
| **Phase 0 — `demo.umbraculum.dev` live** | **Done** | Demo web + API in use for smoke (2026-06-03) |
| **Phase 1b/c — EAS project + `EXPO_TOKEN`** | **Done** | `@umbraculum/umbraculum-brewery`; `app.config.js` bakes demo URL into `expo.extra` |
| **Phase 3–4 — APK + device smoke** | **Core done** | Local `eas build --profile preview`; §5.1 rows 1–5 PASS; row 6 native PDF FAIL |
| **Gate G1** ([surface doc](canonical-native-platform-surface.md) §8) | **Core closed** | Optional native PDF deferred — [Known gaps](#known-gaps-address-later) |

**When you return:** work top-to-bottom in [Maintainer closure (required for G1)](#maintainer-closure-required-for-g1), then check §5.1 boxes in [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) and update this log.

---

## Source documents

- [`demo-host-runbook.md`](demo-host-runbook.md)
- [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5
- Plan: July 2026 native EAS demo closure (repo-local)

---

## Phase table

| Phase | Status | Deliverable | Verification |
|-------|--------|-------------|--------------|
| 0 — Demo host | **Done** (2026-06-03) | `demo.umbraculum.dev` live | `curl https://demo.umbraculum.dev/api/health` → `{"ok":true}` |
| 1 — EAS repo wiring | Shipped | `eas.json` `preview.env`, runbook, cloud stub | See commit on `master` |
| 1b — EAS project ID | **Done** (2026-06-03) | `eas init` + `projectId` in `app.json` / `app.config.js` | `@umbraculum/umbraculum-brewery` |
| 1c — GitHub secret | **Done** (2026-06-03) | `EXPO_TOKEN` on repo | Local `eas build` used; GHA optional when public |
| 2 — Pre-build gates | **Shipped** (2026-05-27) | dist check, native-deps, vitest | See [Pre-build gates](#pre-build-gates-maintainer--ci) |
| 3 — Android `preview` build | **Done** (2026-06-03) | Expo internal APK | Local `eas build --profile preview` (APK installed on device) |
| 4 — Device smoke | **Core done** (2026-06-03) | §5.1 rows 1–5 on physical Android | Row 6 native PDF FAIL — see [Known gaps](#known-gaps-address-later) |
| 5 — Docs sign-off | **Shipped** (repo) | Surface doc §5.2 URL, this log, runbook, cloud stub | G1 core closed 2026-06-03 |

---

## Repo changes (shipped)

| Artifact | Change |
|----------|--------|
| [`apps/native/eas.json`](../../apps/native/eas.json) | `preview.env`: `EXPO_PUBLIC_API_BASE_URL` / `MEDIA` → `https://demo.umbraculum.dev` |
| [`demo-host-runbook.md`](demo-host-runbook.md) | Demo policy, accounts, infra checklist |
| [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) | Future `cloud` track stub |
| [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §5 | Demo naming + distribution URL |
| [`NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md) §5 | Demo host + EAS |
| [`scripts/demo-host-verify.sh`](../../scripts/demo-host-verify.sh) | Exit 0 = demo API ready |
| [`scripts/demo-native-api-smoke.sh`](../../scripts/demo-native-api-smoke.sh) | API paths (login, recipes, webview-exchange) |
| [`infra/nginx/demo.conf`](../../infra/nginx/demo.conf) | `server_name demo.umbraculum.dev` for VPS |

---

## G1 resume attempt (2026-05-27)

| Step | Result |
|------|--------|
| `./scripts/demo-host-verify.sh` | **FAIL** — HTTPS timeout; HTTP returns registrar parking HTML |
| `./scripts/demo-native-api-smoke.sh` (local) | **PASS** — `BASE_URL=http://localhost:18080` (API parity only; not G1) |
| SSH `216.40.34.41:22` | **Timeout** — cannot deploy from agent environment |
| `eas whoami` | **Not logged in** — run `eas login` locally, then `eas init` per [`EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md) |
| Device §5.1 | **Not run** — requires EAS APK + physical Android |

**Your next commands (in order):**

```bash
# 1) After VPS + TLS + compose deploy:
./scripts/demo-host-verify.sh

# 2) Expo + EAS (on your machine):
cd apps/native && npx eas-cli login && npx eas-cli init
# commit projectId; add EXPO_TOKEN to GitHub; run native-eas-build workflow

# 3) On device: install APK; complete §5.1 table below
```

---

## Pre-build gates (maintainer / CI)

```bash
cd $REPO_ROOT
./scripts/check-packages-dist-up-to-date.sh
# native-deps parity (container — matches .github/workflows/native-deps.yml):
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim \
  bash -lc "npm ci --no-audit --no-fund && cd apps/native/brewery && npx expo install --check && npm run typecheck"
npm run test -w @umbraculum/native
```

Record last green run date here when executed: **2026-05-27** (agent): `check-packages-dist` OK; `expo install --check` + `apps/native` typecheck OK; `npm run test -w @umbraculum/native` OK. `curl https://demo.umbraculum.dev/api/health` — **unreachable** (DNS/host not live yet).

---

## EAS build (fill when run)

| Field | Value |
|-------|--------|
| Profile | `preview` |
| Platform | `android` |
| Expo build ID | _pending_ |
| APK URL | _pending_ |
| `EXPO_PUBLIC_API_BASE_URL` baked | `https://demo.umbraculum.dev` |

**Trigger:** GitHub Actions → `native-eas-build` → `platform=android`, `profile=preview` (requires `EXPO_TOKEN`) — **prefer GHA when the repo is public**; while private, use local `eas build` or expo.dev only during long free-tier queues (see [`EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md) § “Expo free tier”).

**Queue + quota note (2026-06-03):** Expo **Free** plan — **monthly** build allowance (dashboard: **15 Android** + **15 iOS** of **30** total; **1 concurrency**; EAS Update **1,000 MAUs** + **100 GiB** / month). Not unlimited; occasional demo builds are within policy. First `preview` Android build sat in **Free Tier Queue** (~1h+ *waiting for available worker*) while a private-repo GHA job polled *Waiting for build to complete* — expected. GHA workflow canceled; Expo build allowed to finish independently. See [`EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md) § “Expo free tier”.

---

## Device smoke (§5.1) — fill on device

| # | Check | Pass? | Notes |
|---|--------|-------|-------|
| 1 | Cold start | **Yes** | EAS `preview` APK, 2026-06-03 |
| 2 | Login (demo admin) | **Yes** | `e2e-admin@brewery.local` / demo password |
| 3 | Dashboard / health | **Yes** | API health `{ok:true}` on demo |
| 4 | Recipes → recipe → water hub | **Yes** | Via **Mashing and sparging** recipe |
| 5 | Inventory → Open on web | **Yes** | Opens `demo.umbraculum.dev/en/inventory` |
| 6 | Brew session PDF (optional) | **No (native)** | **PASS** [demo web (e2e session)](https://demo.umbraculum.dev/en/production-orders/brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe); **FAIL** native **Export work order (PDF)** — see [Known gaps](#known-gaps-address-later) |
| 7 | Yeast media | | Not run |

---

## Known gaps (address later)

### Native brew session PDF export (2026-06-03)

| Surface | Result |
|---------|--------|
| Demo web | **PASS** — e.g. [brewery-brew-session-e2e00000-…000bbe](https://demo.umbraculum.dev/en/production-orders/brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe) |
| Local web (`localhost:18080`) | **PASS** (same flow on dev stack) |
| EAS `preview` APK → `https://demo.umbraculum.dev` | **FAIL** — generic “export failed” alert |

**Implication:** Demo rendering / Gotenberg / MRP work-order templates are OK. The gap is **native-only**: async render job + artifact URL for `platform: "native"` + `Linking.openURL` (Bearer client), not demo VPS.

**Code path:** [`apps/native/src/modules/brewery/screens/BrewSessionDetailScreen.tsx`](../../apps/native/src/modules/brewery/screens/BrewSessionDetailScreen.tsx) → `runAsyncRenderJobExport` → [`packages/platform/api-client/src/platform/rendering.ts`](../../packages/platform/api-client/src/platform/rendering.ts).

**Scope:** Optional §5.1 row 6 — does not reopen G1 core closure. Fix deferred.

---

## Maintainer closure (required for G1)

Repo wiring for this plan is **shipped**. Gate **G1** in [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §8 **core closed 2026-06-03** after:

1. **Demo host live** — done.
2. **`eas init`** + `projectId` + `app.config.js` `extra` for demo API URL — done.
3. **`EXPO_TOKEN`** on GitHub — done; preview APK built locally (GHA optional when repo public).
4. **Device smoke** — §5.1 rows 1–5 PASS on physical Android (table above).

**Open follow-up:** [Native brew session PDF](#native-brew-session-pdf-export-2026-06-03) on device (optional row 6).

---

## Explicitly not claimed

- `cloud.umbraculum.dev` or production hosted SaaS
- iOS EAS build (follow-up)
- Play Store release
- Native MRP/CRP UI
