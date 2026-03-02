import type { BillingTier, PrismaClient } from "@prisma/client";
import { BillingEventsService } from "./billingEventsService.js";
import { WorkspaceBillingService } from "./workspaceBillingService.js";

function getString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function tierFromEntitlements(entitlements: unknown): BillingTier {
  const e = entitlements as any;
  const active = (key: string) => Boolean(e?.[key]?.is_active ?? e?.[key]?.isActive ?? e?.[key]?.active);

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
    const p = (payload ?? {}) as any;
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

