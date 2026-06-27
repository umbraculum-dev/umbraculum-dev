# umbraculum-toolset — pre-flip hygiene audit (sister repo)

**Tier:** Public  
**Status:** Agent-run 2026-05-27 on local clone — maintainer sign-off pending  
**Repo:** `github.com/umbraculum-dev/umbraculum-toolset` (private until Stage 2 flip)  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §5.3, [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md)

---

## Summary

| Check | Result |
|-------|--------|
| `LICENSE` (MIT) | **PASS** — present at repo root |
| `README.md` | **PASS** — describes four Cursor plugins + layout |
| `CONTRIBUTING.md` | **PASS** — present (DCO + hooks documented in README) |
| `CODE_OF_CONDUCT.md` | **PASS** — added 2026-05-30 (Contributor Covenant 2.1; `conduct@umbraculum.dev`) |
| `SECURITY.md` | **PASS** — added 2026-05-30 (toolset-scoped scope; `security@umbraculum.dev`) |
| Quick secret patterns in tracked tree | **PASS** — none found in sample scan |
| Maintainer-specific paths in `*.md` | **PASS** — none found |
| Parity with monorepo AGPL + MIT posture | **PASS** — toolset is MIT plugin source; root legal set now matches monorepo contacts |

---

## Gaps to close before flip (maintainer)

1. ~~**Add `CODE_OF_CONDUCT.md`**~~ — **DONE** 2026-05-30 in toolset root.
2. ~~**Add `SECURITY.md`**~~ — **DONE** 2026-05-30 in toolset root (toolset-scoped in/out of scope).
3. **Confirm `repository` URL** in any future `package.json` at toolset root (none today — acceptable for a non-npm meta-repo).
4. **Marketplace submission** — repo-root [`.cursor-plugin/marketplace.json`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/.cursor-plugin/marketplace.json) with `metadata.pluginRoot: cursor-plugins` (three listings; OpenPLC hook-only). Runbook: [`MARKETPLACE-C2-MANIFEST.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md). Submit at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).

---

## What was scanned

Clone path used: maintainer local `umbraculum-toolset` (sibling of monorepo).

Commands equivalent to monorepo Stage 1:

- Presence of legal / onboarding files
- `rg` for `sk-ant-`, `sk-proj-`, PEM headers — no hits
- `rg` for maintainer-specific home-directory path prefixes in markdown — no hits

**Not run:** `gitleaks` on toolset history (install on maintainer machine).

---

## Sign-off

| Date | Maintainer | Result |
|------|------------|--------|
| 2026-05-30 | Agent + maintainer | CoC + SECURITY closed; items 3–4 remain flip-day / optional |
| 2026-06-27 | Agent | Maintainer path scrub + history rewrite (`git filter-repo --replace-text` ×3); force-pushed `origin/master`. Full-history grep gate green on public flip checklist §2.3 terms. |
