# Native local development (Expo)

Repo root (canonical): `/home/rf/dkprojects/rfapps/brewery-app`

For **strategy** (risk posture, Expo Go vs long-term dev client, Mac-free constraints, optional CI philosophy): see `docs/NATIVE-STRATEGY-AND-CI.md`.

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
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"
```

Exit 0 with "Dependencies are up to date" means you're good. Non-zero means at least one package will misbehave on Expo Go.

## UI system (Tamagui, shared with web)

- Native UI is built with **Tamagui** system-wide.
- The shared cross-platform design system lives in `packages/ui` (`@brewery/ui`) and is used by **both**:
  - `apps/native` (React Native / Expo)
  - `apps/web` (Next.js)
- Tamagui config must be imported via platform-safe entrypoints:
  - Native: `@brewery/ui/tamagui-config-native`
  - Web: `@brewery/ui/tamagui-config-web`
- Styling preference:
  - Prefer Tamagui components + props/tokens over React Native `style={{ ... }}` so web/native stay visually consistent.

## 1) Build shared packages (required after changes under `packages/**`)

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
./scripts/build-packages-in-docker.sh
```

## 2) Start API + web (serves `/api/**` and `/media/**`)

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
docker compose up --build
```

Default local entrypoint is nginx:

- `http://localhost:${NGINX_HTTP_PORT:-18080}`

## 3) Ensure web media is synced (hashed filenames)

The web app serves shared assets from `apps/web/public/media/**`. Sync is normally run by `apps/web` lifecycle scripts, but you can run it explicitly:

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
docker run --rm -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" -w /repo/apps/web node:20-slim bash -lc "node scripts/sync-media.mjs"
```

## 4) Start Expo (containerized)

### 4.0) MANDATORY pre-flight: pick your current LAN IP

Your host's LAN IP **changes over time** (DHCP lease, switching Wi-Fi vs Ethernet, VPN). Hard-coding an old IP is the #1 cause of Expo Go failing with `java.io.IOException: Failed to download remote update`. Re-check every session:

```bash
ip -4 addr show | awk '/inet /{print $NF, $2}' | grep -v '127.0.0.1'
```

Pick the interface on the same subnet as your phone (usually Wi-Fi, e.g. `wlo1 → 192.168.1.115/24`). That value is your **`<LAN_IP>`** for the rest of this section.

Then update **both** places that hard-code an IP, replacing any stale value with your current `<LAN_IP>`:

- `apps/native/app.json` → `extra.EXPO_PUBLIC_API_BASE_URL` and `extra.EXPO_PUBLIC_MEDIA_BASE_URL` (must be `http://<LAN_IP>:<NGINX_HTTP_PORT>`).
- The `REACT_NATIVE_PACKAGER_HOSTNAME` env var passed to `expo start` (used by Metro and embedded into the QR/`exp://` URL).
- (Optional, fallback only) `apps/native/src/auth/apiBaseUrl.ts` → `DEFAULT_API_BASE_URL`. This is only used when `app.json` `extra` is empty.

Verify the IP responds from the host **before scanning the QR**:

```bash
curl -sS -o /dev/null -w "HTTP %{http_code}\n" "http://<LAN_IP>:8081/"   # expect 200 once Metro is up
curl -sS -o /dev/null -w "HTTP %{http_code}\n" "http://<LAN_IP>:${NGINX_HTTP_PORT:-18080}/en/login"  # expect 200
```

If `curl` returns `No route to host` or `connection refused` from the host itself, the IP is wrong (or the port isn't bound) — do **not** start Expo until this passes.

### 4.1) Run Metro (interactive — recommended)

Foreground + TTY: keeps the QR visible in the terminal and gives you the interactive keys (`r` reload, `m` menu, etc.). Use this for normal dev work.

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
docker run --rm -it \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 \
  -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=<LAN_IP> \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo start --lan -c"
```

`--rm` auto-cleans the container on exit. `Ctrl+C` stops Metro and removes the container in one step.

Notes:

- If `./node_modules/.bin/expo` is missing, run `npm install` in the same container workdir first.
- Web preview is available at `http://<LAN_IP>:8081/` (useful to inspect browser console errors while iterating).
- After changing `app.json` or `<LAN_IP>`, always restart Metro with `-c` (cache clear) and **rescan the QR** on the device (do not reload an old session — it has the stale URL cached).

### 4.2) Run Metro detached (background, no TTY)

When you don't need the QR (e.g. agent-driven workflow, CI smoke checks) or want to keep your terminal free:

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
docker rm -f brewery-metro 2>/dev/null
docker run -d --rm --name brewery-metro \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 \
  -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=<LAN_IP> \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo start --lan -c"
```

- `--rm` removes the container as soon as it stops, so `docker stop brewery-metro` is all you need (no leftover container blocking the name on the next run).
- Without `--rm`, `docker stop` leaves an `Exited` container holding the `brewery-metro` name; a follow-up `docker run --name brewery-metro` will fail with `Conflict. The container name "/brewery-metro" is already in use`. Recover with `docker rm brewery-metro` first.
- No QR is printed to logs in detached mode. Enter the URL `exp://<LAN_IP>:8081` manually in Expo Go (Settings → "Enter URL manually"), or just tap your previous project in Expo Go's recents.
- Tail logs with `docker logs -f brewery-metro`.

### Environment variables (native)

`apps/native` reads:

- `EXPO_PUBLIC_API_BASE_URL` (used by native auth + API calls; see `apps/native/src/auth/apiBaseUrl.ts`)
- `EXPO_PUBLIC_MEDIA_BASE_URL` (used by `RemoteImage`; see `apps/native/src/media/mediaBaseUrl.ts`)

Recommended values depend on where the app runs:

- Android emulator often needs `http://10.0.2.2:<NGINX_HTTP_PORT>`
- iOS simulator can usually use `http://localhost:<NGINX_HTTP_PORT>`
- Physical device should use your current LAN IP (same network as the dev server): `http://<LAN_IP>:<NGINX_HTTP_PORT>`. Find `<LAN_IP>` with `ip -4 addr show` (see §4.0). Do not hard-code a stale IP — the previous one is the #1 cause of `Failed to download remote update`.

Notes:

- On Android **emulators**, `apps/native/src/auth/apiBaseUrl.ts` rewrites `localhost` / `127.0.0.1` / `0.0.0.0` to `10.0.2.2` automatically, but it cannot guess your LAN IP for real devices.
- `apps/native/src/media/mediaBaseUrl.ts` falls back to `EXPO_PUBLIC_API_BASE_URL` if `EXPO_PUBLIC_MEDIA_BASE_URL` is unset.

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

- Android emulator: use Android Studio emulator, open Expo Go, connect to `exp://<LAN_IP>:8081`.
- Android device: install Expo Go from Play Store, ensure it is on the same Wi-Fi/LAN as `REACT_NATIVE_PACKAGER_HOSTNAME`, then scan the QR.
- iOS device: install Expo Go, same Wi-Fi/LAN, then scan the QR from `expo start --lan`.
- iOS simulator: requires macOS + Xcode (cannot run the iOS Simulator on Linux).

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

Cause: Expo Go is fetching the JS bundle from a host it cannot reach (almost always a stale `REACT_NATIVE_PACKAGER_HOSTNAME` and/or stale IP in `apps/native/app.json`).

Fix:

1. Find the current LAN IP (see §4.0 above): `ip -4 addr show | grep 'inet '` and pick the interface on the same subnet as your phone.
2. Update `apps/native/app.json` (`extra.EXPO_PUBLIC_API_BASE_URL`, `extra.EXPO_PUBLIC_MEDIA_BASE_URL`) and, optionally, `apps/native/src/auth/apiBaseUrl.ts` (`DEFAULT_API_BASE_URL`).
3. Stop Metro, restart it with `REACT_NATIVE_PACKAGER_HOSTNAME=<LAN_IP>` and `expo start --lan -c`.
4. **Rescan the QR** in Expo Go (do not reload the previous session).
5. Sanity check from the **phone's browser**: `http://<LAN_IP>:8081/` should load Metro's web preview. If it doesn't, the issue is network (Wi-Fi mismatch, client/AP isolation, firewall). Try `expo start --tunnel` as a fallback while you diagnose.

### `Incompatible React versions: react 19.x.x vs react-native-renderer 19.y.y` (Expo Go black/blank screen after bundle loads)

Cause: `react-native` ships a renderer that requires an **exact** React version match. SDK 54's Expo Go binary expects:

- `react` `19.1.0`
- `react-native-svg` `15.12.1`
- `expo` `~54.0.34`

If `apps/native/package.json` drifts above those (e.g. because `apps/web` pinned a newer React and someone aligned native to match), the bundle compiles fine but crashes on the first native commit with this exact error.

Fix:

```bash
docker run --rm \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
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
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
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
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"
```

A non-zero exit means at least one package will fail at runtime on Expo Go.

### Quick triage order (when "something is wrong with native")

Walk through these in this exact order before deep-diving:

1. **API up?** `curl -sS http://localhost:${NGINX_HTTP_PORT:-18080}/api/health` → `{"ok":true}`. If 502, see esbuild/502 section above. Many native crashes are downstream of a dead API.
2. **LAN IP fresh?** `ip -4 addr show | grep 'inet '` — does the IP in `apps/native/app.json` and your last `REACT_NATIVE_PACKAGER_HOSTNAME` still match?
3. **Phone reaches host?** From the **phone's browser**, open `http://<LAN_IP>:8081/`. If that fails, no Expo Go change will help — fix the network first.
4. **Versions aligned?** Run `expo install --check`. If it complains, run `expo install --fix` and (if `react` moved) ensure `react-dom` was bumped to the same exact version.
5. **Bundle cache?** Restart Metro with `-c` and rescan the QR (or re-enter `exp://<LAN_IP>:8081`).
6. **Read the device error log.** On the blue "Something went wrong" screen, tap **View error log** — `java.io.IOException: Failed to download remote update` means step 2/3; `Incompatible React versions` means step 4.

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
# pick the current LAN IP
ip -4 addr show | awk '/inet /{print $NF, $2}' | grep -v '127.0.0.1'

# verify versions in apps/native
docker run --rm \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check"

# realign apps/native versions to SDK 54 expectations
docker run --rm \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --fix"

# bring api back from a 502 (esbuild missing / Prisma stale)
docker compose exec -T api npm install
docker compose exec -T api npx prisma generate
docker compose restart api
curl -sS http://localhost:${NGINX_HTTP_PORT:-18080}/api/health

# start Metro detached (replace LAN_IP)
docker rm -f brewery-metro 2>/dev/null
docker run -d --rm --name brewery-metro \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 \
  -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=<LAN_IP> \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo start --lan -c"

# tail Metro logs / stop / restart
docker logs -f brewery-metro
docker stop brewery-metro
# (after stop, with --rm the container is gone, no docker rm needed)
```

