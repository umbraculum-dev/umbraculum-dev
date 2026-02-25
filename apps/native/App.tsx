import React from "react";
import { SafeAreaView } from "react-native";
import { TamaguiProvider, Theme } from "tamagui";

import config from "./tamagui.config";

import { I18nProvider } from "./src/i18n/I18nProvider";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AuthProvider, useAuth } from "./src/auth/AuthProvider";
import { LoginScreen } from "./src/screens/LoginScreen";
import { Screen, Spinner } from "@brewery/ui";

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name="light">
        <SafeAreaView style={{ flex: 1 }}>
          <I18nProvider>
            <AuthProvider>
              <AppGate />
            </AuthProvider>
          </I18nProvider>
        </SafeAreaView>
      </Theme>
    </TamaguiProvider>
  );
}

function AppGate() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  if (state.status === "logged_out") {
    return <LoginScreen />;
  }

  return <DashboardScreen />;
}

