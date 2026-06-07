import { describe, expect, it } from "vitest";

import { CapacityLoadBucketSchema, CapacityLoadResponseSchema } from "./load.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const bucket = {
  resourceId: "res-1",
  resourceCode: "FV-01",
  bucketStartAt: "2026-08-01T00:00:00.000Z",
  bucketEndAt: "2026-08-02T00:00:00.000Z",
  availableMinutes: 1440,
  plannedMinutes: 120,
  overloadMinutes: 0,
};

describe("CRP load schemas", () => {
  it("accepts load response envelopes", () => {
    expect(CapacityLoadResponseSchema.parse({ ok: true, items: [bucket] }).items[0])
      .toMatchObject({ resourceCode: "FV-01" });
  });

  it("rejects inverted buckets with a field path", () => {
    expectFirstIssuePathStartsWith(
      CapacityLoadBucketSchema,
      { ...bucket, bucketEndAt: "2026-08-01T00:00:00.000Z" },
      ["bucketEndAt"],
    );
  });
});
