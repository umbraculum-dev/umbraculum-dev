"use client";

import { Button, H2, Input, View, XStack, YStack } from "tamagui";

import { ErrorBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";

type Model = ReturnType<typeof useEquipmentPage>;

export function EquipmentProfileEditForm(props: { model: Model }) {
  const {
    t,
    tUnits,
    editingId,
    editDraft,
    setEditDraft,
    editSubmitting,
    editError,
    onSaveEdit,
    cancelEdit,
  } = props.model;

  if (!editingId) return null;

  return (
    <View
      mt="$3"
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
      aria-labelledby="equipment-edit"
    >
      <H2 id="equipment-edit" mt={0}>
        {t("editTitle")}
      </H2>
      <form onSubmit={(...a) => { void onSaveEdit(...(a as Parameters<typeof onSaveEdit>)); }} aria-describedby={editError ? "equipment-edit-error" : undefined}>
        <YStack gap="$3">
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-name">{t("nameLabel")}</RecipeEditFieldLabel>
            <Input
              id="equip-edit-name"
              value={editDraft["name"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>

          <fieldset className="brew-fieldset">
            <legend className="brew-fieldset-legend">{t("sectionTitles.kettle")}</legend>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="equip-edit-kettle-vol">
                    {t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-kettle-vol"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["kettleVolumeLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-kettle-losses">
                    {t("kettleLossesLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-kettle-losses"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["kettleLossesLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleLossesLiters: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-evap">
                    {t("kettleBoilEvaporationRatePercentPerHourLabel")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-evap"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["kettleBoilEvaporationRatePercentPerHour"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-shrink">
                    {t("kettleCoolingShrinkagePercentLabel")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-shrink"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["kettleCoolingShrinkagePercent"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-hops-abs">
                    {t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-hops-abs"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["kettleHopsAbsorptionLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: v }))}
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
          </fieldset>

          <fieldset className="brew-fieldset">
            <legend className="brew-fieldset-legend">{t("sectionTitles.mash")}</legend>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="equip-edit-mash-vol">
                    {t("mashVolumeLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-mash-vol"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashVolumeLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashVolumeLiters: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-mash-eff">
                    {t("mashEfficiencyPercentLabel")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-mash-eff"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashEfficiencyPercent"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-mash-losses">
                    {t("mashLossesLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-mash-losses"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashLossesLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashLossesLiters: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-thickness">
                    {t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-thickness"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashThicknessLPerKg"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-grain-abs">
                    {t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-grain-abs"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashGrainAbsorptionLPerKg"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: v }))}
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
                  <RecipeEditFieldLabel htmlFor="equip-edit-water-leftover">
                    {t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-water-leftover"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["mashWaterLeftoverLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: v }))}
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
          </fieldset>

          <fieldset className="brew-fieldset">
            <legend className="brew-fieldset-legend">{t("sectionTitles.misc")}</legend>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="equip-edit-other-losses">
                    {t("otherLossesLitersLabel", { unit: tUnits("L") })}
                  </RecipeEditFieldLabel>
                  <Input
                    id="equip-edit-other-losses"
                    type="number"
                    inputMode="decimal"
                    value={editDraft["otherLossesLiters"] ?? ""}
                    onChangeText={(v) => setEditDraft((d) => ({ ...d, otherLossesLiters: v }))}
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
          </fieldset>
        </YStack>

        <XStack gap="$3" mt="$3">
          <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={editSubmitting}>
            {editSubmitting ? t("saving") : t("save")}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={cancelEdit}
            disabled={editSubmitting}
          >
            {t("cancel")}
          </Button>
        </XStack>
        {editError ? (
          <ErrorBox id="equipment-edit-error" mt="$3">{editError}</ErrorBox>
        ) : null}
      </form>
    </View>
  );
}
