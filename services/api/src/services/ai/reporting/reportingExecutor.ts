import type { PrismaClient } from "@prisma/client";

import { BadRequestError } from "../../../errors.js";
import type { ReportingQueryAst } from "./reportingAst.js";

const VIEW_CONFIG: Record<
  ReportingQueryAst["view"],
  { metrics: string[]; dimensions: string[]; sql: string }
> = {
  mrp_order_status_counts: {
    metrics: ["order_count"],
    dimensions: ["status"],
    sql: `SELECT status, order_count::float AS order_count
          FROM reporting.mrp_order_status_counts
          WHERE workspace_id = $1::uuid
          ORDER BY status
          LIMIT $2`,
  },
  brewery_inventory_summary: {
    metrics: ["on_hand_qty"],
    dimensions: ["category"],
    sql: `SELECT category, on_hand_qty::float AS on_hand_qty
          FROM reporting.brewery_inventory_summary
          WHERE workspace_id = $1::uuid
          ORDER BY category
          LIMIT $2`,
  },
};

export class ReportingExecutor {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(workspaceId: string, ast: ReportingQueryAst): Promise<{
    rows: Record<string, unknown>[];
    rowCount: number;
    truncated: boolean;
  }> {
    const cfg = VIEW_CONFIG[ast.view];
    for (const m of ast.metrics) {
      if (!cfg.metrics.includes(m)) {
        throw new BadRequestError("invalid_metric", `Metric "${m}" is not allowed for ${ast.view}`);
      }
    }
    if (ast.dimensions) {
      for (const d of ast.dimensions) {
        if (!cfg.dimensions.includes(d)) {
          throw new BadRequestError(
            "invalid_dimension",
            `Dimension "${d}" is not allowed for ${ast.view}`,
          );
        }
      }
    }
    const limit = ast.limit ?? 50;
    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      cfg.sql,
      workspaceId,
      limit,
    );
    return {
      rows,
      rowCount: rows.length,
      truncated: rows.length >= limit,
    };
  }
}
