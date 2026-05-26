import { describe, expect, it } from "vitest";

import {
  CrpExplainCapacityLoadToolInputSchema,
  CrpGetScheduleToolInputSchema,
  CrpListResourcesToolInputSchema,
} from "./aiTools.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

describe("CRP AI-tool schemas", () => {
  it("accepts planned read-only tool inputs", () => {
    expect(CrpListResourcesToolInputSchema.parse({ kind: "equipment" })).toEqual({
      kind: "equipment",
    });
    expect(CrpExplainCapacityLoadToolInputSchema.parse({ resourceId: "res-1" }))
      .toEqual({ resourceId: "res-1" });
  });

  it("rejects empty schedule ids with a field path", () => {
    expectFirstIssuePathStartsWith(
      CrpGetScheduleToolInputSchema,
      { scheduleId: "" },
      ["scheduleId"],
    );
  });
});
