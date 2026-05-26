import { describe, expect, it } from "vitest";

import {
  CapacityScheduleGetResponseSchema,
  CapacityScheduleListResponseSchema,
  ScheduleAssignmentSchema,
} from "./schedule.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const assignment = {
  id: "assign-1",
  workspaceId: "ws-1",
  scheduleId: "sched-1",
  resourceId: "res-1",
  productionOrderId: "po-1",
  operationId: "op-1",
  sourceModule: "mrp",
  sourceRefId: "op-1",
  startsAt: "2026-08-01T08:00:00.000Z",
  endsAt: "2026-08-01T10:00:00.000Z",
  plannedDurationMinutes: 120,
};

const schedule = {
  id: "sched-1",
  workspaceId: "ws-1",
  code: "AUG-WEEK-1",
  name: "August week 1",
  status: "proposed",
  horizonStartAt: "2026-08-01T00:00:00.000Z",
  horizonEndAt: "2026-08-08T00:00:00.000Z",
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
  assignments: [assignment],
};

describe("CRP schedule schemas", () => {
  it("accepts list and get response envelopes", () => {
    expect(CapacityScheduleListResponseSchema.parse({ ok: true, items: [schedule] }).items)
      .toHaveLength(1);
    expect(CapacityScheduleGetResponseSchema.parse({ ok: true, item: schedule }).item.status)
      .toBe("proposed");
  });

  it("rejects inverted assignments with a field path", () => {
    expectFirstIssuePathStartsWith(
      ScheduleAssignmentSchema,
      { ...assignment, endsAt: "2026-08-01T08:00:00.000Z" },
      ["endsAt"],
    );
  });
});
