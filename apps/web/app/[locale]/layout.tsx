import type { ReactNode } from "react";

import { getSharedMessages } from "@umbraculum/i18n";
import { LocaleProvider } from "@umbraculum/i18n-react";
import { composeWebShellNavItems } from "@umbraculum/module-sdk";
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
  const shellNavItems = composeWebShellNavItems();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleProvider locale={locale} messages={messages}>
        <TamaguiProviderWrapper>
          <div className="brew-app-shell">
            <PrimaryNav shellNavItems={shellNavItems} />
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

