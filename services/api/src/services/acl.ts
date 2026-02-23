import type { PrismaClient, WorkspaceRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

export class AclService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async requireRole(userId: string | null | undefined, workspaceId: string, allowed: WorkspaceRole[]) {
    if (!userId) throw new UnauthorizedError("missing_user", "Not authenticated");
    const role = await this.workspaces.getMembershipRole(userId, workspaceId);
    if (!role) throw new ForbiddenError("not_a_member", "User is not a member of this workspace");
    if (!allowed.includes(role)) {
      throw new ForbiddenError("insufficient_role", `Requires role: ${allowed.join(", ")}`);
    }
    return role;
  }
}

