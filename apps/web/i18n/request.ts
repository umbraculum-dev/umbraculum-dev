import { getRequestConfig } from "next-intl/server";

import { getSharedMessages } from "@brewery/i18n";
import { defaultLocale, isLocale } from "../src/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: getSharedMessages(locale),
  };
});

