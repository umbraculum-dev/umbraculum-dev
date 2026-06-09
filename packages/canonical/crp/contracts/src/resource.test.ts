import { describe, expect, it } from "vitest";

import {
  CapacityResourceGetResponseSchema,
  CapacityResourceListResponseSchema,
  CapacityResourceSchema,
} from "./resource.js";
import { expectFirstIssuePathStartsWith } from "./testHelpers.js";

export const capacityResource = {
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

describe("CRP resource schemas", () => {
  it("accepts list and get response envelopes", () => {
    expect(CapacityResourceListResponseSchema.parse({ ok: true, items: [capacityResource] }).items)
      .toHaveLength(1);
    expect(CapacityResourceGetResponseSchema.parse({ ok: true, item: capacityResource }).item.code)
      .toBe("FV-01");
  });

  it("rejects invalid resource kinds with a field path", () => {
    expectFirstIssuePathStartsWith(
      CapacityResourceSchema,
      { ...capacityResource, kind: "tank" },
      ["kind"],
    );
  });
});
