"use client";

import { useEffect } from "react";

import { FIELD_READONLY_BG, FIELD_READONLY_BORDER } from "./nativeReadonlyTokens";

/**
 * Injects shared readonly field tokens into document root so web and native
 * use the same colors. Must run client-side.
 */
export function ThemeVarsInjector() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--field-readonly-bg", FIELD_READONLY_BG);
    root.style.setProperty("--field-readonly-border", FIELD_READONLY_BORDER);
    return () => {
      root.style.removeProperty("--field-readonly-bg");
      root.style.removeProperty("--field-readonly-border");
    };
  }, []);
  return null;
}
