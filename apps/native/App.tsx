import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider, Theme } from "tamagui";

import config from "./tamagui.config";

import { I18nProvider } from "./src/i18n/I18nProvider";
import { AuthProvider } from "./src/auth/AuthProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";

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

