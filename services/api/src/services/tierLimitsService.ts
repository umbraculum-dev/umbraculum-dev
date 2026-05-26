import type { BillingTier } from "@prisma/client";

export type TierLimits = {
  maxRecipesPerWorkspace: number;
  maxVersionsPerRecipe: number;
  /**
   * Whether the AI consultant feature is unlocked on this billing tier.
   * Gated by docs/PLATFORM-ARCHITECTURE.md §4.3 and the v0 monetization
   * model (internal/AI-MONETIZATION-STRATEGY.md): BYOK + paid value-layer
   * subscription. Free workspaces see a 402 + upgrade prompt; paid workspaces
   * unlock the feature subject to per-workspace enablement, role limits, and
   * per-user daily caps.
   */
  aiEnabled: boolean;
};

const LIMITS_BY_TIER: Record<BillingTier, TierLimits> = {
  free: { maxRecipesPerWorkspace: 5, maxVersionsPerRecipe: 2, aiEnabled: false },
  premium: { maxRecipesPerWorkspace: 25, maxVersionsPerRecipe: 3, aiEnabled: true },
  pro: { maxRecipesPerWorkspace: 99, maxVersionsPerRecipe: 5, aiEnabled: true },
  pro_plus: { maxRecipesPerWorkspace: 1000, maxVersionsPerRecipe: 99, aiEnabled: true },
};

export function getTierLimits(tier: BillingTier): TierLimits {
  return LIMITS_BY_TIER[tier] ?? LIMITS_BY_TIER.free;
}

