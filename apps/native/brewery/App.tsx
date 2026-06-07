import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider, Theme } from "tamagui";

import config from "./tamagui.config";

import { I18nProvider } from "@umbraculum/native-shell/i18n";
import { AuthProvider } from "@umbraculum/native-shell/auth";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { registerPlatformNativeModules } from "./src/navigation/registerPlatformNativeModules";

registerPlatformNativeModules();

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <SafeAreaProvider>
          <I18nProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </Theme>
    </TamaguiProvider>
  );
}

