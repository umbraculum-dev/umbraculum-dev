import { defineConfig } from "vitest/config";

const unitTestFiles = [
  "src/tests/openapi.test.ts",
  "src/tests/openapiRouteCoverage.test.ts",
  "src/tests/entitlementsService.test.ts",
  "src/tests/unitsCore.test.ts",
  "src/tests/ai/promptComposer.test.ts",
  "src/tests/ai/reportingAst.test.ts",
];

/** Imported by thin barrel files — exclude from glob to avoid duplicate runs. */
const integrationBarrelPartFiles = [
  "src/tests/brewSessionsCreate.test.ts",
  "src/tests/brewSessionsSteps.test.ts",
  "src/tests/brewSessionsHydrometer.test.ts",
  "src/tests/brewSessionsExport.test.ts",
  "src/tests/recipesCrud.test.ts",
  "src/tests/recipesAnalysis.test.ts",
  "src/tests/inventoryFermentable.test.ts",
  "src/tests/inventoryHop.test.ts",
  "src/tests/inventoryMisc.test.ts",
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
          exclude: [...unitTestFiles, ...integrationBarrelPartFiles],
          setupFiles: ["src/tests/vitest.setup.ts"],
        },
      },
    ],
  },
});
