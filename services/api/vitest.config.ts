import { defineConfig } from "vitest/config";

const unitTestFiles = [
  "src/tests/openapi.test.ts",
  "src/tests/entitlementsService.test.ts",
  "src/tests/unitsCore.test.ts",
  "src/tests/ai/promptComposer.test.ts",
  "src/tests/ai/reportingAst.test.ts",
];

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: unitTestFiles,
          setupFiles: ["src/tests/vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/tests/**/*.test.ts"],
          exclude: unitTestFiles,
          setupFiles: ["src/tests/vitest.setup.ts"],
        },
      },
    ],
  },
});
