import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { MashStepsEditor } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterMashMashStepsSection(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    tEdit,
    tUnits,
    openSections,
    mashRows,
    waterVolumes,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL,
    mashStepsDirty,
    mashStepsSaving,
    updateMashStep,
    moveMashStep,
    addMashStep,
    deleteMashStep,
    addMashFromTemplate,
    saveMashSteps,
  } = props.model;

  return (
    <Accordion.Item value="mashSteps">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("mashStepsHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("mashSteps") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <MashStepsEditor
            mashRows={mashRows}
            waterVolumes={waterVolumes}
            mashWaterBudgetLiters={derivedMashWaterVolumeLiters > 0 ? derivedMashWaterVolumeLiters : null}
            firstStepAmountComputed={derivedMashWaterVolumeLiters > 0 ? computeFirstStepAmountL : null}
            readOnly={false}
            onUpdateStep={updateMashStep}
            onMoveStep={moveMashStep}
            onAddStep={addMashStep}
            onDeleteStep={deleteMashStep}
            onAddFromTemplate={addMashFromTemplate}
            t={(k, v) => tEdit(k, v)}
            tUnits={(k) => tUnits(k)}
            locale={locale}
            formatFixed={formatFixed}
          />
          {mashStepsDirty ? (
            <Button size="$3" mt="$2" onPress={() => { void saveMashSteps(); }} disabled={mashStepsSaving}>
              <Text>{mashStepsSaving ? "Saving…" : "Save mash steps"}</Text>
            </Button>
          ) : null}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
