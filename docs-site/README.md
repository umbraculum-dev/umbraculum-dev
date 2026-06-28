# @umbraculum/docs-site

Docusaurus 3.10.x static site that renders the monorepo `docs/` tree for `docs.umbraculum.dev`.

> [!NOTE]
> Part of [Umbraculum](../README.md) — an open-source toolset for building
> workspace-shaped operational applications.

## What this is

A **build-only** npm workspace: configuration, theme CSS, and sidebar wiring for the public documentation site committed in [RFC-0005](../docs/rfcs/0005-docs-site.md). Markdown content stays in `docs/` (and per-workspace READMEs in Pass 2); this workspace is the renderer, not a content store.

## Scope

- **Contains**: `docusaurus.config.ts` (v4 future flags, Mermaid, i18n scaffold), `sidebars.ts`, `src/css/custom.css`, `src/theme/` (swizzled theme components — see below), `V4-UPGRADE.md` (flag tracker), build output under `build/`.
- **Does not contain**: Authoritative prose (that lives in `docs/`), production Algolia DocSearch credentials (Cloudflare **Variables and secrets** only — see [`docsearch-application-draft.md`](../docs/design/docsearch-application-draft.md) §4). **Local search** uses `@easyops-cn/docusaurus-search-local` (lunr.js) until **`DOCSEARCH_*`** are set on the docs Worker build.

## Search (lunr now; Algolia after §4)

| Surface | Index updates when |
|---------|-------------------|
| **Local dev** (`docker compose` / `npm run start`) | **lunr** rebuild on dev server start / rebuild — reflects your working tree |
| **Production** (`docs.umbraculum.dev`) after DocSearch theme wired | Algolia crawler **`umbraculum-docs`** — scheduled **`main`**, **day 12 monthly** (~weekly-to-monthly lag vs merge); not on every deploy. Requires **`DOCSEARCH_*`** build env on Cloudflare (§4 of draft). |

Contributors: doc PRs go live on the site after Cloudflare build, but **production Algolia search can lag weeks** until the next crawl. Maintainer manual re-crawl: [`docsearch-application-draft.md`](../docs/design/docsearch-application-draft.md) §6. Algolia login: [`maintainer-external-service-accounts.md`](../docs/design/maintainer-external-service-accounts.md).

**Sitemap / crawler alignment:** `trailingSlash: true` in [`docusaurus.config.ts`](docusaurus.config.ts) keeps sitemap URLs on trailing-slash canonical paths (fewer Algolia redirect ignores after deploy).

## Build / test / lint (local)

Per the `node-npm-container-only` project rule, run Node/npm **inside** a `node:20-slim` container with the repo bind-mounted (same pattern as CI — see [`docs/LINTING.md`](../docs/LINTING.md)):

```bash
docker run --rm \
  -v "$(pwd):/repo" \
  -w /repo/docs-site \
  node:20-slim \
  bash -lc 'npm install --no-audit --no-fund && npm run build'
```

- **Dev server**: included in the default repo `docker compose up -d` stack at `http://127.0.0.1:3001` (`DOCS_SITE_PORT` overrides the host port). For one-off container use, `npm run start` serves at `http://localhost:3000` when port `-p 3000:3000` is published.
- **Production build**: `npm run build` → `build/`.
- **CI note:** `docs-site-build` uses `cancel-in-progress` — rapid pushes cancel older runs with `The operation was canceled` (not a build failure). Check the latest run for `master`; use **workflow_dispatch** to re-run.
- **Typecheck**: `npm run typecheck`.

## Theme customization (swizzle over CSS fights)

Docusaurus `@docusaurus/theme-classic` ships CSS modules with hashed classes and selectors that often **beat** `custom.css` on load order and specificity. For **layout/structure** changes (announcement bar, navbar chrome), **swizzle the React component** under `src/theme/<Name>/index.tsx` and use **owned class names** (e.g. `.umb-doc-announcement*`) in `custom.css`.

Do **not** override hashed `announcementBar_*` classes or put `display: flex` on announcement content wrappers — HTML children layout as columns and desktop height stays at 30px until swizzled.

