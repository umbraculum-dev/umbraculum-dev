import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { Screen, Text } from "@umbraculum/ui";

import { EquipmentScreenContent } from "../components/equipment/EquipmentScreenContent";
import { useNativeEquipmentPage } from "../hooks/equipment/useNativeEquipmentPage";

export function EquipmentScreen() {
  const navigation = useNavigation();
  const model = useNativeEquipmentPage();
  const { api, tNav, tCommon } = model;

  useEffect(() => {
    navigation.setOptions({ headerTitle: tNav("equipment") });
  }, [navigation, tNav]);

  if (!api) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          {tCommon("loading") || "Loading…"}
        </Text>
      </Screen>
    );
  }

  return <EquipmentScreenContent model={model} />;
}
