# Expo Doctor — monorepo assessment

**Tier:** Internal  
**Status:** Active — Path A chosen (2026-06-07)  
**Audience:** native maintainers, CI authors  
**Related:** Cursor plan `expo_doctor_fixes` (2026-06-07), [DEVELOPMENT-NATIVE-LOCAL.md](../DEVELOPMENT-NATIVE-LOCAL.md), [native-eas-demo-build-log.md](native-eas-demo-build-log.md)

---

## 1. Summary

`npx expo-doctor` (18 checks) must pass from **`apps/native/brewery/`** after **root `npm ci`** — the same context as EAS ([`native-eas-build.yml`](../../.github/workflows/native-eas-build.yml)) and [`native-deps.yml`](../../.github/workflows/native-deps.yml).

**Baseline (2026-06-07, pre-remediation):** **16/18** — two failures:

| Check | Failure |
|-------|---------|
| Expo config | `app.config.js` not using `app.json` values (doctor heuristic) |
| Duplicate dependencies | `expo@54` (brewery) vs `expo@56` (root peer), `react@19.1` vs `react@19.2.4`, stale `apps/native/node_modules/` tree |

**Decision:** **Path A** (shipped 2026-06-07) — keep Expo Go + `react@19.1.0`; align `apps/web` to `19.1.0` (monorepo-wide override); root `expo@54.0.35` override; tighten `@umbraculum/native-shell` peer ranges; post-`npm ci` cleanup via [`check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh). **Path B** deferred.

---

## 2. Reproduce

```bash
cd $REPO_ROOT
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim \
  bash -lc "npm ci --no-audit --no-fund && cd apps/native/brewery && npx expo-doctor@latest"
```

EAS prep ([`native-eas-build.yml`](../../.github/workflows/native-eas-build.yml)): root `npm ci` → `./scripts/build-packages-in-docker.sh` → `eas build` with `working-directory: apps/native/brewery`.

---

## 3. Layout (post–RFC-0011 Wave 4A)

| Path | Role |
|------|------|
| `apps/native/brewery/` | `@umbraculum/native-brewery` — Expo SDK 54 app (EAS, Metro, screens) |
| `apps/native/` | Umbrella index only — **must not** retain `node_modules/` after Wave 4A |
| `packages/platform/native-shell/` | `@umbraculum/native-shell` — shared auth/i18n/bootstrap (`file:` dep) |
| Repo root `node_modules/` | Hoisted monorepo stack (`react@19.1.0` via `overrides`; phantom `expo@56` / `react@19.2.x` **before** Path A remediation) |

---

## 4. `npm why` findings (2026-06-07)

### `expo@56.0.9` at repo root (`peer: true`)

- Trigger: `expo-constants@~18.0.0` in `@umbraculum/native-shell` **devDependencies** (and brewery deps) hoisted to root; npm 10 satisfies peer `expo` with latest (`56.x`).
- Brewery app correctly installs `expo@~54.0.35` under `apps/native/brewery/node_modules/expo`.
- **Fix (Path A):** root `package.json` `overrides.expo: "~54.0.35"` collapses phantom `expo@56` tree.

### `react` alignment (post–Path A)

| Source | Version | Notes |
|--------|---------|-------|
| Root `package.json` `overrides` | `19.1.0` | Collapses web + native to Expo Go ABI |
| `apps/web/package.json` | `19.1.0` | Was `19.2.4` pre-remediation |
| `apps/native/brewery/package.json` | `19.1.0` exact | Expo Go ABI |
| [`metro.config.js`](../../apps/native/brewery/metro.config.js) | Brewery `node_modules/react` | Must not pin root hoisted copy |

**Do not** bump `apps/web` or root `overrides` to `19.2.x` without Path B ([DEVELOPMENT-NATIVE-LOCAL.md](../DEVELOPMENT-NATIVE-LOCAL.md) § Long-term). Historical pre-remediation drift (`19.2.4` web vs `19.1.0` native) is what doctor duplicate checks caught.

### `react-native@0.84.0` at root

- Child of `expo@56` peer tree only — removed when `expo` override pins SDK 54.

### Stale `apps/native/node_modules/`

- Leftover from pre–Wave 4A when Expo lived at `apps/native/`. No `apps/native/package.json` workspace; lockfile entries marked `extraneous`.
- Doctor reported a **third** copy of `expo@54` at `../node_modules/expo`.
- **Fix:** remove directory; do not recreate; CI/docker prep step documents cleanup.

---

## 5. Path A vs Path B

| | Path A (chosen) | Path B (deferred) |
|---|----------------|-------------------|
| Expo Go | Keep as primary dev loop | Custom dev client or SDK upgrade |
| React native | Stay `19.1.0` in brewery | Align to `19.2.4` monorepo-wide |
| SDK | Stay Expo 54 | Expo 55+ spike |
| Doctor | Config fix + overrides + stale tree cleanup | Full alignment milestone |
| Risk | Low — documented monorepo hoist for web `react` if residual | Breaks Expo Go until dev-client workflow lands |

---

## 6. Remediation shipped (this epic)

| Step | Change |
|------|--------|
| Phase 1 | `apps/native/brewery/app.config.js` → `({ config }) =>` spread pattern |
| Phase 2a | Root `overrides` (`expo`, `expo-font`, `react`, `react-dom`, `react-native`, `react-native-svg`); `apps/web` → `react@19.1.0`; `@umbraculum/native-shell` peer pins; `@umbraculum/ui` `react-native-svg@15.12.1` exact; Metro React pin from brewery `node_modules` |
| Phase 2a cleanup | [`scripts/check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh) — rm stale `apps/native/node_modules`, `packages/platform/ui/node_modules`, phantom root `expo-font` only (keep hoisted root `react-native-svg@15.12.1`) |
| Phase 3 | `native-deps.yml` runs script + `typecheck -w @umbraculum/native-brewery`; [`AGENTS.md`](../../AGENTS.md) + [`EAS-DEMO-SETUP.md`](../../apps/native/brewery/EAS-DEMO-SETUP.md) agent gates |

---

## 7. Doctor status

| Date | Score | Notes |
|------|-------|-------|
| 2026-06-07 pre | 16/18 | Config + duplicates |
| 2026-06-07 post | **18/18** | After remediation + cleanup script |

Update [`native-eas-demo-build-log.md`](native-eas-demo-build-log.md) § Expo Doctor when green.

---

## 8. Agent guardrails (do not regress)

Future agents must treat this doc + the toolset gate as binding — not optional tribal knowledge.

| Surface | Guard |
|---------|--------|
| Cursor rule | **`78-native-expo-doctor-monorepo-gate`** (`umbraculum-node-react-cursor-assistant`) — globs `apps/native/**`, `native-shell`, root lockfiles |
| Cursor skill | **`native-expo-doctor-pre-push`** — reproduces GHA `native-deps.yml` before push |
| Repo interceptor | [`AGENTS.md`](../../AGENTS.md) § Native dependency / expo-doctor gate |
| T2 verify | `npm run verify:pre-push` runs `expo-doctor` native step when `.umbraculum/gha-trigger-map.json` matches `native-deps` paths |

**Hard do-nots:** loosen `native-shell` `expo` peer to `>=54`; add `expo-*` to `native-shell` `devDependencies`; bump web React without Path B; skip `check-native-expo-doctor.sh` after override/lockfile edits; revert `app.config.js` away from `({ config }) =>` spread.
