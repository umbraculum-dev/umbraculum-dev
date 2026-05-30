# @umbraculum/website

Static marketing brochure for **umbraculum.dev** — workspace-shaped positioning for the July 2026 public alpha.

> [!NOTE]
> Part of [Umbraculum](../../README.md). Deploy target: **Cloudflare Workers** (static assets via Wrangler; Git-connected Builds). See [`docs/design/public-alpha-cloudflare-pages-runbook.md`](../../docs/design/public-alpha-cloudflare-pages-runbook.md).

## What this is

A **build-only** workspace: HTML + CSS in `public/`, copied to `dist/` on build. The Umbi mascot is copied from the canonical asset [`docs/media/umbi.png`](../../docs/media/umbi.png) at build time (not duplicated in git). Intended for Cloudflare Pages with output directory `apps/website/dist`.

Every page header must include the shared **`brand-row`** block (Umbi logo + title) and `<link rel="icon" href="/img/umbi.png" />` — copy from `public/index.html` or `public/support/index.html`.

New pages should also include the **site announcement** mount (`announcement.css`, `announcement.js`, `#umb-announcement-root`) — see **Site announcement banner** below.

## Site announcement banner

Reusable top-of-page banner for immediate news (public-alpha countdown, outages, deadlines). **Not Tamagui** — the brochure is static HTML/CSS; product apps use `@umbraculum/ui`. **When to reconsider** a Tamagui brochure: [`docs/TAMAGUI.md`](../../docs/TAMAGUI.md) §"UI stack choice — product vs public surfaces".

| File | Role |
|------|------|
| [`announcement.config.json`](announcement.config.json) | **Single source of truth** — `enabled`, `id`, `variant` (`info` \| `warning` \| `critical`), `dismissible`, `html` |
| [`public/announcement.css`](public/announcement.css) | `.umb-announcement` layout + variant colors (matches brochure dark tokens) |
| [`public/announcement.js`](public/announcement.js) | Loads config at runtime; dismiss persists in `localStorage` per `id` |
| [`scripts/announcement-theme.mjs`](scripts/announcement-theme.mjs) | Maps config → Docusaurus `themeConfig.announcementBar` |

**Docs site:** [`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts) reads the same JSON; a **swizzled** [`AnnouncementBar`](../../docs-site/src/theme/AnnouncementBar/index.tsx) renders it (not the stock theme bar — see `docs-site/README.md` § Theme customization).

To change the message, edit `announcement.config.json`, rebuild brochure (`npm run build -w @umbraculum/website` or `docker compose restart website`), restart or rebuild docs-site. Set `"enabled": false` to hide on both surfaces.

## Design and tone

**Less ego, more facts.** The brochure is a modest orientation surface for developers and technicians — not a growth-marketing landing page. Primary objective: **sustain ordinary work** (groceries, running costs), not jackpot or “once in a lifetime” deal theatre — sponsorship is welcome but not the headline. Avoid startup tropes (rockets, neon heroes, super-impactful colors, motion-for-attention). Keep copy precise and link to docs for depth.

Canonical policy: [`docs/design/brochure-site-design-policy.md`](../../docs/design/brochure-site-design-policy.md). Aligns with [`MANIFESTO.md`](../../MANIFESTO.md) §1 (“not a marketing document”).

## Quick start

**With Docker Compose** (starts with the rest of the dev stack):

```bash
docker compose up -d website
# open http://127.0.0.1:4321/support/
```

After editing `public/**`, restart to rebuild `dist/`:

```bash
docker compose restart website
```

**Host preview** (no container):

```bash
npm run build -w @umbraculum/website
npm run preview -w @umbraculum/website
# open http://localhost:4321
```

## Deploy (maintainer, Phase 2)

Cloudflare **Workers Builds** (Git-connected) — see [`docs/design/public-alpha-cloudflare-pages-runbook.md`](../../docs/design/public-alpha-cloudflare-pages-runbook.md).

| Dashboard field | Value |
|-----------------|--------|
| Project name | `umbraculum-dev-website` (must match [`wrangler.toml`](wrangler.toml) `name`) |
| Build command | `npm ci && npm run build -w @umbraculum/website` |
| Deploy command | `npx wrangler deploy --config apps/website/wrangler.toml` |
| Non-production deploy | `npx wrangler versions upload --config apps/website/wrangler.toml` |
| Path | `/` (repo root) |

Static assets are declared in [`wrangler.toml`](wrangler.toml) (`[assets] directory = "./dist"`). Remove `robots.txt` disallow when declaring public alpha.

## Scope

- **Contains:** single-page brochure, `noindex` until flip, links to docs + GitHub.
- **Does not contain:** product app (`apps/web`), API, or docs content (that is `docs-site/`).

## Further reading

- [`docs/design/brochure-site-design-policy.md`](../../docs/design/brochure-site-design-policy.md) — visual and copy policy (less ego, more facts)
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §1.1 — positioning copy source
- [`docs/ROADMAP.md`](../../docs/ROADMAP.md) — Phase 1 / Phase 2 TODO table
- [`docs/rfcs/0005-docs-site.md`](../../docs/rfcs/0005-docs-site.md) — docs hosting decision (Cloudflare)
