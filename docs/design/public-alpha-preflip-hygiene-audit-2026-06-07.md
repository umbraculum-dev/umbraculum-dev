# Public alpha — pre-flip hygiene audit (execution pass)

**Tier:** Public  
**Status:** Agent + maintainer execution pass 2026-06-07  
**Repos:** `umbraculum-dev` + `umbraculum-toolset` (local clones)  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §7 M2 queue

---

## Summary

| Checklist | Result | Notes |
|-----------|--------|-------|
| §2.1 tracked secrets grep | **PASS** | UI `password` fields, GHA `${{ secrets.* }}`, LICENSE prose only |
| §2.2 gitleaks history | **PASS** (reviewed) | toolset: 0 leaks; dev: 48 hits = **false positives** (beerjson `labelKey` i18n strings, historical `packages/beerjson/` paths) |
| §3.5.1 dev migrate deploy | **PASS** | 64 migrations; no pending |
| §3.5.2 test DB prepare | **PASS** | `npm run test:db:prepare` green |
| §3.5.3 pre-DDL backup | **PASS** | `backups/brewapp_pre_schema_split_20260528_*.dump` present |
| §3.5.4 fresh-clone docs | **PASS** | [`DEVELOPMENT.md`](../DEVELOPMENT.md) upgrade path + RFC-0010 runbook |
| §5.1 legal (both repos) | **PASS** | All four files present; AGPL (dev) + MIT (toolset) intentional; `security@` / `conduct@` in SECURITY/CoC |
| §6.3 Cloudflare / Workers | **PASS** | Custom domains + workers.dev previews HTTP 200; `docs-site/wrangler.toml` present; `robots.txt` + `noindex` pre-flip |
| §6.6 forum | **PARTIAL** | `forum.umbraculum.dev` live; categories visible; **§7.5 hardening + pinned “How we communicate” not verified** |
| §6.4 DocSearch | **Deferred** | First step after atomic flip (maintainer M2) |
| §6.7 donations | **Deferred** | Not a flip blocker (maintainer M2) |

---

## §2.2 gitleaks detail

Commands (Docker image `zricethezav/gitleaks:latest`):

```bash
docker run --rm -v "$PWD":/repo -w /repo zricethezav/gitleaks:latest detect --log-opts="--all"
```

| Repo | Commits scanned | Leaks | Verdict |
|------|-----------------|-------|---------|
| umbraculum-toolset | 38 | 0 | Clean |
| umbraculum-dev | 289 | 48 | All `generic-api-key` on `yeastPitchRate*` **labelKey** strings in beerjson source/dist (not credentials) |

**Do not** scan the working tree with `--no-git` including `apps/web/.next/` — webpack cache triggers hundreds of false positives.

---

## §6.3 URL smoke (2026-06-07)

| URL | HTTP |
|-----|------|
| `https://docs.umbraculum.dev/` | 200 |
| `https://umbraculum.dev/` | 200 |
| `https://umbraculum-brochure.umbraculum-dev.workers.dev/` | 200 |
| `https://umbraculum-dev-docs-docusaurus.umbraculum-dev.workers.dev/` | 200 |
| `https://demo.umbraculum.dev/api/health` | 200 |

Pre-flip SEO: docs + brochure `robots.txt` include `Disallow: /`; docs HTML contains `noindex`.

---

## §6.6 forum gap (maintainer ~30 min)

Forum responds; **Community policy** and **Proposals** categories exist. Not confirmed on this pass:

- Pinned **How we communicate** topic ([`community-forum-runbook.md`](community-forum-runbook.md) §6 item 5)
- [§7 anti-verticality hardening](community-forum-runbook.md) checklist (avatars, badges off, digest never, test email)

Complete §7.5 in Discourse Admin, then tick §6.6 in the main checklist.

---

## Sign-off

| Role | Date | Result |
|------|------|--------|
| Agent execution pass | 2026-06-07 | Summary table above |
| Maintainer forum §7 | — | Pending |
