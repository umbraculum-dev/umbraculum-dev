import type { BillingTier, PrismaClient } from "@prisma/client";
import { BillingEventsService } from "./billingEventsService.js";
import { WorkspaceBillingService } from "./workspaceBillingService.js";
import { isObject } from "../lib/typeGuards.js";

type RevenueCatPayload = {
  id?: unknown;
  app_user_id?: unknown;
  entitlements?: unknown;
  event?: { id?: unknown; entitlements?: unknown } | null;
};

function getString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function tierFromEntitlements(entitlements: unknown): BillingTier {
  const e = isObject(entitlements) ? entitlements : {};
  const active = (key: string) => {
    const node = isObject(e[key]) ? e[key] : {};
    return Boolean(node.is_active ?? node.isActive ?? node.active);
  };

  if (active("tier_pro_plus")) return "pro_plus";
  if (active("tier_pro")) return "pro";
  if (active("tier_premium")) return "premium";
  return "free";
}

export class RevenueCatWebhookService {
  private readonly billing: WorkspaceBillingService;
  private readonly events: BillingEventsService;

  constructor(private readonly prisma: PrismaClient) {
    this.billing = new WorkspaceBillingService(prisma);
    this.events = new BillingEventsService(prisma);
  }

  async handleEvent(payload: unknown) {
    const p: RevenueCatPayload = isObject(payload) ? (payload) : {};
    const userId = getString(p.app_user_id);

    // Always record an audit event even if we can't apply it.
    await this.events.recordEvent({
      provider: "revenuecat",
      externalEventId: getString(p.id) ?? getString(p.event?.id),
      userId,
      workspaceId: null,
      payloadJson: payload,
    });

    if (!userId) return;

    const binding = await this.prisma.billingUserWorkspaceBinding.findUnique({
      where: { userId },
      select: { workspaceId: true },
    });
    if (!binding) return;

    const tier = tierFromEntitlements(p.entitlements ?? p.event?.entitlements);

    // RevenueCat payloads commonly include expiry timestamps per entitlement; keep nullable for now.
    await this.billing.applyTierToWorkspace({
      workspaceId: binding.workspaceId,
      tier,
      expiresAt: null,
      source: "manual",
      rcAppUserId: userId,
    });
  }
}

