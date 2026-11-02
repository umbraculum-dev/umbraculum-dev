# Native Metro cold-bundle gate (automation proposal)

**Tier:** Public  
**Status:** Proposal (manual stub shipped; T2/GHA wiring **not** landed)  
**Audience:** maintainers, agents running pre-push  
**Related:** [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../DEVELOPMENT-NATIVE-LOCAL.md) § Pre-release: cold Metro / clean graph; [`scripts/check-native-metro-cold.sh`](../../scripts/check-native-metro-cold.sh); [`docs/NATIVE-STRATEGY-AND-CI.md`](../NATIVE-STRATEGY-AND-CI.md) §6

## 1. Problem

CI parity (`git archive` + static jobs) and `expo-doctor` prove versions and types. They do **not** prove Metro can emit an **Android** JS bundle for `apps/native/brewery`.

A developer machine with warm Metro/Hermes cache and existing `node_modules` can stay green while:

- a **backup restore**,
- a **junior first clone**, or
- a **clean CI-like install**

fails when Metro walks a cold graph (historical incident: `@umbraculum/module-sdk` main barrel → `installProfile` → Node `fs` → Android bundle 500 → Expo Go “Failed to download remote update”).

That contradicts the junior-equalizer philosophy ([`MANIFESTO.md`](../../MANIFESTO.md) §1.3).

## 2. Manual floor (shipped)

```bash
./scripts/check-native-metro-cold.sh
```

Restarts Metro with cleared bundler cache (`-c`) and asserts HTTP 200 + non-error body for the brewery `platform=android` bundle. No physical device required.

## 3. Proposed automation (next wave — do not implement in the stub PR)

| Item | Locked proposal |
|------|-----------------|
| **Trigger paths** | Diff touches any of: `apps/native/**`, `packages/sdk/module-sdk/**`, `packages/platform/i18n/**`, `scripts/start-metro-dev.sh`, `scripts/check-native-metro-cold.sh` |
| **Mechanism** | New `nativeStep` sibling to `expo-doctor` in [`.umbraculum/gha-trigger-map.json`](../../.umbraculum/gha-trigger-map.json), invoked from [`scripts/verify-slice.sh`](../../scripts/verify-slice.sh) T2-PR companions (parallel with ci-parity, same pattern as expo-doctor) |
| **Proof command** | `./scripts/check-native-metro-cold.sh` inside `node:20-slim` with warm npm volumes ([`docs/DEVELOPMENT-NPM-VOLUMES.md`](../DEVELOPMENT-NPM-VOLUMES.md)); Android `curl` only |
| **Why not only expo-doctor** | Doctor checks dependency ABI alignment; it never builds the Metro Android graph |
| **Why not full ci-parity job first** | Runtime cost (Metro boot + full Android bundle) is higher than lint/typecheck; path-aware companion keeps unrelated PRs cheap |
| **Non-goals** | Physical Expo Go; Expo SDK 58 upgrade; `npm ci` on every PR (optional later `--fresh` flag on the script) |
| **Rollout** | (1) Manual stub — **done** → (2) path-aware T2 companion → (3) optional GHA workflow when wall-time is acceptable |

## 4. Acceptance criteria for the future wiring PR

- [ ] `gha-trigger-map.json` lists a `metro-cold` (name TBD) `nativeStep` with the trigger paths above.
- [ ] `verify-slice.sh` runs the companion when the resolver includes that step.
- [ ] Documented in [`docs/VERIFICATION-TIERS.md`](../VERIFICATION-TIERS.md) T2-PR table and [`AGENTS.md`](../../AGENTS.md) native gates.
- [ ] Fail message points maintainers at DEVELOPMENT-NATIVE-LOCAL cold § and the `module-sdk` `/native` + `/edge` entrypoints.

## 5. Explicit non-goals of this proposal document

- Implementing verify-slice / GHA wiring (tracked as follow-up).
- Replacing device Expo Go SDK matching (still operator installs SDK 54 Expo Go from expo.dev/go).
