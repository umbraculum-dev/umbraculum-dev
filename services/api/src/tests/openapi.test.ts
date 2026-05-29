import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validate as validateOpenApi } from "@readme/openapi-parser";
import type { OpenAPI } from "openapi-types";
import { describe, expect, it } from "vitest";

import { OPENAPI_INFO } from "../openapi/metadata.js";

const repoOpenApiPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../openapi/openapi.json",
);

describe("openapi artifact", () => {
  it("parses and validates committed openapi.json", async () => {
    const raw = readFileSync(repoOpenApiPath, "utf8");
    const spec = JSON.parse(raw) as OpenAPI.Document;
    await validateOpenApi(spec);
    expect(spec.info?.title).toBe(OPENAPI_INFO.title);
    expect(spec.info?.description).toContain("Alpha partial OpenAPI spec");
  });

  it("includes alpha module path prefixes", () => {
    const spec = JSON.parse(readFileSync(repoOpenApiPath, "utf8")) as OpenAPI.Document;
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.some((path) => path.startsWith("/mrp/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/pim/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/crp/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/automation/"))).toBe(true);
    expect(paths.some((path) => path.startsWith("/rendering/"))).toBe(true);
    expect(paths).toContain("/health");
    expect(paths.some((path) => path.startsWith("/auth/"))).toBe(false);
  });
});
