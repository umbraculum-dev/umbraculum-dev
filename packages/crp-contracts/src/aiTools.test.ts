import { describe, expect, it } from "vitest";

import {
  CrpExplainCapacityLoadToolInputSchema,
  CrpGetScheduleToolInputSchema,
  CrpListConflictsToolInputSchema,
  CrpListResourcesToolInputSchema,
  CrpListScheduledOperationsToolInputSchema,
  CrpListWorkCentersToolInputSchema,
} from "./aiTools.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

describe("CRP AI-tool schemas", () => {
  it("accepts planned read-only tool inputs", () => {
    expect(CrpListResourcesToolInputSchema.parse({ kind: "equipment" })).toEqual({
      kind: "equipment",
    });
    expect(CrpExplainCapacityLoadToolInputSchema.parse({ resourceId: "res-1" }))
      .toEqual({ resourceId: "res-1" });
    expect(CrpListWorkCentersToolInputSchema.parse({})).toEqual({});
    expect(CrpListScheduledOperationsToolInputSchema.parse({})).toEqual({});
    expect(CrpListConflictsToolInputSchema.parse({})).toEqual({});
  });

  it("rejects empty schedule ids with a field path", () => {
    expectFirstIssuePathStartsWith(
      CrpGetScheduleToolInputSchema,
      { scheduleId: "" },
      ["scheduleId"],
    );
  });
});
