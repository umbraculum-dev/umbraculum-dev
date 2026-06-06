# Web brewery tree consolidation — move inventory

**Tier:** Public  
**Status:** Executed — legacy `apps/web/app/recipes/` removed (2026-06-06)  
**Audience:** agents and maintainers navigating brewery web routes  
**Related:** [`forkable-repo-cleanliness-audit.md`](forkable-repo-cleanliness-audit.md), [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) § Finding vertical module code on web, RFC-0002 / RFC-0006 β layout

---

## Summary

| Source | Target | Action |
|--------|--------|--------|
| `apps/web/app/recipes/[id]/edit/**` | `apps/web/app/[locale]/(brewery)/recipes/[id]/edit/**` | Move impl; delete re-export shim |
| `apps/web/app/recipes/[id]/water/**` | `…/(brewery)/recipes/[id]/water/**` | Move impl (hub + mash/sparge/boil segments) |
| `apps/web/app/recipes/[id]/brew-sessions/**` | `…/(brewery)/recipes/[id]/brew-sessions/**` | Move impl |
| `apps/web/app/recipes/[id]/yeast/**` | `…/(brewery)/recipes/[id]/yeast/**` | Move impl |
| `apps/web/app/recipes/_lib/**` | `…/(brewery)/recipes/_lib/**` | Merge (`beerjsonRecipe.ts`) |
| `apps/web/app/recipes/_components/**` | `…/(brewery)/recipes/_components/**` | Merge (YeastEditor, nav) |
| `(brewery)/recipes/page.tsx`, `import/` | unchanged | Already β impl |
| `(brewery)/recipes/[id]/versions/**` | unchanged | Already β impl (not in legacy tree) |
| `(platform)/recipes/**` | unchanged | Platform admin — not brewery |

**File counts (pre-move):** ~253 TS/TSX legacy; ~17 brewery (8 re-export shims + list/import/versions).  
**Post-move:** single SoT under `(brewery)/recipes/**`; zero files under legacy path.

---

## Re-export shims removed

These one-line re-exports pointed at legacy paths and were replaced by moved implementation files:

- `(brewery)/recipes/[id]/edit/page.tsx`
- `(brewery)/recipes/[id]/water/page.tsx`
- `(brewery)/recipes/[id]/water/{mash,sparge,boil}/page.tsx`
- `(brewery)/recipes/[id]/yeast/page.tsx`
- `(brewery)/recipes/[id]/brew-sessions/page.tsx`
- `(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/page.tsx`

---

## Import fix rule

Files moved under **`[locale]/(brewery)/`** — two extra route-group segments between `app/` and `recipes/`.

| Import target | Rule |
|---------------|------|
| **Within** `(brewery)/recipes/` (e.g. `../_lib/beerjsonRecipe`, `./_hooks/…`) | Unchanged — same depth relative to `recipes/` root |
| **Escapes** `recipes/` to `app/_lib/`, `app/_components/`, or `apps/web/src/` | Add `../` segments equal to **depth delta** (`new_depth_to_app − old_depth_to_app`). Typically **+2** for `recipes/_components/` and **+3** for `recipes/[id]/…` nested files |

Automation: [`scripts/migrate-recipes-tree-to-brewery.py`](../../scripts/migrate-recipes-tree-to-brewery.py) (one-shot `git mv` + import rewrite). A follow-up resolver pass validated every relative import resolves on disk.

**Do not** add new brewery recipe pages under `apps/web/app/recipes/` — that tree is gone.

---

## WS5 eslint retarget

| Element | Legacy pattern | Target pattern |
|---------|----------------|----------------|
| `web-water-shared` | `apps/web/app/recipes/[id]/water/{_lib,_hooks}/**` | `apps/web/app/[locale]/(brewery)/recipes/[id]/water/{_lib,_hooks}/**` |
| `web-water-segment` | `…/recipes/[id]/water/*/**` | `…/(brewery)/recipes/[id]/water/*/**` |
| `web-recipe-edit-shared` | `…/recipes/[id]/edit/{_lib,_hooks}/**` | `…/(brewery)/recipes/[id]/edit/{_lib,_hooks}/**` |
| `web-recipe-edit-surface` | `…/recipes/[id]/edit/**` | `…/(brewery)/recipes/[id]/edit/**` |
| `web-recipe-cluster` | `apps/web/app/recipes/**` | `apps/web/app/[locale]/(brewery)/recipes/**` |

Also updated: [`eslint.config.mjs`](../../eslint.config.mjs), [`docs/LINTING.md`](../LINTING.md) § App layer boundaries, [`solid-boundaries-eslint-apps-spike.md`](solid-boundaries-eslint-apps-spike.md), [`scripts/audit/solid-inventory.ts`](../../scripts/audit/solid-inventory.ts), SOLID section-split audit scripts under `scripts/audit/`.

---

## URL contract (unchanged)

Middleware + next-intl still serve:

- `/en/recipes`, `/en/recipes/[id]/edit`, `/en/recipes/[id]/water/mash`, etc.
- Unprefixed `/recipes` → locale redirect (see `apps/web/e2e/smoke/auth.spec.ts`)

Route groups `(brewery)` and dynamic `[locale]` do **not** appear in URLs (RFC-0002 Decision B).

---

## Verification (executed 2026-06-06)

| Check | Result |
|-------|--------|
| `npm run check-web-url-segments` | 0 violations |
| ci-parity `lint` (working tree) | OK — WS5 paths green |
| ci-parity `typecheck` (working tree) | OK |
| `python3 scripts/docs/check-readmes.py` | 21/21 OK |
| `python3 scripts/docs/check-public-docs-no-internal-links.py` | run at commit time |
| Playwright smoke (`/recipes` redirect, `/en/recipes/…`) | Specs unchanged under `apps/web/e2e/smoke/`; run against live stack before release |

Pre-push gate: `npm run verify:pre-push` (T2-PR) after commit on clean tree.

---

## Revision history

| Date | Change |
|------|--------|
| 2026-06-06 | Consolidation executed; inventory + verification record |
