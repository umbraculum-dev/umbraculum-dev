import type { PrismaClient, AccountRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors.js";
import { AccountsService } from "./accountsService.js";

export class AclService {
  private readonly accounts: AccountsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
  }

  async requireRole(userId: string | null | undefined, accountId: string, allowed: AccountRole[]) {
    if (!userId) throw new UnauthorizedError("missing_user", "Not authenticated");
    const role = await this.accounts.getMembershipRole(userId, accountId);
    if (!role) throw new ForbiddenError("not_a_member", "User is not a member of this account");
    if (!allowed.includes(role)) {
      throw new ForbiddenError("insufficient_role", `Requires role: ${allowed.join(", ")}`);
    }
    return role;
  }
}

