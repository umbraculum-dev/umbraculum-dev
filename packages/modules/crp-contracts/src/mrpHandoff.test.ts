import { describe, expect, it } from "vitest";

import { CrpScheduleableOperationSchema, MrpHandoffBatchSchema } from "./mrpHandoff.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const operation = {
  productionOrderId: "po-1",
  operationId: "op-1",
  operationCode: "mash",
  requiredResourceKind: "mash_tun",
  plannedDurationMinutes: 90,
  earliestStartAt: null,
  dueAt: "2026-08-01T10:00:00.000Z",
  quantity: 10,
  unit: "bbl",
  sourceModule: "brewery",
  sourceRefId: "session-1",
  preferredResourceId: null,
  schedulingNotes: ["Use any available mash tun."],
};

describe("CRP MRP-handoff schemas", () => {
  it("accepts scheduleable operations from MRP", () => {
    expect(CrpScheduleableOperationSchema.parse(operation).operationCode).toBe("mash");
    expect(
      MrpHandoffBatchSchema.parse({
        workspaceId: "ws-1",
        sourceModule: "mrp",
        operations: [operation],
      }).operations,
    ).toHaveLength(1);
  });

  it("rejects non-MRP handoff batches with a field path", () => {
    expectFirstIssuePathStartsWith(
      MrpHandoffBatchSchema,
      {
        workspaceId: "ws-1",
        sourceModule: "brewery",
        operations: [operation],
      },
      ["sourceModule"],
    );
  });
});
