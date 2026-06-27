# Algolia DocSearch application — maintainer draft (do not submit from CI)

**Tier:** Public  
**Status:** v1 — **C5 submitted 2026-06-27**; §4 Docusaurus wired on `master`; **`DOCSEARCH_*`** on Cloudflare **Variables and secrets** — await deploy green, then smoke Algolia search on production.  
**Audience:** maintainer applying at [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply)  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) §9 (Decision G), [`docs-site/README.md`](../../docs-site/README.md)

---

## 1. When to submit

Submit after **`docs.umbraculum.dev`** is live with HTTPS, **`noindex` removed** (flip-day runbook §3), and you can complete **domain verification** within **7 days** of approval ([DocSearch onboarding](https://docsearch.algolia.com/docs/who-can-apply)).

**Flip queue:** maintainer action **C5** — [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §7 and §11. Do **now** (post-§3), in parallel with waiting on Cursor marketplace **C2**.

**Applicant account (SoT):** sign in at Algolia with **GitHub OAuth** — same identity as Cursor marketplace **C2**: GitHub org context [`umbraculum-dev`](https://github.com/umbraculum-dev), login email **`umbraculum-dev@proton.me`**. Full matrix: [`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md). Do not create a separate personal or ad-hoc Algolia login.

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
| **Contact email** | **`toolset@umbraculum.dev`** (public project contact on the form) |
| **Account login** | **GitHub OAuth** — [`umbraculum-dev`](https://github.com/umbraculum-dev) / **`umbraculum-dev@proton.me`** (see [`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md)) |
| **Framework** | Docusaurus 3.x |
| **Search already on site** | Yes — local lunr.js fallback until DocSearch credentials are configured |

**One-liner for “what is this project?”**

> Umbraculum is an AGPLv3 open-source platform for composable operational modules (MRP, PIM, automation, brewery vertical demo, etc.) with a unified AI consultant and workspace model — documentation covers architecture, APIs, and contributor workflows.

---

## 4. After approval — Docusaurus + Cloudflare env (§4 landed 2026-06-27)

**Code (in repo):** `docs-site/docusaurus.config.ts` uses **`@docusaurus/theme-search-algolia`** when all three build env vars are set; otherwise **lunr** fallback (CI + local dev without secrets).

| Cloudflare **Variables and secrets** (build) | Value |
|--------------------------------------------|--------|
| **`DOCSEARCH_APP_ID`** | Application ID from Algolia DocSearch onboarding |
| **`DOCSEARCH_API_KEY`** | **Search-only** API key (public in client bundle — DocSearch design) |
| **`DOCSEARCH_INDEX_NAME`** | **`umbraculum-docs`** (Algolia Crawler → Indices) |

**Maintainer — Cloudflare Workers Builds** (project **`umbraculum-dev-docs-docusaurus`**):

1. Dashboard → **Workers & Pages** → **`umbraculum-dev-docs-docusaurus`** → **Settings** → **Build** → section **Variables and secrets** (same page as **`NODE_VERSION`**).
2. **+ Add** each **`DOCSEARCH_*`** variable above (type **Variable**; Production — mirror Preview if you use branch previews).
3. **Retry deployment** after saving vars (or wait for in-progress **`master`** build, then **Retry** so the build sees the new vars).
4. Smoke: open `https://docs.umbraculum.dev/`, use navbar search — Algolia modal (not lunr). Optional: `curl -sI https://docs.umbraculum.dev/search/` → 200.

**Local smoke (optional):** copy [`docs-site/.env.example`](../../docs-site/.env.example) → `docs-site/.env.local` with your keys; `npm run start --workspace=@umbraculum/docs-site` (Docusaurus loads `.env` files from site directory).

**Do not** commit `.env.local` or paste keys into git.

Reference: [Docusaurus search — using Algolia DocSearch](https://docusaurus.io/docs/search#using-algolia-docsearch).

---

## 5. Domain verification

Follow Algolia’s emailed/Dashboard instructions (DNS TXT, meta tag, or file upload on `docs.umbraculum.dev`). Complete within **7 days** of approval or the crawler may be paused.

**Umbraculum (2026-06-27):** verified via Cloudflare DNS TXT (`algolia-site-verification.umbraculum.dev`).

---

## 6. Production crawl schedule (developer expectation)

DocSearch indexes **`docs.umbraculum.dev`** with Algolia’s hosted crawler — **not** on every Cloudflare deploy or `master` merge.

| Item | Value (as configured 2026-06-27) |
|------|----------------------------------|
| Crawler | **`umbraculum-docs`** |
| Schedule name | **`main`** |
| Cadence | **Monthly — day 12 of each month** (dashboard may show “Next crawl in ~14 days” mid-cycle) |
| Dashboard | [Algolia Crawler](https://dashboard.algolia.com/crawler) → **`umbraculum-docs`** → Monitoring / schedule |

### What contributors should expect

- **Merging doc changes** updates the live HTML on `docs.umbraculum.dev` **immediately** after Workers Builds deploy.
- **Production DocSearch** (once §4 is wired) queries Algolia’s **index**, which refreshes on the **crawler schedule** above — typically **up to ~4 weeks** after merge unless someone triggers a manual crawl.
- **Do not** expect same-day search hits for new pages on production Algolia search after a doc PR lands.
- **Local / preview:** `docker compose` docs-site and **`npm run start`** use **lunr** when **`DOCSEARCH_*`** is unset locally; production uses Algolia after Cloudflare build env is set and deployed.

### Maintainer: urgent re-index

When a doc change must appear in **production Algolia search** before the next scheduled crawl:

1. Sign in with the account in [`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md).
2. Open **Algolia Crawler** → crawler **`umbraculum-docs`**.
3. Click **Start Crawling** (or equivalent on the crawler home page).
4. Wait for the crawl to finish; smoke-test search on `https://docs.umbraculum.dev/`.

Do **not** commit Algolia admin keys or crawler API tokens to the repo.

### Monitoring noise (redirects)

With **`trailingSlash: true`** in [`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts) (2026-06-27), the sitemap and canonical URLs both use trailing slashes — Algolia should see far fewer **HTTP redirect (301, 302)** ignored URLs on the next crawl. Until that deploy lands, legacy sitemap URLs without `/` may still 307 once.

---

## 7. Submission log

| Date | Actor | Notes |
|------|-------|-------|
| 2026-06-27 | Maintainer | Onboarding complete: domain **`docs.umbraculum.dev`**, crawler **`umbraculum-docs`**, index **`umbraculum-docs`** (~6933 records). Domain verified (Cloudflare DNS TXT). Schedule **`main`** — **12th of month**. §4 code on `master`; **`DOCSEARCH_*`** added to Cloudflare **Variables and secrets** — deploy in progress. |
