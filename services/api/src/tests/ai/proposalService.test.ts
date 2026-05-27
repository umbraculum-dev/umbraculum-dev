import { describe, expect, it } from "vitest";

import { AiProposalService } from "../../services/ai/proposalService.js";

describe("AiProposalService", () => {
  it("toDto maps proposal fields", () => {
    const svc = new AiProposalService({} as never);
    const dto = svc.toDto({
      id: "p1",
      workspaceId: "w1",
      userId: "u1",
      moduleCode: "mrp",
      proposalType: "orderAdjustment",
      summary: "test",
      payloadJson: { x: 1 },
      status: "pending",
      createdAt: new Date("2026-05-27T00:00:00.000Z"),
      appliedAt: null,
      rejectedAt: null,
    });
    expect(dto.id).toBe("p1");
    expect(dto.status).toBe("pending");
    expect(dto.payloadJson).toEqual({ x: 1 });
  });
});
