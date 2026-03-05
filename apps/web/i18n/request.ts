import { getRequestConfig } from "next-intl/server";

import { getSharedMessages } from "@brewery/i18n";
import { defaultLocale, isLocale } from "../src/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  const messages = getSharedMessages(locale) as any;
  // Runtime guardrail: ensure required keys exist even if dist JSON is stale.
  messages.recipes = messages.recipes ?? {};
  messages.recipes.edit = messages.recipes.edit ?? {};
  messages.recipes.edit.saving = messages.recipes.edit.saving ?? "Saving…";
  messages.recipes.edit.mashStepsFromWaterPage =
    messages.recipes.edit.mashStepsFromWaterPage ?? "Mash steps (from Mash water page)";
  messages.recipes.edit.fermentableLateAdditionLabel =
    messages.recipes.edit.fermentableLateAdditionLabel ?? "Late addition";
  messages.recipes.edit.fermentableLateAdditionNo =
    messages.recipes.edit.fermentableLateAdditionNo ?? "No";
  messages.recipes.edit.fermentableLateAdditionYes =
    messages.recipes.edit.fermentableLateAdditionYes ?? "Yes";
  messages.recipes.water = messages.recipes.water ?? {};
  messages.recipes.water.mash = messages.recipes.water.mash ?? {};
  messages.recipes.water.mash.lateFermentablesExcludedNote =
    messages.recipes.water.mash.lateFermentablesExcludedNote ??
    "Late addition fermentables total {kg} kg and are excluded from mash grist for water chemistry.";

  return {
    locale,
    messages,
  };
});

