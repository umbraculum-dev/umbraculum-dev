# Public alpha — pre-flip hygiene checklist (Stage 1)

**Tier:** Public  
**Status:** Stage 1 **complete** (2026-06-08) — **2b signed off**; cleared for **2c** (DocSearch remains first step after flip)  
**Audience:** maintainer running Stage 1 before the atomic public flip (**2c**)  
**Related:** [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, [`ROADMAP.md`](../ROADMAP.md) Week 1 tail + Week 3 Stage 1, [RFC-0010](../rfcs/0010-platform-brewery-postgres-schema-split.md) runbook [`platform-brewery-postgres-schema-split.md`](platform-brewery-postgres-schema-split.md)

---

## 1. Scope

Run this checklist on **all three source repos** before Stage 2 §1 visibility flip:

| Repo | URL |
|------|-----|
| Monorepo | `github.com/umbraculum-dev/umbraculum-dev` |
| Toolset (sister) | `github.com/umbraculum-dev/umbraculum-toolset` |
| Brochure (sister) | `github.com/umbraculum-dev/umbraculum-brochure` — audit [`brochure-preflip-hygiene-audit-2026-06-26.md`](brochure-preflip-hygiene-audit-2026-06-26.md) |

Record pass/fail and remediation commit SHAs in §6 when complete.

---

## 2. Secrets and identifiers

| # | Check | How | Pass? |
|---|--------|-----|-------|
| 2.1 | No API keys, tokens, or passwords in **tracked** files | `git grep -E '(api[_-]?key|secret|password|BEGIN (RSA|OPENSSH)|sk-ant-|sk-proj-)' -- ':!*.md' ':!docs/design/*'` + manual review of `.env.example` only placeholders | ☑ (2026-06-07 — UI/GHA/LICENSE only; see [`public-alpha-preflip-hygiene-audit-2026-06-07.md`](public-alpha-preflip-hygiene-audit-2026-06-07.md)) |
| 2.2 | Git history scan (optional deep pass) | `gitleaks detect` or `trufflehog git file://.` on both repos before flip | ☑ (2026-06-07 — toolset 0; dev 48 FP beerjson keys reviewed) |
| 2.3 | Personal identifiers | `python3 scripts/docs/check-public-docs-no-personal-paths.py` + per-developer gitignored denylist (see [`public-surface-personal-identifier-hygiene.md`](public-surface-personal-identifier-hygiene.md)) + manual email review | ☑ paths (2026-05-27); emails manual |

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
| 3.5.1 | Dev DB migration current | `docker compose exec -T api sh -c 'DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate deploy --schema prisma/schema.prisma'` exits 0 | ☑ (2026-06-07) |
| 3.5.2 | Test DB bootstrap (CI parity) | `docker compose exec -T api npm run test:db:prepare` — drops `reporting` schema before `migrate reset` (see runbook §5) | ☑ (2026-06-07) |
| 3.5.3 | Pre-DDL backup on maintainer machine | Confirm gitignored `backups/*_pre_schema_split_*.dump` exists OR re-run runbook §3 before any future DDL on shared dev DB | ☑ (2026-05-28 dumps) |
| 3.5.4 | Self-host / fresh-clone path documented | [`DEVELOPMENT.md`](../../DEVELOPMENT.md) (upgrade path: `prisma migrate deploy`) + runbook §4 | ☑ |

---

## 4. Tier: Public link graph

| # | Check | Command / action | Pass? |
|---|--------|------------------|-------|
| 4.1 | Module README structure | `python3 scripts/docs/check-readmes.py` (or CI `docs-readmes` workflow) | ☑ (21/21; GHA `docs-readmes` green 2026-06-08) |
| 4.2 | RFC companion links (optional) | `python3 scripts/docs/check-rfc-companion-links.py` | ☑ (10/10) |
| 4.3 | Docs site build | `npm run build -w @umbraculum/docs-site` in Node 20 container | ☑ |
| 4.4 | Brochure build | `npm run build` in `umbraculum-brochure` | ☑ |
| 4.5 | OpenAPI docs + static spec | [`API-OPENAPI.md`](../API-OPENAPI.md) linked from [`docs/README.md`](../README.md); `docs-site/static/openapi/openapi.json` synced via `prebuild` + `python3 scripts/docs/check-docs-site-openapi-sync.py` | ☑ (2026-06-07) |

---

## 5. Legal and community files (both repos)

| # | Check | Pass? |
|---|--------|-------|
| 5.1 | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` present and aligned | ☑ (2026-06-07 — both repos; AGPL dev + MIT toolset; see audit 2026-06-07) |
| 5.2 | Contact emails in CoC / SECURITY are real monitored addresses on `umbraculum.dev` (not placeholders) | ☑ (2026-05-30 — `security@` + `conduct@` via Cloudflare Email Routing) |
| 5.3 | Toolset repo README / LICENSE parity with monorepo posture | ☑ (2026-05-30 — CoC + SECURITY added; see [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md)) |

---

## 6. Static surfaces pre-deploy

| # | Check | Pass? |
|---|--------|-------|
| 6.1 | Docs: `noIndex: true` + `static/robots.txt` disallow until flip ([`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts)) | ☑ |
| 6.2 | Brochure: `noindex` meta + `robots.txt` until flip (`umbraculum-brochure` `public/`) | ☑ |
| 6.3 | Cloudflare Pages projects configured per [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) | ☑ (2026-06-07 — Workers + custom domains 200; pre-flip noindex) |
| 6.4 | DocSearch application submitted after docs URL live ([`docsearch-application-draft.md`](docsearch-application-draft.md)) | ☐ (**first step after 2c** — docs.umbraculum.dev already deployed with pre-flip `noindex`) |
| 6.5 | Flip announcement reviewed ([`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md)) | ☑ (2026-06-08 — draft reviewed; **publish at 2c** only; fill `[Name]` / `[Date]` / `[Contact]` on flip day) |
| 6.6 | Community forum provisioned — **live** at [forum.umbraculum.dev](https://forum.umbraculum.dev/) ([`community-forum-runbook.md`](community-forum-runbook.md)) — §7 hardening + pinned **How we communicate** (§6 item 5 / §6.1) | ☑ (2026-06-08 — §7.5 complete; **production host live pre-flip**) |
| 6.7 | **Donation channel accounts (before flip)** — Liberapay `Umbraculum` + Buy Me a Coffee live; URLs match `/support/` — **roadmap Phase 2 `2d`** | ☑ (2026-06-26 — re-verified live at [umbraculum.dev/support/](https://umbraculum.dev/support/); page stays `noindex` until 2c — expected) |

**Docs-site flip coordination:** see [docs-site-flip-runbook.md](docs-site-flip-runbook.md) (noIndex removal, brochure vendor sync, DocSearch, Cloudflare deploy).

---

## 7. Sign-off log

### Maintainer flip checklist (Step 4 — 2026-06-07)

Answers from [RFC-0011 pre-flip closure](rfc-0011-pre-flip-closure.md) Step 4:

| # | Question | Answer (maintainer) |
|---|----------|---------------------|
| M1 | **Flip window** | **July 2026. Atomic flip** — one coordinated go-live: monorepo + toolset + docs + brochure public together; forum may complete pre-flip; DocSearch is first step after flip (M2). |
| M2 | **Manual hygiene — what runs when** | **Before flip (execute):** §2.2 gitleaks, §3.5 Postgres, §5.1 legal (both repos), §6.3 Cloudflare Pages, §6.6 forum. **First step after flip:** §6.4 DocSearch. **Not a flip blocker:** §6.7 donations. |
| M3 | **Platform profile — document vs demo** | **Document pre-flip:** yes — [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) + [`platform-module-profile.md`](platform-module-profile.md). **Demo:** no second hosted SKU — `demo.umbraculum.dev` keeps **reference profile** (core + brewery) as the public vertical example; platform-only is self-host via `UMBRACULUM_MODULE_PROFILE=platform`. |
| M4 | **Second native app scaffold** | **Post-alpha** — decide **PIM handheld vs quality** after structure is stable; [backbone §13](pre-flip-application-surface-backbone.md). |
| M5 | **Docs deploy + noIndex on flip day** | **Solo maintainer** — Cloudflare deploy, noIndex removal, brochure sync, then DocSearch (M2). |

#### M2 — what each manual item means (maintainer decisions 2026-06-07)

| Checklist ref | What it is | Decision |
|---------------|------------|----------|
| **§2.2 gitleaks** | Scan **git history** for leaked secrets in umbraculum-dev **and** umbraculum-toolset. | **Do before flip** |
| **§3.5 Postgres** | RFC-0010 schema split: migrations current, backup discipline, fresh-clone docs. | **Do before flip** |
| **§5.1 legal files** | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` in **both** repos. | **Do before flip** |
| **§6.3 Cloudflare Pages** | Docs + brochure build/deploy from GitHub. | **Do before flip** |
| **§6.4 DocSearch** | Algolia search on docs.umbraculum.dev (needs indexable URL). | **First action immediately after flip** |
| **§6.6 Community forum** | forum.umbraculum.dev + pinned governance. | **Do before flip** |
| **§6.7 Donations** | Liberapay + Buy Me a Coffee; `/support/` links. **Not** “keep donations secret pre-flip” — only “links work when `/support/` is public.” | **Not required for flip** |

#### M2 — pre-flip execution queue

1. §2.2 — gitleaks (both repos)  
2. §3.5 — Postgres runbook checklist  
3. §5.1 — legal parity (both repos)  
4. §6.3 — Cloudflare Pages  
5. §6.6 — forum provisioned  

**Immediately after atomic flip:** §6.4 DocSearch ([`docsearch-application-draft.md`](docsearch-application-draft.md)).

**Execution pass:** [`public-alpha-preflip-hygiene-audit-2026-06-07.md`](public-alpha-preflip-hygiene-audit-2026-06-07.md).

### 7.1 Remaining maintainer actions before 2c

Stage 1 automated + forum gates are **complete** (2026-06-08). Only **2c** and post-flip steps remain:

| # | Action | Where | Time | Status |
|---|--------|-------|------|--------|
| **A** | **Forum §7.5 recheck** | [Discourse Admin](https://forum.umbraculum.dev/admin) + pinned topics | ~30 min | ☑ **Complete** (2026-06-08) |
| **B** | **Run 2c flip-day runbook** | [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) | flip window | Not started |
| **C** | **DocSearch application** | [`docsearch-application-draft.md`](docsearch-application-draft.md) | first step **after** 2c | Deferred (by design) |

**Pre-flip complete:** donation accounts (§6.7), docs + brochure deploy (§6.3), announcement draft (§6.5), forum §7.5 (§6.6).

#### Forum §7.5 recheck (step A — complete 2026-06-08)

Maintainer confirmed all seven [runbook §7.5](community-forum-runbook.md) items:

1. ☑ Default avatar (Umbi URL); uploads + Gravatar off  
2. ☑ Badges off; trust badges off; user directory off  
3. ☑ New-user digest default = never; reply-by-email off; `disable emails` = no  
4. ☑ Five categories; pinned **How to write a proposal** in Proposals  
5. ☑ Pinned **How we communicate** in Community policy  
6. ☑ Registration + password-reset email deliver  
7. ☑ Policy readable logged out via pinned topics (`conduct@` in topic body); GitHub CoC URLs private until **2c** — expected

#### 2c flip-day sequence (step B — when ready)

1. **Three source repos → Public** (same session): `umbraculum-dev` + `umbraculum-toolset` + `umbraculum-brochure` (see flip-day runbook §1; hosting repos already public)
2. Tag and push **`v0.0.1-alpha`**
3. Remove `noindex` / `robots.txt` disallow on **brochure** + **docs-site** → redeploy Cloudflare Workers
4. Publish [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md) (GitHub release + forum cross-post)
5. Start Cursor marketplace submission (same day)
6. **Step C:** submit DocSearch / Algolia application

---

### Historical entries

| Date | Repo | Stage 1 result | Notes |
|------|------|----------------|-------|
| 2026-06-08 | umbraculum-dev + toolset | **Stage 1 complete — 2b signed off; cleared for 2c** | Forum §7.5 ☑ (maintainer); donations ☑; docs/brochure live with pre-flip `noindex`; announcement draft reviewed; GHA `docs-readmes` green. Post-flip: §6.4 DocSearch first. |
| 2026-06-07 | umbraculum-dev + toolset | **Stage 1 mostly complete** | Gitleaks, Postgres, legal, Cloudflare ☑; forum §7.5 partial; DocSearch post-flip; donations optional. Audit: [`public-alpha-preflip-hygiene-audit-2026-06-07.md`](public-alpha-preflip-hygiene-audit-2026-06-07.md). |
| 2026-05-27 | umbraculum-dev | **Partial (automated)** | Full report: [`public-alpha-preflip-hygiene-audit-2026-05-27.md`](public-alpha-preflip-hygiene-audit-2026-05-27.md). Maintainer sign-off still required for 2.2 gitleaks, 5.x legal mailboxes, 6.3–6.7 manual deploy/comms gates, toolset CoC/SECURITY. |
| 2026-05-29 | umbraculum-dev | **Automated prep complete** | Stage 1 closure per org-transfer plan: internal report at `internal/working-notes/pre-public-flip-hygiene-scan-2026-05-27.md` (not linked from public docs). Ready for maintainer flip when §5–§6 manual items close. |
