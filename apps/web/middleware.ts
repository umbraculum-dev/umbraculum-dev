import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./src/i18n/routing";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Skip Next.js internals and API routes
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

