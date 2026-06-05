import React, { useEffect } from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import { useT } from "@umbraculum/i18n-react";
import { Screen, Spinner } from "@umbraculum/ui";

import type { RootStackParamList } from "../../../navigation/types";
import { BrewdayStepsSettingsScreenContent } from "../components/brewdayStepsSettings/BrewdayStepsSettingsScreenContent";
import { useNativeBrewdayStepsSettingsPage } from "../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";

export function BrewdayStepsSettingsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useT("dashboard.brewdayStepsSettings");
  const model = useNativeBrewdayStepsSettingsPage();

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  if (model.loading) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  return (
    <Screen>
      <BrewdayStepsSettingsScreenContent model={model} />
    </Screen>
  );
}
