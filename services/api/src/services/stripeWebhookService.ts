import type { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../errors.js";
import { BillingEventsService } from "./billingEventsService.js";
import { BillingIntentsService } from "./billingIntentsService.js";
import { WorkspaceBillingService } from "./workspaceBillingService.js";

type StripeCheckoutSessionObject = {
  id?: unknown;
  client_reference_id?: unknown;
  subscription?: unknown;
  customer?: unknown;
};

type StripeCheckoutSessionCompletedEvent = {
  id?: unknown;
  type?: unknown;
  data?: { object?: StripeCheckoutSessionObject | null } | null;
};

function getString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export class StripeWebhookService {
  private readonly intents: BillingIntentsService;
  private readonly billing: WorkspaceBillingService;
  private readonly events: BillingEventsService;

  constructor(private readonly prisma: PrismaClient) {
    this.intents = new BillingIntentsService(prisma);
    this.billing = new WorkspaceBillingService(prisma);
    this.events = new BillingEventsService(prisma);
  }

  async handleCheckoutSessionCompleted(payload: unknown) {
    const e = (payload ?? {}) as StripeCheckoutSessionCompletedEvent;
    const eventType = getString(e.type);
    if (eventType !== "checkout.session.completed") {
      throw new BadRequestError("unsupported_stripe_event", "Unsupported Stripe event type");
    }

    const obj: StripeCheckoutSessionObject = e.data?.object ?? {};
    const billingIntentId = getString(obj?.client_reference_id);
    if (!billingIntentId) throw new BadRequestError("missing_client_reference_id", "Missing client_reference_id");

    const stripeSubscriptionId = getString(obj?.subscription);
    const stripeCustomerId = getString(obj?.customer);

    const intent = await this.intents.resolveIntent(billingIntentId);

    // Upsert workspace billing with Stripe IDs. Tier will be applied authoritatively by RevenueCat webhook later.
    await this.billing.applyTierToWorkspace({
      workspaceId: intent.workspaceId,
      tier: "free",
      expiresAt: null,
      source: "stripe",
      rcAppUserId: intent.userId,
      stripeCustomerId,
      stripeSubscriptionId,
    });

    await this.intents.fulfillIntent(billingIntentId, {
      stripeSubscriptionId,
      stripeCheckoutSessionId: getString(obj?.id),
    });

    await this.billing.bindUserToWorkspaceForBilling({
      userId: intent.userId,
      workspaceId: intent.workspaceId,
      provider: "stripe",
    });

    await this.events.recordEvent({
      provider: "stripe",
      externalEventId: getString(e.id),
      userId: intent.userId,
      workspaceId: intent.workspaceId,
      payloadJson: payload,
    });

    // TODO (when RevenueCat account exists): call RC receipts API
    // - POST /v1/receipts with X-Platform=stripe, fetch_token=sub_..., app_user_id=user_id
  }
}

