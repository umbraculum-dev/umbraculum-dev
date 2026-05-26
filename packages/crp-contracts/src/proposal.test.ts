import { describe, it } from "vitest";

import { ScheduleProposalInputSchema } from "./proposal.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

describe("CRP schedule-proposal schemas", () => {
  it("rejects empty proposal operation arrays with a field path", () => {
    expectFirstIssuePathStartsWith(
      ScheduleProposalInputSchema,
      {
        workspaceId: "ws-1",
        operations: [],
        horizonStartAt: "2026-08-01T00:00:00.000Z",
        horizonEndAt: "2026-08-08T00:00:00.000Z",
      },
      ["operations"],
    );
  });
});
