import type { PrismaClient } from "@prisma/client";
import { ForbiddenError } from "../errors.js";

export class WorkspacesService {
  constructor(private readonly prisma: PrismaClient) {}

  async listWorkspacesForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: "asc" },
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      brandKey: m.workspace.brandKey ?? "default",
    }));
  }

  async getMembershipRole(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    return membership?.role ?? null;
  }

  async assertMembership(userId: string, workspaceId: string) {
    const role = await this.getMembershipRole(userId, workspaceId);
    if (!role) throw new ForbiddenError("not_a_member", "User is not a member of this workspace");
    return role;
  }

  async createWorkspaceForUser(userId: string, name: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: "brewery_admin",
          },
        },
      },
    });

    return workspace;
  }
}

