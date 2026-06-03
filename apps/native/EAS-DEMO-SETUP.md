# EAS demo setup (`preview` → `demo.umbraculum.dev`)

**Tier:** Public (module-local operator notes)  
**Status:** **Do when resuming G1** — repo already pins `preview.env` to demo; you still need live demo host + steps below.  
**See also:** [`docs/design/demo-host-runbook.md`](../../docs/design/demo-host-runbook.md), [`docs/design/native-eas-demo-build-log.md`](../../docs/design/native-eas-demo-build-log.md) §“Where we are”

---

## Prerequisites

1. **`https://demo.umbraculum.dev`** is live — from repo root: `./scripts/demo-host-verify.sh` must exit 0.
2. Expo account — `npx eas-cli login` (agent environments are usually **not** logged in).
3. GitHub repo secret **`EXPO_TOKEN`** (Settings → Secrets → Actions).

---

## One-time: link Expo project

From repo root:

```bash
cd "$REPO_ROOT/apps/native"
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

**Prefer GHA only when the repo is public.** While **umbraculum-dev** is private, a dispatched workflow allocates a GitHub-hosted runner for the **entire** `eas build` poll — including time spent in Expo’s queue — and that wall-clock time counts against the org’s **private-repo Actions minute pool**. For queued free-tier builds, run **`eas build` locally** (below) or watch the build on [expo.dev](https://expo.dev) without holding a GHA job open.

---

## Expo free tier: monthly quotas + queue (expected — not a failure)

Umbraculum uses Expo’s **Free** plan (`@umbraculum`). Builds are **not unlimited**. Limits are **per calendar month** (billing period starts the **first day of each month** — see [Expo billing FAQ](https://docs.expo.dev/billing/faq/) and [EAS Free plan limits](https://expo.dev/changelog/2023-08-01-eas-free-plan-limits)). Check live usage: [expo.dev account billing](https://expo.dev/accounts/umbraculum/settings/billing).

| Free-plan allowance (monthly) | Umbraculum expectation |
|------------------------------|------------------------|
| **30 EAS Build credits** total — **up to 15 Android** + **up to 15 iOS** (dashboard may also list **uploaded** builds separately) | **Occasional** demo `preview` APKs only — not continuous CI. A handful of Android builds per month is well within quota. |
| **1 build concurrency** | Only one cloud build runs at a time; a second submit **waits** (*waiting for concurrency*). |
| **EAS Update:** 1,000 **monthly** active users (MAUs) | Demo APK path does not rely on OTA updates for G1. |
| **EAS Update:** 100 GiB **monthly** global edge bandwidth | Same — not a current bottleneck. |
| **Lower-priority queue** | Start and finish can be **slow** (often **30–90+ minutes** in queue before compile). |

**Policy:** Slow queue + finite monthly builds are **acceptable** for the demo loop. We do **not** treat EAS as a fast CI gate or run cloud builds on every PR. Do **not** fail triage solely because a job ran a long time while Expo was still **Queued**.

| What you see | Meaning |
|--------------|---------|
| Expo status **Queued**, log *waiting for concurrency* / *waiting for available worker*, **Free Tier Queue** | Build is submitted; **no worker yet** (or concurrency slot busy). |
| GHA log **Waiting for build to complete.** | `eas` CLI polling until Expo reaches a terminal state. **Not** “Gradle is running” — queued builds show this too. |
| Expo **Waiting to start** vs GHA “waiting to complete” | Same build, different UI wording — **not** a desync. |

Check [expo.dev builds](https://expo.dev/accounts/umbraculum/projects/umbraculum-brewery/builds) for the real phase (queued → in progress → finished). Enable Expo **usage notifications** (80% / 100%) if you dispatch builds regularly.

**While the repo is private:** avoid leaving **native-eas-build** running during a long queue; cancel the workflow and let Expo continue, or use local `eas build`.

**When the repo is public:** manual **native-eas-build** is fine on standard `ubuntu-latest` (no minute billing for the wait — see [`DEVELOPMENT.md`](../../DEVELOPMENT.md)); the job may still sit on “Waiting for build to complete” until Expo assigns a worker.

Priority queue / paid Expo plans are optional operator upgrades, not required for G1.

---

## Metro config (SDK 54 monorepo)

[`metro.config.js`](metro.config.js) extends Expo via `getDefaultConfig` + `mergeConfig` (see [Work with monorepos](https://docs.expo.dev/guides/monorepos/)). EAS may still warn about monorepo `extraNodeModules`; answer **`n`** to continue unless the bundle fails.

---

## Local build (optional)

```bash
cd "$REPO_ROOT"
./scripts/build-packages-in-docker.sh
cd apps/native
npx eas-cli build --platform android --profile preview
```

---

## Troubleshooting: login `Network request failed` on device

If `https://demo.umbraculum.dev/api/health` works in the phone browser but the EAS APK login shows **Network request failed**, the build likely fell back to the dev LAN default in `apiBaseUrl.ts` (`http://192.168.…:18080`) because `EXPO_PUBLIC_API_BASE_URL` was not in `expo.extra` at runtime.

**Fix (repo):** [`app.config.js`](app.config.js) mirrors `eas.json` `env` into `extra` at EAS build time. **Operator:** run a new `preview` Android build and reinstall the APK.

---

## Device smoke

Install the APK on a physical Android device and complete [`canonical-native-platform-surface.md`](../../docs/design/canonical-native-platform-surface.md) §5.1. Record results in [`native-eas-demo-build-log.md`](../../docs/design/native-eas-demo-build-log.md).
