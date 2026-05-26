import { describe, expect, it } from "vitest";

import {
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
  ProductionOrderSchema,
} from "./productionOrder.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

export const productionOrder = {
  id: "po-1",
  workspaceId: "ws-1",
  orderNumber: "MRP-0001",
  status: "planned",
  sourceModule: "brewery",
  sourceRefId: "session-1",
  outputProductId: null,
  outputVariantId: null,
  quantity: 10,
  unit: "bbl",
  plannedStartAt: null,
  dueAt: "2026-08-01T10:00:00.000Z",
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
  lines: [
    {
      id: "line-1",
      productionOrderId: "po-1",
      lineNumber: 1,
      outputProductId: null,
      outputVariantId: null,
      description: "Pale Ale",
      quantity: 10,
      unit: "bbl",
    },
  ],
};

const operation = {
  id: "op-1",
  workspaceId: "ws-1",
  productionOrderId: "po-1",
  sequence: 1,
  code: "mash",
  name: "Mash",
  requiredResourceKind: "mash_tun",
  plannedDurationMinutes: 90,
  earliestStartAt: null,
  dueAt: null,
};

const materialRequirement = {
  id: "req-1",
  workspaceId: "ws-1",
  productionOrderId: "po-1",
  bomLineId: null,
  materialRefModule: "brewery",
  materialRefId: "fermentable-1",
  description: "Pale malt",
  requiredQuantity: 42,
  unit: "kg",
  availabilityStatus: "planned",
  availabilityNote: null,
};

describe("MRP production-order schemas", () => {
  it("accepts list and get response envelopes", () => {
    expect(
      ProductionOrderListResponseSchema.parse({ ok: true, items: [productionOrder] }).items,
    ).toHaveLength(1);
    expect(
      ProductionOrderGetResponseSchema.parse({
        ok: true,
        item: {
          ...productionOrder,
          operations: [operation],
          materialRequirements: [materialRequirement],
        },
      }).item.operations[0]?.code,
    ).toBe("mash");
  });

  it("rejects invalid statuses with a field path", () => {
    expectFirstIssuePathStartsWith(
      ProductionOrderSchema,
      { ...productionOrder, status: "draft" },
      ["status"],
    );
  });
});
