# Tamagui 3 upgrade analysis (umbraculum-dev)

**Status:** Phase 0 analysis + Phase 2 pin bump landed on `tamagui3-upgrade`  
**Date:** 2026-11-03  
**Pinned (landed):** Tamagui **3.2.0** (exact) across five manifests + root overrides; native-shell peer `>=3`  
**Prior baseline:** Tamagui **2.2.0**  
**Config strategy (as landed):** **`@tamagui/config/v6`** for tokens/fonts Tamagui 3 skins require; merge v5 theme keys via `themesWithV5CompatKeys` so app `red10` / `borderColor` / `color4` keep working. (Initial plan kept v5 only — Expo Go Input/radius/font crashes forced the v6 token pack.)

## Inventory (current)

| Manifest | Pins |
|----------|------|
| `apps/web` | `tamagui`, `@tamagui/core`, `@tamagui/config`, `@tamagui/animations-css`, `@tamagui/cli` @ **2.2.0** |
| `packages/platform/ui` | `tamagui`, `@tamagui/config`, animations @ **2.2.0** |
| `packages/verticals/brewery/recipes-ui` | `tamagui` @ **2.2.0** |
| `apps/native/brewery` | `tamagui`, `@tamagui/core` @ **2.2.0** |
| `packages/platform/native-shell` | `tamagui` **2.2.0** (dep) + peer `>=2` |
| Root `overrides` | `tamagui` / `@tamagui/core` / `config` / animations @ **2.2.0** |

Configs: [`packages/platform/ui/src/tamagui/config.web.ts`](../../packages/platform/ui/src/tamagui/config.web.ts) and `config.native.ts` both `import { defaultConfig } from "@tamagui/config/v5"`.

## tsc baselines (2026-11-03, compose `web`, pre-bump)

| Surface | `error TS` count | Notes |
|---------|------------------|-------|
| `apps/web` (`tsc -p tsconfig.json`) | **723** | Lower than TAMAGUI.md 2026-06-10 row (1125); re-measure after 3.2.0 |
| `packages/platform/ui` | **23** | Was 27 at 2.2.0 doc row |
| Native / recipes-ui | not re-run in this pass | historically 0 |

## Authoring-surface scale (v2 → v3)

Codemod-relevant rough counts under app/ui/recipes/native-shell sources:

| Pattern | Approx. hits |
|---------|----------------|
| JSX `$token` attrs (`bg="$…"`, etc.) | **~3665** in **~344** files |
| `hoverStyle` / `pressStyle` / `focusStyle` | ~17 |
| `Sheet.Frame` | 2 (1 file) |
| `themeInverse` / `fullscreen` / `useProps` | 0 |

Upstream: there is **no runtime path** for `$…` tokens or V2 condition objects (`hoverStyle`, …) on V3. Migration path is `@tamagui/codemod-flat-values --source-semantics v2-pixels` then hand-fix the report ([Upgrading to v3](https://tamagui.dev/docs/guides/how-to-upgrade)).

## Path B / Expo 58 compatibility

V3 baseline: React **19**, React Native **0.81+**, TypeScript **5+**.  
Umbraculum Path B (post Expo 58 merge): React **19.3.0**, RN **0.88.1**, Expo SDK **58**, Node **22** — within baseline. Native doctor / Metro must be re-checked after the pin bump (rule 78 / skill `native-expo-doctor-pre-push` when native manifests change).

## Breaking themes (summary)

1. **Flat values** — bare token names; conditions on each prop (`hover:…`, typed objects); run flat-values codemod first.
2. **Removed APIs** — `focusable`, `fullscreen`, `themeInverse` → `theme="inverse"`, `Sheet.Frame` → `Sheet.Container` + `Sheet.Background`, etc.
3. **Sizes** — `$true` gone; control sizes `xs`–`xl` (`md` default).
4. **lineHeight** — numeric values become ratios; codemod with `v2-pixels` emits `px` strings for old absolutes.
5. **Config v5 vs v6** — keep v5 for this wave; v6 is a separate design migration.

## Decision for Phase 2

- Bump all five manifests + root overrides to exact **`3.2.0`**.
- Keep `@tamagui/config/v5` imports.
- Widen native-shell peer to `>=3` (or `>=2` → `>=3`).
- Run flat-values codemod on web/ui/recipes-ui/native surfaces; fix report leftovers + Sheet anatomy.
- Gates: `lock:update:root` + `lock:update:web`, `check:lockfiles`, `scripts/check-tamagui-cli.sh`, web + Expo smoke.

## Sign-off

Phase 0 complete for executor continuation on `tamagui3-upgrade` (operator plan: implement through brochure + T2; Git tag `v1.0.0` remains operator-gated).
