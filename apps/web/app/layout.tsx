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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const c = cookieStore.get("NEXT_LOCALE")?.value;
  const lang = c && isLocale(c) ? c : defaultLocale;
  return (
    <html lang={lang}>
      <body>
        {children}
      </body>
    </html>
  );
}

