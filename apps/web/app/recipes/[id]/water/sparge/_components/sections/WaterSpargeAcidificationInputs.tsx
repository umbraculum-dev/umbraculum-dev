import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { WaterAcidificationModeFields } from "../../../_components/acidification/WaterAcidificationModeFields";
import { Input, View, XStack, YStack } from "tamagui";

import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";

export function WaterSpargeAcidificationInputs({ model }: { model: WaterSpargePageModel }) {
  const {
    t,
    tUnits,
    waterProfiles,
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    selectedSpargeProfileInfo,
    spargeAcidificationMode,
    setSpargeAcidificationMode,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    volumeLiters,
    setVolumeLiters,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    spargeManualAcidAdded,
    setSpargeManualAcidAdded,
  } = model;

  return (
    <XStack gap="$3" flexWrap="wrap" ai="flex-end">
      <View width="100%" flexBasis="100%">
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="sparge-profile">{t("spargeSourceWaterProfileLabel")}</RecipeEditFieldLabel>
          <BrewSelect
            id="sparge-profile"
            value={spargeWaterProfileId}
            onValueChange={setSpargeWaterProfileId}
            options={[
              { value: "", label: "(none)" },
              ...waterProfiles.map((p) => ({
                value: p.id,
                label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
              })),
            ]}
            width="full"
          />
          {selectedSpargeProfileInfo}
        </YStack>
      </View>

      <WaterAcidificationModeFields
        idPrefix="sparge"
        modeName="sparge-mode"
        modeFieldWidth="full"
        modeOptions={[
          { value: "targetPh", label: "Target pH (solve acid required)" },
          { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
        ]}
        acidificationMode={spargeAcidificationMode}
        setAcidificationMode={setSpargeAcidificationMode}
        acidType={acidType}
        setAcidType={setAcidType}
        strengthKind={strengthKind}
        setStrengthKind={setStrengthKind}
        strengthValue={strengthValue}
        setStrengthValue={setStrengthValue}
        manualAcidAdded={spargeManualAcidAdded}
        setManualAcidAdded={setSpargeManualAcidAdded}
        tUnits={tUnits}
      />

      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="starting-alk">
            {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
          </RecipeEditFieldLabel>
          <Input
            id="starting-alk"
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
          <RecipeEditFieldLabel htmlFor="volume-l">{t("waterVolumeLabel", { unit: tUnits("L") })}</RecipeEditFieldLabel>
          <Input
            id="volume-l"
            keyboardType="decimal-pad"
            value={String(volumeLiters)}
            onChangeText={(text) => setVolumeLiters(Number(text) || 0)}
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
          <RecipeEditFieldLabel htmlFor="starting-ph">Starting pH</RecipeEditFieldLabel>
          <Input
            id="starting-ph"
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
      {spargeAcidificationMode === "targetPh" ? (
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="target-ph">Target pH</RecipeEditFieldLabel>
            <Input
              id="target-ph"
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
