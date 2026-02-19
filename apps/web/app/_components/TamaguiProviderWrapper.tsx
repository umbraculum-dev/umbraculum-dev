"use client";

import type { ReactNode } from "react";
import { TamaguiProvider } from "@tamagui/core";
import config from "../../tamagui.config";

export function TamaguiProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      {children}
    </TamaguiProvider>
  );
}
