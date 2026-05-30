# Public alpha — pre-flip hygiene checklist (Stage 1)

**Tier:** Public  
**Status:** v1 working checklist for Phase 2 **2b**  
**Audience:** maintainer running Stage 1 before the atomic public flip (**2c**)  
**Related:** [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, [`ROADMAP.md`](../ROADMAP.md) Week 1 tail + Week 3 Stage 1, [RFC-0010](../rfcs/0010-platform-brewery-postgres-schema-split.md) runbook [`platform-brewery-postgres-schema-split.md`](platform-brewery-postgres-schema-split.md)

---

## 1. Scope

Run this checklist on **both** repositories before Stage 2:

| Repo | URL |
|------|-----|
| Monorepo | `github.com/umbraculum-dev/umbraculum-dev` |
| Toolset (sister) | `github.com/umbraculum-dev/umbraculum-toolset` |

Record pass/fail and remediation commit SHAs in §6 when complete.

---

## 2. Secrets and identifiers

| # | Check | How | Pass? |
|---|--------|-----|-------|
| 2.1 | No API keys, tokens, or passwords in **tracked** files | `git grep -E '(api[_-]?key|secret|password|BEGIN (RSA|OPENSSH)|sk-ant-|sk-proj-)' -- ':!*.md' ':!docs/design/*'` + manual review of `.env.example` only placeholders | ☐ |
| 2.2 | Git history scan (optional deep pass) | `gitleaks detect` or `trufflehog git file://.` on both repos before flip | ☐ |
| 2.3 | Personal identifiers | `python3 scripts/docs/check-public-docs-no-personal-paths.py` + manual email review | ☑ paths (2026-05-27); emails manual |

---

## 3. Repository metadata (monorepo)

| # | Check | Expected | Pass? |
|---|--------|----------|-------|
| 3.1 | `package.json` `repository` / `bugs` | `github.com/umbraculum-dev/umbraculum-dev` | ☑ |
| 3.2 | Clone URLs in [`GETTING-STARTED.md`](../GETTING-STARTED.md) | `git@github.com:umbraculum-dev/umbraculum-dev.git` | ☑ |
| 3.3 | `internal/**` not linked from public docs | `python3 scripts/docs/check-public-docs-no-internal-links.py` | ☑ (2026-05-27 agent) |

### 3.5 Postgres schema split (RFC-0010)

Runbook: [`platform-brewery-postgres-schema-split.md`](platform-brewery-postgres-schema-split.md) (backup §3, migrate deploy §4, test DB §5).

| # | Check | How | Pass? |
|---|--------|-----|-------|
| 3.5.1 | Dev DB migration current | `docker compose exec -T api sh -c 'DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate deploy --schema prisma/schema.prisma'` exits 0 | ☐ |
| 3.5.2 | Test DB bootstrap (CI parity) | `docker compose exec -T api npm run test:db:prepare` — drops `reporting` schema before `migrate reset` (see runbook §5) | ☐ |
| 3.5.3 | Pre-DDL backup on maintainer machine | Confirm gitignored `backups/*_pre_schema_split_*.dump` exists OR re-run runbook §3 before any future DDL on shared dev DB | ☐ |
| 3.5.4 | Self-host / fresh-clone path documented | [`DEVELOPMENT.md`](../../DEVELOPMENT.md) (upgrade path: `prisma migrate deploy`) + runbook §4 | ☐ |

---

## 4. Tier: Public link graph

| # | Check | Command / action | Pass? |
|---|--------|------------------|-------|
| 4.1 | Module README structure | `python3 scripts/docs/check-readmes.py` (or CI `docs-readmes` workflow) | ☑ (21/21) |
| 4.2 | RFC companion links (optional) | `python3 scripts/docs/check-rfc-companion-links.py` | ☑ (10/10) |
| 4.3 | Docs site build | `npm run build -w @umbraculum/docs-site` in Node 20 container | ☑ |
| 4.4 | Brochure build | `npm run build -w @umbraculum/website` | ☑ |
| 4.5 | OpenAPI docs + static spec | [`API-OPENAPI.md`](../API-OPENAPI.md) linked from [`docs/README.md`](../README.md); `docs-site/static/openapi/openapi.json` present; docs build includes `API-OPENAPI` page | ☐ |

---

## 5. Legal and community files (both repos)

| # | Check | Pass? |
|---|--------|-------|
| 5.1 | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` present and aligned | ☐ |
| 5.2 | Contact emails in CoC / SECURITY are real monitored addresses on `umbraculum.dev` (not placeholders) | ☑ (2026-05-30 — `security@` + `conduct@` via Cloudflare Email Routing) |
| 5.3 | Toolset repo README / LICENSE parity with monorepo posture | ☑ (2026-05-30 — CoC + SECURITY added; see [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md)) |

---

## 6. Static surfaces pre-deploy

| # | Check | Pass? |
|---|--------|-------|
| 6.1 | Docs: `noIndex: true` + `static/robots.txt` disallow until flip ([`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts)) | ☑ |
| 6.2 | Brochure: `noindex` meta + `robots.txt` until flip (`apps/website/public/`) | ☑ |
| 6.3 | Cloudflare Pages projects configured per [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) | ☐ |
| 6.4 | DocSearch application submitted after docs URL live ([`docsearch-application-draft.md`](docsearch-application-draft.md)) | ☐ |
| 6.5 | Flip announcement reviewed ([`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md)) | ☐ |
| 6.6 | Community forum provisioned or scheduled ([`community-forum-runbook.md`](community-forum-runbook.md)) — §7 hardening + pinned **How we communicate** (§6 item 5 / §6.1); may trail flip by days but before first proposal cycle | ☐ |
| 6.7 | **Donation channel accounts (before flip)** — Liberapay `Umbraculum` + Buy Me a Coffee live; URLs match `/support/` — **roadmap Phase 2 `2d`** | ☐ |

---

## 7. Sign-off log

| Date | Repo | Stage 1 result | Notes |
|------|------|----------------|-------|
| 2026-05-27 | umbraculum-dev | **Partial (automated)** | Full report: [`public-alpha-preflip-hygiene-audit-2026-05-27.md`](public-alpha-preflip-hygiene-audit-2026-05-27.md). Maintainer sign-off still required for 2.2 gitleaks, 5.x legal mailboxes, 6.3–6.7 manual deploy/comms gates, toolset CoC/SECURITY. |
| 2026-05-29 | umbraculum-dev | **Automated prep complete** | Stage 1 closure per org-transfer plan: internal report at `internal/working-notes/pre-public-flip-hygiene-scan-2026-05-27.md` (not linked from public docs). Ready for maintainer flip when §5–§6 manual items close. |
