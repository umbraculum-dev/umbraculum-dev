import { describe, expect, it } from "vitest";

import { MaterialRequirementListResponseSchema, MaterialRequirementSchema } from "./materialRequirement.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

const requirement = {
  id: "req-1",
  workspaceId: "ws-1",
  productionOrderId: "po-1",
  bomLineId: "line-1",
  materialRefModule: "brewery",
  materialRefId: "fermentable-1",
  description: "Pale malt",
  requiredQuantity: 42,
  unit: "kg",
  availabilityStatus: "planned",
  availabilityNote: null,
};

describe("MRP material requirement schemas", () => {
  it("accepts a material-requirement list response", () => {
    expect(MaterialRequirementListResponseSchema.parse({ ok: true, items: [requirement] }).items[0])
      .toMatchObject({ description: "Pale malt" });
  });

  it("rejects invalid availability statuses with a field path", () => {
    expectFirstIssuePathStartsWith(
      MaterialRequirementSchema,
      { ...requirement, availabilityStatus: "missing" },
      ["availabilityStatus"],
    );
  });
});
