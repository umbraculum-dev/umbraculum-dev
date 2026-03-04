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

  return {
    locale,
    messages,
  };
});

