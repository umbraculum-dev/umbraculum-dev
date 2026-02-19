import type { PrismaClient } from "@prisma/client";
import { ForbiddenError } from "../errors.js";

export class AccountsService {
  constructor(private readonly prisma: PrismaClient) {}

  async listAccountsForUser(userId: string) {
    const memberships = await this.prisma.accountMember.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: "asc" },
    });

    return memberships.map((m) => ({
      id: m.account.id,
      name: m.account.name,
      role: m.role,
      brandKey: m.account.brandKey ?? "default",
    }));
  }

  async getMembershipRole(userId: string, accountId: string) {
    const membership = await this.prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId, userId } },
    });
    return membership?.role ?? null;
  }

  async assertMembership(userId: string, accountId: string) {
    const role = await this.getMembershipRole(userId, accountId);
    if (!role) throw new ForbiddenError("not_a_member", "User is not a member of this account");
    return role;
  }

  async createAccountForUser(userId: string, name: string) {
    const account = await this.prisma.account.create({
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

    return account;
  }
}

