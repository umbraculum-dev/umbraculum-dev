# Public web surfaces (`umbraculum.dev`)

**Tier:** Public  
**Status:** v1 — brochure in sister repo; docs site in monorepo  
**Audience:** maintainers, evaluators, contributors wiring launch comms

---

## Summary

Umbraculum publishes **two static HTML surfaces** on **Cloudflare Workers** (static assets via Wrangler). RFC-0005 owns the docs generator; this document owns the **brochure** decision and how the two surfaces relate.

| Surface | Domain | Repository / workspace | Role |
|---------|--------|------------------------|------|
| **Brochure** | `umbraculum.dev` | [`umbraculum-brochure`](https://github.com/umbraculum-dev/umbraculum-brochure) (`@umbraculum/brochure`) | Modest entry point — positioning, student/lab experimentation, fit filter, links to docs + GitHub + support |
| **Docs** | `docs.umbraculum.dev` | [`docs-site/`](../docs-site/) in this monorepo | Full `Tier: Public` doc set + module READMEs ([RFC-0005](rfcs/0005-docs-site.md)) |

**Not in scope here:** the product app (`apps/web`), API (`services/api`), or forum (`forum.umbraculum.dev`).

---

## Brochure (`umbraculum-brochure`)

- **Stack:** static HTML + CSS — **not** Next.js, **not** React. Build copies `public/` → `dist/`; Umbi at `public/img/umbi.png`.
- **Design policy:** [`design/brochure-site-design-policy.md`](design/brochure-site-design-policy.md) — less ego, more facts; no startup marketing tropes.
- **Repo README:** [umbraculum-brochure](https://github.com/umbraculum-dev/umbraculum-brochure).
- **CI:** GHA `build` workflow in brochure repo; deploy is Cloudflare Workers Builds on merge to `main`.
- **SEO (post-flip):** brochure and docs are **search-indexable** since **2026-06-27** — `robots.txt` allows crawling; no `noindex` meta on brochure home or `/support/`. Pre-flip gate removal: [`design/public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md) §3.
- **Audience entry:** brochure `public/index.html` sections *Students & university labs* and *Is this for you?*; deep guide: [`ACADEMIC-AND-EXPERIMENTATION.md`](ACADEMIC-AND-EXPERIMENTATION.md).

### Shared announcement bar

Brochure and docs site share announcement copy from **`umbraculum-brochure`** (SoT). Docs site imports `@umbraculum/brochure/announcement` via vendored mirror at `docs-site/vendor/brochure/` — run [`scripts/sync-brochure-vendor.sh`](../scripts/sync-brochure-vendor.sh) after announcement edits in the sister repo.

---

## Docs site (`docs-site`)

- **Stack:** Docusaurus 3.10.x ([RFC-0005](rfcs/0005-docs-site.md)).
- **CI:** [`.github/workflows/docs-site-build.yml`](../.github/workflows/docs-site-build.yml).
- **Search:** **Algolia DocSearch** on production when Cloudflare build env **`DOCSEARCH_*`** is set ([`design/docsearch-application-draft.md`](design/docsearch-application-draft.md) §4); lunr fallback in CI/local without env. Crawler **`umbraculum-docs`** — index refresh **~monthly, day 12**.

---

## Hosting and deploy

Canonical runbook: [`design/public-alpha-cloudflare-pages-runbook.md`](design/public-alpha-cloudflare-pages-runbook.md).

- Two Cloudflare Worker projects (brochure repo + docs in this monorepo), separate Wrangler configs.
- **No deploy secrets in GitHub Actions** — Cloudflare builds on push after repos are connected.
- GitHub Pages is a documented fallback only; not the canonical path.

---

## Flip-day coordination

Stage 2 **2c** executed **2026-06-27** — record: [`design/public-alpha-flip-day-runbook.md`](design/public-alpha-flip-day-runbook.md). Summary:

1. Repos **`umbraculum-dev`**, **`umbraculum-toolset`**, and **`umbraculum-brochure`** → **public** ☑
2. Tag **`v0.0.1-alpha`** + GitHub Release ☑
3. Brochure + docs **`noindex` removed** / `robots.txt` allow-all ☑
4. Cloudflare custom domains + TLS ☑
5. Cursor marketplace submission started ☑ — listings live pending **C6**

MIT npm SDK packages were published **before** the visibility flip (2026-05-29) — see [`LICENSING.md`](LICENSING.md) §6.2.1 and flip-day runbook §6.

---

## Related

- [`ROADMAP.md`](ROADMAP.md) — Late H1 / July 2026 public-alpha tranche
- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 — go-public path
- [`design/public-alpha-preflip-hygiene-checklist.md`](design/public-alpha-preflip-hygiene-checklist.md) — Stage 1 gates
- [`design/production-hosts.md`](design/production-hosts.md) — sister repo table
