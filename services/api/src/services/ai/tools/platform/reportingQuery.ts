import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { ReportingExecutor } from "../../reporting/reportingExecutor.js";
import { ReportingQueryAstSchema } from "../../reporting/reportingAst.js";

const OutputSchema = z.object({
  ok: z.literal(true),
  rows: z.array(z.record(z.string(), z.unknown())),
  rowCount: z.number().int(),
  truncated: z.boolean(),
});

export function createPlatformReportingQueryTool(
  prisma: PrismaClient,
): AiTool<z.infer<typeof ReportingQueryAstSchema>, z.infer<typeof OutputSchema>> {
  const executor = new ReportingExecutor(prisma);

  return {
    name: "platform.reportingQuery",
    description:
      "Run a typed reporting query on curated analytics views. Requires dateFrom and dateTo; never use raw SQL.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        view: {
          type: "string",
          enum: ["mrp_order_status_counts", "brewery_inventory_summary"],
        },
        metrics: { type: "array", items: { type: "string" } },
        dimensions: { type: "array", items: { type: "string" } },
        dateFrom: { type: "string" },
        dateTo: { type: "string" },
        limit: { type: "integer", maximum: 100 },
      },
      required: ["view", "metrics", "dateFrom", "dateTo"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const ast = ReportingQueryAstSchema.parse(input);
      const result = await executor.execute(ctx.workspaceId, ast);
      return OutputSchema.parse({ ok: true, ...result });
    },
  };
}
