import { describe, expect, it } from "vitest";

import {
  CrpCapacityPlanPdfInputSchema,
  CrpResourceLoadCsvInputSchema,
  CrpScheduleExportCsvInputSchema,
} from "./documentTemplates.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

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
  assignments: [],
};

const resource = {
  id: "res-1",
  workspaceId: "ws-1",
  code: "FV-01",
  name: "Fermenter 1",
  kind: "equipment",
  status: "active",
  sourceModule: "brewery",
  sourceRefId: "equipment-1",
  createdAt: "2026-05-26T12:00:00.000Z",
  updatedAt: "2026-05-26T12:00:00.000Z",
};

const bucket = {
  resourceId: "res-1",
  resourceCode: "FV-01",
  bucketStartAt: "2026-08-01T00:00:00.000Z",
  bucketEndAt: "2026-08-02T00:00:00.000Z",
  availableMinutes: 1440,
  plannedMinutes: 120,
  overloadMinutes: 0,
};

describe("CRP document-template schemas", () => {
  it("accepts planned rendering payloads", () => {
    expect(CrpCapacityPlanPdfInputSchema.parse({
      workspaceId: "ws-1",
      schedule,
      resources: [resource],
      loadBuckets: [bucket],
    }).resources).toHaveLength(1);
    expect(CrpResourceLoadCsvInputSchema.parse({
      workspaceId: "ws-1",
      loadBuckets: [bucket],
    }).loadBuckets).toHaveLength(1);
    expect(CrpScheduleExportCsvInputSchema.parse({ workspaceId: "ws-1", schedule }).schedule.id)
      .toBe("sched-1");
  });

  it("rejects empty workspace ids with a field path", () => {
    expectFirstIssuePathStartsWith(
      CrpCapacityPlanPdfInputSchema,
      {
        workspaceId: "",
        schedule,
        resources: [resource],
        loadBuckets: [bucket],
      },
      ["workspaceId"],
    );
  });
});
