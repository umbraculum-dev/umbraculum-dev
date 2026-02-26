import React from "react";
import { View } from "react-native";

import { useT } from "@brewery/i18n-react";
import { Button, Screen, Text } from "@brewery/ui";
import { useNavigation, useRoute } from "@react-navigation/native";

import { RecipeMetaLine } from "../components/RecipeMetaLine";

export function WaterBoilScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<any>();
  const { t } = useT("waterHub");
  const { t: tWaterCommon } = useT("recipes.water.common");

  return (
    <Screen>
      <View style={{ padding: 16 }}>
        <Text fontSize={22} fontWeight="bold" mb="$2">
          {t("additionalBoilWater")}
        </Text>
        <RecipeMetaLine recipeId={recipeId} enabled={Boolean(recipeId)} />
        <Button chromeless size="$3" mt="$2" mb="$3" onPress={() => navigation.navigate("WaterHub", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("backToHub")}</Text>
        </Button>
        <Text fontSize={12} opacity={0.8}>
          Boil water calculator — coming soon. Use the web app for full functionality.
        </Text>
      </View>
    </Screen>
  );
}
