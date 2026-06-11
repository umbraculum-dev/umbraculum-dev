import type { PrismaClient } from "@prisma/client";
import { isVerticalInstalled } from "@umbraculum/module-sdk";

/**
 * RFC-0009 enforcement mode.
 * - tier_only (public α): tier limits only; hasActiveAddon is always true.
 * - tier_and_addons (F-mod slice + H1 2027): query platform.WorkspaceBillingAddon rows.
 */
export type EntitlementEnforcementMode = "tier_only" | "tier_and_addons";

/** Vertical add-on codes require the vertical in the server-wide installation profile first. */
const ADDON_VERTICAL_CODES: Readonly<Record<string, string>> = {
  brewery_module: "brewery",
};

export function resolveEntitlementEnforcementMode(
  env: Record<string, string | undefined> = process.env,
): EntitlementEnforcementMode {
  const raw = env["ENTITLEMENTS_ENFORCEMENT_MODE"]?.trim();
  if (raw === "tier_and_addons") return "tier_and_addons";
  return "tier_only";
}

/**
 * Platform entitlement queries for module add-on codes declared via registerModule.
 * Persistence and purchase flows land in H1 2027 — see docs/rfcs/0009-workspace-billing-addons-and-entitlements.md.
 */
export class EntitlementsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly enforcementMode: EntitlementEnforcementMode = resolveEntitlementEnforcementMode(),
  ) {}

  getEnforcementMode(): EntitlementEnforcementMode {
    return this.enforcementMode;
  }

  /**
   * Whether the workspace has an active entitlement for the given add-on SKU.
   * In tier_only mode (public α), returns true without a DB lookup so call sites
   * can be wired before WorkspaceBillingAddon lands.
   *
   * Installation profile is checked before workspace add-on rows — a workspace cannot
   * be entitled to brewery_module when brewery is not installed on this stack.
   */
  async hasActiveAddon(workspaceId: string, addonCode: string): Promise<boolean> {
    const verticalCode = ADDON_VERTICAL_CODES[addonCode];
    if (verticalCode && !isVerticalInstalled(verticalCode)) {
      return false;
    }

    if (process.env["UMBRACULUM_GRANT_ALL_ADDONS"] === "1") {
      return true;
    }
    if (this.enforcementMode === "tier_only") {
      return true;
    }

    const row = await this.prisma.workspaceBillingAddon.findFirst({
      where: { workspaceId, addonCode, status: "active" },
      select: { id: true },
    });
    return row !== null;
  }
}
