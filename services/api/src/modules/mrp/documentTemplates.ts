import type { DocumentTemplate } from "@umbraculum/module-sdk";
import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  MrpMaterialRequirementsXlsxInputSchema,
  MrpProductionOrderCsvInputSchema,
  MrpRouteCardPdfInputSchema,
  MrpWorkOrderPdfInputSchema,
} from "@umbraculum/mrp-contracts";
import { renderCsv, renderXlsxWorkbook } from "@umbraculum/rendering";

import { renderEtaTemplateToPdf } from "../../services/rendering/htmlToPdf.js";

const WORK_ORDER_PDF_TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Work order</title></head>
<body>
<h1>Work order <%= it.orderNumber %></h1>
<p>Production order: <%= it.productionOrderId %></p>
<p>Status: <%= it.status %></p>
<p>Source: <%= it.sourceModule %> / <%= it.sourceRefId %></p>
<h2>Operations</h2>
<ul>
<% it.operations.forEach(function (op) { %>
<li><%= op.sequence %>. <%= op.name %> (<%= op.code %>) — <%= op.plannedDurationMinutes %> min</li>
<% }) %>
</ul>
<h2>Material requirements</h2>
<ul>
<% it.materialRequirements.forEach(function (req) { %>
<li><%= req.description %> — <%= req.requiredQuantity %> <%= req.unit %></li>
<% }) %>
</ul>
</body></html>`;

const ROUTE_CARD_PDF_TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Route card</title></head>
<body>
<h1>Route card — <%= it.orderNumber %></h1>
<table border="1" cellpadding="4">
<tr><th>Seq</th><th>Code</th><th>Operation</th><th>Minutes</th></tr>
<% it.operations.forEach(function (op) { %>
<tr>
<td><%= op.sequence %></td>
<td><%= op.code %></td>
<td><%= op.name %></td>
<td><%= op.plannedDurationMinutes %></td>
</tr>
<% }) %>
</table>
</body></html>`;

const PRODUCTION_ORDER_CSV_HEADERS = [
  "workspace_id",
  "production_order_id",
  "order_number",
  "status",
  "source_module",
  "source_ref_id",
  "quantity",
  "unit",
] as const;

const MATERIAL_REQUIREMENTS_HEADERS = [
  "workspace_id",
  "production_order_id",
  "order_number",
  "requirement_id",
  "description",
  "required_quantity",
  "unit",
  "availability_status",
] as const;

export const mrpDocumentTemplates: readonly DocumentTemplate<unknown>[] = [
  {
    kind: "pdf",
    ref: MRP_WORK_ORDER_PDF_TEMPLATE_REF,
    schema: MrpWorkOrderPdfInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = MrpWorkOrderPdfInputSchema.parse(data);
      const preview = input.preview;
      return renderEtaTemplateToPdf(WORK_ORDER_PDF_TEMPLATE, {
        orderNumber: preview.productionOrder.orderNumber,
        productionOrderId: input.productionOrderId,
        status: preview.productionOrder.status,
        sourceModule: preview.productionOrder.sourceModule ?? "",
        sourceRefId: preview.productionOrder.sourceRefId ?? "",
        operations: preview.operations,
        materialRequirements: preview.materialRequirements,
      });
    },
  },
  {
    kind: "pdf",
    ref: MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
    schema: MrpRouteCardPdfInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = MrpRouteCardPdfInputSchema.parse(data);
      return renderEtaTemplateToPdf(ROUTE_CARD_PDF_TEMPLATE, {
        orderNumber: input.productionOrder.orderNumber,
        operations: input.operations,
      });
    },
  },
  {
    kind: "xlsx",
    ref: MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
    schema: MrpMaterialRequirementsXlsxInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = MrpMaterialRequirementsXlsxInputSchema.parse(data);
      const rows = input.materialRequirements.map((requirement) => ({
        workspace_id: input.workspaceId,
        production_order_id: input.productionOrder.id,
        order_number: input.productionOrder.orderNumber,
        requirement_id: requirement.id,
        description: requirement.description,
        required_quantity: requirement.requiredQuantity,
        unit: requirement.unit,
        availability_status: requirement.availabilityStatus,
      }));
      const artifact = await renderXlsxWorkbook((workbook) => {
        const sheet = workbook.addWorksheet("Material requirements");
        sheet.columns = MATERIAL_REQUIREMENTS_HEADERS.map((header) => ({
          header,
          key: header,
        }));
        for (const row of rows) {
          sheet.addRow(row);
        }
      });
      return artifact.body;
    },
  },
  {
    kind: "csv",
    ref: MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
    schema: MrpProductionOrderCsvInputSchema,
    retryPolicy: { maxAttempts: 2, backoffMs: 250 },
    async render(data) {
      const input = MrpProductionOrderCsvInputSchema.parse(data);
      const rows = input.productionOrders.map((order) => ({
        workspace_id: input.workspaceId,
        production_order_id: order.id,
        order_number: order.orderNumber,
        status: order.status,
        source_module: order.sourceModule ?? "",
        source_ref_id: order.sourceRefId ?? "",
        quantity: order.quantity,
        unit: order.unit,
      }));
      const artifact = await renderCsv(rows, { headers: PRODUCTION_ORDER_CSV_HEADERS });
      return artifact.body;
    },
  },
];
