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
| `CODE_OF_CONDUCT.md` | **GAP** — not present at toolset root |
| `SECURITY.md` | **GAP** — not present at toolset root |
| Quick secret patterns in tracked tree | **PASS** — none found in sample scan |
| Maintainer-specific paths in `*.md` | **PASS** — none found |
| Parity with monorepo AGPL + MIT posture | **PARTIAL** — toolset is MIT plugin source; monorepo has full legal set |

---

## Gaps to close before flip (maintainer)

1. **Add `CODE_OF_CONDUCT.md`** — can mirror monorepo [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md) with same enforcement contacts once mailboxes exist.
2. **Add `SECURITY.md`** — can mirror or shorten monorepo [`SECURITY.md`](../../SECURITY.md); plugin repos still need a reporting path.
3. **Confirm `repository` URL** in any future `package.json` at toolset root (none today — acceptable for a non-npm meta-repo).
4. **Marketplace submission** — verify `cursor-plugins/.cursor-plugin/marketplace.json` points at public URLs only after visibility flip.

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
| — | — | Gaps § “Gaps to close” open |
