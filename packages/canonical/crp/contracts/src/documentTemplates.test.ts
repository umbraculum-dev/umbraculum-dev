import { describe, expect, it } from "vitest";

import {
  CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
  CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
  CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
  CRP_SCHEDULE_PDF_TEMPLATE_REF,
  CrpCapacityLoadXlsxInputSchema,
  CrpConflictReportPdfInputSchema,
  CrpResourceCalendarCsvInputSchema,
  CrpSchedulePdfInputSchema,
} from "./documentTemplates.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

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

const scheduledOperation = {
  id: "op-1",
  workspaceId: "ws-1",
  resourceId: "res-1",
  workCenterId: "wc-1",
  productionOrderId: "po-1",
  operationId: "mrp-op-1",
  operationCode: "MASH",
  name: "Mash",
  status: "scheduled",
  sourceModule: "brewery",
  sourceRefId: "step-1",
  startsAt: "2026-08-01T08:00:00.000Z",
  endsAt: "2026-08-01T09:00:00.000Z",
  plannedDurationMinutes: 60,
};

const conflict = {
  id: "conflict-1",
  workspaceId: "ws-1",
  severity: "warning",
  status: "open",
  message: "Missing duration",
  resourceId: "res-1",
  scheduledOperationId: "op-2",
  startsAt: "2026-08-01T10:00:00.000Z",
  endsAt: null,
  createdAt: "2026-05-26T12:00:00.000Z",
};

describe("CRP document-template schemas", () => {
  it("exposes canonical template refs", () => {
    expect(CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF).toBe("crp:capacity-load-xlsx@v1");
    expect(CRP_SCHEDULE_PDF_TEMPLATE_REF).toBe("crp:schedule-pdf@v1");
    expect(CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF).toBe("crp:resource-calendar-csv@v1");
    expect(CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF).toBe("crp:conflict-report-pdf@v1");
  });

  it("accepts planned rendering payloads", () => {
    expect(CrpCapacityLoadXlsxInputSchema.parse({
      workspaceId: "ws-1",
      loadBuckets: [bucket],
    }).loadBuckets).toHaveLength(1);
    expect(CrpSchedulePdfInputSchema.parse({
      workspaceId: "ws-1",
      generatedAt: "2026-05-26T12:00:00.000Z",
      resources: [resource],
      scheduledOperations: [scheduledOperation],
      loadBuckets: [bucket],
    }).scheduledOperations).toHaveLength(1);
    expect(CrpResourceCalendarCsvInputSchema.parse({
      workspaceId: "ws-1",
      resources: [resource],
      loadBuckets: [bucket],
    }).resources).toHaveLength(1);
    expect(CrpConflictReportPdfInputSchema.parse({
      workspaceId: "ws-1",
      generatedAt: "2026-05-26T12:00:00.000Z",
      conflicts: [conflict],
      loadBuckets: [bucket],
    }).conflicts).toHaveLength(1);
  });

  it("rejects empty workspace ids with a field path", () => {
    expectFirstIssuePathStartsWith(
      CrpCapacityLoadXlsxInputSchema,
      { workspaceId: "", loadBuckets: [bucket] },
      ["workspaceId"],
    );
  });
});
