# Native local development (Expo)

Repo root (canonical): `/home/rf/dkprojects/rfapps/brewery-app`

## Prerequisites

- Docker / Docker Compose
- iOS simulator or Android emulator (or a physical device)

This repo prefers running Node/npm in containers. If you do run Expo tooling on the host, keep Node aligned with repo `engines` and expect drift.

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

Expose ports so the Expo dev server is reachable from the simulator/device.

```bash
cd /home/rf/dkprojects/rfapps/brewery-app
docker run --rm -it \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 \
  -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.124 \
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo start --lan -c"
```

Notes:

- If `./node_modules/.bin/expo` is missing, run `npm install` in the same container workdir first.
- Web preview is available at `http://192.168.1.124:8081/` (useful to inspect browser console errors while iterating).

### Environment variables (native)

`apps/native` reads:

- `EXPO_PUBLIC_API_BASE_URL` (used by native auth + API calls; see `apps/native/src/auth/apiBaseUrl.ts`)
- `EXPO_PUBLIC_MEDIA_BASE_URL` (used by `RemoteImage`; see `apps/native/src/media/mediaBaseUrl.ts`)

Recommended values depend on where the app runs:

- Android emulator often needs `http://10.0.2.2:<NGINX_HTTP_PORT>`
- iOS simulator can usually use `http://localhost:<NGINX_HTTP_PORT>`
- Physical device should use your LAN IP (same network as the dev server), for example `http://192.168.1.50:<NGINX_HTTP_PORT>`

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

