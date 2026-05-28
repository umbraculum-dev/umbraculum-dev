import type { BillingTier } from "@prisma/client";
import { composeModuleTierLimitSlices } from "@umbraculum/module-sdk";

type PlatformTierLimits = {
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

/** Keys contributed by brewery + automation modules after boot (see module tierLimits.ts). */
type ModuleTierLimits = {
  maxRecipesPerWorkspace: number;
  maxVersionsPerRecipe: number;
  maxVessels: number;
  maxAdaptersConnected: number;
  automationAiToolsEnabled: boolean;
};

export type TierLimits = PlatformTierLimits & ModuleTierLimits;

const PLATFORM_LIMITS_BY_TIER: Record<BillingTier, PlatformTierLimits> = {
  free: { aiEnabled: false },
  premium: { aiEnabled: true },
  pro: { aiEnabled: true },
  pro_plus: { aiEnabled: true },
};

/**
 * Returns platform-owned limits merged with module-contributed slices.
 * Correct only after module boot (`buildApp()` registers modules).
 */
export function getTierLimits(tier: BillingTier): TierLimits {
  const platform = PLATFORM_LIMITS_BY_TIER[tier] ?? PLATFORM_LIMITS_BY_TIER.free;
  // Module slices are Record<string, number | boolean> in the SDK; after boot the
  // brewery + automation modules supply the keys in ModuleTierLimits (verified in tests).
  return { ...platform, ...composeModuleTierLimitSlices(tier) } as TierLimits;
}
