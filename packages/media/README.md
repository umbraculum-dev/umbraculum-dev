# @umbraculum/media

Shared media assets (images, illustrations) for web and native clients. Source of truth across surfaces.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). This package landed under the new `@umbraculum/*` scope as sub-plan #9 slot 2 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../docs/design/brewery-scope-migration-plan.md) for the migration plan. The current asset content is brewery-flavored; a content-split (`@umbraculum/media` framework + `@umbraculum/brewery-media` brewery assets) is deferred until a second vertical configuration lands (plan doc §1.4).

## What this is

The single canonical home for media assets that need to render identically on every surface — domain illustrations (e.g. yeast dilution diagrams), iconography that doesn't fit the icon-font conventions, and any other asset where the web and native renderings must visually match. The web app syncs from this package into its public folder at build time; the native app references the package directly via Metro's bundler. The brand mascot **Umbi** ([`docs/media/umbi.png`](../../docs/media/umbi.png)) lives in `docs/media/` rather than this package — that asset is brand-tier and copied into surfaces that need it; this package is for product-tier domain illustrations.

## Scope

- **Contains**: domain illustration PNGs / SVGs grouped by domain folder under `assets/<domain>/`; the package manifest declaring entry points consumable by both Metro and Next.js.
- **Does not contain**: the brand mascot Umbi (lives in `docs/media/`, see above); icon-font glyphs (lives in `@umbraculum/ui` Tamagui icons — pending rename to `@umbraculum/ui` per sub-plan #9 slot 5); generated thumbnails or transformed image variants (those are generated at build time by the consumer apps).

## Structure

- `assets/<domain>/` — domain-specific assets (e.g. `assets/yeast/`).

## Web usage

Assets are synced into `apps/web/public/media/` via `apps/web/scripts/sync-media.mjs`. Reference them by URL path:

```ts
<img src="/media/yeast/dilution-1-100.png" alt="…" />
```

## Native usage

Import from the package directly so Metro can bundle the binary:

```ts
import yeastDilution from "@umbraculum/media/assets/yeast/dilution-1-100.png";
```

Do not duplicate assets into app-local folders — this package is the source of truth.

## Build / test / lint (local)

This package ships static assets with a thin entry-point manifest. There is no source-level build step in the conventional sense; the assets are consumed directly by the bundlers.

- **No build**: `npm run build:packages` is a no-op for this package's assets but is safe to run.
- **Sync into web**: from repo root, `npm run --workspace=apps/web sync-media` (or simply re-run the web build, which calls the script as part of the pipeline).
- **Lint**: `npm run lint --workspace=@umbraculum/media` (lints the manifest / TS entry-point only).
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate".

When adding a new asset:

1. Drop the file into `assets/<domain>/<filename>` (lowercase, kebab-case).
2. Re-run the web sync (or rely on the next web build).
3. For native, no extra step — Metro picks up the new file on the next bundle.

## How it fits in

- **Consumed by**: `apps/web` (via the sync script), `apps/native` (via Metro direct import), `@brewery/recipes-ui` (for any domain illustration shipped in a shared component — pending rename to `@umbraculum/brewery-recipes-ui` per sub-plan #9 slot 13).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@umbraculum/i18n` and `@brewery/contracts` (both pending sub-plan #9 renames).

## Status

Sparse today — the brewery vertical's UI uses few illustrations, and most of those are already present (yeast-dilution figures). Expect to grow as additional vertical configurations land and bring their own illustrations.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md) §6.6 — the brand mascot Umbi (separate asset, lives at `docs/media/umbi.png`)
