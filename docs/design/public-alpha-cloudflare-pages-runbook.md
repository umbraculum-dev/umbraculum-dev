# Public alpha — Cloudflare Pages deployment runbook

**Tier:** Public  
**Status:** v1 (brochure + docs; deploy in Phase 2 flip week)  
**Audience:** maintainers preparing July 2026 public alpha  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) §4, [`docs/ROADMAP.md`](../ROADMAP.md) Phase 2 **2c**

---

## 1. Summary

Both public static surfaces use the same hosting pattern as RFC-0005:

- **No deploy secrets in GitHub Actions** — Cloudflare Pages connects to the repo and builds on merge to `master`.
- **CI only validates build** — workflows mirror [`docs-site-build.yml`](../../.github/workflows/docs-site-build.yml) and [`website-build.yml`](../../.github/workflows/website-build.yml).
- **Custom domains + HTTPS** — CNAME from DNS to `*.pages.dev`; TLS at Cloudflare edge.
- **`noindex` until flip** — brochure ships with `robots.txt` disallow + meta `noindex`; docs-site uses `noIndex: true` + `static/robots.txt`. Remove or replace in Phase 2 when announcing α.

| Site | Domain (target) | Workspace | Build command | Output directory |
|------|-------------------|-----------|---------------|------------------|
| **Docs** | `docs.umbraculum.dev` | `@umbraculum/docs-site` | `npm run build -w @umbraculum/docs-site` | `docs-site/build` |
| **Brochure** | `umbraculum.dev` (apex) | `@umbraculum/website` | `npm run build -w @umbraculum/website` | `apps/website/dist` |

Use **two Cloudflare Pages projects** (one per site). Same account, separate build roots — avoids coupling marketing deploys to doc edits.

---

## 2. Cloudflare Pages project — brochure (`apps/website`)

1. **Create project** — Connect GitHub `umbraculum-dev/umbraculum-dev` (after public flip).
2. **Build settings**

   | Field | Value |
   |-------|--------|
   | Framework preset | None |
   | Build command | `npm ci && npm run build -w @umbraculum/website` |
   | Build output directory | `apps/website/dist` |
   | Root directory | `/` (repo root) |
   | Node version | 20 |

3. **Environment variables** — none required for static HTML v1.
4. **Custom domains** — add `umbraculum.dev` and `www.umbraculum.dev` (www → apex redirect in Cloudflare DNS rules).
5. **Pre-launch** — leave `public/robots.txt` as `Disallow: /` until Phase 2 **2c**.
6. **At flip** — replace `robots.txt` with allow-all (or remove disallow), publish launch post, link from README.

Local preview:

```bash
npm run build -w @umbraculum/website
npx serve apps/website/dist -p 4321
```

---

## 3. Cloudflare Pages project — docs (`docs-site`)

Same as RFC-0005 P4/P7:

| Field | Value |
|-------|--------|
| Build command | `npm ci && npm run build -w @umbraculum/docs-site` |
| Build output directory | `docs-site/build` |

Custom domain: `docs.umbraculum.dev`. Remove docs-site `noindex` / `robots.txt` gating per RFC-0005 P7 in the same flip window as brochure.

---

## 4. Why not GitHub Pages for brochure?

RFC-0005 chose Cloudflare Pages for docs (free tier, fast CNAME, no Actions deploy token). The brochure uses the **same pattern** so one maintainer mental model covers both surfaces. GitHub Pages remains a fallback (copy `apps/website/dist` to `gh-pages` branch) but is not the canonical path.

---

## 5. Phase checklist (maintainer)

**Before connecting Cloudflare (Phase 1 done in repo):**

- [ ] `npm run build -w @umbraculum/website` green locally / in CI
- [ ] `npm run build -w @umbraculum/docs-site` green in CI
- [ ] Brochure copy reviewed (workspace-shaped positioning, not brewery-only)

**At flip (Phase 2c):**

- [ ] Create both Pages projects; verify preview URLs
- [ ] Point DNS CNAMEs; wait for TLS active
- [ ] Remove `noindex` / open `robots.txt` on both sites
- [ ] Smoke: home → docs → GitHub → `GETTING-STARTED` on rendered docs
