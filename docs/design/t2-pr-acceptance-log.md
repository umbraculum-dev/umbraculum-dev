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

## Wave 16 @ TBD (2026-06-06)

```
T2-PR acceptance @ TBD (Wave 16 SOLID hygiene): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke parallel=4 ci-parity=OK api=332/332
```

Notes:

- Hygiene-band mechanical splits (250–399 LoC) across water tail, recipe-edit, API platform, brewday seed, inventory/equipment, brew-session/MRP UI, projection schemas, packages stretch.
- API vitest **332/332** with no unhandled errors.
- WS6 burn-in: lint OK; **defer** warn→error (operator gate unchanged).
