import { Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../../../../_components/recipe-edit";
import { WaterAcidificationModeFields } from "../../../_lib/acidification/WaterAcidificationModeFields";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";

export function WaterMashAcidificationInputs({ model }: { model: WaterMashPageModel }) {
  const {
    t,
    tUnits,
    mashStartingAlk,
    setMashStartingAlk,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    derivedMashWaterVolumeLiters,
  } = model;

  return (
    <XStack gap="$3" flexWrap="wrap" ai="flex-end">
      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="mash-starting-alk">
            {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
          </RecipeEditFieldLabel>
          <Input
            id="mash-starting-alk"
            keyboardType="decimal-pad"
            value={String(mashStartingAlk)}
            onChangeText={(text) => {
              setMashStartingAlkTouched(true);
              const n = Number(text);
              setMashStartingAlk(Number.isFinite(n) ? n : 0);
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
          <RecipeEditFieldLabel htmlFor="mash-volume-l">
            {t("mashWaterVolumeLabel", { unit: tUnits("L") })}
          </RecipeEditFieldLabel>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
            Derived from Water adjustment volumes above (Source + Dilution).
          </SizableText>
          <Input
            id="mash-volume-l"
            keyboardType="decimal-pad"
            value={String(derivedMashWaterVolumeLiters)}
            readOnly
            tabIndex={-1}
            disabled
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
          <RecipeEditFieldLabel htmlFor="mash-starting-ph">Starting pH</RecipeEditFieldLabel>
          <Input
            id="mash-starting-ph"
            keyboardType="decimal-pad"
            value={String(mashStartingPh)}
            onChangeText={(text) => setMashStartingPh(Number(text) || 0)}
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
          <RecipeEditFieldLabel htmlFor="mash-target-ph">Target pH</RecipeEditFieldLabel>
          <Input
            id="mash-target-ph"
            keyboardType="decimal-pad"
            value={String(mashTargetPh)}
            onChangeText={(text) => setMashTargetPh(Number(text) || 0)}
            disabled={mashAcidificationMode === "manual"}
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
      <WaterAcidificationModeFields
        idPrefix="mash"
        modeName="mash-acid-mode"
        showModeField={false}
        modeOptions={[
          { value: "targetPh", label: "Target mash pH (compute required acid)" },
          { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
        ]}
        acidificationMode={mashAcidificationMode}
        setAcidificationMode={setMashAcidificationMode}
        acidType={mashAcidType}
        setAcidType={setMashAcidType}
        strengthKind={mashStrengthKind}
        setStrengthKind={setMashStrengthKind}
        strengthValue={mashStrengthValue}
        setStrengthValue={setMashStrengthValue}
        manualAcidAdded={mashManualAcidAdded}
        setManualAcidAdded={setMashManualAcidAdded}
        tUnits={tUnits}
      />
    </XStack>
  );
}
