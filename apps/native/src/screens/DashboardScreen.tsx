import React from "react";
import { ScrollView, View } from "react-native";

import { Screen } from "@umbraculum/ui";

import { DashboardScreenHeader } from "./dashboard/DashboardScreenHeader";
import { DashboardScreenSections, DashboardScreenTopAd } from "./dashboard/DashboardScreenSections";
import { useDashboardScreen } from "./dashboard/useDashboardScreen";

export function DashboardScreen() {
  const screen = useDashboardScreen();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <DashboardScreenTopAd />
          <DashboardScreenHeader
            t={screen.t}
            tHealth={screen.tHealth}
            tNav={screen.tNav}
            baseUrl={screen.baseUrl}
            healthState={screen.healthState}
            navigation={screen.navigation}
          />
          <DashboardScreenSections
            t={screen.t}
            tNav={screen.tNav}
            tCommon={screen.tCommon}
            tLocales={screen.tLocales}
            locale={screen.locale}
            setLocale={screen.setLocale}
            navigation={screen.navigation}
            auth={screen.auth}
            links={screen.links}
            breweryLinks={screen.breweryLinks}
            openWeb={screen.openWeb}
            openWebState={screen.openWebState}
            languagePickerOpen={screen.languagePickerOpen}
            setLanguagePickerOpen={screen.setLanguagePickerOpen}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
