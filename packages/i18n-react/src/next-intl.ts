"use client";

import { useTranslations } from "next-intl";

import type { Translator, TranslationValues, RichTranslationValues } from "./index";

export function useT(namespace: string): Translator {
  const t = useTranslations(namespace);

  return {
    t: (key: string, values?: TranslationValues) => t(key, values),
    rich: (key: string, values?: RichTranslationValues) =>
      // Cast through `unknown` because next-intl's RichTranslationValues is a
      // narrower shape than ours (it requires React-specific tag functions).
      // Our type is intentionally looser for cross-platform use.
      t.rich(key, values as unknown as Parameters<typeof t.rich>[1]),
  };
}

