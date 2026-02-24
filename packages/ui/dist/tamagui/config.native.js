// src/tamagui/config.native.ts
import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";
var config = createTamagui({
  ...defaultConfig,
  media: {
    ...defaultConfig.media,
    narrow: { maxWidth: 880 },
    gtNarrow: { minWidth: 881 },
    mobile: { maxWidth: 520 },
    touch: { pointer: "coarse" }
  }
});
var config_native_default = config;
export {
  config,
  config_native_default as default
};
