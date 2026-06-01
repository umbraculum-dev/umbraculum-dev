import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validate as validateOpenApi } from "@readme/openapi-parser";
import type { OpenAPI } from "openapi-types";
import { describe, expect, it } from "vitest";

import { OPENAPI_INFO } from "../openapi/metadata.js";

const repoOpenApiDir = join(dirname(fileURLToPath(import.meta.url)), "../../openapi");
const platformSpecPath = join(repoOpenApiDir, "openapi.json");
const brewerySpecPath = join(repoOpenApiDir, "brewery.json");

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
    expect(spec.info?.description).toContain("brewery reference vertical");
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
