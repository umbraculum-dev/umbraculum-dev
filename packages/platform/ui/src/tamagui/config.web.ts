import { createAnimations } from "@tamagui/animations-css/extras";
import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";

import { radiusNamedAliases } from "./radiusNamedAliases";

export const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    radius: {
      ...defaultConfig.tokens.radius,
      ...radiusNamedAliases,
    },
  },
  animations: createAnimations({
    quick: "ease-out 150ms",
    medium: "ease-in 300ms",
    slow: "ease-in 450ms",
  }),
  media: {
    ...defaultConfig.media,
    narrow: { maxWidth: 880 },
    gtNarrow: { minWidth: 881 },
    mobile: { maxWidth: 520 },
    touch: { pointer: "coarse" },
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

