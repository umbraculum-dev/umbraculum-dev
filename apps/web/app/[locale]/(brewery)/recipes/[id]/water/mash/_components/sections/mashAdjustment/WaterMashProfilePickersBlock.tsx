import { BrewSelect } from "../../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";
import { Input, View, XStack, YStack } from "tamagui";

import type { WaterMashProfilePickersModel } from "./waterMashAdjustmentTypes";

export function WaterMashProfilePickersBlock({ model }: { model: WaterMashProfilePickersModel }) {
  const {
    t,
    tUnits,
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    waterProfiles,
    dilutionProfiles,
  } = model;

  return (
    <XStack gap="$3" flexWrap="wrap" ai="flex-end">
      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="source-profile">Source water profile (starting water)</RecipeEditFieldLabel>
          <BrewSelect
            id="source-profile"
            value={sourceProfileId}
            onValueChange={setSourceProfileId}
            options={waterProfiles.map((p) => ({
              value: p.id,
              label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
            }))}
            width="full"
          />
        </YStack>
      </View>
      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="target-profile">Target water profile</RecipeEditFieldLabel>
          <BrewSelect
            id="target-profile"
            value={targetProfileId}
            onValueChange={setTargetProfileId}
            options={waterProfiles.map((p) => ({
              value: p.id,
              label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
            }))}
            width="full"
          />
        </YStack>
      </View>
      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="dilution-profile">Dilution water profile</RecipeEditFieldLabel>
          <BrewSelect
            id="dilution-profile"
            value={dilutionProfileId}
            onValueChange={setDilutionProfileId}
            options={dilutionProfiles.map((p) => ({
              value: p.id,
              label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
            }))}
            width="full"
          />
        </YStack>
      </View>
      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="tap-volume">
            {t("sourceVolumeLabel", { unit: tUnits("L") })}
          </RecipeEditFieldLabel>
          <Input
            id="tap-volume"
            keyboardType="decimal-pad"
            value={String(tapVolumeLiters)}
            onChangeText={(text) => setTapVolumeLiters(Number(text) || 0)}
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
          <RecipeEditFieldLabel htmlFor="dilution-volume">
            {t("dilutionVolumeLabel", { unit: tUnits("L") })}
          </RecipeEditFieldLabel>
          <Input
            id="dilution-volume"
            keyboardType="decimal-pad"
            value={String(dilutionVolumeLiters)}
            onChangeText={(text) => setDilutionVolumeLiters(Number(text) || 0)}
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
    </XStack>
  );
}
