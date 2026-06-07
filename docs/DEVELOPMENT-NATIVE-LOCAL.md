# Native local development (Expo)

> **Path convention:** `$REPO_ROOT` is your monorepo clone (see [`DEVELOPMENT.md`](../DEVELOPMENT.md)). Example: `export REPO_ROOT=~/src/umbraculum-dev`.

For **strategy** (risk posture, Expo Go vs long-term dev client, Mac-free constraints, optional CI philosophy): see `docs/NATIVE-STRATEGY-AND-CI.md`. **Ubuntu Touch** is not covered here — it uses the web app in a Lomiri Click Morph webapp wrapper ([`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md)). The same dependency check runs in CI: `.github/workflows/native-deps.yml`.

## Prerequisites

- Docker / Docker Compose
- iOS simulator or Android emulator (or a physical device)

This repo prefers running Node/npm in containers. If you do run Expo tooling on the host, keep Node aligned with repo `engines` and expect drift.

## Native baseline (Expo SDK 54 + Expo Go)

These pinned versions are an **ABI requirement** of the Expo Go binary on the device. Any drift produces a black/blank screen on first render (see "Troubleshooting" below). Keep `apps/native/package.json` matching:

| Package | Pinned version | Why |
| --- | --- | --- |
| `expo` | `~54.0.34` | SDK 54 |
| `react` | `19.1.0` (exact) | React Native renderer bundled by RN 0.81.5 requires exact match |
| `react-dom` | `19.1.0` (exact) | Metro web target preview at `:8081/` requires `react-dom` to match `react` exactly |
| `react-native` | `0.81.5` | SDK 54 default |
| `react-native-svg` | `15.12.1` (exact) | Expo Go ships this native module at this exact version |

> **`apps/web` is on a different React minor (`19.2.4`)** while we target Expo Go. This is an intentional, temporary divergence from the "keep React aligned between web and native" guideline in `DEVELOPMENT-LOCAL.md`. See "Long-term: aligning web + native React" below for the roadmap to remove this divergence.

Verify at any time:

```bash
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"
```

Exit 0 with "Dependencies are up to date" means you're good. Non-zero means at least one package will misbehave on Expo Go.

## UI system (Tamagui, shared with web)

- Native UI is built with **Tamagui** system-wide.
- The shared cross-platform design system lives in `packages/platform/ui` (`@umbraculum/ui`) and is used by **both**:
  - `apps/native` (React Native / Expo)
  - `apps/web` (Next.js)
- Tamagui config must be imported via platform-safe entrypoints:
  - Native: `@umbraculum/ui/tamagui-config-native`
  - Web: `@umbraculum/ui/tamagui-config-web`
- Styling preference:
  - Prefer Tamagui components + props/tokens over React Native `style={{ ... }}` so web/native stay visually consistent.

## 1) Build shared packages (required after changes under `packages/**`)

```bash
cd $REPO_ROOT
./scripts/build-packages-in-docker.sh
```

## 2) Start API + web (serves `/api/**` and `/media/**`)

```bash
cd $REPO_ROOT
docker compose up --build
```

Default local entrypoint is nginx:

- `http://localhost:${NGINX_HTTP_PORT:-18080}`

## 3) Ensure web media is synced (hashed filenames)

The web app serves shared assets from `apps/web/public/media/**`. Sync is normally run by `apps/web` lifecycle scripts, but you can run it explicitly:

```bash
cd $REPO_ROOT
docker run --rm -v "$REPO_ROOT:/repo" -w /repo/apps/web node:20-slim bash -lc "node scripts/sync-media.mjs"
```

## 4) Start Expo (containerized)

### 4.0) Start Metro (recommended: helper script)

Use `./scripts/start-metro-dev.sh`. It auto-detects the laptop's outbound LAN IP, removes any stale `brewery-metro` container, and starts Metro in Docker with the right `REACT_NATIVE_PACKAGER_HOSTNAME`. The app then auto-derives its API base URL from Metro's bundle host at runtime — so you no longer edit `apps/native/app.json` when your IP drifts. See `docs/NATIVE-STRATEGY-AND-CI.md` §5.1 for the rationale.

```bash
cd $REPO_ROOT
./scripts/start-metro-dev.sh
docker logs -f brewery-metro    # follow Metro; Ctrl+C detaches the log tail (container keeps running)
```

The script prints the detected IP, the `exp://<LAN_IP>:8081` URL for manual entry in Expo Go, and the local Metro web preview at `http://localhost:8081/`. Stop it with `docker stop brewery-metro` (`--rm` removes the container automatically).

Override the auto-detection when needed (e.g. force Ethernet over WiFi, or pin a Tailscale IP):

```bash
LAN_IP=192.168.1.116 ./scripts/start-metro-dev.sh
```

### 4.1) Verify the API is reachable on the detected IP (optional, fast)

```bash
curl -sS "http://$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}'):${NGINX_HTTP_PORT:-18080}/api/health"
# Expect: {"ok":true}
```

If this fails, fix the stack (`docker compose up -d`) before scanning the QR — see `DEVELOPMENT-LOCAL.md` → "Troubleshooting: 502 Bad Gateway on login / API calls".

### 4.2) Run Metro manually (without the helper)

Only needed if you can't run the helper script (different OS, Docker socket issue, etc.). Use this as the explicit form of what the helper does:

```bash
cd $REPO_ROOT
LAN_IP="$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}')"
docker rm -f brewery-metro 2>/dev/null || true
docker run -d --rm --name brewery-metro \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME="${LAN_IP}" \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund && ./node_modules/.bin/expo start --lan -c"
```

- `--rm` removes the container on stop, so `docker stop brewery-metro` is all you need; otherwise `docker run --name brewery-metro` next time will fail with `Conflict. The container name "/brewery-metro" is already in use`. Recover with `docker rm brewery-metro`.
- No QR is printed to logs in detached mode. Enter `exp://${LAN_IP}:8081` manually in Expo Go (Settings → "Enter URL manually"), or tap your previous project in Expo Go's recents.

### 4.3) Pinning a specific URL (override the auto-derive)

The auto-derive in `apps/native/src/auth/apiBaseUrl.ts` is bypassed when **any** of these is set, in this priority order:

1. `apps/native/app.json` → `expo.extra.EXPO_PUBLIC_API_BASE_URL` (per-config pin; checked in to the repo for EAS staging/production builds via `app.config.ts` / `eas.json`).
2. `process.env.EXPO_PUBLIC_API_BASE_URL` (per-session env override; used for tunnel mode, integration tests, ad-hoc pinning).
3. Auto-derive from Metro `hostUri` (the new default; works on any LAN).
4. `DEFAULT_API_BASE_URL` in `apiBaseUrl.ts` (last resort; only hit by real builds without Metro and no override).

The same logic applies to `EXPO_PUBLIC_MEDIA_BASE_URL` via `apps/native/src/media/mediaBaseUrl.ts`, which delegates to `getApiBaseUrl()` when no explicit media URL is set.

**When to use overrides:**

- **Tunnel mode** (`expo start --tunnel`): `hostUri` becomes the ngrok URL, which won't route to your laptop's API. Set `EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:18080` (or a public URL) in your shell before starting Metro.
- **EAS builds**: configure `EXPO_PUBLIC_API_BASE_URL` in `eas.json` per profile so released binaries point at the right backend. The **`preview`** profile is wired to **`https://demo.umbraculum.dev`** (demonstration host only — see [`docs/design/demo-host-runbook.md`](design/demo-host-runbook.md)). Future production hosted product will use a separate profile/host ([`docs/design/cloud-hosted-product-track.md`](design/cloud-hosted-product-track.md)).

### Environment variables (native)

`apps/native` reads:

- `EXPO_PUBLIC_API_BASE_URL` (used by native auth + API calls; see `apps/native/src/auth/apiBaseUrl.ts`)
- `EXPO_PUBLIC_MEDIA_BASE_URL` (used by `RemoteImage`; see `apps/native/src/media/mediaBaseUrl.ts`)

For local dev on Expo Go you typically **leave both unset** — `apiBaseUrl.ts` auto-derives the host from Metro's `hostUri` (set by the helper script via `REACT_NATIVE_PACKAGER_HOSTNAME`), and `mediaBaseUrl.ts` delegates to it. See §4.3 for when to override.

Platform-specific notes:

- **Android emulator** without overrides: `apiBaseUrl.ts` rewrites `localhost` / `127.0.0.1` / `0.0.0.0` to `10.0.2.2` automatically (see `maybeRewriteForAndroidEmulator` in that file).
- **iOS simulator**: auto-derive produces `http://localhost:18080` from Metro's hostUri — usually correct without overrides.
- **Physical device**: auto-derive produces `http://<your-laptop-LAN-IP>:18080` from Metro's hostUri — also correct as long as the helper detected the right interface. Override with `LAN_IP=...` on the helper if it picked the wrong one.

## Go-live checklist (native)

- **Set production base URLs at build time**:
  - `EXPO_PUBLIC_API_BASE_URL=https://<your-domain>` (nginx should route `/api/**`)
  - `EXPO_PUBLIC_MEDIA_BASE_URL=https://<your-domain>` (nginx should serve `/media/**`)
- **Verify media**:
  - Test a known asset in a device browser: `https://<your-domain>/media/yeast/dilution-1-100.<hash>.png`
  - In-app: open Yeast page → expand “Manual cell count methodology” → both images should render.
- **Tabs icons**:
  - Tab icons are defined in `apps/native/src/navigation/AppNavigator.tsx`.
  - If you want non-emoji icons for production, add an icon library (e.g. `@expo/vector-icons`) and update `tabBarIcon`.

## Device testing (Expo Go)

This is the validated end-to-end smoke flow once `./scripts/start-metro-dev.sh` is up. Each step is a quick gate; if a step fails, fix it before moving on (the cause is almost always upstream of the next step).

### 1. Pre-flight from the phone's browser (catches network problems before Expo Go)

The helper script printed a `LAN IP:` line and a `Metro web preview:` URL. On the phone's browser (same Wi-Fi as the laptop), open:

```
http://<LAN_IP>:8081/
```

Expect Metro's "React Native" preview page. If this fails, no Expo Go change will help — fix the network first. Most common causes:

- Phone is on a different SSID or VLAN than the laptop.
- Wi-Fi access point has **client isolation** enabled (typical on guest networks; switch to your main network or use a hotspot).
- Laptop firewall is blocking inbound on `:8081` — on Linux check `sudo ufw status` / `firewalld`.
- Wrong interface detected. Restart the helper with `LAN_IP=<other>` (e.g. swap Ethernet ↔ Wi-Fi).

### 2. Connect Expo Go (three options, in order of speed)

Metro is running **detached** (no TTY) by default, so its logs do not print a QR. Pick one of these to connect:

- **Manual URL (easiest, no QR needed):**
  - Open Expo Go.
  - Tap **"Enter URL manually"** on the Expo Go home screen (below the projects list).
  - Enter: `exp://<LAN_IP>:8081`.
  - Tap **Connect**.
- **Recently in development:** if you've connected to this project from this Expo Go before, it appears on the Expo Go home screen — tap it.
- **QR code:** restart Metro in interactive mode (`docker run --rm -it … expo start --lan -c`, see §4.2 "Run Metro manually") and Metro will print the QR in the terminal.

### 3. First-load expectations

- **Bundling progress bar** in Expo Go for ~30–90s on cold cache; faster on subsequent loads.
- **No red error overlay** and **no blue/black "Incompatible React versions" screen** — that would mean the React / `react-native-renderer` ABI is out of sync (see Troubleshooting → "Incompatible React versions").
- **No "Failed to download remote update"** blue screen — that would mean Step 1 actually didn't pass (phone can't reach the laptop).
- **App opens to its initial screen** (login page for unauthenticated users).
- The app's API base URL is auto-derived to `http://<LAN_IP>:18080` from Metro's hostUri — no `app.json` edit was needed. See `docs/NATIVE-STRATEGY-AND-CI.md` §5.1.

### 4. Watch Metro / device logs in a second terminal

```bash
docker logs -f brewery-metro
```

Every bundle request, fast-refresh event, and runtime `console.*` call from the device shows here. **Keep this open while testing** — if something misbehaves on the device, the cause is almost always visible here in real time.

For deeper device-side debugging, shake the phone (or Cmd-D / Cmd-M on emulators) for Expo Go's dev menu (toggle dev menu, reload, debug remote JS, performance monitor).

### 5. Platform variants

- **Android device (covered above):** Expo Go from Play Store, same Wi-Fi, Step 2 URL or QR.
- **Android emulator (Android Studio):** open Expo Go inside the emulator, use Step 2 URL or QR. The helper sets `REACT_NATIVE_PACKAGER_HOSTNAME` to the LAN IP; the emulator can reach it because it shares the host network.
- **iOS device:** Expo Go from App Store, same Wi-Fi, Step 2 URL or QR.
- **iOS simulator:** requires macOS + Xcode (cannot run the iOS Simulator on Linux). Not part of the Mac-free flow — see `docs/NATIVE-STRATEGY-AND-CI.md`.

## Quick validation checklist

- **i18n**: open the app and change language; locale should switch and persist across reloads.
- **media**: the sample image on the dashboard should load when `EXPO_PUBLIC_MEDIA_BASE_URL` is set correctly.
- **offline behavior**:
  - load the screen once online (warm cache)
  - disable network
  - reload: image should show if cached; otherwise it should show the placeholder.

## Troubleshooting (native + Expo Go)

These are recurring traps. Walk through them in order.

### `java.io.IOException: Failed to download remote update` (Android Expo Go)

Cause: Expo Go is fetching the JS bundle from a host it cannot reach (almost always a stale `REACT_NATIVE_PACKAGER_HOSTNAME` — typically because the laptop joined a new network after Metro was started, or the helper script picked an interface the phone can't reach).

Fix:

1. Stop Metro: `docker stop brewery-metro`.
2. Restart with the helper, which re-detects the current LAN IP: `./scripts/start-metro-dev.sh`. If the auto-detected IP is on the wrong interface for your phone, override it: `LAN_IP=192.168.x.y ./scripts/start-metro-dev.sh`.
3. **Rescan the QR** in Expo Go (do not reload the previous session — it has the stale bundle URL cached).
4. Sanity check from the **phone's browser**: `http://<LAN_IP>:8081/` should load Metro's web preview. If it doesn't, the issue is network-level (Wi-Fi mismatch, client/AP isolation, firewall). Try `expo start --tunnel` as a fallback while you diagnose, but remember to also set `EXPO_PUBLIC_API_BASE_URL` to a reachable URL — the auto-derive intentionally skips tunnel `hostUri`s (see §4.3).

### `Incompatible React versions: react 19.x.x vs react-native-renderer 19.y.y` (Expo Go black/blank screen after bundle loads)

Cause: `react-native` ships a renderer that requires an **exact** React version match. SDK 54's Expo Go binary expects:

- `react` `19.1.0`
- `react-native-svg` `15.12.1`
- `expo` `~54.0.34`

If `apps/native/package.json` drifts above those (e.g. because `apps/web` pinned a newer React and someone aligned native to match), the bundle compiles fine but crashes on the first native commit with this exact error.

Fix:

```bash
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --fix"
```

Then restart Metro with `-c` and **rescan the QR**.

> Trade-off vs. the "keep React aligned between web and native" rule in `DEVELOPMENT-LOCAL.md`:
> Expo Go is a hard external ABI constraint. While you target Expo Go for development, `apps/native` must match Expo Go's bundled React version, even if `apps/web` is one minor ahead. Permanent alignment requires either upgrading Expo SDK to one that ships your target React, or moving native off Expo Go onto a custom dev client (EAS Build or local `expo prebuild` + dev client) — both are larger architectural changes. Track the divergence in your dev notes and revisit when Expo SDK bumps.

### `Incompatible React versions: react 19.1.0 vs react-dom 19.2.4` (Metro web preview at `:8081/` is blank)

Cause: when the native bundle is compiled in **web target** (visiting `http://<LAN_IP>:8081/` in a browser), it pulls in `react-dom`. `react-dom` is not used by the device build, so `apps/native/package.json` historically didn't pin it — npm workspace hoisting then resolves `react-dom` from the **monorepo root** (typically the version `apps/web` pinned). When `apps/native` is on an older React (because Expo Go forced the downgrade), root's `react-dom` is newer, and the browser crashes on this exact-match check.

Fix: pin `react-dom` in `apps/native/package.json` to **exactly** the same version as `react`:

```jsonc
// apps/native/package.json → "dependencies"
"react": "19.1.0",
"react-dom": "19.1.0",
```

Then reinstall (inside a container to keep host-side Node out of the way) and restart Metro with `-c`:

```bash
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "npm install"
```

> Anytime `react` in `apps/native` is changed, `react-dom` must move with it.

### `Cannot find module 'esbuild'` (api container) → `502 Bad Gateway` on `/api/*`

This is the api container's `tsx` watcher restarting and discovering that `services/api/node_modules` is missing transitive deps. Fix:

```bash
docker compose exec -T api npm install
docker compose exec -T api npx prisma generate    # if Prisma client errors
docker compose restart api
curl -sS http://localhost:${NGINX_HTTP_PORT:-18080}/api/health   # expect {"ok":true}
```

The native blue screen can also be caused by this (API down → unhandled JS exception → blue screen), so fix the API first before deeper native debugging.

### Native package compatibility check

Whenever Metro logs version warnings on startup, do not ignore them on physical devices — Expo Go is an ABI gate. Run:

```bash
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"
```

A non-zero exit means at least one package will fail at runtime on Expo Go.

### `apps/native` typecheck fails with `Property 'X' does not exist on type 'EditorGristRow'` (or similar `@umbraculum/brewery-beerjson` type)

Symptom: a fresh `npm run typecheck` in `apps/native` (or a red `native-deps.yml` PR check) complaining about a property that **clearly exists** in `packages/verticals/brewery/beerjson/src/index.ts`. The dist on disk (and committed to git) is older than the source.

Root cause: `packages/verticals/brewery/beerjson/dist/*` is consumed via the workspace symlink, and tsup builds happen only when the `build:packages` script runs. Until 2026-05, the script omitted `@umbraculum/brewery-beerjson`, so dist could drift silently. The script now (re)builds beerjson before `@umbraculum/brewery-recipes-ui` — but if someone bypasses the script, the dist still goes stale.

Fix:

```bash
# Option A — fast check: rebuilds all packages and fails if any dist diffs
./scripts/check-packages-dist-up-to-date.sh
# If it errors, the diff IS your fix — `git status` will show packages/*/dist
# changes you need to stage and commit.

# Option B — explicit rebuild + apps/native re-typecheck (use when you want to
# see the apps/native error go away yourself):
./scripts/build-packages-in-docker.sh
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native node:20-slim \
  bash -lc "npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck"
# exit 0 means dist drift is gone
```

Then commit the regenerated `packages/verticals/brewery/beerjson/dist/*` (and any other dist that changed as a result of the rebuild) alongside the source change.

See `DEVELOPMENT-LOCAL.md` → "Shared packages build (native-ready)" for the drift-reproduction recipe and CI guard details.

### `npm run typecheck` passes locally but the `native-deps` GitHub Action fails on the same commit

Symptom: you ran the CI-equivalent docker command locally (`npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck`), it returned exit 0, you pushed, and the workflow turned red on a TypeScript error that the local run never reported.

Root cause: a bind-mounted `apps/native/node_modules` (or hoisted root `node_modules`) from a prior install can resolve a *different* `@types/*` version than a clean CI install does. The most common offender is `URL` typings — local `@types/node` may declare `URL.hostname` as writable, while a fresh CI install resolves a strict version where it's read-only. Other `lib.dom`-shaped APIs can drift the same way.

Fix when triaging:

```bash
# Reproduce CI's clean install locally — this exposes the same @types resolution CI sees.
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native node:20-slim \
  bash -lc "rm -rf node_modules && npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck"
```

If this reproduces, fix the code so it doesn't depend on the lenient typing (e.g., for `URL`: rebuild the URL string from `u.protocol` + `u.hostname` + `u.port` + `u.pathname` + `u.search` + `u.hash` instead of assigning to `u.hostname = ...`). See `apps/native/src/auth/apiBaseUrl.ts` for the canonical example committed for exactly this reason. If it doesn't reproduce, the divergence is probably elsewhere (Node minor version, lockfile drift) — check the workflow logs for the exact npm version and tsc version.

### `error: unable to unlink old 'packages/.../dist/...': Permission denied` after running the build script

This should no longer happen on a current checkout: `scripts/build-packages-in-docker.sh` now appends a `chown -R $HOST_UID:$HOST_GID /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json` step (host uid/gid passed in as env vars; runs unconditionally so a failed build never leaves a partial root-owned tree).

If you still hit it — typically because an older `docker run` (or an older copy of the script) wrote files as root before the fix landed — the symptom is that any of these git operations fail: `git stash pop`, `git checkout <branch>`, `git restore <file>`, `git rebase …`. The manual recovery is:

```bash
docker run --rm -v "$PWD:/repo" node:20-slim \
  chown -R "$(id -u):$(id -g)" /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json
```

If `git stash pop` then complains `Your local changes to ... would be overwritten by merge` — that means the working tree has *also* modified the same dist files (e.g. a leftover from an interrupted rebuild). Decide whether the working-tree dist or the stash dist is correct, then either `git restore packages/*/dist/*` (to keep stash) or `git stash drop` (to keep working tree) and retry.

See also `DEVELOPMENT-LOCAL.md` → "Shared packages build (native-ready)" → "Container ownership (now self-resolving from the script)".

### Quick triage order (when "something is wrong with native")

Walk through these in this exact order before deep-diving:

1. **API up?** `curl -sS http://localhost:${NGINX_HTTP_PORT:-18080}/api/health` → `{"ok":true}`. If 502, see esbuild/502 section above. Many native crashes are downstream of a dead API.
2. **Metro running on the right IP?** `docker ps --filter name=brewery-metro` should show it Up. `docker logs --tail=20 brewery-metro` should mention the LAN IP. If the IP looks wrong for your current network, restart it: `docker stop brewery-metro && ./scripts/start-metro-dev.sh`.
3. **Phone reaches host?** From the **phone's browser**, open `http://<LAN_IP>:8081/` (the IP printed by the helper script). If that fails, no Expo Go change will help — fix the network first (Wi-Fi mismatch, AP isolation, firewall).
4. **Versions aligned?** Run `expo install --check`. If it complains, run `expo install --fix` and (if `react` moved) ensure `react-dom` was bumped to the same exact version.
5. **Shared packages dist fresh?** If you (or someone) just edited `packages/verticals/brewery/beerjson/src/` (or any other shared package source) and `apps/native` typecheck fails on a property that exists in source, run `./scripts/build-packages-in-docker.sh` — see "beerjson dist drift" entry above.
6. **Bundle cache?** Restart Metro with `-c` and rescan the QR (or re-enter `exp://<LAN_IP>:8081`).
7. **Read the device error log.** On the blue "Something went wrong" screen, tap **View error log** — `java.io.IOException: Failed to download remote update` means step 2/3; `Incompatible React versions` means step 4.

## Long-term: aligning web + native React (planning, not yet executed)

Today `apps/web` runs React `19.2.4` and `apps/native` runs `19.1.0` because Expo Go's bundled native modules dictate the React version on the device. This divergence is **acceptable as long as we depend on Expo Go**. Removing it permanently is a deliberate architectural step that should be planned, not a quick "let's bump packages" change.

The two viable paths and what each entails (high level — fuller analysis lives in `docs/REACT-NATIVE-KICKOFF-READINESS.md` if we expand it):

1. **Move native off Expo Go onto a custom dev client** (EAS Build or local `expo prebuild` + dev client). Removes the Expo Go ABI constraint entirely; native then picks its own native module versions. Cost: build infra (EAS account or local Android/iOS toolchains), longer first-run, app store accounts for distribution to real testers, plus a more involved local dev story than scan-a-QR.
2. **Upgrade Expo SDK** to a version whose bundled React matches what `apps/web` targets. Lower-cost than (1) but coupled to Expo's release cadence; check the SDK release notes for the React version it ships, and budget a day for upgrade-related breakages (`expo-secure-store`, `expo-image`, `react-native` minor, Tamagui native peer deps, `victory-native`, `react-native-svg`).

Until one of those is done, treat the divergence as **known tech debt**:

- Watch CI/dev tooling that compares versions across the monorepo and either tolerate or assert the expected gap on purpose.
- Pin both `react` and `react-dom` in `apps/native` to the exact version Expo Go expects (currently `19.1.0`). Don't let `react-dom` resolve from root hoisting (see troubleshooting above).
- Whenever you bump `apps/web` React, do not automatically bump `apps/native` — wait until Expo SDK supports the new version.

## Appendix: operator quick reference

```bash
# start Metro (auto-detects LAN IP; override with LAN_IP=... if needed)
./scripts/start-metro-dev.sh
docker logs -f brewery-metro
docker stop brewery-metro     # --rm removes the container automatically

# inspect current LAN IP (debug only — the helper already does this)
ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}'

# verify versions in apps/native
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"

# realign apps/native versions to SDK 54 expectations
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --fix"

# bring api back from a 502 (esbuild missing / Prisma stale)
docker compose exec -T api npm install
docker compose exec -T api npx prisma generate
docker compose restart api
curl -sS http://localhost:${NGINX_HTTP_PORT:-18080}/api/health
```

