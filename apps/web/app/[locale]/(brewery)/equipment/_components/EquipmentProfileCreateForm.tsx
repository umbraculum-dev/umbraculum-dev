"use client";

import { Accordion, Button, Input, View, XStack, YStack } from "tamagui";

import { BrewAccordionSection } from "../../../../_components/BrewAccordionSection";
import { ErrorBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";

type Model = ReturnType<typeof useEquipmentPage>;

export function EquipmentProfileCreateForm(props: { model: Model }) {
  const {
    t,
    tUnits,
    openSections,
    setCreateSectionOpen,
    createName,
    setCreateName,
    createKettleVolumeLiters,
    setCreateKettleVolumeLiters,
    createKettleLossesLiters,
    setCreateKettleLossesLiters,
    createKettleBoilEvaporationRatePercentPerHour,
    setCreateKettleBoilEvaporationRatePercentPerHour,
    createKettleCoolingShrinkagePercent,
    setCreateKettleCoolingShrinkagePercent,
    createKettleHopsAbsorptionLiters,
    setCreateKettleHopsAbsorptionLiters,
    createMashVolumeLiters,
    setCreateMashVolumeLiters,
    createMashEfficiencyPercent,
    setCreateMashEfficiencyPercent,
    createMashLossesLiters,
    setCreateMashLossesLiters,
    createMashThicknessLPerKg,
    setCreateMashThicknessLPerKg,
    createMashGrainAbsorptionLPerKg,
    setCreateMashGrainAbsorptionLPerKg,
    createMashWaterLeftoverLiters,
    setCreateMashWaterLeftoverLiters,
    createOtherLossesLiters,
    setCreateOtherLossesLiters,
    createError,
    createSubmitting,
    onCreate,
  } = props.model;

  return (
    <View mt="$3">
      <Accordion
        type="single"
        collapsible
        value={openSections.includes("create") ? "create" : ""}
        onValueChange={(v) => setCreateSectionOpen(v === "create")}
      >
        <BrewAccordionSection
          value="create"
          headingId="equipment-create-heading"
          title={t("createTitle")}
          open={openSections.includes("create")}
        >
          <View mt="$3">
            <form onSubmit={(...a) => { void onCreate(...(a as Parameters<typeof onCreate>)); }} aria-describedby={createError ? "equipment-create-error" : undefined}>
              <YStack gap="$3">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="equip-name">{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    id="equip-name"
                    value={createName}
                    onChangeText={setCreateName}
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
                        <RecipeEditFieldLabel htmlFor="equip-kettle-vol">
                          {t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-kettle-vol"
                          type="number"
                          inputMode="decimal"
                          value={createKettleVolumeLiters}
                          onChangeText={setCreateKettleVolumeLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-kettle-losses">
                          {t("kettleLossesLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-kettle-losses"
                          type="number"
                          inputMode="decimal"
                          value={createKettleLossesLiters}
                          onChangeText={setCreateKettleLossesLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-evap">
                          {t("kettleBoilEvaporationRatePercentPerHourLabel")}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-evap"
                          type="number"
                          inputMode="decimal"
                          value={createKettleBoilEvaporationRatePercentPerHour}
                          onChangeText={setCreateKettleBoilEvaporationRatePercentPerHour}
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
                        <RecipeEditFieldLabel htmlFor="equip-shrink">
                          {t("kettleCoolingShrinkagePercentLabel")}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-shrink"
                          type="number"
                          inputMode="decimal"
                          value={createKettleCoolingShrinkagePercent}
                          onChangeText={setCreateKettleCoolingShrinkagePercent}
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
                        <RecipeEditFieldLabel htmlFor="equip-hops-abs">
                          {t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-hops-abs"
                          type="number"
                          inputMode="decimal"
                          value={createKettleHopsAbsorptionLiters}
                          onChangeText={setCreateKettleHopsAbsorptionLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-mash-vol">
                          {t("mashVolumeLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-mash-vol"
                          type="number"
                          inputMode="decimal"
                          value={createMashVolumeLiters}
                          onChangeText={setCreateMashVolumeLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-mash-eff">
                          {t("mashEfficiencyPercentLabel")}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-mash-eff"
                          type="number"
                          inputMode="decimal"
                          value={createMashEfficiencyPercent}
                          onChangeText={setCreateMashEfficiencyPercent}
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
                        <RecipeEditFieldLabel htmlFor="equip-mash-losses">
                          {t("mashLossesLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-mash-losses"
                          type="number"
                          inputMode="decimal"
                          value={createMashLossesLiters}
                          onChangeText={setCreateMashLossesLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-mash-thickness">
                          {t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-mash-thickness"
                          type="number"
                          inputMode="decimal"
                          value={createMashThicknessLPerKg}
                          onChangeText={setCreateMashThicknessLPerKg}
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
                        <RecipeEditFieldLabel htmlFor="equip-grain-abs">
                          {t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-grain-abs"
                          type="number"
                          inputMode="decimal"
                          value={createMashGrainAbsorptionLPerKg}
                          onChangeText={setCreateMashGrainAbsorptionLPerKg}
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
                        <RecipeEditFieldLabel htmlFor="equip-water-leftover">
                          {t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-water-leftover"
                          type="number"
                          inputMode="decimal"
                          value={createMashWaterLeftoverLiters}
                          onChangeText={setCreateMashWaterLeftoverLiters}
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
                        <RecipeEditFieldLabel htmlFor="equip-other-losses">
                          {t("otherLossesLitersLabel", { unit: tUnits("L") })}
                        </RecipeEditFieldLabel>
                        <Input
                          id="equip-other-losses"
                          type="number"
                          inputMode="decimal"
                          value={createOtherLossesLiters}
                          onChangeText={setCreateOtherLossesLiters}
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
              <XStack gap="$3" mt="$3" alignItems="center">
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={createSubmitting}>
                  {createSubmitting ? t("creating") : t("create")}
                </Button>
              </XStack>
              {createError ? (
                <ErrorBox id="equipment-create-error" mt="$3">{createError}</ErrorBox>
              ) : null}
            </form>
          </View>
        </BrewAccordionSection>
      </Accordion>
    </View>
  );
}
