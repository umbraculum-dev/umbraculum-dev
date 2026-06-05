import React from "react";
import { ScrollView } from "react-native";

import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../hooks/useWaterMashScreen";
import { WaterMashAcidificationSection } from "./mash/sections/WaterMashAcidificationSection";
import { WaterMashAdjustmentSection } from "./mash/sections/WaterMashAdjustmentSection";
import { WaterMashGristSection } from "./mash/sections/WaterMashGristSection";
import { WaterMashMashStepsSection } from "./mash/sections/WaterMashMashStepsSection";
import { WaterMashOverallSection } from "./mash/sections/WaterMashOverallSection";
import { WaterMashSaltsSection } from "./mash/sections/WaterMashSaltsSection";

export function WaterMashScreenContent({ model }: { model: WaterMashScreenModel }) {
  if (model.loading && !model.profiles) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  const {
    recipeId,
    navigation,
    loadRecipeMeta,
    t,
    tWaterCommon,
    error,
    openSections,
    setOpenSections,
    canCall,
  } = model;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Heading fontSize={22} mb="$2">
          {t("title")}
        </Heading>
        <RecipeMetaLine recipeId={recipeId} enabled={canCall} loadRecipeMeta={loadRecipeMeta} />
        <Button chromeless size="$3" mt="$2" mb="$3" onPress={() => navigation.navigate("WaterHub", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("backToHub")}</Text>
        </Button>

        {error ? (
          <Card background="$red3" p="$3" mb="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <WaterMashAdjustmentSection model={model} />
          <WaterMashGristSection model={model} />
          <WaterMashAcidificationSection model={model} />
          <WaterMashSaltsSection model={model} />
          <WaterMashOverallSection model={model} />
          <WaterMashMashStepsSection model={model} />
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
