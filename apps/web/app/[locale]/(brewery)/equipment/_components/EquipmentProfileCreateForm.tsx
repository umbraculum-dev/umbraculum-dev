"use client";

import { Accordion, Button, View, XStack, YStack } from "tamagui";

import { BrewAccordionSection } from "../../../../_components/BrewAccordionSection";
import { ErrorBox } from "../../../../_components/recipe-edit";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";
import { EquipmentCreateKettleFields } from "./create/EquipmentCreateKettleFields";
import { EquipmentCreateMashFields } from "./create/EquipmentCreateMashFields";
import { EquipmentCreateMiscFields } from "./create/EquipmentCreateMiscFields";
import { EquipmentCreateNameField } from "./create/EquipmentCreateNameField";

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
                <EquipmentCreateNameField
                  t={t}
                  createName={createName}
                  setCreateName={setCreateName}
                />

                <EquipmentCreateKettleFields
                  t={t}
                  tUnits={tUnits}
                  createKettleVolumeLiters={createKettleVolumeLiters}
                  setCreateKettleVolumeLiters={setCreateKettleVolumeLiters}
                  createKettleLossesLiters={createKettleLossesLiters}
                  setCreateKettleLossesLiters={setCreateKettleLossesLiters}
                  createKettleBoilEvaporationRatePercentPerHour={createKettleBoilEvaporationRatePercentPerHour}
                  setCreateKettleBoilEvaporationRatePercentPerHour={setCreateKettleBoilEvaporationRatePercentPerHour}
                  createKettleCoolingShrinkagePercent={createKettleCoolingShrinkagePercent}
                  setCreateKettleCoolingShrinkagePercent={setCreateKettleCoolingShrinkagePercent}
                  createKettleHopsAbsorptionLiters={createKettleHopsAbsorptionLiters}
                  setCreateKettleHopsAbsorptionLiters={setCreateKettleHopsAbsorptionLiters}
                />

                <EquipmentCreateMashFields
                  t={t}
                  tUnits={tUnits}
                  createMashVolumeLiters={createMashVolumeLiters}
                  setCreateMashVolumeLiters={setCreateMashVolumeLiters}
                  createMashEfficiencyPercent={createMashEfficiencyPercent}
                  setCreateMashEfficiencyPercent={setCreateMashEfficiencyPercent}
                  createMashLossesLiters={createMashLossesLiters}
                  setCreateMashLossesLiters={setCreateMashLossesLiters}
                  createMashThicknessLPerKg={createMashThicknessLPerKg}
                  setCreateMashThicknessLPerKg={setCreateMashThicknessLPerKg}
                  createMashGrainAbsorptionLPerKg={createMashGrainAbsorptionLPerKg}
                  setCreateMashGrainAbsorptionLPerKg={setCreateMashGrainAbsorptionLPerKg}
                  createMashWaterLeftoverLiters={createMashWaterLeftoverLiters}
                  setCreateMashWaterLeftoverLiters={setCreateMashWaterLeftoverLiters}
                />

                <EquipmentCreateMiscFields
                  t={t}
                  tUnits={tUnits}
                  createOtherLossesLiters={createOtherLossesLiters}
                  setCreateOtherLossesLiters={setCreateOtherLossesLiters}
                />
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
