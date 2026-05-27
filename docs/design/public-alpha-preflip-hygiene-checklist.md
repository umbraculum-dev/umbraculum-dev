# Public alpha — pre-flip hygiene checklist (Stage 1)

**Tier:** Public  
**Status:** v1 working checklist for Phase 2 **2b**  
**Audience:** maintainer running Stage 1 before the atomic public flip (**2c**)  
**Related:** [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, [`ROADMAP.md`](../ROADMAP.md) Week 3 Stage 1

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
| 2.3 | Personal identifiers | Search maintainer home paths, personal emails, private hostnames in `Tier: Public` docs | ☐ |

---

## 3. Repository metadata (monorepo)

| # | Check | Expected | Pass? |
|---|--------|----------|-------|
| 3.1 | `package.json` `repository` / `bugs` | `github.com/umbraculum-dev/umbraculum-dev` | ☐ |
| 3.2 | Clone URLs in [`GETTING-STARTED.md`](../GETTING-STARTED.md) | `git@github.com:umbraculum-dev/umbraculum-dev.git` | ☐ |
| 3.3 | `internal/**` not linked from public docs | `rg 'internal/' docs --glob '*.md'` — no accidental links | ☐ |

---

## 4. Tier: Public link graph

| # | Check | Command / action | Pass? |
|---|--------|------------------|-------|
| 4.1 | Module README structure | `python3 scripts/docs/check-readmes.py` (or CI `docs-readmes` workflow) | ☐ |
| 4.2 | RFC companion links (optional) | `python3 scripts/docs/check-rfc-companion-links.py` | ☐ |
| 4.3 | Docs site build | `npm run build -w @umbraculum/docs-site` in Node 20 container | ☐ |
| 4.4 | Brochure build | `npm run build -w @umbraculum/website` | ☐ |

---

## 5. Legal and community files (both repos)

| # | Check | Pass? |
|---|--------|-------|
| 5.1 | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` present and aligned | ☐ |
| 5.2 | Contact emails in CoC / SECURITY are real monitored addresses on `umbraculum.dev` (not placeholders) | ☐ |
| 5.3 | Toolset repo README / LICENSE parity with monorepo posture | ☐ |

---

## 6. Static surfaces pre-deploy

| # | Check | Pass? |
|---|--------|-------|
| 6.1 | Docs: `noIndex: true` + `static/robots.txt` disallow until flip ([`docs-site/docusaurus.config.ts`](../../docs-site/docusaurus.config.ts)) | ☐ |
| 6.2 | Brochure: `noindex` meta + `robots.txt` until flip (`apps/website/public/`) | ☐ |
| 6.3 | Cloudflare Pages projects configured per [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) | ☐ |
| 6.4 | DocSearch application submitted after docs URL live ([`docsearch-application-draft.md`](docsearch-application-draft.md)) | ☐ |

---

## 7. Sign-off log

| Date | Repo | Stage 1 result | Notes |
|------|------|----------------|-------|
| — | — | Not run | Agent-prepared checklist only |
