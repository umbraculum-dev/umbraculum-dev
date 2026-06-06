import { BrewSelect } from "../../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";
import { Input, View, XStack, YStack } from "tamagui";

import type { WaterBoilProfilePickersModel } from "./waterBoilAdjustmentTypes";

export function WaterBoilProfilePickersBlock({ model }: { model: WaterBoilProfilePickersModel }) {
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
    selectedSource,
    selectedTarget,
    selectedDilution,
    selectedProfileInfo,
  } = model;

  return (
    <>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={180}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="boil-source-profile">Source water profile</RecipeEditFieldLabel>
            <BrewSelect
              id="boil-source-profile"
              value={sourceProfileId}
              onValueChange={setSourceProfileId}
              options={[
                { value: "", label: "(none)" },
                ...waterProfiles.map((p) => ({
                  value: p.id,
                  label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                })),
              ]}
              width="full"
            />
            <View mt="$1.5">{selectedProfileInfo(selectedSource, "Selected")}</View>
          </YStack>
        </View>

        <View flex={1} minWidth={180}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="boil-target-profile">Target water profile</RecipeEditFieldLabel>
            <BrewSelect
              id="boil-target-profile"
              value={targetProfileId}
              onValueChange={setTargetProfileId}
              options={[
                { value: "", label: "(none)" },
                ...waterProfiles.map((p) => ({
                  value: p.id,
                  label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                })),
              ]}
              width="full"
            />
            <View mt="$1.5">{selectedProfileInfo(selectedTarget, "Selected")}</View>
          </YStack>
        </View>

        <View flex={1} minWidth={180}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="boil-dilution-profile">Dilution water profile</RecipeEditFieldLabel>
            <BrewSelect
              id="boil-dilution-profile"
              value={dilutionProfileId}
              onValueChange={setDilutionProfileId}
              options={[
                { value: "", label: "(none)" },
                ...dilutionProfiles.map((p) => ({
                  value: p.id,
                  label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                })),
              ]}
              width="full"
            />
            <View mt="$1.5">{selectedProfileInfo(selectedDilution, "Selected")}</View>
          </YStack>
        </View>
      </XStack>

      <XStack gap="$3" flexWrap="wrap" mt="$3" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="boil-source-volume">
              {t("sourceVolumeLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="boil-source-volume"
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
            <RecipeEditFieldLabel htmlFor="boil-dilution-volume">
              {t("dilutionVolumeLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="boil-dilution-volume"
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
    </>
  );
}
