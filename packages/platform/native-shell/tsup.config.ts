import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/bootstrap.ts",
    "src/auth/index.ts",
    "src/i18n/index.ts",
    "src/theme/index.ts",
    "src/components/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: [
    /^react(\/.*)?$/,
    /^react-native(\/.*)?$/,
    /^expo(\/.*)?$/,
    /^@umbraculum\//,
    /^tamagui(\/.*)?$/,
    /^@tamagui\//,
    /^zeego(\/.*)?$/,
  ],
});
