# Public web surfaces (`umbraculum.dev`)

**Tier:** Public  
**Status:** v1 — brochure + docs site shipped in-repo; production deploy at public-alpha flip  
**Audience:** maintainers, evaluators, contributors wiring launch comms

---

## Summary

Umbraculum publishes **two static HTML surfaces**, both built from this monorepo and hosted on **Cloudflare Pages** (not GitHub Pages). RFC-0005 owns the docs generator; this document owns the **brochure** decision and how the two surfaces relate.

| Surface | Domain | Workspace | Role |
|---------|--------|-----------|------|
| **Brochure** | `umbraculum.dev` | [`apps/website/`](../apps/website/) | Modest entry point — positioning, student/lab experimentation, fit filter, links to docs + GitHub + support |
| **Docs** | `docs.umbraculum.dev` | [`docs-site/`](../docs-site/) | Full `Tier: Public` doc set + module READMEs ([RFC-0005](rfcs/0005-docs-site.md)) |

**Not in scope here:** the product app (`apps/web`), API (`services/api`), or forum (`forum.umbraculum.dev`).

---

## Brochure (`apps/website`)

- **Stack:** static HTML + CSS — **not** Next.js, **not** React. Build copies `public/` → `dist/` and syncs Umbi from [`docs/media/umbi.png`](media/umbi.png).
- **Design policy:** [`design/brochure-site-design-policy.md`](design/brochure-site-design-policy.md) — less ego, more facts; no startup marketing tropes.
- **Workspace README:** [`apps/website/README.md`](../apps/website/README.md).
- **CI:** [`.github/workflows/website-build.yml`](../.github/workflows/website-build.yml) — build validation only; deploy is Cloudflare-connected on merge after flip.
- **Pre-flip SEO:** `noindex` meta + `robots.txt` disallow until public-alpha cutover ([`design/public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md) §3.1).
- **Audience entry:** [`public/index.html`](../apps/website/public/index.html) sections *Students & university labs* and *Is this for you?* filter visitors before docs; deep guide: [`ACADEMIC-AND-EXPERIMENTATION.md`](ACADEMIC-AND-EXPERIMENTATION.md).

### Shared announcement bar

Brochure and docs site share [`apps/website/announcement.config.json`](../apps/website/announcement.config.json) for top-of-page banners (countdown, outages). Docs site consumes it via a swizzled Docusaurus `AnnouncementBar` ([`docs-site/README.md`](../docs-site/README.md)).

---

## Docs site (`docs-site`)

- **Stack:** Docusaurus 3.10.x ([RFC-0005](rfcs/0005-docs-site.md)).
- **CI:** [`.github/workflows/docs-site-build.yml`](../.github/workflows/docs-site-build.yml).
- **Search:** lunr local plugin until Algolia DocSearch approves ([`design/docsearch-application-draft.md`](design/docsearch-application-draft.md)).

---

## Hosting and deploy

Canonical runbook: [`design/public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md).

- Two Cloudflare Pages projects (brochure + docs), same GitHub repo, different build output directories.
- **No deploy secrets in GitHub Actions** — Cloudflare builds on push to `master` after the repo is public and projects are connected.
- GitHub Pages is a documented fallback only; not the canonical path.

---

## Flip-day coordination

Execute [`design/public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md) in one maintenance window:

1. Both repos (`umbraculum-dev`, `umbraculum-toolset`) → **public**
2. Tag `v0.0.1-alpha` on monorepo (if not already present)
3. Remove brochure + docs `noindex` / `robots.txt` gates
4. Connect Cloudflare custom domains + TLS
5. Submit Cursor marketplace plugins ([`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md))

MIT npm SDK packages were published **before** the visibility flip (2026-05-29) — see [`LICENSING.md`](LICENSING.md) §6.2.1 and flip-day runbook §6.

---

## Related

- [`ROADMAP.md`](ROADMAP.md) — Late H1 / July 2026 public-alpha tranche
- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 — go-public path
- [`design/public-alpha-preflip-hygiene-checklist.md`](design/public-alpha-preflip-hygiene-checklist.md) — Stage 1 gates
