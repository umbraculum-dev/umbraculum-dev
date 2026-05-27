# Public alpha — pre-flip hygiene audit (automated pass)

**Tier:** Public  
**Status:** Agent-run 2026-05-27 — **not** maintainer sign-off (Stage 1 **2b** incomplete)  
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
| Personal path examples (2.3) | **REVIEW** — 13 public docs still use `~/dkprojects/rfapps/…` or `/home/rf/…` (see §3) |
| Toolset repo (5.3) | **NOT RUN** — requires clone |
| CoC/SECURITY live mailboxes (5.2) | **BLOCKED** — placeholders until flip |
| Cloudflare / DocSearch (6.3–6.4) | **MANUAL** |

---

## §2 Secrets (quick scan)

No live production API keys found in tracked TS/JS/YML. Expected dev-only values:

- `docker-compose.yml` — `postgres` / `pgpooladmin` passwords (local dev)
- `packages/i18n` — `sk-ant-…` placeholder string for BYOK UI
- `services/api/src/tests` — `sk-ant-test-1` test fixture

**Maintainer still required:** gitleaks / trufflehog history scan (checklist 2.2).

---

## §3 Personal path examples (maintainer review)

These **Tier: Public** docs embed a maintainer-specific clone path. They do not leak secrets but are poor first-impression on flip. Normalize to `<repo-root>` or `$REPO_ROOT` in a follow-up PR (not blocking CI today):

| File | Occurrences (approx.) |
|------|------------------------|
| `docs/PGPOOL-VERIFICATION.md` | 11 |
| `docs/DEVELOPMENT-NATIVE-LOCAL.md` | 6 |
| `docs/design/web-route-group-audit.md` | 4 (`/home/rf/.cursor/plans/…` plan paths) |
| `docs/POSTGRES-REPLICATION-ARCHITECTURE.md` | 2 |
| `docs/REACT-NATIVE-KICKOFF-READINESS.md` | 2 |
| Others (single hits) | `REDIS-ARCHITECTURE`, `CODING-STANDARDS`, `NATIVE-STRATEGY-AND-CI`, … |

---

## §4 CI commands (reproduce)

```bash
python3 scripts/docs/check-readmes.py
python3 scripts/docs/check-rfc-companion-links.py
python3 scripts/docs/check-public-docs-no-internal-links.py
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
