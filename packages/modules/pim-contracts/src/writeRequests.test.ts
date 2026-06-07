import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  AttributeCreateRequestSchema,
  AttributeSetCreateRequestSchema,
  CategoryCreateRequestSchema,
  MediaAssetRefCreateRequestSchema,
  ProductCreateRequestSchema,
  ProductUpdateRequestSchema,
  VariantCreateRequestSchema,
} from "./index.js";

function expectFirstIssuePathStartsWith(
  schema: { parse(value: unknown): unknown },
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  try {
    schema.parse(value);
    throw new Error("expected parse to throw");
  } catch (err) {
    if (!(err instanceof ZodError)) throw err;
    const firstPath = err.issues[0]?.path ?? [];
    for (let i = 0; i < expectedPathPrefix.length; i += 1) {
      expect(firstPath[i]).toBe(expectedPathPrefix[i]);
    }
  }
}

describe("PIM write request schemas", () => {
  it("accepts a minimal draft product create request", () => {
    expect(
      ProductCreateRequestSchema.parse({
        sku: "SKU-1",
        name: "Product 1",
      }),
    ).toEqual({ sku: "SKU-1", name: "Product 1" });
  });

  it("rejects invalid product status with a field path", () => {
    expectFirstIssuePathStartsWith(
      ProductCreateRequestSchema,
      { sku: "SKU-1", name: "Product 1", status: "pending" },
      ["status"],
    );
  });

  it("rejects empty product update requests", () => {
    expectFirstIssuePathStartsWith(ProductUpdateRequestSchema, {}, []);
  });

  it("rejects invalid attribute types", () => {
    expectFirstIssuePathStartsWith(
      AttributeCreateRequestSchema,
      { code: "bad", type: "lookup", label: "Bad" },
      ["type"],
    );
  });

  it("rejects invalid attribute value discriminants on variants", () => {
    expectFirstIssuePathStartsWith(
      VariantCreateRequestSchema,
      {
        sku: "VAR-1",
        name: "Variant 1",
        attributeValues: { color: { type: "colour", value: "red" } },
      },
      ["attributeValues", "color", "type"],
    );
  });

  it("rejects empty attribute ids on attribute sets", () => {
    expectFirstIssuePathStartsWith(
      AttributeSetCreateRequestSchema,
      { code: "base", label: "Base", attributeIds: [""] },
      ["attributeIds", 0],
    );
  });

  it("accepts a minimal category create request", () => {
    expect(CategoryCreateRequestSchema.parse({ code: "beer", label: "Beer" })).toEqual({
      code: "beer",
      label: "Beer",
    });
  });

  it("rejects invalid media asset roles", () => {
    expectFirstIssuePathStartsWith(
      MediaAssetRefCreateRequestSchema,
      { mediaAssetId: "media-1", role: "hero" },
      ["role"],
    );
  });
});
