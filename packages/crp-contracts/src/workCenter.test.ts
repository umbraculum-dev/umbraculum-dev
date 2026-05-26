import { describe, expect, it } from "vitest";

import { WorkCenterListResponseSchema, WorkCenterSchema } from "./workCenter.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const workCenter = {
  id: "wc-1",
  workspaceId: "ws-1",
  code: "CELLAR",
  name: "Cellar",
  resourceId: "res-1",
  status: "active",
  sourceModule: "brewery",
  sourceRefId: "area-1",
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
};

describe("CRP work-center schemas", () => {
  it("accepts list response envelopes", () => {
    expect(WorkCenterListResponseSchema.parse({ ok: true, items: [workCenter] }).items[0]?.code)
      .toBe("CELLAR");
  });

  it("rejects invalid statuses with a field path", () => {
    expectFirstIssuePathStartsWith(
      WorkCenterSchema,
      { ...workCenter, status: "archived" },
      ["status"],
    );
  });
});
