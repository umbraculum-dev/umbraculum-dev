"use client";

// src/next-intl.ts
import { useTranslations } from "next-intl";
function useT(namespace) {
  const t = useTranslations(namespace);
  return {
    t: (key, values) => t(key, values),
    rich: (key, values) => t.rich(key, values)
  };
}
export {
  useT
};
