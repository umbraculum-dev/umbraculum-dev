import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validate as validateOpenApi } from "@readme/openapi-parser";
import type { OpenAPI } from "openapi-types";
import { describe, expect, it } from "vitest";

import { OPENAPI_DOCUMENTATION_EXEMPT_ROUTES } from "../openapi/exemptRoutes.js";
import { OPENAPI_INFO } from "../openapi/metadata.js";

const repoOpenApiDir = join(dirname(fileURLToPath(import.meta.url)), "../../openapi");
const platformSpecPath = join(repoOpenApiDir, "openapi.json");
const brewerySpecPath = join(repoOpenApiDir, "brewery.json");

/** Regression floors — bump only when intentionally shrinking a spec. */
const PLATFORM_MIN_PATHS = 81;
const PLATFORM_MIN_OPS = 105;
const BREWERY_MIN_PATHS = 55;
const BREWERY_MIN_OPS = 70;

function countOperations(spec: OpenAPI.Document): number {
  let count = 0;
  for (const pathItem of Object.values(spec.paths ?? {})) {
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      if (method in pathItem) count += 1;
    }
  }
  return count;
}

describe("openapi artifact", () => {
  it("parses and validates committed platform openapi.json", async () => {
    const raw = readFileSync(platformSpecPath, "utf8");
    const spec = JSON.parse(raw) as OpenAPI.Document;
    await validateOpenApi(spec);
    expect(spec.info?.title).toBe(OPENAPI_INFO.title);
    expect(spec.info?.description).toContain("Platform catalog");
  });

  it("parses and validates committed brewery openapi.json", async () => {
    const raw = readFileSync(brewerySpecPath, "utf8");
    const spec = JSON.parse(raw) as OpenAPI.Document;
    await validateOpenApi(spec);
    expect(spec.info?.description).toContain("Brewery reference vertical");
  });

  it("platform spec meets minimum coverage floors", () => {
    const spec = JSON.parse(readFileSync(platformSpecPath, "utf8")) as OpenAPI.Document;
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.length).toBeGreaterThanOrEqual(PLATFORM_MIN_PATHS);
    expect(countOperations(spec)).toBeGreaterThanOrEqual(PLATFORM_MIN_OPS);
  });

  it("brewery spec meets minimum coverage floors", () => {
    const spec = JSON.parse(readFileSync(brewerySpecPath, "utf8")) as OpenAPI.Document;
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.length).toBeGreaterThanOrEqual(BREWERY_MIN_PATHS);
    expect(countOperations(spec)).toBeGreaterThanOrEqual(BREWERY_MIN_OPS);
  });

  it("lists documentation-exempt routes (SSE and similar)", () => {
    expect(OPENAPI_DOCUMENTATION_EXEMPT_ROUTES).toContain("/ai/chat");
  });

  it("includes platform catalog path prefixes", () => {
    const spec = JSON.parse(readFileSync(platformSpecPath, "utf8")) as OpenAPI.Document;
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.some((path) => path.startsWith("/mrp/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/pim/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/crp/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/automation/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/rendering/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/auth/"))).toBe(true);
    expect(paths.some((path) => path.includes("/billing"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/integrations/"))).toBe(true);
    expect(paths).toContain("/health");
    expect(paths).toContain("/workspaces");
    expect(paths.some((path) => path.startsWith("/recipes"))).toBe(false);
  });

  it("brewery spec contains brewery routes only", () => {
    const spec = JSON.parse(readFileSync(brewerySpecPath, "utf8")) as OpenAPI.Document;
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.some((path) => path.startsWith("/recipes"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/water-profiles"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/water-calc/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/mrp/"))).toBe(false);
    expect(paths.some((path) => path.startsWith("/auth/"))).toBe(false);
  });
});
