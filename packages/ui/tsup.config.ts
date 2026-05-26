import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/tamagui/config.web.ts",
    "src/tamagui/config.native.ts",
    "src/charts/HydrometerChart.web.tsx",
    "src/charts/HydrometerChart.native.tsx",
  ],
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: [/^react(\/.*)?$/, /^react-native(\/.*)?$/, /^victory(\/.*)?$/, /^victory-native(\/.*)?$/],
});

