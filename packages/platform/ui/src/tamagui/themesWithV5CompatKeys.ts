import { defaultConfig as v5Config } from "@tamagui/config/v5";
import { defaultConfig as v6Config } from "@tamagui/config/v6";

/**
 * Tamagui 3 component skins need Config v6 tokens/fonts, but our app still
 * references v5 theme keys (`red10`, `borderColor`, `color4`, …). Spread v5
 * first so v6 wins on shared keys and legacy names remain resolvable.
 */
export function themesWithV5CompatKeys(): typeof v6Config.themes {
  const themes = { ...v6Config.themes } as Record<string, Record<string, unknown>>;
  const v5Themes = v5Config.themes as Record<string, Record<string, unknown>>;

  for (const [name, theme] of Object.entries(v6Config.themes)) {
    const legacy = v5Themes[name];
    if (!legacy) continue;
    themes[name] = { ...legacy, ...theme };
  }

  return themes as typeof v6Config.themes;
}
