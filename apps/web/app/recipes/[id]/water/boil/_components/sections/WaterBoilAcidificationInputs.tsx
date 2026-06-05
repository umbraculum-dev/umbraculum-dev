import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { WaterAcidificationModeFields } from "../../../_lib/acidification/WaterAcidificationModeFields";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";

export function WaterBoilAcidificationInputs({ model }: { model: WaterBoilPageModel }) {
  const {
    t,
    tUnits,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
  } = model;

  return (
    <XStack gap="$3" flexWrap="wrap" ai="flex-end">
      <WaterAcidificationModeFields
        idPrefix="boil"
        modeName="boil-mode"
        modeFieldWidth="full"
        modeOptions={[
          { value: "targetPh", label: "Target pH (solve acid required)" },
          { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
        ]}
        acidificationMode={acidificationMode}
        setAcidificationMode={setAcidificationMode}
        acidType={acidType}
        setAcidType={setAcidType}
        strengthKind={strengthKind}
        setStrengthKind={setStrengthKind}
        strengthValue={strengthValue}
        setStrengthValue={setStrengthValue}
        manualAcidAdded={manualAcidAdded}
        setManualAcidAdded={setManualAcidAdded}
        tUnits={tUnits}
      />

      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="boil-starting-alk">
            {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
          </RecipeEditFieldLabel>
          <Input
            id="boil-starting-alk"
            keyboardType="decimal-pad"
            value={String(startingAlk)}
            onChangeText={(text) => {
              setStartingAlkTouched(true);
              const n = Number(text);
              setStartingAlk(Number.isFinite(n) ? n : 0);
            }}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
      </View>

      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="boil-starting-ph">Starting pH</RecipeEditFieldLabel>
          <Input
            id="boil-starting-ph"
            keyboardType="decimal-pad"
            value={startingPh}
            onChangeText={setStartingPh}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
      </View>

      {acidificationMode === "targetPh" ? (
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="boil-target-ph">Target pH</RecipeEditFieldLabel>
            <Input
              id="boil-target-ph"
              keyboardType="decimal-pad"
              value={String(targetPh)}
              onChangeText={(text) => setTargetPh(Number(text) || 0)}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
      ) : null}
    </XStack>
  );
}
