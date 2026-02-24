import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { Translator, TranslationValues, RichTranslationValues } from "./index";

export function useT(namespace: string): Translator {
  const t = useTranslations(namespace);

  return {
    t: (key: string, values?: TranslationValues) => t(key, values),
    rich: (key: string, values?: RichTranslationValues) => t.rich(key, values as Record<string, any> | undefined) as ReactNode,
  };
}

