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
| §6.6 forum | **PASS** (2026-06-08) | §7.5 complete: avatars, badges, digests, pinned proposal + **How we communicate**, registration + password-reset email; GitHub CoC links private until 2c (expected) |
| §6.4 DocSearch | **Deferred** | First step after atomic flip (maintainer M2) |
| §6.7 donations | **PASS** (2026-06-08) | Liberapay + Buy Me a Coffee live; `/support/` wired; `noindex` until 2c — expected |

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

## §6.6 forum (maintainer completion 2026-06-08)

Forum §7.5 recheck complete. Confirmed:

- Umbi default avatar URL; Gravatar + uploaded avatars disabled  
- Badges, user directory, user status disabled  
- Default digest never; reply-by-email off  
- Categories + pinned **How to write a proposal** (Proposals)  
- Pinned **How we communicate** (Community policy)  
- Registration + password-reset email deliver (Brevo / `forum@`)  
- Logged-out visitors read policy via pinned topics; GitHub doc links resolve after **2c**

---

## §6.6 forum gap (superseded — 2026-06-07 agent pass)

Forum responds; **Community policy** and **Proposals** categories exist. Not confirmed on this pass:

- Pinned **How we communicate** topic ([`community-forum-runbook.md`](community-forum-runbook.md) §6 item 5)
- [§7 anti-verticality hardening](community-forum-runbook.md) checklist (avatars, badges off, digest never, test email)

**Closed 2026-06-08** — see §6.6 forum (maintainer completion) above.

---

## Sign-off

| Role | Date | Result |
|------|------|--------|
| Agent execution pass | 2026-06-07 | Summary table above |
| Maintainer Stage 1 (2b) | 2026-06-08 | **Complete — cleared for 2c** |
| Maintainer forum §7.5 | 2026-06-08 | **Complete** |
