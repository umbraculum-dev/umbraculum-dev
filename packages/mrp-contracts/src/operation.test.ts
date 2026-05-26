import { describe, expect, it } from "vitest";

import { OperationSchema, ScheduleableOperationSchema } from "./operation.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

describe("MRP operation schemas", () => {
  it("accepts a scheduleable operation", () => {
    expect(
      ScheduleableOperationSchema.parse({
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
      }),
    ).toMatchObject({ operationCode: "mash" });
  });

  it("rejects invalid operation sequences with a field path", () => {
    expectFirstIssuePathStartsWith(
      OperationSchema,
      {
        id: "op-1",
        workspaceId: "ws-1",
        productionOrderId: "po-1",
        sequence: 0,
        code: "mash",
        name: "Mash",
        requiredResourceKind: null,
        plannedDurationMinutes: null,
        earliestStartAt: null,
        dueAt: null,
      },
      ["sequence"],
    );
  });
});
