import { describe, expect, it } from "vitest";

import { BomGetResponseSchema, BomLineSchema, BomListResponseSchema } from "./bom.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const bom = {
  id: "bom-1",
  workspaceId: "ws-1",
  code: "PALE-ALE",
  name: "Pale Ale",
  ownerModule: "brewery",
  sourceRefId: "recipe-1",
  lines: [
    {
      id: "bom-line-1",
      bomId: "bom-1",
      lineNumber: 1,
      materialRefModule: "brewery",
      materialRefId: "fermentable-1",
      description: "Pale malt",
      quantity: 42,
      unit: "kg",
      lossPercent: null,
    },
  ],
};

describe("MRP BOM schemas", () => {
  it("accepts list and get response envelopes", () => {
    expect(BomListResponseSchema.parse({ ok: true, items: [bom] }).items).toHaveLength(1);
    expect(BomGetResponseSchema.parse({ ok: true, item: bom }).item.code).toBe("PALE-ALE");
  });

  it("rejects invalid BOM line quantities with a field path", () => {
    expectFirstIssuePathStartsWith(
      BomLineSchema,
      { ...bom.lines[0], quantity: 0 },
      ["quantity"],
    );
  });
});
