import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("brewery OpenAPI generated types", () => {
  it("brewery artifact includes brewery-tagged paths", () => {
    const text = readFileSync(join(pkgRoot, "src/generated/brewery.openapi.ts"), "utf8");
    expect(text).toContain('"/recipes"');
  });
});
