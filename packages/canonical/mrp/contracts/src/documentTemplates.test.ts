import { describe, expect, it } from "vitest";

import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
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
  it("exposes canonical template refs", () => {
    expect(MRP_WORK_ORDER_PDF_TEMPLATE_REF).toBe("mrp:work-order-pdf@v1");
    expect(MRP_ROUTE_CARD_PDF_TEMPLATE_REF).toBe("mrp:route-card-pdf@v1");
    expect(MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF).toBe(
      "mrp:material-requirements-xlsx@v1",
    );
    expect(MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF).toBe("mrp:production-order-csv@v1");
  });

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
