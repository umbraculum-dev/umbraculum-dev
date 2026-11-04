import {
  isModuleOwnedPathDenied,
} from "@umbraculum/module-sdk/edge";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./src/i18n/routing";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function localeFromPathname(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && (locales as readonly string[]).includes(first)) {
    return first;
  }
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // Preserve locale redirects (e.g. /recipes → /en/recipes) before gating.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  if (
    isModuleOwnedPathDenied({
      pathname: request.nextUrl.pathname,
      locales,
      env: process.env as Record<string, string | undefined>,
    })
  ) {
    const locale = localeFromPathname(request.nextUrl.pathname);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}/page-not-found`;
    // Rewrite into the in-app 404 page (HTML + chrome) with HTTP 404.
    return NextResponse.rewrite(rewriteUrl, { status: 404 });
  }

  return intlResponse;
}

export const config = {
  // Skip Next.js internals and API routes
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
