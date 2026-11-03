# Expo Doctor — monorepo assessment

**Tier:** Internal  
**Status:** Active — **Path B executed** (Expo SDK 58 + React 19.3.0; Node 22). Path A (2026-06-07) remains historical.  
**Audience:** native maintainers, CI authors  
**Related:** Cursor plan `expo_doctor_fixes` (2026-06-07), Path B upgrade (2026-11), [DEVELOPMENT-NATIVE-LOCAL.md](../DEVELOPMENT-NATIVE-LOCAL.md), [native-eas-demo-build-log.md](native-eas-demo-build-log.md)

---

## 1. Summary

`npx expo-doctor` (20 checks on SDK 58) must pass from the **primary native app** in the active [installation profile](installation-profile.md) after **root `npm ci`** — core profile: [`apps/native/blank/`](../../apps/native/blank/); reference profile: [`apps/native/brewery/`](../../apps/native/brewery/). [`check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh) resolves the app from `.umbraculum/install*.json`. Same context as EAS ([`native-eas-build.yml`](../../.github/workflows/native-eas-build.yml)) and [`native-deps.yml`](../../.github/workflows/native-deps.yml).

**Baseline (2026-06-07, pre-remediation):** **16/18** — two failures:

| Check | Failure |
|-------|---------|
| Expo config | `app.config.js` not using `app.json` values (doctor heuristic) |
| Duplicate dependencies | `expo@54` (brewery) vs `expo@56` (root peer), `react@19.1` vs `react@19.2.4`, stale `apps/native/node_modules/` tree |

**Decision (historical):** **Path A** (shipped 2026-06-07) — keep Expo Go + `react@19.1.0`; align `apps/web` to `19.1.0`; root `expo@54` override. **Path B** was deferred until store Expo Go shipped SDK 58-only (junior install friction).

**Decision (current):** **Path B executed (2026-11)** — Expo Go remains the primary loop; monorepo on **Expo SDK 58** / **React 19.3.0** / **RN 0.88.1** / **Node ≥22.13** via root `overrides`; `native-shell` peers `~58.0.22`; doctor **20/20**.

---

## 2. Reproduce

```bash
cd $REPO_ROOT
docker run --rm -v "$PWD:/repo" -w /repo node:22-slim \
  bash -lc "npm ci --no-audit --no-fund && cd apps/native/brewery && npx expo-doctor@latest"
```

EAS prep ([`native-eas-build.yml`](../../.github/workflows/native-eas-build.yml)): root `npm ci` → `./scripts/build-packages-in-docker.sh` → `eas build` with `working-directory: apps/native/brewery`.

---

## 3. Layout (post–RFC-0011 Wave 4A)

| Path | Role |
|------|------|
| `apps/native/blank/` | `@umbraculum/native-blank` — blank Expo app (core installation profile; CI expo-doctor default) |
| `apps/native/brewery/` | `@umbraculum/native-brewery` — Expo SDK **58** app (reference profile; EAS, Metro, screens) |
| `apps/native/` | Umbrella index only — **must not** retain `node_modules/` after Wave 4A |
| `packages/platform/native-shell/` | `@umbraculum/native-shell` — shared auth/i18n/bootstrap (`file:` dep); peers `expo ~58` |
| Repo root `node_modules/` | Hoisted monorepo stack (`react@19.3.0` / `expo@58.0.22` via `overrides`) |

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

| | Path A (2026-06-07) | Path B (executed 2026-11) |
|---|----------------|-------------------|
| Expo Go | Primary loop on SDK 54 | Still primary loop — now **SDK 58** (store Expo Go) |
| React | `19.1.0` monorepo-wide | `19.3.0` monorepo-wide |
| SDK | Expo 54 | Expo **58** (`expo@58.0.22`, RN `0.88.1`) |
| Node | 20 | **22.13+** (`node:22-slim`) |
| Doctor | 18/18 | **20/20** |

Further exits (custom dev client, web React ahead of Expo Go) remain available if Expo Go ABI blocks a feature again.

---

## 6. Remediation shipped (this epic)

| Step | Change |
|------|--------|
| Phase 1 | `apps/native/brewery/app.config.js` → `({ config }) =>` spread pattern |
| Phase 2a | Root `overrides` (`expo`, `expo-font`, `react`, `react-dom`, `react-native`, `react-native-svg`); `apps/web` → `react@19.1.0`; `@umbraculum/native-shell` peer pins; `@umbraculum/ui` `react-native-svg@15.12.1` exact; Metro React pin from brewery `node_modules` |
| Phase 2a cleanup | [`scripts/check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh) — rm stale `apps/native/node_modules`, `packages/platform/ui/node_modules`, phantom root `expo-font` only (keep hoisted root `react-native-svg@15.12.1`) |
| Phase 3 | `native-deps.yml` runs [`check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh) (manifest-selected app + typecheck); [`AGENTS.md`](../../AGENTS.md) + [`EAS-DEMO-SETUP.md`](../../apps/native/brewery/EAS-DEMO-SETUP.md) agent gates |
| 2026-06 | **Installation profile:** core → `blank` (was `starter`), reference → `brewery`; see [`installation-profile.md`](installation-profile.md) |

---

## 7. Doctor status

| Date | Score | Notes |
|------|-------|-------|
| 2026-06-07 pre | 16/18 | Config + duplicates |
| 2026-06-07 post | **18/18** | After Path A remediation + cleanup script |
| 2026-11 Path B | **20/20** | Expo SDK 58 + React 19.3; regen root lock so overrides hoist (avoid nested brewery `react` vs root `19.1`) |

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

**Hard do-nots:** loosen `native-shell` `expo` peer to `>=58`; add `expo-*` to `native-shell` `devDependencies`; drift web React off root `overrides` / Expo Go ABI; skip `check-native-expo-doctor.sh` after override/lockfile edits; revert `app.config.js` away from `({ config }) =>` spread; delete root `node_modules/expo-font` (real transitive on SDK 58).
