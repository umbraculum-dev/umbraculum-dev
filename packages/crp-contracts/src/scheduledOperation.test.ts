import { describe, expect, it } from "vitest";

import {
  ScheduledOperationListResponseSchema,
  ScheduledOperationSchema,
} from "./scheduledOperation.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const operation = {
  id: "sched-op-1",
  workspaceId: "ws-1",
  resourceId: "res-1",
  workCenterId: "wc-1",
  productionOrderId: "po-1",
  operationId: "op-1",
  operationCode: "mash",
  name: "Mash",
  status: "scheduled",
  sourceModule: "mrp",
  sourceRefId: "op-1",
  startsAt: "2026-08-01T08:00:00.000Z",
  endsAt: "2026-08-01T09:30:00.000Z",
  plannedDurationMinutes: 90,
};

describe("CRP scheduled-operation schemas", () => {
  it("accepts list response envelopes", () => {
    expect(ScheduledOperationListResponseSchema.parse({ ok: true, items: [operation] }).items[0]?.operationCode)
      .toBe("mash");
  });

  it("rejects inverted operation windows with a field path", () => {
    expectFirstIssuePathStartsWith(
      ScheduledOperationSchema,
      { ...operation, endsAt: "2026-08-01T08:00:00.000Z" },
      ["endsAt"],
    );
  });
});
