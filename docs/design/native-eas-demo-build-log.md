# Native EAS demo build log

**Tier:** Public  
**Status:** **Blocked on maintainer — G1 open** (demo DNS/VPS + `eas login` + physical device; see [G1 resume attempt](#g1-resume-attempt-2026-05-27))  
**Started:** 2026-05-27  
**Last updated:** 2026-05-27 (G1 resume attempt)  
**Scope:** July 2026 native EAS demo closure — `preview` APK → `https://demo.umbraculum.dev`

> [!NOTE]
> This log tracks the **demo-only** EAS loop. It does **not** start [`cloud.umbraculum.dev`](cloud-hosted-product-track.md).

---

## Where we are (resume here for G1)

| Track | State | What happens next |
|-------|--------|-------------------|
| **Repo / docs (this commit)** | **Done** | `eas.json` → demo URL; runbooks; surface doc §5.2; [`EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md) |
| **Pre-build gates (local)** | **Done** (2026-05-27) | Re-run before EAS if `packages/**` or `apps/native/**` changed |
| **Phase 0 — `demo.umbraculum.dev` live** | **Blocked** | `./scripts/demo-host-verify.sh` fails — see runbook §Current status |
| **Phase 1b/c — EAS project + `EXPO_TOKEN`** | **Blocked** | `eas whoami` → not logged in; `EXPO_TOKEN` not in agent env |
| **Phase 3–4 — APK + device smoke** | **Not started** | You: install APK, fill §5.1 table below |
| **Gate G1** ([surface doc](canonical-native-platform-surface.md) §8) | **Open** | Closes when phases 0, 1b/c, 3–4 pass |

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
| 0 — Demo host | Pending | `demo.umbraculum.dev` live | `curl https://demo.umbraculum.dev/api/health` → `{"ok":true}` |
| 1 — EAS repo wiring | Shipped | `eas.json` `preview.env`, runbook, cloud stub | See commit on `master` |
| 1b — EAS project ID | Pending | `eas init` + real `projectId` in `app.json` | Replace `REPLACE_WITH_EAS_PROJECT_ID` |
| 1c — GitHub secret | Pending | `EXPO_TOKEN` on repo | Manual dispatch `native-eas-build` succeeds |
| 2 — Pre-build gates | **Shipped** (2026-05-27) | dist check, native-deps, vitest | See [Pre-build gates](#pre-build-gates-maintainer--ci); demo curl pending Phase 0 |
| 3 — Android `preview` build | Pending | Expo internal APK URL | Workflow or `eas build` |
| 4 — Device smoke | Pending | §5.1 checklist on physical device | Record in table below |
| 5 — Docs sign-off | **Shipped** (repo) | Surface doc §5.2 URL, this log, runbook, cloud stub | G1 closes when Phase 3–4 pass |

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
cd REPO_ROOT/umbraculum-dev
./scripts/check-packages-dist-up-to-date.sh
# native-deps parity (container):
docker run --rm -v "$PWD:/repo" -w /repo/apps/native node:20-slim \
  bash -lc "npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck"
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

**Trigger:** GitHub Actions → `native-eas-build` → `platform=android`, `profile=preview` (requires `EXPO_TOKEN`).

---

## Device smoke (§5.1) — fill on device

| # | Check | Pass? | Notes |
|---|--------|-------|-------|
| 1 | Cold start | | |
| 2 | Login (demo admin) | | |
| 3 | Dashboard / health | | |
| 4 | Recipes → recipe → water hub | | |
| 5 | Inventory → Open on web | | |
| 6 | Brew session PDF (optional) | | |
| 7 | Yeast media | | |

---

## Maintainer closure (required for G1)

Repo wiring for this plan is **shipped**. Gate **G1** in [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) §8 closes only after:

1. **Demo host live** — follow [`demo-host-runbook.md`](demo-host-runbook.md) §Infra bring-up.
2. **`eas init`** + commit `projectId` — [`apps/native/EAS-DEMO-SETUP.md`](../../apps/native/EAS-DEMO-SETUP.md).
3. **`EXPO_TOKEN`** on GitHub + successful **native-eas-build** workflow run.
4. **Device smoke** — fill §5.1 table above on a physical Android device.

---

## Explicitly not claimed

- `cloud.umbraculum.dev` or production hosted SaaS
- iOS EAS build (follow-up)
- Play Store release
- Native MRP/CRP UI
