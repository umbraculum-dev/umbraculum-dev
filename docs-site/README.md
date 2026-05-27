# @umbraculum/docs-site

Docusaurus 3.10.x static site that renders the monorepo `docs/` tree for `docs.umbraculum.dev`.

> [!NOTE]
> Part of [Umbraculum](../README.md) — an open-source toolset for building
> workspace-shaped operational applications.

## What this is

A **build-only** npm workspace: configuration, theme CSS, and sidebar wiring for the public documentation site committed in [RFC-0005](../docs/rfcs/0005-docs-site.md). Markdown content stays in `docs/` (and per-workspace READMEs in Pass 2); this workspace is the renderer, not a content store.

## Scope

- **Contains**: `docusaurus.config.ts` (v4 future flags, Mermaid, i18n scaffold), `sidebars.ts`, `src/css/custom.css`, `V4-UPGRADE.md` (flag tracker), build output under `build/`.
- **Does not contain**: Authoritative prose (that lives in `docs/`), production Algolia DocSearch credentials (Phase 2 submit — see [`docsearch-application-draft.md`](../docs/design/docsearch-application-draft.md)). **Local search** uses `@easyops-cn/docusaurus-search-local` (lunr.js) until DocSearch approval. Navbar/favicon use **Umbi** from [`docs/media/umbi.png`](../docs/media/umbi.png), copied into `static/img/umbi.png` by `scripts/copy-brand-assets.mjs` on `prestart` / `prebuild` (generated file; not committed).

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
- **Typecheck**: `npm run typecheck`.

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
