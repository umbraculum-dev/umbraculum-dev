import { describe, expect, it } from "vitest";

import {
  WorkOrderDocumentInputSchema,
  WorkOrderPreviewResponseSchema,
  WorkOrderPreviewSchema,
} from "./workOrder.js";
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
  dueAt: "2026-08-01T10:00:00.000Z",
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
  lines: [],
};

const preview = {
  productionOrder,
  operations: [],
  materialRequirements: [],
  operatorNotes: ["Confirm cellar availability before release."],
};

describe("MRP work-order schemas", () => {
  it("accepts preview and document input payloads", () => {
    expect(WorkOrderPreviewResponseSchema.parse({ ok: true, item: preview }).item.operatorNotes)
      .toHaveLength(1);
    expect(
      WorkOrderDocumentInputSchema.parse({
        workspaceId: "ws-1",
        productionOrderId: "po-1",
        preview,
      }).productionOrderId,
    ).toBe("po-1");
  });

  it("rejects empty operator notes with a nested field path", () => {
    expectFirstIssuePathStartsWith(
      WorkOrderPreviewSchema,
      { ...preview, operatorNotes: [""] },
      ["operatorNotes", 0],
    );
  });
});