**Announcement bar (2026-05):** swizzled `AnnouncementBar`; SoT in [`umbraculum-brochure`](https://github.com/umbraculum-dev/umbraculum-brochure) (`announcement.config.json`). Docs-site imports `@umbraculum/brochure/announcement` from vendored mirror at `vendor/brochure/` (run [`scripts/sync-brochure-vendor.sh`](../scripts/sync-brochure-vendor.sh) after announcement edits). Cursor rule: `74-docusaurus-swizzle-over-css-fights.mdc` in `umbraculum-node-react-cursor-assistant` (umbraculum-toolset).

After swizzle changes: `docker compose restart docs-site`.

## OpenAPI / Redoc embed pages

Browsable OpenAPI on the docs site uses **Redoc standalone** inside a Docusaurus **custom page** — not MDX, not the Docusaurus OpenAPI plugin.

| File | Role |
|------|------|
| [`src/components/OpenApiRedocEmbed.tsx`](src/components/OpenApiRedocEmbed.tsx) | **Reuse this** — loads Redoc CDN script, calls `Redoc.init`, re-inits on theme toggle |
| [`src/openapi/redocTheme.ts`](src/openapi/redocTheme.ts) | Light/dark theme presets synced with Docusaurus `useColorMode()` |
| [`src/css/custom.css`](src/css/custom.css) | `.openapi-redoc-host` / `.openapi-redoc-page` — stops IFM dark-mode typography from overriding Redoc text |
| [`static/openapi/*.json`](static/openapi/) | Static copies of committed specs — **`prebuild` runs `scripts/sync-openapi-static.mjs`** from `services/api/openapi/`; verify with `python3 scripts/docs/check-docs-site-openapi-sync.py` |
| [`src/pages/openapi-platform.tsx`](src/pages/openapi-platform.tsx) | Platform catalog page — `/openapi-platform` |
| [`src/pages/openapi-brewery.tsx`](src/pages/openapi-brewery.tsx) | Brewery add-on page — `/openapi-brewery` |

### Do not (common agent trap)

- **Do not** call `Redoc.init(specUrl, {}, container)` with an empty options object inside Docusaurus. Redoc defaults to a **light** palette; Docusaurus **dark mode** applies global `[data-theme='dark']` CSS on top → white sidebar, invisible body text, broken layout.
- **Do not** copy the Redoc loader into each page — extend `OpenApiRedocEmbed` or `getRedocTheme()` instead.
- **Do not** assume green **docs-site-build** CI deploys Redoc pages differently — same Docusaurus build; the pitfall is **theme sync at runtime**, not the spec JSON.

### Adding another browsable spec (checklist)

1. Ensure a static copy exists: `docs-site/static/openapi/<name>.json` (via `openapi:generate` mirror or manual `cp` from `services/api/openapi/`).
2. Add `src/pages/openapi-<name>.tsx`:

   ```tsx
   import Layout from '@theme/Layout';
   import {OpenApiRedocEmbed} from '../components/OpenApiRedocEmbed';

   export default function OpenApiNamePage() {
     return (
       <Layout title="…" description="…">
         <main className="openapi-redoc-page">
           <OpenApiRedocEmbed specPath="/openapi/<name>.json" />
         </main>
       </Layout>
     );
   }
   ```

3. Wire sidebar or navbar link in [`sidebars.ts`](sidebars.ts) (type `link`, `href: '/openapi-<name>'`).
4. Toggle **light and dark** in the docs dev server (`http://127.0.0.1:3001/...`) before declaring done.
5. Cross-link from [`docs/API-OPENAPI.md`](../docs/API-OPENAPI.md) integrator workflow if the spec is public-facing.

Canonical API index: [`docs/API-OPENAPI.md`](../docs/API-OPENAPI.md). Local Swagger UI (dev API only): `http://localhost:18080/api/documentation`.

## Deploy (maintainer, Phase 2)

Cloudflare **Workers Builds** — second Worker project (after brochure is green). See [`docs/design/public-alpha-cloudflare-pages-runbook.md`](../docs/design/public-alpha-cloudflare-pages-runbook.md) §3.

| Dashboard field | Value |
|-----------------|--------|
| Project name | `umbraculum-dev-docs-docusaurus` (must match [`wrangler.toml`](wrangler.toml) `name`) |
| Build command | `npm run build -w @umbraculum/docs-site` |
| Deploy command | `npx wrangler deploy --config docs-site/wrangler.toml` |
| Non-production deploy | `npx wrangler versions upload --config docs-site/wrangler.toml` |
| Path | `/` (repo root) |
| `NODE_VERSION` | `20.19.4` (Cloudflare env var) |
| Preview | https://umbraculum-dev-docs-docusaurus.umbraculum-dev.workers.dev |

**Post-flip (2026-06-27):** `noIndex: false` in [`docusaurus.config.ts`](docusaurus.config.ts); [`static/robots.txt`](static/robots.txt) allows crawling. Algolia DocSearch on production when Cloudflare **`DOCSEARCH_*`** env is set ([`docsearch-application-draft.md`](../docs/design/docsearch-application-draft.md) §4).

## How it fits in

- **Consumed by**: maintainers and CI validating docs publication; Cloudflare Pages (or equivalent) at deploy time.
- **Depends on**: `docs/**` Tier: Public markdown; monorepo root `package.json` workspaces entry `"docs-site"`.
- **Related**: [`docs/design/rfc-0005-execution-plan.md`](../docs/design/rfc-0005-execution-plan.md) (operational pass plan), [`docs/DOCS-README-STANDARDS.md`](../docs/DOCS-README-STANDARDS.md).

## Status

Pass 1 scaffold (P1): Docusaurus 3.10 + v4 future flags + full `docs/` sidebar mirror. Reference README wiring, theme branding, and `docs-site-build.yml` CI land in Pass 2.

## Further reading

- [`docs/rfcs/0005-docs-site.md`](../docs/rfcs/0005-docs-site.md) — authoritative RFC
- [`docs/README.md`](../docs/README.md) — documentation index (sidebar shape)
- [`docs-site/V4-UPGRADE.md`](V4-UPGRADE.md) — enabled v4 future flags
