import type { PrismaClient } from "@prisma/client";

/**
 * RFC-0009 enforcement mode.
 * - tier_only (public α): tier limits only; hasActiveAddon is always true.
 * - tier_and_addons (H1 2027): query platform.WorkspaceBillingAddon rows.
 */
export type EntitlementEnforcementMode = "tier_only" | "tier_and_addons";

/**
 * Platform entitlement queries for module add-on codes declared via registerModule.
 * Persistence and purchase flows land in H1 2027 — see docs/rfcs/0009-workspace-billing-addons-and-entitlements.md.
 */
export class EntitlementsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly enforcementMode: EntitlementEnforcementMode = "tier_only",
  ) {}

  getEnforcementMode(): EntitlementEnforcementMode {
    return this.enforcementMode;
  }

  /**
   * Whether the workspace has an active entitlement for the given add-on SKU.
   * In tier_only mode (public α), returns true without a DB lookup so call sites
   * can be wired before WorkspaceBillingAddon lands.
   */
  hasActiveAddon(_workspaceId: string, _addonCode: string): Promise<boolean> {
    if (this.enforcementMode === "tier_only") {
      return Promise.resolve(true);
    }

    // H1 2027: query platform.workspace_billing_addons when the model ships.
    void this.prisma;
    return Promise.resolve(false);
  }
}
