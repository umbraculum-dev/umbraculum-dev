import { describe, expect, it } from "vitest";

import {
  CapacityBucketSchema,
  CapacityLoadQuerySchema,
  CapacityLoadResponseSchema,
} from "./capacityLoad.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const bucket = {
  resourceId: "res-1",
  resourceCode: "FV-01",
  bucketStartAt: "2026-08-01T00:00:00.000Z",
  bucketEndAt: "2026-08-02T00:00:00.000Z",
  availableMinutes: 1440,
  plannedMinutes: 90,
  overloadMinutes: 0,
};

describe("CRP capacity-load schemas", () => {
  it("accepts query and response envelopes", () => {
    expect(CapacityLoadQuerySchema.parse({ resourceId: "res-1" })).toEqual({
      resourceId: "res-1",
    });
    expect(CapacityLoadResponseSchema.parse({
      ok: true,
      item: { workspaceId: "ws-1", buckets: [bucket] },
    }).item.buckets[0]?.plannedMinutes).toBe(90);
  });

  it("rejects inverted bucket windows with a field path", () => {
    expectFirstIssuePathStartsWith(
      CapacityBucketSchema,
      { ...bucket, bucketEndAt: "2026-08-01T00:00:00.000Z" },
      ["bucketEndAt"],
    );
  });
});
