// src/tamagui/themesWithV5CompatKeys.ts
import { defaultConfig as v5Config } from "@tamagui/config/v5";
import { defaultConfig as v6Config } from "@tamagui/config/v6";
function themesWithV5CompatKeys() {
  const themes = { ...v6Config.themes };
  const v5Themes = v5Config.themes;
  for (const [name, theme] of Object.entries(v6Config.themes)) {
    const legacy = v5Themes[name];
    if (!legacy) continue;
    themes[name] = { ...legacy, ...theme };
  }
  return themes;
}

export {
  themesWithV5CompatKeys
};
