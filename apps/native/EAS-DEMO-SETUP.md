# EAS demo setup (`preview` → `demo.umbraculum.dev`)

**Tier:** Public (module-local operator notes)  
**Status:** **Do when resuming G1** — repo already pins `preview.env` to demo; you still need live demo host + steps below.  
**See also:** [`docs/design/demo-host-runbook.md`](../../docs/design/demo-host-runbook.md), [`docs/design/native-eas-demo-build-log.md`](../../docs/design/native-eas-demo-build-log.md) §“Where we are”

---

## Prerequisites

1. **`https://demo.umbraculum.dev`** is live (`curl …/api/health` → `{"ok":true}`).
2. Expo account with access to the Umbraculum Expo project.

---

## One-time: link Expo project

From repo root:

```bash
cd REPO_ROOT/umbraculum-dev/apps/native
npx eas-cli login
npx eas-cli init
```

Commit the real `expo.extra.eas.projectId` written to `app.json` (replace `REPLACE_WITH_EAS_PROJECT_ID`).

---

## GitHub Actions builds

1. Create an Expo access token (Expo dashboard → Access tokens).
2. Add repository secret **`EXPO_TOKEN`** in GitHub.
3. Run workflow **native-eas-build** → `platform=android`, `profile=preview`.

The workflow uses `eas.json` `preview.env` (`EXPO_PUBLIC_API_BASE_URL=https://demo.umbraculum.dev`).

---

## Local build (optional)

```bash
cd REPO_ROOT/umbraculum-dev
./scripts/build-packages-in-docker.sh
cd apps/native
npx eas-cli build --platform android --profile preview
```

---

## Device smoke

Install the APK on a physical Android device and complete [`canonical-native-platform-surface.md`](../../docs/design/canonical-native-platform-surface.md) §5.1. Record results in [`native-eas-demo-build-log.md`](../../docs/design/native-eas-demo-build-log.md).
