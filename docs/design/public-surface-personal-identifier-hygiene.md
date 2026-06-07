# Public-surface personal-identifier hygiene

**Tier:** Public  
**Audience:** contributors and maintainers before the public α flip  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §2.3, [`DEVELOPMENT.md`](../../DEVELOPMENT.md), [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

---

## Goal

Public docs, module READMEs, i18n source catalogs, and selected root markdown must not embed maintainer-specific home-directory paths, employer codenames, or personal contact strings. CI enforces a baseline; each developer can extend checks locally without ever committing personal terms.

---

## Checker

```bash
python3 scripts/docs/check-public-docs-no-personal-paths.py
```

Also runs in the `docs-readmes` CI job (see [`.umbraculum/ci-parity.json`](../../.umbraculum/ci-parity.json)).

On failure, violations name the file and line and report `path pattern` or `denylist substring` — **never the matched personal term** (so logs stay safe to paste).

---

## What is scanned

- `docs/**` (selected audit docs excluded)
- Module READMEs under `apps/`, `services/`, `packages/` (skips `node_modules`)
- Root `DEVELOPMENT*.md`, `apps/native/EAS-DEMO-SETUP.md`
- `packages/platform/i18n/src/en.json` and `it.json`
- `packages/platform/test-mcp/README.md` and `src/server.ts`

Use `$REPO_ROOT` in prose instead of absolute clone paths (see [`DEVELOPMENT.md`](../../DEVELOPMENT.md)).

---

## Denylist layers (merged, deduped)

| Layer | Git status | Use for |
|-------|------------|---------|
| Path regexes in the checker script | Committed | Generic home-directory and workspace-tree patterns (see `PATH_PATTERNS` in the checker) |
| [`scripts/docs/public-surface-denylist.txt`](../../scripts/docs/public-surface-denylist.txt) | Committed | **Shared, non-personal** substrings only (e.g. sister-repo path fragments the whole team must avoid) |
| [`scripts/docs/.public-surface-denylist.txt`](../../scripts/docs/.public-surface-denylist.txt) | **Gitignored** | Your personal / employer-specific substrings (one per line) |
| `PUBLIC_SURFACE_DENYLIST` in repo-root `.env` | **Gitignored** | Same as the local file; comma-separated. Auto-read when not exported in the shell |

**Do not put personal names, emails, or handles in the committed denylist** — that defeats history scrub and re-leaks identifiers into git forever.

Copy [`scripts/docs/public-surface-denylist.example.txt`](../../scripts/docs/public-surface-denylist.example.txt) for the local-file shape; see [`.env.sample`](../../.env.sample) for the env var.

### Example local entries (placeholders — substitute your own)

```text
# .public-surface-denylist.txt or PUBLIC_SURFACE_DENYLIST=
MY/EMPLOYER/CODENAME
mypersonalemail@me.com
My Full Name
```

Avoid very short tokens (three-letter words match inside normal English: *report*, *important*, …). Prefer emails, codenames, and multi-word phrases.

---

## CI vs local

- **CI** runs path regexes + the **committed** denylist only.
- **Local** runs all three denylist layers when your gitignored file and/or `.env` are present.

Run the checker locally before pushing doc or README edits that might carry machine-specific paths.

---

## Optional: scrub git history

One-time history rewrite (maintainer-only, coordinate with all clones):

1. Copy [`scripts/docs/personal-history-scrub-expressions.example.txt`](../../scripts/docs/personal-history-scrub-expressions.example.txt) to `scripts/docs/.personal-history-scrub-expressions.txt` (gitignored).
2. Fill `old==>new` pairs using **your** legacy strings (never commit that file).
3. Run `bash scripts/docs/scrub-personal-identifiers-from-history.sh` and force-push only after confirming no other active clones.

Example expression shape (placeholders):

```text
MY/EMPLOYER/CODENAME==>neutral-project-codename
mypersonalemail@me.com==>demo@umbraculum.dev
/home/<USERNAME>/MY/HOME/PATH/==>REPO_ROOT/
~/MY/HOME/PATH/my-clone==>$REPO_ROOT
```

---

## See also

- [`scripts/docs/check-public-docs-no-internal-links.py`](../../scripts/docs/check-public-docs-no-internal-links.py) — no links from public docs into `internal/`
- [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) — full Stage 1 gate list
