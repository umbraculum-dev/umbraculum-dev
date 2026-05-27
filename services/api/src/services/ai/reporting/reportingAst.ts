import { z } from "zod";

export const ReportingViewIdSchema = z.enum([
  "mrp_order_status_counts",
  "brewery_inventory_summary",
]);

export const ReportingQueryAstSchema = z
  .object({
    view: ReportingViewIdSchema,
    metrics: z.array(z.string().min(1).max(64)).min(1).max(8),
    dimensions: z.array(z.string().min(1).max(64)).max(8).optional(),
    filters: z
      .array(
        z
          .object({
            field: z.string().min(1).max(64),
            op: z.literal("eq"),
            value: z.union([z.string(), z.number()]),
          })
          .strict(),
      )
      .max(8)
      .optional(),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    limit: z.number().int().positive().max(100).optional(),
  })
  .strict();

export type ReportingQueryAst = z.infer<typeof ReportingQueryAstSchema>;
