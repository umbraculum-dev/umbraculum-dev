import "../chunk-JSBRDJBE.js";

// src/tamagui/config.web.ts
import { createAnimations } from "@tamagui/animations-css";
import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";
var config = createTamagui({
  ...defaultConfig,
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
