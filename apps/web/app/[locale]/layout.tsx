import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PrimaryNav } from "../_components/PrimaryNav";
import { isLocale } from "../../src/i18n/routing";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="appShell">
        <PrimaryNav />
        <main id="main" style={{ marginTop: 16 }}>
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}

