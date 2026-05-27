import { describe, expect, it } from "vitest";

import { ReportingQueryAstSchema } from "../../services/ai/reporting/reportingAst.js";

describe("ReportingQueryAstSchema", () => {
  it("accepts a minimal valid query", () => {
    const parsed = ReportingQueryAstSchema.parse({
      view: "mrp_order_status_counts",
      metrics: ["order_count"],
      dimensions: ["status"],
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
      limit: 50,
    });
    expect(parsed.view).toBe("mrp_order_status_counts");
  });

  it("rejects limit above 100", () => {
    expect(() =>
      ReportingQueryAstSchema.parse({
        view: "brewery_inventory_summary",
        metrics: ["on_hand_qty"],
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
        limit: 200,
      }),
    ).toThrow();
  });
});
