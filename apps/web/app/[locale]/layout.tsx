import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdSlot } from "../_components/AdSlot";
import { PrimaryNav } from "../_components/PrimaryNav";
import { TamaguiProviderWrapper } from "../_components/TamaguiProviderWrapper";
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
      <TamaguiProviderWrapper>
      <div className="brew-app-shell">
        <PrimaryNav />
        <AdSlot placement="global_top" />
        <main id="main" style={{ marginTop: 16 }}>
          {children}
        </main>
        <AdSlot placement="global_bottom" />
      </div>
      </TamaguiProviderWrapper>
    </NextIntlClientProvider>
  );
}

