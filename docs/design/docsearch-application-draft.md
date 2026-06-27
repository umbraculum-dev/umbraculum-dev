# Algolia DocSearch application — maintainer draft (do not submit from CI)

**Tier:** Public  
**Status:** v1 draft for Phase 2 submit (**ROADMAP** item **2f** / RFC-0005 **P5**)  
**Audience:** maintainer applying at [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply)  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) §9 (Decision G), [`docs-site/README.md`](../../docs-site/README.md)

---

## 1. When to submit

Submit after **`docs.umbraculum.dev`** is live with HTTPS, **`noindex` removed** (flip-day runbook §3), and you can complete **domain verification** within **7 days** of approval ([DocSearch onboarding](https://docsearch.algolia.com/docs/who-can-apply)).

**Flip queue:** maintainer action **C5** — [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §7 and §11. Do **now** (post-§3), in parallel with waiting on Cursor marketplace **C2**.

Until credentials arrive, the docs site uses **local lunr.js search** (`@easyops-cn/docusaurus-search-local`) — wired in `docs-site/docusaurus.config.ts`.

---

## 2. Pre-flight checklist

| Check | Expected |
|-------|----------|
| Production URL | `https://docs.umbraculum.dev/` returns 200 |
| Technical docs | Public `Tier: Public` markdown + workspace READMEs rendered (not a marketing-only site) |
| Open source | Repo will be public at flip (`github.com/umbraculum-dev/umbraculum-dev`) |
| License | AGPLv3 core + MIT SDK — acceptable for DocSearch OSS program |
| `noindex` | Removed at flip **2c §3** (2026-06-27); sitemap at `https://docs.umbraculum.dev/sitemap.xml` |
| Integration | Docusaurus 3.10.x — plan to use official `@docusaurus/theme-search-algolia` after approval |

---

## 3. Suggested form answers (copy/adapt)

Use the live form fields as authoritative; names may differ slightly in the Algolia dashboard.

| Field | Suggested value |
|-------|-----------------|
| **Documentation URL** | `https://docs.umbraculum.dev` |
| **Site / project name** | Umbraculum Documentation |
| **Repository URL** | `https://github.com/umbraculum-dev/umbraculum-dev` |
| **Open source** | Yes |
| **License** | AGPL-3.0 (core monorepo); MIT for published SDK packages — see [`docs/LICENSING.md`](../LICENSING.md) |
| **Short description** | Technical documentation for Umbraculum, an open-source toolset for building workspace-shaped operational applications (ERP-style modules, AI consultant, web + native shells). Includes platform architecture, RFCs, module READMEs, and development runbooks. |
| **Crawler / sitemap** | `https://docs.umbraculum.dev/sitemap.xml` (available after first production Docusaurus build) |
| **Contact email** | **`toolset@umbraculum.dev`** (public toolset contact; or maintainer Proton if the form requires the applying account email) |
| **Framework** | Docusaurus 3.x |
| **Search already on site** | Yes — local lunr.js fallback until DocSearch credentials are configured |

**One-liner for “what is this project?”**

> Umbraculum is an AGPLv3 open-source platform for composable operational modules (MRP, PIM, automation, brewery vertical demo, etc.) with a unified AI consultant and workspace model — documentation covers architecture, APIs, and contributor workflows.

---

## 4. After approval — code swap (maintainer + agent)

1. Algolia emails **Application ID**, **Search API key** (search-only), and **index name**.
2. Add to Cloudflare Pages env (or build-time secrets) — **do not commit secrets**.
3. In `docs-site/docusaurus.config.ts`:
   - Add `@docusaurus/theme-search-algolia` to `themes` (or `presets` theme config per Docusaurus docs).
   - Set `themeConfig.algolia` with `appId`, `apiKey`, `indexName`.
   - Remove or disable `@easyops-cn/docusaurus-search-local` theme entry.
4. Rebuild, deploy, smoke-test search on production.
5. Mark **ROADMAP** **2f** done and note approval date in this file §6.

Reference: [Docusaurus search — using Algolia DocSearch](https://docusaurus.io/docs/search#using-algolia-docsearch).

---

## 5. Domain verification

Follow Algolia’s emailed/Dashboard instructions (DNS TXT, meta tag, or file upload on `docs.umbraculum.dev`). Complete within **7 days** of approval or the crawler may be paused.

---

## 6. Submission log (fill when done)

| Date | Actor | Notes |
|------|-------|-------|
| — | — | *Not submitted yet — draft ready; flip queue **C5** ([`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §7, §11).* |
