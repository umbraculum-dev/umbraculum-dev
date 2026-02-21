# @brewery/media

Shared media assets (images, etc.) for the brewery app. Source of truth for both web and native.

## Structure

- `assets/<domain>/` — domain-specific assets (e.g. `assets/yeast/`)

## Web usage

Assets are synced into `apps/web/public/media/` via `apps/web/scripts/sync-media.mjs`. Reference them as `/media/<domain>/<filename>` (e.g. `/media/yeast/dilution-1-100.png`).

## Native usage (future)

When a React Native / Expo app exists, import assets from this package (e.g. `require('@brewery/media/assets/yeast/dilution-1-100.png')` or equivalent bundler support). Do not duplicate assets in app-local folders.
