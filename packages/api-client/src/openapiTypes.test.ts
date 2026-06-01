import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("OpenAPI generated types", () => {
  it("platform artifact includes /health", () => {
    const text = readFileSync(join(pkgRoot, "src/generated/platform.openapi.ts"), "utf8");
    expect(text).toContain('"/health"');
  });

  it("brewery artifact includes brewery-tagged paths", () => {
    const text = readFileSync(join(pkgRoot, "src/generated/brewery.openapi.ts"), "utf8");
    expect(text).toContain('"/recipes"');
  });
});
