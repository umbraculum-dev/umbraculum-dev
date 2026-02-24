import "../chunk-JSBRDJBE.js";

// src/tamagui/config.native.ts
import { createAnimations } from "@tamagui/animations-react-native";
import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";
var config = createTamagui({
  ...defaultConfig,
  animations: createAnimations({
    quick: {
      damping: 20,
      mass: 1.2,
      stiffness: 250
    },
    medium: {
      damping: 18,
      stiffness: 80
    },
    slow: {
      damping: 22,
      stiffness: 50
    }
  }),
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
