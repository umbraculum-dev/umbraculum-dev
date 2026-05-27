import type { AiProposal, PrismaClient } from "@prisma/client";
import type { AiProposalDto } from "@umbraculum/contracts";

import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors.js";
import { WorkspacesService } from "../workspacesService.js";

export class AiProposalService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  toDto(row: AiProposal): AiProposalDto {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      moduleCode: row.moduleCode,
      proposalType: row.proposalType,
      summary: row.summary,
      payloadJson: row.payloadJson as Record<string, unknown>,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      appliedAt: row.appliedAt ? row.appliedAt.toISOString() : null,
      rejectedAt: row.rejectedAt ? row.rejectedAt.toISOString() : null,
    };
  }

  async create(input: {
    workspaceId: string;
    userId: string;
    moduleCode: string;
    proposalType: string;
    summary: string;
    payloadJson: Record<string, unknown>;
  }): Promise<AiProposal> {
    await this.workspaces.assertMembership(input.userId, input.workspaceId);
    return this.prisma.aiProposal.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        moduleCode: input.moduleCode,
        proposalType: input.proposalType,
        summary: input.summary,
        payloadJson: input.payloadJson as object,
      },
    });
  }

  async list(userId: string, workspaceId: string, limit = 20): Promise<AiProposal[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    return this.prisma.aiProposal.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 50),
    });
  }

  async getById(userId: string, workspaceId: string, id: string): Promise<AiProposal> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.aiProposal.findFirst({
      where: { id, workspaceId },
    });
    if (!row) throw new NotFoundError("ai_proposal_not_found", "Proposal not found");
    return row;
  }

  async apply(userId: string, workspaceId: string, id: string): Promise<{ row: AiProposal; appliedPreviewOnly: boolean }> {
    const row = await this.getById(userId, workspaceId, id);
    if (row.status !== "pending") {
      throw new BadRequestError("ai_proposal_not_pending", "Proposal is not pending");
    }
    const updated = await this.prisma.aiProposal.update({
      where: { id },
      data: { status: "applied", appliedAt: new Date() },
    });
    return { row: updated, appliedPreviewOnly: true };
  }

  async reject(userId: string, workspaceId: string, id: string): Promise<AiProposal> {
    const row = await this.getById(userId, workspaceId, id);
    if (row.status !== "pending") {
      throw new BadRequestError("ai_proposal_not_pending", "Proposal is not pending");
    }
    if (row.userId !== userId) {
      const role = await this.workspaces.getMembershipRole(userId, workspaceId);
      if (role !== "brewery_admin") {
        throw new ForbiddenError("ai_proposal_reject_forbidden", "Cannot reject another user's proposal");
      }
    }
    return this.prisma.aiProposal.update({
      where: { id },
      data: { status: "rejected", rejectedAt: new Date() },
    });
  }
}
