import { describe, expect, it } from "vitest";

import {
  MrpMaterialRequirementsXlsxInputSchema,
  MrpProductionOrderCsvInputSchema,
  MrpRouteCardPdfInputSchema,
  MrpWorkOrderPdfInputSchema,
} from "./documentTemplates.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const productionOrder = {
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
  dueAt: null,
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
  lines: [],
};

describe("MRP document-template schemas", () => {
  it("accepts planned rendering payloads", () => {
    expect(MrpRouteCardPdfInputSchema.parse({
      workspaceId: "ws-1",
      productionOrder,
      operations: [],
    }).workspaceId).toBe("ws-1");
    expect(MrpMaterialRequirementsXlsxInputSchema.parse({
      workspaceId: "ws-1",
      productionOrder,
      materialRequirements: [],
    }).materialRequirements).toHaveLength(0);
    expect(MrpProductionOrderCsvInputSchema.parse({
      workspaceId: "ws-1",
      productionOrders: [productionOrder],
    }).productionOrders).toHaveLength(1);
  });

  it("rejects missing work-order identifiers with a field path", () => {
    expectFirstIssuePathStartsWith(
      MrpWorkOrderPdfInputSchema,
      {
        workspaceId: "ws-1",
        productionOrderId: "",
        preview: {
          productionOrder,
          operations: [],
          materialRequirements: [],
          operatorNotes: [],
        },
      },
      ["productionOrderId"],
    );
  });
});
