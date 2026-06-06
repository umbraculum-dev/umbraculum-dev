# T2-PR acceptance log

Append-only record of path-aware T2-PR dogfood runs.

## Wave 14 @ 9979281 (2026-06-06)

```
T2-PR acceptance @ 9979281 (Wave 14 + path-aware T2): jobs=docs-readmes,lint,typecheck,dogfood-npm-smoke parallel=4 wall_clock=196s (3-job subset: 196s) legacy_aborted=yes api=FAIL(seed network)
```

Notes:

- Parallel ci-parity (3 jobs): **3m16** wall clock vs **30+ min** aborted legacy full sequential manifest.
- `typecheck=OK`, `docs-readmes=OK` after snapshot-per-job fix (`@umbraculum/ci-parity@1.0.11`).
- `lint=FAIL` — fixed broken import in `useYeastEditorEditableModel.ts` (`../../_lib` → `../../../_lib`).
- API vitest failed on prisma seed (`raw.githubusercontent.com` connect timeout) — environmental; Wave 14 previously green at 332/332.
