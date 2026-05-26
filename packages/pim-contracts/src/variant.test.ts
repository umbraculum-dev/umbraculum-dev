import { describe, expect, it } from "vitest";

import { VariantSchema } from "./variant.js";

describe("VariantSchema", () => {
  it("parses attributeValues with typed entries", () => {
    const parsed = VariantSchema.parse({
      id: "v1",
      productId: "p1",
      sku: "VAR-1",
      name: "Variant 1",
      attributeValues: {
        color: { type: "string", value: "red" },
        abv: { type: "number", value: 5.2 },
      },
      createdAt: "2026-05-19T12:00:00.000Z",
      updatedAt: "2026-05-19T12:00:00.000Z",
    });
    expect(parsed.attributeValues["color"]?.value).toBe("red");
  });
});
