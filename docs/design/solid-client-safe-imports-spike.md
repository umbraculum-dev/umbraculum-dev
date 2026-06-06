# SOLID client-safe imports spike — WS6 eslint burn-in

**Tier:** Internal  
**Status:** Burn-in (2026-06-05) — Wave 11 deliverable  
**Audience:** app authors, CI maintainers  
**Related:** [DATA-ACCESS-BOUNDARIES.md](../DATA-ACCESS-BOUNDARIES.md) §6, [solid-audit-inventory.md](./solid-audit-inventory.md), [LINTING.md](../LINTING.md)

---

## 1. Problem

`solid-inventory.ts` flagged **77 P2 rows** for `@umbraculum/brewery-recipes-ui` and `@umbraculum/brewery-beerjson` imports in apps — packages were client-safe but missing from `APP_CLIENT_PACKAGE_PREFIXES` (which listed legacy `@umbraculum/recipes-ui` / `@umbraculum/beerjson` names only).

---

## 2. Verification (2026-06-05)

| Package | npm name | Dependencies (runtime) | Prisma / API? |
|---------|----------|------------------------|---------------|
| BeerJSON helpers | `@umbraculum/brewery-beerjson` | `@umbraculum/brewery-core` | No |
| Recipe/water UI | `@umbraculum/brewery-recipes-ui` | `brewery-beerjson`, `i18n-react`, `ui`, `tamagui` | No |

Grep of both package trees: zero `@prisma`, zero `services/api` imports.

---

## 3. Artifacts landed (Wave 11)

| Artifact | Role |
|----------|------|
| [`scripts/eslint/appClientPackageAllowlist.mjs`](../../scripts/eslint/appClientPackageAllowlist.mjs) | Single source of truth for inventory + future strict rule |
| [`scripts/audit/solid-inventory.ts`](../../scripts/audit/solid-inventory.ts) | Imports shared allowlist |
| [`eslint.config.mjs`](../../eslint.config.mjs) WS6 block | `no-restricted-imports` **warn** for `@prisma/*` and `**/services/api/**` in apps |
| [DATA-ACCESS-BOUNDARIES.md](../DATA-ACCESS-BOUNDARIES.md) §6 | Documents client-safe vertical packages |

---

## 4. Verdict

**SOUND for burn-in (warn-level).** Inventory P2 client-safe rows should drop to **0** after allowlist update. WS5 `boundaries/element-types` already blocks `apps/* → services/api/**` at error; WS6 adds explicit `@prisma` messaging and documents the promotion path.

### Promotion criteria (warn → error)

1. One release cycle on `master` with **0** new WS6 warnings in ci-parity `lint` job.
2. No false positives on legitimate `@umbraculum/brewery-*` imports.
3. Follow B5 pattern: promote in dedicated PR; update this doc + LINTING.md TL;DR table.

### Burn-in evaluation log

| Date | Wave | ci-parity `lint` WS6 warnings | False positives on `@umbraculum/brewery-*` | Decision |
|------|------|--------------------------------|------------------------------------------|----------|
| 2026-06-04 | Wave 13 Phase 9 | Archive lint **OK** on `951f51e` (no WS6 regressions observed in green run) | None reported | **Defer** warn→error — operator approval required for promotion PR; one full release cycle since Wave 11 not independently metered |
| 2026-06-06 | Wave 14 Phase 8 | Archive lint **OK** on `d25fc8a` pre-commit baseline (full ci-parity green); no WS6 regressions observed | None reported | **Defer** warn→error — operator approval required for promotion PR |
| 2026-06-06 | Wave 15 Phase 10 | Working-tree + archive lint **OK** on Wave 15 refactor (no WS6 regressions observed in green runs) | None reported | **Defer** warn→error — operator approval required for promotion PR |
| 2026-06-06 | Wave 16 Phase 9 | Working-tree lint **OK** on Wave 16 hygiene splits (typecheck + lint green; no WS6 regressions observed) | None reported | **Defer** warn→error — operator approval required for promotion PR |
| 2026-06-04 | Wave 17 Phase 8 | Working-tree + archive lint **OK** on Wave 17 tail parity + Tier A route thinning (no WS6 regressions observed); `boundaries/element-types` **0** violations on `services/api/src/modules` | None reported | **Defer** warn→error — operator approval required for promotion PR |
| 2026-06-06 | S closure epic | Archive lint **OK** after WS6 promotion (`warn` → `error` on `apps/{web,native}/**`) | None reported | **Promoted to error** — see [solid-post-wave17-closure.md](./solid-post-wave17-closure.md) §7 |

---

## 5. Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-06-05 |
| Subplan | WS6 / Wave 11 Phase 5 |
| Verdict | **SOUND** (warn shipped; error deferred) |
