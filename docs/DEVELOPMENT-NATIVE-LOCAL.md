# Native local development (Expo)

Repo root (canonical): `/home/rf/dkprojects/rfapps/brewery-app`

## Prerequisites

- Docker / Docker Compose
- iOS simulator or Android emulator (or a physical device)

This repo prefers running Node/npm in containers. If you do run Expo tooling on the host, keep Node aligned with repo `engines` and expect drift.

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

- `http://localhost:${NGINX_HTTP_PORT:-8080}`

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
  -v "/home/rf/dkprojects/rfapps/brewery-app:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "npm install && npx expo start --lan"
```

### Environment variables (native)

`apps/native` reads:

- `EXPO_PUBLIC_MEDIA_BASE_URL` (used by `RemoteImage`)

Recommended values depend on where the app runs:

- Android emulator often needs `http://10.0.2.2:<NGINX_HTTP_PORT>`
- iOS simulator can usually use `http://localhost:<NGINX_HTTP_PORT>`
- Physical device should use your LAN IP (same network as the dev server), for example `http://192.168.1.50:<NGINX_HTTP_PORT>`

## Quick validation checklist

- **i18n**: open the app and use the “Toggle” button; locale should switch and persist across reloads.
- **media**: the sample image on the dashboard should load when `EXPO_PUBLIC_MEDIA_BASE_URL` is set correctly.
- **offline behavior**:
  - load the screen once online (warm cache)
  - disable network
  - reload: image should show if cached; otherwise it should show the placeholder.

