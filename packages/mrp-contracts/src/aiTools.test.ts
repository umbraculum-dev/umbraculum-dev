import { describe, expect, it } from "vitest";

import {
  MrpGetProductionOrderToolInputSchema,
  MrpListProductionOrdersToolInputSchema,
  MrpSummarizeWorkOrderToolInputSchema,
} from "./aiTools.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

describe("MRP AI-tool schemas", () => {
  it("accepts planned read-only tool inputs", () => {
    expect(MrpListProductionOrdersToolInputSchema.parse({ status: "planned" })).toEqual({
      status: "planned",
    });
    expect(MrpGetProductionOrderToolInputSchema.parse({ productionOrderId: "po-1" }))
      .toEqual({ productionOrderId: "po-1" });
  });

  it("rejects empty production-order ids with a field path", () => {
    expectFirstIssuePathStartsWith(
      MrpSummarizeWorkOrderToolInputSchema,
      { productionOrderId: "" },
      ["productionOrderId"],
    );
  });
});
