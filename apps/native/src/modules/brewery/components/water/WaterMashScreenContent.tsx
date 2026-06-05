import React, { useState } from "react";

/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@umbraculum/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { MashStepsEditor, type WaterVolumes } from "@umbraculum/brewery-recipes-ui";
import { Input } from "../../../../components/AppInput";



function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}



function PickerField(props: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button
        onPress={() => setOpen(true)}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={12}>{selectedLabel}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {props.options.map((opt) => (
                    <Button
                      key={opt.value}
                      onPress={() => {
                        props.onChange(opt.value);
                        setOpen(false);
                      }}
                      size="$3"
                      background={opt.value === props.value ? "$color4" : "$background"}
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text fontSize={12}>{opt.label}</Text>
                    </Button>
                  ))}
                </View>
              </ScrollView>
              <Button onPress={() => setOpen(false)} size="$3" chromeless>
                <Text>{props.closeLabel}</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}


import type { WaterMashScreenModel } from "../../hooks/useWaterMashScreen";

export function WaterMashScreenContent({ model }: { model: WaterMashScreenModel }) {
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
    locale,
    loadRecipeMeta,
    t,
    tEdit,
    tCommon,
    tUnits,
    tWaterCommon,
    error,
    openSections,
    setOpenSections,
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
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    saltAdditions,
    setSaltAdditions,
    overallResult,
    overallStatus,
    savingOverall,
    mashAcidResult,
    mashManualResult,
    mashSaveStatus,
    mashCalcSaveStatus,
    savingMash,
    mashSubmitting,
    mashRows,
    mashStepsDirty,
    mashStepsSaving,
    gristImportedRows,
    gristImportError,
    gristImportStatus,
    importingGrist,
    canCall,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL,
    waterProfiles,
    dilutionProfiles,
    profileOptions,
    selectedTarget,
    mixedSourceProfile,
    waterVolumes,
    saveSettings,
    onSaveAdjustment,
    onImportGristFromRecipe,
    lateAdditionsTotalKg,
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
    onComputeAndSave,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    saveMashSteps
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

        {error ? (
          <Card background="$red3" p="$3" mb="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <Accordion.Item value="adjustment">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("adjustmentHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("adjustment") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <PickerField
                    label="Source water profile"
                    value={sourceProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
                    onChange={setSourceProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Target water profile"
                    value={targetProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
                    onChange={setTargetProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Dilution water profile"
                    value={dilutionProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(dilutionProfiles)]}
                    onChange={setDilutionProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("sourceVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={tapVolumeLiters}
                      onChangeText={setTapVolumeLiters}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("dilutionVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={dilutionVolumeLiters}
                      onChangeText={setDilutionVolumeLiters}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <Button size="$3" onPress={() => { void onSaveAdjustment(); }}>
                    <Text>Save</Text>
                  </Button>
                  {mixedSourceProfile ? (
                    <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Mixed water ions
                      </Text>
                      <Text fontSize={11} opacity={0.8} mb="$2">
                        Computed from profiles + volumes
                      </Text>
                      {[
                        ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                        ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                        ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                        ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                        ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                        ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                      ].map(([label, mixed, target]) => {
                        const delta = target === null ? null : (mixed as number) - (target as number);
                        return (
                          <View key={String(label)} style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                            <Text fontSize={12} style={{ minWidth: 40 }}>{label}</Text>
                            <Text fontSize={12}>{formatFixed(locale, mixed as number, 0)} {tUnits("ppm")}</Text>
                            {target !== null ? (
                              <>
                                <Text fontSize={12} opacity={0.7}>Target: {formatFixed(locale, target as number, 0)}</Text>
                                <Text fontSize={12} opacity={0.7}>Δ: {formatFixed(locale, delta as number, 0)}</Text>
                              </>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="grist">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("gristSummaryHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("grist") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 8 }}>
                  <Text fontSize={12} opacity={0.75}>
                    {t("lateFermentablesExcludedNote", { kg: formatFixed(locale, lateAdditionsTotalKg, 2) })}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => { void onImportGristFromRecipe(); }}
                      disabled={!canCall || importingGrist}
                    >
                      <Text>{importingGrist ? "Importing…" : "Import/update grist snapshot"}</Text>
                    </Button>
                    {gristImportStatus ? <Text fontSize={12} opacity={0.85}>{gristImportStatus}</Text> : null}
                  </View>
                  {gristImportError ? <Text fontSize={12} color="$red10">{gristImportError}</Text> : null}
                  {gristImportedRows.length > 0 ? (
                    <Text fontSize={12} opacity={0.8}>
                      Rows: {gristImportedRows.length} · Total:{" "}
                      {formatFixed(
                        locale,
                        gristImportedRows.reduce(
                          (sum, r) => sum + (Number.isFinite(r['amountKg'] as number) ? (r['amountKg'] as number) : 0),
                          0,
                        ),
                        2,
                      )}{" "}
                      {tUnits("kg")}
                    </Text>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="acidification">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("acidificationHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("acidification") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <ModeFieldset
                    legend="Acidification mode"
                    name="mashAcidMode"
                    value={mashAcidificationMode}
                    onChange={setMashAcidificationMode}
                    options={[
                      { value: "targetPh", label: "Target pH" },
                      { value: "manual", label: "Manual" },
                    ]}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("startingAlkalinityLabel", { unit: "ppm as CaCO3" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStartingAlk)}
                      onChangeText={(text: string) => setMashStartingAlk(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Starting pH
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStartingPh)}
                      onChangeText={(text: string) => setMashStartingPh(Number(text) || 7)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Target pH
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashTargetPh)}
                      onChangeText={(text: string) => setMashTargetPh(Number(text) || 5.4)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <PickerField
                    label="Acid type"
                    value={mashAcidType}
                    options={[
                      { value: "phosphoric", label: "Phosphoric" },
                      { value: "lactic", label: "Lactic" },
                      { value: "hydrochloric", label: "Hydrochloric" },
                      { value: "sulfuric", label: "Sulfuric" },
                      { value: "acetic", label: "Acetic" },
                      { value: "citric", label: "Citric (solid)" },
                      { value: "tartaric", label: "Tartaric (solid)" },
                      { value: "malic", label: "Malic (solid)" },
                    ]}
                    onChange={setMashAcidType}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Strength kind"
                    value={mashStrengthKind}
                    options={[
                      { value: "percent", label: "Percent (%)" },
                      { value: "normality", label: "Normality (N)" },
                      { value: "molarity", label: "Molarity (M)" },
                      { value: "solid", label: "Solid (pure)" },
                    ]}
                    onChange={(v) => setMashStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Strength value {mashStrengthKind === "percent" ? "(%)" : ""}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStrengthValue)}
                      onChangeText={(text: string) => setMashStrengthValue(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      disabled={mashStrengthKind === "solid"}
                    />
                  </View>
                  {mashAcidificationMode === "manual" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Acid added ({mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(mashManualAcidAdded)}
                        onChangeText={(text: string) => setMashManualAcidAdded(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}

                  <View style={{ gap: 8, marginTop: 8 }}>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => { void onSaveMashDraft(); }}
                      disabled={!canCall || savingMash}
                    >
                      <Text>{savingMash ? t("saving") : t("saveMashDraft")}</Text>
                    </Button>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => { void onEstimateAndSaveSnapshot(); }}
                      disabled={!canCall || mashSubmitting}
                    >
                      <Text>
                        {mashSubmitting
                          ? t("working")
                          : mashAcidificationMode === "manual"
                            ? t("estimateAndSaveSnapshot")
                            : t("calculateAndSaveSnapshot")}
                      </Text>
                    </Button>
                    {mashSaveStatus || mashCalcSaveStatus ? (
                      <Text fontSize={12} opacity={0.85}>
                        {mashSaveStatus ?? mashCalcSaveStatus}
                      </Text>
                    ) : null}
                  </View>

                  {mashAcidificationMode === "targetPh" && mashAcidResult ? (
                    <View style={{ gap: 6, marginTop: 8 }}>
                      <Heading fontSize={16}>{t("resultLastCalculated")}</Heading>
                      {mashAcidResult.acidRequiredMl != null ? (
                        <Text fontSize={12}>
                          Acid required: {formatFixed(locale, mashAcidResult.acidRequiredMl, 0)} {tUnits("mL")}
                        </Text>
                      ) : null}
                      {mashAcidResult.acidRequiredGrams != null ? (
                        <Text fontSize={12}>
                          Acid required: {formatFixed(locale, mashAcidResult.acidRequiredGrams, 0)} {tUnits("g")}
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {formatFixed(locale, mashAcidResult.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {formatFixed(locale, mashAcidResult.sulfateAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {formatFixed(locale, mashAcidResult.chlorideAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}

                  {mashAcidificationMode === "manual" && mashManualResult ? (
                    <View style={{ gap: 6, marginTop: 10 }}>
                      <Heading fontSize={16}>{t("resultManualAcidAmountMode")}</Heading>
                      <Text fontSize={12} opacity={0.85}>
                        {t("estimatedFromManualAcidAmount")}
                      </Text>
                      <Text fontSize={12}>
                        Estimated achieved pH: {formatFixed(locale, mashManualResult.achievedPh, 2)}
                      </Text>
                      {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                        <Text fontSize={12}>
                          Acid amount: {formatFixed(locale, mashManualResult.targetAmount, 0)}{" "}
                          {mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                          {formatFixed(locale, mashManualResult.predictedAmount, 0)})
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {formatFixed(locale, mashManualResult.predicted.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {formatFixed(locale, mashManualResult.predicted.sulfateAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {formatFixed(locale, mashManualResult.predicted.chlorideAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="salts">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("saltAdditionsManualV0")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <SaltAdditionsEditor
                  rows={saltAdditions}
                  onChange={setSaltAdditions}
                  idPrefix="mash"
                  disabled={!canCall}
                />
                  <Button
                  size="$3"
                  mt="$2"
                  onPress={() => { void saveSettings({ mashSaltAdditionsJson: saltAdditions }); }}
                  disabled={!canCall}
                >
                  <Text>Save</Text>
                </Button>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="overall">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("overallResultHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("overall") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Button
                  size="$3"
                  onPress={() => { void onComputeAndSave(); }}
                  disabled={!canCall || savingOverall}
                >
                  <Text>{savingOverall ? "Calculating…" : "Compute & save"}</Text>
                </Button>
                {overallStatus ? <Text fontSize={12} mt="$2">{overallStatus}</Text> : null}
                {overallResult ? (
                  <View style={{ marginTop: 12, gap: 4 }}>
                    <Text fontSize={12}>
                      pH: {formatFixed(locale, (overallResult['ph'] as { value?: number })?.value ?? 0, 2)}
                    </Text>
                    <Text fontSize={12}>
                      Final alkalinity: {formatFixed(locale, (overallResult['finalAlkalinityPpmCaCO3'] as number) ?? 0, 0)} ppm
                    </Text>
                  </View>
                ) : null}
              </Accordion.Content>
            </Card>
          </Accordion.Item>

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
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
