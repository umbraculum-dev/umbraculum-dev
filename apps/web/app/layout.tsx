import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "../src/i18n/routing";
import "./globals.css";

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

  return (
    <html lang={lang} data-theme={theme} data-density={density} data-font-scale={fontScale}>
      <body>
        {children}
      </body>
    </html>
  );
}

