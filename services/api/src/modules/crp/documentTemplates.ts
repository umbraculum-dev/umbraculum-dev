import type { DocumentTemplate } from "@umbraculum/module-sdk";
import {
  CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
  CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
  CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
  CRP_SCHEDULE_PDF_TEMPLATE_REF,
  CrpCapacityLoadXlsxInputSchema,
  CrpConflictReportPdfInputSchema,
  CrpResourceCalendarCsvInputSchema,
  CrpSchedulePdfInputSchema,
} from "@umbraculum/crp-contracts";
import { renderCsv, renderXlsxWorkbook } from "@umbraculum/rendering";

import { renderEtaTemplateToPdf } from "../../services/rendering/htmlToPdf.js";

const SCHEDULE_PDF_TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Schedule</title></head>
<body>
<h1>Capacity schedule</h1>
<p>Workspace: <%= it.workspaceId %></p>
<p>Generated: <%= it.generatedAt %></p>
<h2>Scheduled operations</h2>
<table border="1" cellpadding="4">
<tr><th>Resource</th><th>Operation</th><th>Start</th><th>End</th><th>Minutes</th></tr>
<% it.scheduledOperations.forEach(function (op) { %>
<tr>
<td><%= op.resourceId %></td>
<td><%= op.name %> (<%= op.operationCode %>)</td>
<td><%= op.startsAt %></td>
<td><%= op.endsAt %></td>
<td><%= op.plannedDurationMinutes %></td>
</tr>
<% }) %>
</table>
</body></html>`;

const CONFLICT_REPORT_PDF_TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Conflict report</title></head>
<body>
<h1>Capacity conflict report</h1>
<p>Workspace: <%= it.workspaceId %></p>
<p>Generated: <%= it.generatedAt %></p>
<h2>Conflicts</h2>
<ul>
<% it.conflicts.forEach(function (c) { %>
<li><strong><%= c.severity %></strong> — <%= c.message %> (resource <%= c.resourceId %>)</li>
<% }) %>
</ul>
<h2>Load buckets</h2>
<ul>
<% it.loadBuckets.forEach(function (b) { %>
<li><%= b.resourceCode %>: planned <%= b.plannedMinutes %> / available <%= b.availableMinutes %> min</li>
<% }) %>
</ul>
</body></html>`;

const CAPACITY_LOAD_HEADERS = [
  "workspace_id",
  "resource_id",
  "resource_code",
  "bucket_start_at",
  "bucket_end_at",
  "available_minutes",
  "planned_minutes",
  "overload_minutes",
] as const;

const RESOURCE_CALENDAR_HEADERS = [
  "workspace_id",
  "resource_id",
  "resource_code",
  "resource_name",
  "bucket_start_at",
  "bucket_end_at",
  "planned_minutes",
  "available_minutes",
  "overload_minutes",
] as const;

export const crpDocumentTemplates: readonly DocumentTemplate<unknown>[] = [
  {
    kind: "xlsx",
    ref: CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
    schema: CrpCapacityLoadXlsxInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = CrpCapacityLoadXlsxInputSchema.parse(data);
      const rows = input.loadBuckets.map((bucket) => ({
        workspace_id: input.workspaceId,
        resource_id: bucket.resourceId,
        resource_code: bucket.resourceCode,
        bucket_start_at: bucket.bucketStartAt,
        bucket_end_at: bucket.bucketEndAt,
        available_minutes: bucket.availableMinutes,
        planned_minutes: bucket.plannedMinutes,
        overload_minutes: bucket.overloadMinutes,
      }));
      const artifact = await renderXlsxWorkbook((workbook) => {
        const sheet = workbook.addWorksheet("Capacity load");
        sheet.columns = CAPACITY_LOAD_HEADERS.map((header) => ({ header, key: header }));
        for (const row of rows) {
          sheet.addRow(row);
        }
      });
      return artifact.body;
    },
  },
  {
    kind: "pdf",
    ref: CRP_SCHEDULE_PDF_TEMPLATE_REF,
    schema: CrpSchedulePdfInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = CrpSchedulePdfInputSchema.parse(data);
      return renderEtaTemplateToPdf(SCHEDULE_PDF_TEMPLATE, {
        workspaceId: input.workspaceId,
        generatedAt: input.generatedAt,
        scheduledOperations: input.scheduledOperations,
      });
    },
  },
  {
    kind: "csv",
    ref: CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
    schema: CrpResourceCalendarCsvInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = CrpResourceCalendarCsvInputSchema.parse(data);
      const resourceById = new Map(input.resources.map((resource) => [resource.id, resource]));
      const rows = input.loadBuckets.map((bucket) => {
        const resource = resourceById.get(bucket.resourceId);
        return {
          workspace_id: input.workspaceId,
          resource_id: bucket.resourceId,
          resource_code: bucket.resourceCode,
          resource_name: resource?.name ?? "",
          bucket_start_at: bucket.bucketStartAt,
          bucket_end_at: bucket.bucketEndAt,
          planned_minutes: bucket.plannedMinutes,
          available_minutes: bucket.availableMinutes,
          overload_minutes: bucket.overloadMinutes,
        };
      });
      const artifact = await renderCsv(rows, { headers: RESOURCE_CALENDAR_HEADERS });
      return artifact.body;
    },
  },
  {
    kind: "pdf",
    ref: CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
    schema: CrpConflictReportPdfInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = CrpConflictReportPdfInputSchema.parse(data);
      return renderEtaTemplateToPdf(CONFLICT_REPORT_PDF_TEMPLATE, {
        workspaceId: input.workspaceId,
        generatedAt: input.generatedAt,
        conflicts: input.conflicts,
        loadBuckets: input.loadBuckets,
      });
    },
  },
];
