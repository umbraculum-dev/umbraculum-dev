"use client";

import type { ReactNode } from "react";
import { TamaguiProvider } from "@tamagui/core";
import config from "@umbraculum/ui/tamagui-config-web";
import { ThemeVarsInjector } from "@umbraculum/ui";

export function TamaguiProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <ThemeVarsInjector />
      {children}
    </TamaguiProvider>
  );
}
