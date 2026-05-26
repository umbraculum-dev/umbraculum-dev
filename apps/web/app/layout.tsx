import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "../src/i18n/routing";
import { registerPlatformSegments } from "./_lib/registerPlatformSegments";
import "./globals.css";
import "../public/tamagui.generated.css";

// Bootstrap: register platform-owned URL segments with @umbraculum/module-sdk.
// Module-owned segments (vessels, products, categories, attribute-sets,
// recipes, inventory, equipment, water-profiles, brewday-steps-settings,
// ferm-data-integration) are registered by their server-side bootstraps in
// services/api/src/modules/*/index.ts; this call records the residual
// platform-owned segments (auth, ai, content pages) so the registry has a
// complete picture. The function is idempotent (it guards against duplicate
// registration via listRegisteredWebModules) so re-imports during HMR /
// build-time pre-rendering do not collide.
registerPlatformSegments();

export const metadata: Metadata = {
  title: {
    default: "Brewery App",
    template: "%s · Brewery App",
  },
  description: "Brewery operations, recipes, and water chemistry tools.",
};

function oneOf<T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T {
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const c = cookieStore.get("NEXT_LOCALE")?.value;
  const lang = c && isLocale(c) ? c : defaultLocale;

  const theme = oneOf(cookieStore.get("UI_THEME")?.value, ["default", "hc_dark", "hc_light"] as const, "default");
  const density = oneOf(cookieStore.get("UI_DENSITY")?.value, ["comfortable", "compact"] as const, "comfortable");
  const fontScale = oneOf(cookieStore.get("UI_FONT_SCALE")?.value, ["sm", "md", "lg", "xl"] as const, "md");
  const brand = oneOf(cookieStore.get("UI_BRAND")?.value, ["default", "acme", "forest"] as const, "default");

  return (
    <html
      lang={lang}
      data-theme={theme}
      data-density={density}
      data-font-scale={fontScale}
      data-brand={brand}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

