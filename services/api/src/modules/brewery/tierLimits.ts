import type { BillingTierSlug } from "@umbraculum/module-sdk";

const MAX_RECIPES_PER_WORKSPACE: Record<BillingTierSlug, number> = {
  free: 5,
  premium: 25,
  pro: 99,
  pro_plus: 1000,
};

const MAX_VERSIONS_PER_RECIPE: Record<BillingTierSlug, number> = {
  free: 2,
  premium: 3,
  pro: 5,
  pro_plus: 99,
};

export function breweryTierLimits(tier: BillingTierSlug) {
  return {
    maxRecipesPerWorkspace: MAX_RECIPES_PER_WORKSPACE[tier],
    maxVersionsPerRecipe: MAX_VERSIONS_PER_RECIPE[tier],
  };
}
