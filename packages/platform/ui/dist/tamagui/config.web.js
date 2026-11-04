import {
  themesWithV5CompatKeys
} from "../chunk-GZJL72HW.js";

// src/tamagui/config.web.ts
import { createAnimations } from "@tamagui/animations-css/extras";
import { defaultConfig } from "@tamagui/config/v6";
import { createTamagui } from "tamagui";
var config = createTamagui({
  ...defaultConfig,
  themes: themesWithV5CompatKeys(),
  animations: createAnimations({
    quick: "ease-out 150ms",
    medium: "ease-in 300ms",
    slow: "ease-in 450ms"
  }),
  media: {
    ...defaultConfig.media,
    narrow: { maxWidth: 880 },
    gtNarrow: { minWidth: 881 },
    mobile: { maxWidth: 520 },
    touch: { pointer: "coarse" }
  }
});
var config_web_default = config;
export {
  config,
  config_web_default as default
};
