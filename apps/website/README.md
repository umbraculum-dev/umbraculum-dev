# @umbraculum/website

Static marketing brochure for **umbraculum.dev** — workspace-shaped positioning for the July 2026 public alpha.

> [!NOTE]
> Part of [Umbraculum](../../README.md). Deploy target: **Cloudflare Pages** (same pattern as [`docs-site`](../../docs-site/README.md)); see [`docs/design/public-alpha-cloudflare-pages-runbook.md`](../../docs/design/public-alpha-cloudflare-pages-runbook.md).

## What this is

A **build-only** workspace: HTML + CSS in `public/`, copied to `dist/` on build. No React, no npm runtime dependencies. Intended for Cloudflare Pages with output directory `apps/website/dist`.

## Quick start

```bash
npm run build -w @umbraculum/website
npm run preview -w @umbraculum/website
# open http://localhost:4321
```

## Deploy (maintainer, Phase 2)

Cloudflare Pages project — build command `npm ci && npm run build -w @umbraculum/website`, output `apps/website/dist`. Remove `robots.txt` disallow when declaring public alpha.

## Scope

- **Contains:** single-page brochure, `noindex` until flip, links to docs + GitHub.
- **Does not contain:** product app (`apps/web`), API, or docs content (that is `docs-site/`).

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §1.1 — positioning copy source
- [`docs/ROADMAP.md`](../../docs/ROADMAP.md) — Phase 1 / Phase 2 TODO table
- [`docs/rfcs/0005-docs-site.md`](../../docs/rfcs/0005-docs-site.md) — docs hosting decision (Cloudflare)
