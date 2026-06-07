# Public alpha — pre-flip hygiene audit (automated pass)

**Tier:** Public  
**Status:** Agent-run 2026-05-27 — Stage 1 automated prep **complete** 2026-05-29 (maintainer flip gates: toolset CoC/SECURITY, live mailboxes, Cloudflare — see checklist §7)  
**Repo:** `umbraculum-dev/umbraculum-dev` only (toolset sister repo not scanned)  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md)

---

## Summary

| Area | Result |
|------|--------|
| Module READMEs | **PASS** — 20/20 (`check-readmes.py`) |
| RFC companion links | **PASS** — 10/10 |
| Web URL segments | **PASS** — 0 violations |
| Public docs → `internal/` links | **PASS** (after remediation `TBD`) — `check-public-docs-no-internal-links.py` |
| Docs-site build | **PASS** |
| Brochure build | **PASS** |
| Repo metadata (3.1–3.2) | **PASS** |
| Secrets in tracked code (2.1 quick) | **PASS** — dev placeholders only (`postgres`, `sk-ant-…` UI copy, test keys) |
| Personal path examples (2.3) | **PASS** (2026-05-27) — normalized to `$REPO_ROOT`; `check-public-docs-no-personal-paths.py` |
| Toolset repo (5.3) | **PARTIAL** — [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md) |
| CoC/SECURITY live mailboxes (5.2) | **BLOCKED** — placeholders until flip |
| Cloudflare / DocSearch (6.3–6.4) | **MANUAL** |

---

## §2 Secrets (quick scan)

No live production API keys found in tracked TS/JS/YML. Expected dev-only values:

- `docker-compose.yml` — `postgres` / `pgpooladmin` passwords (local dev)
- `packages/platform/i18n` — `sk-ant-…` placeholder string for BYOK UI
- `services/api/src/tests` — `sk-ant-test-1` test fixture

**Maintainer still required:** gitleaks / trufflehog history scan (checklist 2.2).

---

## §3 Personal path examples

Remediated 2026-05-27: public docs use `$REPO_ROOT` (documented in [`DEVELOPMENT.md`](../DEVELOPMENT.md)). Denylist setup: [`public-surface-personal-identifier-hygiene.md`](public-surface-personal-identifier-hygiene.md). CI: `check-public-docs-no-personal-paths.py`.

---

## §4 CI commands (reproduce)

```bash
python3 scripts/docs/check-readmes.py
python3 scripts/docs/check-rfc-companion-links.py
python3 scripts/docs/check-public-docs-no-internal-links.py
python3 scripts/docs/check-public-docs-no-personal-paths.py
npm run check-web-url-segments
npm run build -w @umbraculum/docs-site   # Node 20 container
node apps/website/scripts/build.mjs
```

---

## Remediation in this audit tranche

- Removed markdown links from public `docs/**` into `internal/` (4 files).
- Added `scripts/docs/check-public-docs-no-internal-links.py` to `docs-readmes` workflow.

---

## Sign-off

| Role | Date | Result |
|------|------|--------|
| Agent automated pass | 2026-05-27 | See summary table |
| Maintainer Stage 1 | — | Pending |
