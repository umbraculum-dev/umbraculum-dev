import type { BillingTierSlug } from "@umbraculum/module-sdk";

/** Illustrative caps per docs/design/canonical-automation-module-surface.md §8.2 */
const MAX_VESSELS: Record<BillingTierSlug, number> = {
  free: 2,
  premium: 8,
  pro: 24,
  pro_plus: 100,
};

const MAX_ADAPTERS_CONNECTED: Record<BillingTierSlug, number> = {
  free: 0,
  premium: 1,
  pro: 2,
  pro_plus: 10,
};

const AUTOMATION_AI_TOOLS_ENABLED: Record<BillingTierSlug, boolean> = {
  free: false,
  premium: true,
  pro: true,
  pro_plus: true,
};

export function automationTierLimits(tier: BillingTierSlug) {
  return {
    maxVessels: MAX_VESSELS[tier],
    maxAdaptersConnected: MAX_ADAPTERS_CONNECTED[tier],
    automationAiToolsEnabled: AUTOMATION_AI_TOOLS_ENABLED[tier],
  };
}
