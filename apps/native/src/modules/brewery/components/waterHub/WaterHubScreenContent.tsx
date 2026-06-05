import React from "react";
import { ScrollView } from "react-native";

import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../hooks/waterHub/useNativeWaterHubScreen";
import { WaterHubAlkVsBicarbSection } from "./sections/WaterHubAlkVsBicarbSection";
import { WaterHubFinalRecapSection } from "./sections/WaterHubFinalRecapSection";
import { WaterHubLinksSection } from "./sections/WaterHubLinksSection";
import { WaterHubRecapSection } from "./sections/WaterHubRecapSection";
import { WaterHubStatusSection } from "./sections/WaterHubStatusSection";

export function WaterHubScreenContent(props: { model: NativeWaterHubScreenModel }) {
  const { model } = props;
  const { t, recipeId, canCall, loadRecipeMeta, error, openSections, onOpenSectionsChange, navigateToRecipeEdit } = model;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Heading fontSize={22} mb="$2">
        {t("title")}
      </Heading>
      <RecipeMetaLine recipeId={recipeId} enabled={canCall} loadRecipeMeta={loadRecipeMeta} />
      <Button
        chromeless
        size="$3"
        mt="$2"
        mb="$3"
        onPress={navigateToRecipeEdit}
      >
        <Text fontSize={12}>{t("backToRecipeEditor")}</Text>
      </Button>

      {error ? (
        <Card background="$red3" p="$3" mb="$3">
          <Text color="$red11">{error}</Text>
        </Card>
      ) : null}

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={onOpenSectionsChange}
      >
        <WaterHubLinksSection model={model} />
        <WaterHubStatusSection model={model} />
        <WaterHubRecapSection model={model} />
        <WaterHubFinalRecapSection model={model} />
        <WaterHubAlkVsBicarbSection model={model} />
      </Accordion>
    </ScrollView>
  );
}
