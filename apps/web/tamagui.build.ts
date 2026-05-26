import type { TamaguiBuildOptions } from "@tamagui/core";

export default {
  components: ["@tamagui/core", "tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./public/tamagui.generated.css",
} satisfies TamaguiBuildOptions;
