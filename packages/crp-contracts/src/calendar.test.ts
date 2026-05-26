import { describe, expect, it } from "vitest";

import { CapacityWindowListResponseSchema, CapacityWindowSchema } from "./calendar.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const windowPayload = {
  id: "win-1",
  workspaceId: "ws-1",
  resourceId: "res-1",
  startsAt: "2026-08-01T08:00:00.000Z",
  endsAt: "2026-08-01T16:00:00.000Z",
  capacityMinutes: 480,
  sourceModule: "brewery",
  sourceRefId: "availability-1",
};

describe("CRP capacity-window schemas", () => {
  it("accepts list response envelopes", () => {
    expect(CapacityWindowListResponseSchema.parse({ ok: true, items: [windowPayload] }).items[0])
      .toMatchObject({ capacityMinutes: 480 });
  });

  it("rejects inverted windows with a field path", () => {
    expectFirstIssuePathStartsWith(
      CapacityWindowSchema,
      { ...windowPayload, endsAt: "2026-08-01T08:00:00.000Z" },
      ["endsAt"],
    );
  });
});
