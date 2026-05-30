# Pre-public-flip hygiene scan (Stage 1)

**Tier:** Internal (not published on docs site)  
**Date:** 2026-05-27 (updated 2026-05-29 — org-transfer plan Stage 1 closure)  
**Repos scanned:** `umbraculum-dev/umbraculum-dev` (full automated pass); `umbraculum-dev/umbraculum-toolset` (partial — see sister audit)  
**Public companion:** [`docs/design/public-alpha-preflip-hygiene-audit-2026-05-27.md`](../../docs/design/public-alpha-preflip-hygiene-audit-2026-05-27.md), [`docs/design/public-alpha-preflip-hygiene-checklist.md`](../../docs/design/public-alpha-preflip-hygiene-checklist.md)

---

## Executive summary

| Area | Result | Blocker for flip? |
|------|--------|-------------------|
| Stage 0 org transfer | **PASS** | No |
| GitHub Actions on org push | **PASS** (all workflows green per maintainer 2026-05-27) | No |
| URL canonicalization | **PASS** | No |
| Module READMEs + public doc link graph | **PASS** | No |
| Docs-site + brochure builds | **PASS** | No |
| `@brewery/*` migration (slots 1–14) | **PASS** (closed 2026-05-19) | No |
| MIT npm SDK batch | **PASS** (published 2026-05-29) | No |
| Git history secret scan (gitleaks) | **NOT RUN** (tool absent on scan host) | Maintainer optional deep pass |
| Toolset CoC + SECURITY | **PASS** (2026-05-30) | No — added in umbraculum-toolset |
| Live contact mailboxes | **PASS** (2026-05-30) | No — `security@` + `conduct@` via Cloudflare Email Routing |
| Cloudflare Pages + DNS | **MANUAL** | Yes — maintainer |
| Repo visibility → public | **PENDING** | Yes — maintainer (atomic with toolset) |

**Stage 1 automated prep:** **complete.** Maintainer sign-off required for §5–§6 manual gates before executing [`public-alpha-flip-day-runbook.md`](../../docs/design/public-alpha-flip-day-runbook.md).

---

## Stage 0 — Org transfer (2026-05-27)

| Check | Result |
|-------|--------|
| Repo at `github.com/umbraculum-dev/umbraculum-dev` | **PASS** — private |
| Sister-repo `umbraculum-toolset` under same org | **PASS** — private |
| Git history rewrite (orphan `main`) before transfer | **PASS** — user confirmed |
| Commits + tags preserved on org repo | **PASS** — user confirmed |
| Workflows preserved in GitHub UI | **PASS** |
| Org push smoke (`6a1ea92`, `53cad6d`) | **PASS** |
| Full CI matrix green | **PASS** — maintainer confirmed 2026-05-27 |
| `package.json` `repository` / `bugs` URLs | **PASS** — `umbraculum-dev/umbraculum-dev` |
| Zero stale personal-org URL strings in repo | **PASS** — grep 2026-05-29 |

---

## §2 Secrets and identifiers

### 2.1 Tracked files (quick scan)

**PASS** — dev placeholders only (`postgres` in compose, `sk-ant-…` UI copy, test fixtures). See public audit §2.

### 2.2 Git history (gitleaks / trufflehog)

**NOT RUN** on 2026-05-29 — `gitleaks` not installed on scan host.

**Maintainer action (recommended before flip):**

```bash
# Install gitleaks once, then per repo:
gitleaks detect --source . --no-banner
```

Post-rewrite history is short; risk is lowered but not zero.

### 2.3 Personal paths in public docs

**PASS** — `python3 scripts/docs/check-public-docs-no-personal-paths.py` (2026-05-27).

---

## §3 Repository metadata

| Check | Command | Result |
|-------|---------|--------|
| Module READMEs | `python3 scripts/docs/check-readmes.py` | **21/21 OK** |
| Public → internal links | `python3 scripts/docs/check-public-docs-no-internal-links.py` | **OK** |
| RFC companion links | `python3 scripts/docs/check-rfc-companion-links.py` | **10/10 OK** |
| Web URL segments | `npm run check-web-url-segments` | **OK** |
| Docs site build | `npm run build -w @umbraculum/docs-site` | **PASS** (CI) |
| Brochure build | `npm run build -w @umbraculum/website` | **PASS** (CI) |

---

## §5 Toolset sister repo

Partial audit: [`docs/design/toolset-preflip-hygiene-audit-2026-05-27.md`](../../docs/design/toolset-preflip-hygiene-audit-2026-05-27.md).

| Gap | Status |
|-----|--------|
| `CODE_OF_CONDUCT.md` at toolset root | **OPEN** |
| `SECURITY.md` at toolset root | **OPEN** |

---

## §6 Static surfaces

| Surface | Pre-flip gate | Status |
|---------|---------------|--------|
| Brochure `noindex` + `robots.txt` disallow | Until flip | **SET** |
| Docs-site `noIndex` + `robots.txt` | Until flip | **SET** |
| Cloudflare Pages projects | Maintainer | **PENDING** |
| DocSearch application | After docs URL live | **PENDING** |

---

## Sign-off

| Role | Date | Result |
|------|------|--------|
| Agent automated pass | 2026-05-27 | See public audit |
| Agent Stage 1 closure (org-transfer plan) | 2026-05-29 | Automated prep **complete**; manual flip gates listed above |
| Maintainer flip authorization | — | Pending — execute flip-day runbook when §5–§6 gaps closed |
