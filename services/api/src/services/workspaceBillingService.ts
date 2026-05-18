import type { BillingSource, BillingTier, PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { getTierLimits } from "./tierLimitsService.js";

export type WorkspaceBillingSummary = {
  workspaceId: string;
  tier: BillingTier;
  expiresAt: string | null;
  limits: ReturnType<typeof getTierLimits>;
};

export class WorkspaceBillingService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async getWorkspaceBilling(userId: string, workspaceId: string): Promise<WorkspaceBillingSummary> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const existing = await this.prisma.workspaceBilling.findUnique({
      where: { workspaceId },
    });

    const tier = existing?.tier ?? "free";
    const expiresAt = existing?.expiresAt ? existing.expiresAt.toISOString() : null;

    return {
      workspaceId,
      tier,
      expiresAt,
      limits: getTierLimits(tier),
    };
  }

  async bindUserToWorkspaceForBilling(input: { userId: string; workspaceId: string; provider?: "stripe" | "apple" | "google" | null }) {
    const { userId, workspaceId } = input;
    if (!userId) throw new BadRequestError("invalid_user_id", "userId is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "workspaceId is required");

    // v1 constraint: 1 binding per user; overwrite only through explicit purchase/confirm flows.
    await this.prisma.billingUserWorkspaceBinding.upsert({
      where: { userId },
      create: {
        userId,
        workspaceId,
        ...(input.provider != null ? { provider: input.provider } : {}),
      },
      update: {
        workspaceId,
        ...(input.provider != null ? { provider: input.provider } : {}),
      },
      select: { userId: true },
    });
  }

  async applyTierToWorkspace(input: {
    workspaceId: string;
    tier: BillingTier;
    expiresAt?: Date | null;
    source: BillingSource;
    rcAppUserId?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  }) {
    const workspaceId = input.workspaceId.trim();
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "workspaceId is required");

    await this.prisma.workspaceBilling.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        tier: input.tier,
        expiresAt: input.expiresAt ?? null,
        source: input.source,
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        rcAppUserId: input.rcAppUserId ?? null,
      },
      update: {
        tier: input.tier,
        expiresAt: input.expiresAt ?? null,
        source: input.source,
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        rcAppUserId: input.rcAppUserId ?? null,
      },
      select: { workspaceId: true },
    });
  }

  async requireBreweryAdmin(userId: string, workspaceId: string) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (role !== "brewery_admin") {
      throw new ForbiddenError("not_admin", "Admin role required");
    }
  }
}

