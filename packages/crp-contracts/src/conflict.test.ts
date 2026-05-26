import { describe, expect, it } from "vitest";

import { CapacityConflictListResponseSchema, CapacityConflictSchema } from "./conflict.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const conflict = {
  id: "conflict-1",
  workspaceId: "ws-1",
  severity: "warning",
  status: "open",
  message: "Resource is overloaded.",
  resourceId: "res-1",
  scheduledOperationId: null,
  startsAt: "2026-08-01T08:00:00.000Z",
  endsAt: "2026-08-01T09:00:00.000Z",
  createdAt: "2026-05-26T12:00:00.000Z",
};

describe("CRP capacity-conflict schemas", () => {
  it("accepts list response envelopes", () => {
    expect(CapacityConflictListResponseSchema.parse({ ok: true, items: [conflict] }).items[0]?.severity)
      .toBe("warning");
  });

  it("rejects invalid severity values with a field path", () => {
    expectFirstIssuePathStartsWith(
      CapacityConflictSchema,
      { ...conflict, severity: "low" },
      ["severity"],
    );
  });
});
