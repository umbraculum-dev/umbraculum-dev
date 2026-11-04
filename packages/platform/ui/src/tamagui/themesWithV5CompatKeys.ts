import { defaultConfig as v5Config } from "@tamagui/config/v5";
import { defaultConfig as v6Config } from "@tamagui/config/v6";

type ThemesV5 = typeof v5Config.themes;
type ThemesV6 = typeof v6Config.themes;

type LightV5 = ThemesV5["light"];
type LightV6 = ThemesV6["light"];

/** v5-only keys (same set across themes); patch every v6 theme so TS accepts them. */
type LegacyThemePatch = {
  [K in Exclude<keyof LightV5, keyof LightV6>]: LightV5[K];
};

/**
 * Tamagui 3 component skins need Config v6 tokens/fonts, but our app still
 * references v5 theme keys (`red10`, `borderColor`, `color4`, …). Spread v5
 * first so v6 wins on shared keys and legacy names remain resolvable — both
 * at runtime and in `createTamagui` inferred types (ci-parity typecheck).
 *
 * Typing uses a flat light-theme legacy patch (not a full per-theme merge
 * type) so `createTamagui` inference stays within TS complexity limits.
 */
export type ThemesWithV5CompatKeys = {
  [Name in keyof ThemesV6]: ThemesV6[Name] & LegacyThemePatch;
};

export function themesWithV5CompatKeys(): ThemesWithV5CompatKeys {
  const themes = { ...v6Config.themes } as Record<string, Record<string, unknown>>;
  const v5Themes = v5Config.themes as Record<string, Record<string, unknown>>;

  for (const [name, theme] of Object.entries(v6Config.themes)) {
    const legacy = v5Themes[name];
    if (!legacy) continue;
    themes[name] = { ...legacy, ...theme };
  }

  return themes as ThemesWithV5CompatKeys;
}
