# @umbraculum/brewery-media-assets

Brewery-vertical shared PNG assets and generated manifest (hashed public paths under `/media/**`).

> [!NOTE]
> Part of [Umbraculum](../../../../README.md). The loader API and empty platform manifest live in [`@umbraculum/media`](../../../platform/media/README.md).

## What this is

Reference-vertical media content (currently yeast help images under `assets/yeast/`). Web pre-build sync copies assets into `apps/web/public/media/` via `apps/web/scripts/sync-media.mjs` alongside the platform media package.

## Scope

- **Contains**: brewery PNG assets; `manifest.generated.json` / TypeScript manifest types.
- **Does not contain**: generic loader helpers (`getMediaUrl`, …) — use `@umbraculum/media` or this package's mirrored exports.

## Usage (native)

```ts
import { getMediaUrl, type MediaAssetKey } from "@umbraculum/brewery-media-assets";
```

## Build / test / lint (local)

- **Build**: `npm run build:packages` (runs `generate:manifest` + tsup).
- **Typecheck**: `npm run typecheck --workspace=@umbraculum/brewery-media-assets`.

## How it fits in

- **Consumed by**: `apps/web` (sync-media), `apps/native` (RemoteImage / brewery screens).
- **Depends on**: nothing in the workspace.

## Further reading

- [`docs/CODING-STANDARDS.md`](../../../../docs/CODING-STANDARDS.md) — shared media policy
- [`@umbraculum/media`](../../../platform/media/README.md)
