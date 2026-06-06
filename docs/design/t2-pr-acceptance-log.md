# T2-PR acceptance log

Append-only record of path-aware T2-PR dogfood runs.

## Wave 14 @ 9979281 (2026-06-06)

```
T2-PR acceptance @ 64dc748 (Wave 14 + path-aware T2): jobs=docs-readmes,lint,typecheck parallel=3 wall_clock=208s ci-parity=OK legacy_aborted=yes api=not-rerun
```

Notes:

- Parallel ci-parity (3 jobs): **3m28** wall clock vs **30+ min** aborted legacy full sequential manifest.
- `docs-readmes=OK`, `lint=OK`, `typecheck=OK` after snapshot-per-job fix (`@umbraculum/ci-parity@1.0.11`).
- `lint=OK` after import path fixes in yeast editor split files.
- API vitest not re-run in final acceptance (prior attempt failed on prisma seed network timeout); Wave 14 previously green at 332/332.

## Wave 15 @ b20a2b1 (2026-06-06)

```
T2-PR acceptance @ b20a2b1 (Wave 15 SOLID extended): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke parallel=4 ci-parity=OK api=332/332
```

Notes:

- Path-aware T2-PR green after mechanical splits across API water compute, native/web UI, packages, platform pages.
- API vitest **332/332** with no unhandled errors.
- WS6 burn-in: lint OK; **defer** warn→error (operator gate unchanged).

## Wave 16 @ 3d33183 (2026-06-06)

```
T2-PR acceptance @ 3d33183 (Wave 16 SOLID hygiene): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke parallel=4 ci-parity=OK api=332/332
```

Notes:

- Hygiene-band mechanical splits (250–399 LoC) across water tail, recipe-edit, API platform, brewday seed, inventory/equipment, brew-session/MRP UI, projection schemas, packages stretch.
- API vitest **332/332** with no unhandled errors.
- WS6 burn-in: lint OK; **defer** warn→error (operator gate unchanged).

## Wave 17 @ 54b4f06 (2026-06-04)

```
T2-PR acceptance @ 54b4f06 (Wave 17 SOLID tail parity): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke ci-parity=OK api=332/332
```

Notes:

- Tail parity (220–249 LoC web/native), CRP/MRP projection finish, API leftovers + near-threshold splits, packages/ui, Tier A route thinning (AuthService + WaterCalcRouteService), test file hygiene (400+ LoC vitest barrels).
- API vitest **332/332** with no unhandled errors.
- WS6 burn-in: lint OK; boundaries B5 **0** violations on `services/api/src/modules`; **defer** warn→error (operator gate unchanged).

## S closure epic @ 4bbe132 (2026-06-06)

```
T2-PR acceptance @ 4bbe132 (SOLID S closure): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke ci-parity=OK
```

Notes:

- Post–Wave 17 program closure doc (`solid-post-wave17-closure.md`), agent verification cross-links, WS6 **promoted to error**.
- Recipe-edit composer thinning (web + native mashing parity), water/brew-session/equipment tail S splits.
- Inventory P2/P3=0 unchanged; API not re-run (UI/docs/eslint only).

## WS5 app boundaries @ c5f9945 (2026-06-06)

```
T2-PR acceptance @ c5f9945 (WS5 app-layer D): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke ci-parity=OK
```

Notes:

- WS5 locale vertical + recipe-cluster fences at **error**; closure §7–8 reconciled; LINTING + charter §11 contributor docs.
- Baseline **0** WS5 violations before and after expansion; inventory app cross-segment heuristic added (report-only).
- API not re-run (eslint/docs/inventory script only).
