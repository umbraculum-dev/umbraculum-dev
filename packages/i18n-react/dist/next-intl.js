"use client";

// src/next-intl.ts
import { useTranslations } from "next-intl";
function useT(namespace) {
  const t = useTranslations(namespace);
  return {
    t: (key, values) => t(key, values),
    rich: (key, values) => (
      // Cast through `unknown` because next-intl's RichTranslationValues is a
      // narrower shape than ours (it requires React-specific tag functions).
      // Our type is intentionally looser for cross-platform use.
      t.rich(key, values)
    )
  };
}
export {
  useT
};
