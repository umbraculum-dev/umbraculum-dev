import type { BillingPurchaseIntentMode, BillingPurchaseProvider, PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

export type CreateBillingIntentInput = {
  userId: string;
  workspaceId: string;
  planCode: string;
  provider: BillingPurchaseProvider;
  mode: BillingPurchaseIntentMode;
};

const INTENT_TTL_MINUTES = 30;

function nowPlusMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export class BillingIntentsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async assertCanCreateIntent(userId: string, workspaceId: string) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (role !== "brewery_admin") {
      throw new ForbiddenError("not_admin", "Admin role required");
    }
  }

  async createIntent(input: CreateBillingIntentInput) {
    await this.assertCanCreateIntent(input.userId, input.workspaceId);

    const planCode = input.planCode.trim();
    if (!planCode) throw new BadRequestError("invalid_plan_code", "Body.planCode is required");

    return this.prisma.billingPurchaseIntent.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        planCode,
        provider: input.provider,
        mode: input.mode,
        expiresAt: nowPlusMinutes(INTENT_TTL_MINUTES),
      },
      select: {
        id: true,
        userId: true,
        workspaceId: true,
        planCode: true,
        provider: true,
        mode: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async resolveIntent(billingIntentId: string) {
    const id = billingIntentId.trim();
    if (!id) throw new BadRequestError("invalid_billing_intent_id", "billingIntentId is required");

    const intent = await this.prisma.billingPurchaseIntent.findUnique({
      where: { id },
    });
    if (!intent) throw new NotFoundError("billing_intent_not_found", "Billing intent not found");

    if (intent.status !== "created") {
      throw new BadRequestError("billing_intent_not_active", "Billing intent is not active");
    }

    if (intent.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestError("billing_intent_expired", "Billing intent expired");
    }

    return intent;
  }

  async fulfillIntent(
    billingIntentId: string,
    input: { stripeCheckoutSessionId?: string | null; stripeSubscriptionId?: string | null },
  ) {
    const intent = await this.resolveIntent(billingIntentId);

    return this.prisma.billingPurchaseIntent.update({
      where: { id: intent.id },
      data: {
        status: "fulfilled",
        fulfilledAt: new Date(),
        ...(input.stripeCheckoutSessionId != null ? { stripeCheckoutSessionId: input.stripeCheckoutSessionId } : {}),
        ...(input.stripeSubscriptionId != null ? { stripeSubscriptionId: input.stripeSubscriptionId } : {}),
      },
      select: {
        id: true,
        userId: true,
        workspaceId: true,
        planCode: true,
        provider: true,
        status: true,
        expiresAt: true,
        fulfilledAt: true,
      },
    });
  }
}

