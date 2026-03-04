import type { ReactNode } from "react";

import { getSharedMessages } from "@brewery/i18n";
import type { SupportedLocale } from "@brewery/i18n";
import { LocaleProvider } from "@brewery/i18n-react";
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

  const messages = getSharedMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleProvider locale={locale as SupportedLocale} messages={messages}>
        <TamaguiProviderWrapper>
          <div className="brew-app-shell">
            <PrimaryNav />
            <AdSlot placement="global_top" />
            <main id="main" className="brew-main-margin">
              {children}
            </main>
            <div className="brew-global-bottom-slot">
              <AdSlot placement="global_bottom" />
            </div>
          </div>
        </TamaguiProviderWrapper>
      </LocaleProvider>
    </NextIntlClientProvider>
  );
}

