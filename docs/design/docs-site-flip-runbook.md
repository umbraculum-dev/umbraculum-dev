# Docs-site flip runbook — pre-alpha coordination

**Tier:** Public  
**Status:** v1 — execute on flip day with [public-alpha-preflip-hygiene-checklist.md](public-alpha-preflip-hygiene-checklist.md) §6  
**Audience:** maintainers running the July 2026 public-alpha flip  
**Related:** [RFC-0005](../rfcs/0005-docs-site.md), [WEBSITE.md](../WEBSITE.md), [public-alpha-cloudflare-pages-runbook.md](public-alpha-cloudflare-pages-runbook.md)

---

## Scope

This runbook covers **docs.umbraculum.dev** and its static assets while sources remain in the monorepo ([RFC-0005 Decision C](../rfcs/0005-docs-site.md)). Sister-repo extraction of `docs-site/` is post-alpha ([deferral register](public-flip-deferral-register.md) R-POLICY).

---

## Pre-flip foundations (complete before flip day)

| Item | Location | Verification |
|------|----------|--------------|
| Reference registry | [`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts), [`reference-sidebar-items.ts`](../../docs-site/reference-sidebar-items.ts) | Includes post–Wave 3a brewery packages + `@umbraculum/brewery-api-client` |
| OpenAPI static copies | [`docs-site/static/openapi/`](../../docs-site/static/openapi/) | `prebuild` sync from `services/api/openapi/`; `python3 scripts/docs/check-docs-site-openapi-sync.py` |
| Broken doc anchors | `docs/` source headings | `npm run build -w @umbraculum/docs-site` — zero broken anchor warnings |
| Brochure vendor mirror | [`scripts/sync-brochure-vendor.sh`](../../scripts/sync-brochure-vendor.sh) | Announcement bar + shared assets from `umbraculum-brochure` |

---

## Flip day — coordinated noIndex removal

Remove search-engine blocking **in the same maintenance window** for docs and brochure so crawlers see a consistent public surface.

### 1. Docs site (`docs.umbraculum.dev`)

| File | Change |
|------|--------|
| [`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts) | Set `noIndex: false` (or remove `noIndex: true`) |
| [`docs-site/static/robots.txt`](../../docs-site/static/robots.txt) | Remove `Disallow: /` (allow all) |
| Cloudflare Pages | Redeploy docs-site project per [public-alpha-cloudflare-pages-runbook.md](public-alpha-cloudflare-pages-runbook.md) |

### 2. Brochure (`umbraculum.dev`)

| Repo | Change |
|------|--------|
| [`umbraculum-brochure`](https://github.com/umbraculum-dev/umbraculum-brochure) | Remove `noindex` meta from `index.html` / layout; update `public/robots.txt` |
| Monorepo vendor sync | Run `./scripts/sync-brochure-vendor.sh` if announcement/config changed; rebuild docs-site |

Cross-reference: [WEBSITE.md](../WEBSITE.md) § brochure + docs relationship.

### 3. Post-deploy

| Step | Action |
|------|--------|
| DocSearch | Submit or refresh application after live URL — [docsearch-application-draft.md](docsearch-application-draft.md) |
| Smoke | `curl -sf https://docs.umbraculum.dev/` ; OpenAPI pages `/openapi-platform`, `/openapi-brewery` |
| RFC-0011 closure blurb | Optional ROADMAP / announcement link to [rfc-0011-pre-flip-closure.md](rfc-0011-pre-flip-closure.md) |

---

## Ongoing maintenance (pre- and post-flip)

```bash
# After OpenAPI route schema changes (API container):
docker compose exec api bash -lc 'cd /app && npm run openapi:generate'

# Docs-site build syncs static OpenAPI on prebuild; verify:
python3 scripts/docs/check-docs-site-openapi-sync.py

# After brochure announcement edits:
./scripts/sync-brochure-vendor.sh
npm run build -w @umbraculum/docs-site
```

---

## Owner checklist (record in hygiene §7)

1. Who runs Cloudflare docs deploy on flip day?
2. Who removes noIndex on docs-site vs brochure (same window)?
3. Who submits DocSearch after URL is live?
