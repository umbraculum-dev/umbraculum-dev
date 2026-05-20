import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { ProductListResponseSchema, ProductSchema } from "./product.js";

const validProduct = {
  id: "p1",
  workspaceId: "ws1",
  sku: "SKU-1",
  name: "Test Product",
  description: null,
  primaryAttributeSetId: null,
  status: "draft" as const,
  createdAt: "2026-05-19T12:00:00.000Z",
  updatedAt: "2026-05-19T12:00:00.000Z",
};

describe("ProductSchema", () => {
  it("parses a well-formed product", () => {
    expect(ProductSchema.parse(validProduct)).toEqual(validProduct);
  });

  it("rejects invalid status", () => {
    expect(() =>
      ProductSchema.parse({ ...validProduct, status: "invalid" }),
    ).toThrow(ZodError);
  });
});

describe("ProductListResponseSchema", () => {
  it("parses list response", () => {
    const parsed = ProductListResponseSchema.parse({
      ok: true,
      items: [validProduct],
    });
    expect(parsed.items).toHaveLength(1);
  });
});
