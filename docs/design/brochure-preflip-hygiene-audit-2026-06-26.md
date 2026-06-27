# umbraculum-brochure — pre-flip hygiene audit

**Tier:** Public  
**Status:** Audit **2026-06-26** — tracked content clean; git author metadata remediated before §1 flip  
**Repo:** `github.com/umbraculum-dev/umbraculum-brochure` (private until Stage 2 §1)  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §2, [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §1

---

## Scope

Static marketing site only: HTML/CSS, announcement config, Wrangler static-assets config, GHA build workflow. No API, no `.env`, no Cloudflare account IDs or API tokens in tree.

---

## Checks run (2026-06-26)

| Check | Result | Notes |
|-------|--------|-------|
| Tracked-file secret grep (`api_key`, `ghp_`, `AKIA`, PEM blocks, home paths) | **PASS** | 0 hits across 18 tracked files |
| `gitleaks detect` (full history, 5 commits) | **PASS** | `no leaks found` |
| Personal path patterns (home-directory and workspace-tree shapes) | **PASS** | None in tracked content |
| Private IPs / personal consumer email in content | **PASS** | None |
| `.gitignore` covers `dist/`, `.env*`, `.wrangler/` | **PASS** | `dist/` not tracked |
| `wrangler.toml` | **PASS** | Worker name + assets dir only — no secrets |
| Git author metadata | **REMEDIATED** | Commits 2–5 used maintainer Gmail in Author/Committer; rewritten to `Umbraculum contributors <umbraculum-dev@proton.me>` via `git filter-repo --mailmap` before push |

---

## Intentional public content (not secrets)

These are **policy copy**, synced from umbraculum-dev donation/support docs — safe to publish:

- Liberapay / Buy Me a Coffee public profile URLs
- Infrastructure cost bands (forum ~€4–10/mo, demo €5/mo)
- Maintainer AI tooling reference baseline ($200/mo Cursor Ultra + ~$100/mo API — transparency for sponsorship)
- `noindex` / `robots.txt` disallow until Stage 2 §3

---

## Maintainer action before §1 flip

1. Confirm remote history uses project email only:

   ```bash
   cd /path/to/umbraculum-brochure
   git fetch origin
   git log origin/main --format='%an <%ae>' | sort -u
   # expect umbraculum-dev@proton.me only
   ```

2. Flip visibility with monorepo + toolset in the same session ([`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §1).

**Done 2026-06-26:** mailmap rewrite force-pushed to `origin/main` (`9f70a37`).

---

## Sign-off

| Date | Auditor | Verdict |
|------|---------|---------|
| 2026-06-26 | Agent | Tracked tree + gitleaks **PASS**; author mailmap rewrite **force-pushed** to `origin/main` (`9f70a37`) |
