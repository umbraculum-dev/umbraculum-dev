import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { Screen, Text } from "@umbraculum/ui";

import { WaterProfilesScreenContent } from "../components/waterProfiles/WaterProfilesScreenContent";
import { useNativeWaterProfilesPage } from "../hooks/waterProfiles/useNativeWaterProfilesPage";

export function WaterProfilesScreen() {
  const navigation = useNavigation();
  const model = useNativeWaterProfilesPage();
  const { api, t, tCommon } = model;

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  if (!api) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          {tCommon("loading") || "Loading…"}
        </Text>
      </Screen>
    );
  }

  return <WaterProfilesScreenContent model={model} />;
}
