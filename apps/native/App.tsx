import React from "react";
import { SafeAreaView } from "react-native";
import { TamaguiProvider, Theme } from "tamagui";

import config from "./tamagui.config";

import { I18nProvider } from "./src/i18n/I18nProvider";
import { DashboardScreen } from "./src/screens/DashboardScreen";

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name="light">
        <SafeAreaView style={{ flex: 1 }}>
          <I18nProvider>
            <DashboardScreen />
          </I18nProvider>
        </SafeAreaView>
      </Theme>
    </TamaguiProvider>
  );
}

