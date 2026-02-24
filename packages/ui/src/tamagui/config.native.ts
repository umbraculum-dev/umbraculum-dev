import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";

export const config = createTamagui({
  ...defaultConfig,
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

