import type { BillingTier } from "@prisma/client";

export type TierLimits = {
  maxRecipesPerWorkspace: number;
  maxVersionsPerRecipe: number;
};

const LIMITS_BY_TIER: Record<BillingTier, TierLimits> = {
  free: { maxRecipesPerWorkspace: 5, maxVersionsPerRecipe: 2 },
  premium: { maxRecipesPerWorkspace: 25, maxVersionsPerRecipe: 3 },
  pro: { maxRecipesPerWorkspace: 99, maxVersionsPerRecipe: 5 },
  pro_plus: { maxRecipesPerWorkspace: 1000, maxVersionsPerRecipe: 99 },
};

export function getTierLimits(tier: BillingTier): TierLimits {
  return LIMITS_BY_TIER[tier] ?? LIMITS_BY_TIER.free;
}

