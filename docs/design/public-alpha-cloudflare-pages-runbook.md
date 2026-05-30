# Public alpha — Cloudflare static-site deployment runbook

**Tier:** Public  
**Status:** v1 (brochure + docs; deploy in Phase 2 flip week)  
**Audience:** maintainers preparing July 2026 public alpha  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) §4, [`docs/ROADMAP.md`](../ROADMAP.md) Phase 2 **2c**

> **Dashboard note (2026-05-30):** Cloudflare’s Git UI is **Workers & Pages → Create application → Create a Worker** (not a separate “Pages” wizard). Static sites declare the build output in **`wrangler.toml`** (`[assets] directory`), not in a “Build output directory” dashboard field. Deploy uses `npx wrangler deploy --config …`.

---

## 1. Summary

Both public static surfaces use the same hosting pattern as RFC-0005:

- **No deploy secrets in GitHub Actions** — Cloudflare Workers Builds connects to the repo and builds on merge to `master`.
- **CI only validates build** — workflows mirror [`docs-site-build.yml`](../../.github/workflows/docs-site-build.yml) and [`website-build.yml`](../../.github/workflows/website-build.yml).
- **Custom domains + HTTPS** — attach `umbraculum.dev` / `docs.umbraculum.dev` on each Worker; TLS at Cloudflare edge.
- **`noindex` until flip** — brochure ships with `robots.txt` disallow + meta `noindex`; docs-site uses `noIndex: true` + `static/robots.txt`. Remove or replace in Phase 2 when announcing α.

| Site | Domain (target) | Preview URL (pre-flip) | Build command (tuned) |
|------|-----------------|------------------------|------------------------|
| **Brochure** | `umbraculum.dev` | `https://umbraculum-dev-website.umbraculum-dev.workers.dev` | `npm run build -w @umbraculum/website` |
| **Docs** | `docs.umbraculum.dev` | `https://umbraculum-dev-docs-docusaurus.umbraculum-dev.workers.dev` | `npm run build -w @umbraculum/docs-site` |

Cloudflare runs `npm clean-install` before your build command — **do not** repeat `npm ci` in the build command (saves ~3 min per deploy).

Use **two Cloudflare Worker projects** (one per site). Same account, same repo, separate Wrangler configs — avoids coupling marketing deploys to doc edits.

---

## 2. Brochure Worker — `apps/website` (do this first)

1. **Create Worker** — Workers & Pages → **Create application** → connect GitHub `umbraculum-dev/umbraculum-dev` (private repo OK).
2. **Build settings**

   | Field | Value |
   |-------|--------|
   | Project name | `umbraculum-dev-website` — **must match** [`apps/website/wrangler.toml`](../../apps/website/wrangler.toml) `name` |
   | Build command | `npm run build -w @umbraculum/website` |
   | Deploy command | `npx wrangler deploy --config apps/website/wrangler.toml` |
   | Non-production branch deploy command | `npx wrangler versions upload --config apps/website/wrangler.toml` |
   | Path | `/` (repo root — required for workspace `npm ci`) |
   | Environment variables | **`NODE_VERSION`** = `20.19.4` (silences `EBADENGINE` from React Native / Vite in lockfile) |
   | API token | default (auto token) |

3. **Repo file (required before Deploy):** [`apps/website/wrangler.toml`](../../apps/website/wrangler.toml) — `[assets] directory = "./dist"` (relative to that file).
4. **Custom domains** — add `umbraculum.dev` and `www.umbraculum.dev` after first green deploy (www → apex redirect in Cloudflare DNS rules). Can wait until flip day.
5. **Pre-launch** — leave `public/robots.txt` as `Disallow: /` until Phase 2 **2c**.
6. **At flip** — replace `robots.txt` with allow-all (or remove disallow), publish launch post, link from README.

Local preview:

```bash
npm run build -w @umbraculum/website
npm run preview -w @umbraculum/website
```

---

## 3. Docs Worker — `docs-site` (second project, after brochure is green)

Repeat **Create application** with the same repo; different project name and Wrangler config (add `docs-site/wrangler.toml` before Deploy — same pattern as §2).

| Field | Value |
|-------|--------|
| Project name | `umbraculum-dev-docs-docusaurus` |
| Build command | `npm run build -w @umbraculum/docs-site` |
| Deploy command | `npx wrangler deploy --config docs-site/wrangler.toml` |
| Non-production branch deploy command | `npx wrangler versions upload --config docs-site/wrangler.toml` |
| Path | `/` |
| Environment variables | **`NODE_VERSION`** = `20.19.4` |

Custom domain: `docs.umbraculum.dev`. Remove docs-site `noindex` / `robots.txt` gating per RFC-0005 P7 in the same flip window as brochure.

---

## 4. Post-deploy tuning (maintainer, both Workers)

Apply in each Worker → **Settings → Builds** after first green deploy:

| Tuning | Action |
|--------|--------|
| **Node version** | Environment variable **`NODE_VERSION`** = **`20.19.4`** — avoids `npm warn EBADENGINE` (RN/Metro/Vite want ≥20.19.4; Cloudflare default was 20.18.1). |
| **Build command** | Drop redundant **`npm ci &&`** — Cloudflare already runs `npm clean-install` before your command. Use workspace build only (see table §1). |
| **Branch previews** | Optional: uncheck **Builds for non-production branches** to halve build count on feature-branch pushes (~500 builds/month free-tier budget). Keep on if you want preview URLs per branch. |
| **Deploy triggers** | Every **`master` push** rebuilds **both** Workers (no path filter). GitHub Actions remain path-scoped; Cloudflare is hosting-only. |

**Smoke-tested preview URLs (2026-05-30):**

- Brochure: https://umbraculum-dev-website.umbraculum-dev.workers.dev
- Docs: https://umbraculum-dev-docs-docusaurus.umbraculum-dev.workers.dev

Custom domains (`umbraculum.dev`, `docs.umbraculum.dev`) wait until flip day.

---

## 5. Why not GitHub Pages for brochure?

RFC-0005 chose Cloudflare for docs (free tier, fast CNAME, no Actions deploy token). The brochure uses the **same pattern** so one maintainer mental model covers both surfaces. GitHub Pages remains a fallback (copy `apps/website/dist` to `gh-pages` branch) but is not the canonical path.

---

## 6. Phase checklist (maintainer)

**Before connecting Cloudflare (Phase 1 done in repo):**

- [x] `apps/website/wrangler.toml` committed (brochure)
- [x] `docs-site/wrangler.toml` committed (docs — before second Worker)
- [ ] `npm run build -w @umbraculum/website` green locally / in CI
- [ ] `npm run build -w @umbraculum/docs-site` green in CI
- [ ] Brochure copy reviewed (workspace-shaped positioning, not brewery-only)
- [ ] Brochure design policy satisfied — no hype visuals/copy ([`brochure-site-design-policy.md`](brochure-site-design-policy.md))

**At flip (Phase 2c):**

- [x] Both Workers created; preview URLs smoke-tested (2026-05-30)
- [ ] Post-deploy tuning applied (§4): `NODE_VERSION`, build commands without duplicate `npm ci`
- [ ] Point DNS / custom domains; wait for TLS active
- [ ] Remove `noindex` / open `robots.txt` on both sites
- [x] Smoke: home → docs → GitHub → `GETTING-STARTED` on rendered docs (workers.dev previews, 2026-05-30)
