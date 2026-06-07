import React from "react";
import { ScrollView } from "react-native";

import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import type { WaterSpargeScreenModel } from "../../hooks/useWaterSpargeScreen";
import { WaterSpargeAcidificationSection } from "./sparge/sections/WaterSpargeAcidificationSection";
import { WaterSpargeConfigSection } from "./sparge/sections/WaterSpargeConfigSection";
import { WaterSpargeSaltsSection } from "./sparge/sections/WaterSpargeSaltsSection";

export function WaterSpargeScreenContent({ model }: { model: WaterSpargeScreenModel }) {
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
        <Button chromeless size="$3" mb="$3" onPress={() => navigation.navigate("WaterMash", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("goToMash")}</Text>
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
          <WaterSpargeConfigSection model={model} />
          <WaterSpargeAcidificationSection model={model} />
          <WaterSpargeSaltsSection model={model} />
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
