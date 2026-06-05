import React from "react";
import { ScrollView } from "react-native";

import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import type { WaterBoilScreenModel } from "../../hooks/useWaterBoilScreen";
import { WaterBoilAcidificationSection } from "./boil/sections/WaterBoilAcidificationSection";
import { WaterBoilAdjustmentSection } from "./boil/sections/WaterBoilAdjustmentSection";
import { WaterBoilSaltsSection } from "./boil/sections/WaterBoilSaltsSection";

export function WaterBoilScreenContent({ model }: { model: WaterBoilScreenModel }) {
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
    canCall,
    error,
    openSections,
    setOpenSections,
    saveStatus,
    calcSaveStatus,
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

        {(saveStatus || calcSaveStatus) ? (
          <Card background="$green3" p="$3" mb="$3">
            <Text color="$green11">{saveStatus ?? calcSaveStatus}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <WaterBoilAdjustmentSection model={model} />
          <WaterBoilAcidificationSection model={model} />
          <WaterBoilSaltsSection model={model} />
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
