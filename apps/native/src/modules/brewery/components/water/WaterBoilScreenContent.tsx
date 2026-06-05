import React, { useState } from "react";

/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { Modal, Pressable, ScrollView, View } from "react-native";

import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@umbraculum/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { Input } from "../../../../components/AppInput";




function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
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

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}


import type { WaterBoilScreenModel } from "../../hooks/useWaterBoilScreen";

export function WaterBoilScreenContent({ model }: { model: WaterBoilScreenModel }) {
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
    loadRecipeMeta,
    t,
    tCommon,
    tUnits,
    tWaterCommon,
    canCall,
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
    saltAdditions,
    setSaltAdditions,
    acidResult,
    manualResult,
    saveStatus,
    calcSaveStatus,
    saving,
    submitting,
    waterProfiles,
    dilutionProfiles,
    selectedSource,
    mixedSourceProfile,
    onSaveAdjustment,
    onSaveDraft,
    onCalculateAndSave,
    onSaveSalts,
    acidTypeOptions,
    strengthKindOptions
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

        {(saveStatus || calcSaveStatus) ? (
          <Card background="$green3" p="$3" mb="$3">
            <Text color="$green11">{saveStatus ?? calcSaveStatus}</Text>
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
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("adjustmentHelp")}
                </Text>
                <View style={{ gap: 12 }}>
                  <PickerField
                    label="Source water profile"
                    value={sourceProfileId}
                    options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
                    onChange={setSourceProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Target water profile"
                    value={targetProfileId}
                    options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
                    onChange={setTargetProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Dilution water profile"
                    value={dilutionProfileId}
                    options={[{ value: "", label: "(none)" }, ...profileOptions(dilutionProfiles)]}
                    onChange={setDilutionProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("sourceVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(tapVolumeLiters)}
                      onChangeText={(text) => setTapVolumeLiters(Number(text) || 0)}
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
                      value={String(dilutionVolumeLiters)}
                      onChangeText={(text) => setDilutionVolumeLiters(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <Button size="$3" onPress={() => { void onSaveAdjustment(); }} disabled={!canCall || saving}>
                    <Text>{saving ? "Saving…" : "Save adjustment"}</Text>
                  </Button>
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
                  {mixedSourceProfile ? (
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => {
                        setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate));
                        if (selectedSource?.ph != null) setStartingPh(String(selectedSource.ph));
                      }}
                      disabled={!canCall}
                    >
                      <Text fontSize={12}>Use profile alkalinity</Text>
                    </Button>
                  ) : null}
                  <ModeFieldset
                    legend="Mode"
                    name="boil-mode"
                    value={acidificationMode}
                    onChange={setAcidificationMode}
                    options={[
                      { value: "targetPh", label: "Target pH" },
                      { value: "manual", label: "Manual acid amount" },
                    ]}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(startingAlk)}
                      onChangeText={(text) => {
                        setStartingAlkTouched(true);
                        setStartingAlk(Number(text) || 0);
                      }}
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
                      value={startingPh}
                      onChangeText={setStartingPh}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  {acidificationMode === "targetPh" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Target pH
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(targetPh)}
                        onChangeText={(text) => setTargetPh(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}
                  <PickerField
                    label="Acid type"
                    value={acidType}
                    options={acidTypeOptions}
                    onChange={setAcidType}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Strength kind"
                    value={strengthKind}
                    options={strengthKindOptions}
                    onChange={(v) => setStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Strength value {strengthKind === "percent" ? "(%)" : ""}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(strengthValue)}
                      onChangeText={(text) => setStrengthValue(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      disabled={strengthKind === "solid"}
                    />
                  </View>
                  {acidificationMode === "manual" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(manualAcidAdded)}
                        onChangeText={(text) => setManualAcidAdded(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="$3"
                      onPress={() => { void onCalculateAndSave(); }}
                      disabled={!canCall || submitting}
                    >
                      <Text>
                        {submitting
                          ? "Working…"
                          : acidificationMode === "manual"
                            ? "Estimate & save"
                            : "Calculate & save"}
                      </Text>
                    </Button>
                    <Button size="$3" chromeless onPress={() => { void onSaveDraft(); }} disabled={!canCall || saving}>
                      <Text>{saving ? "Saving…" : "Save draft"}</Text>
                    </Button>
                  </View>
                  {acidResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Result
                      </Text>
                      {acidResult.acidRequiredMl != null ? (
                        <Text fontSize={12}>
                          Acid required: {acidResult.acidRequiredMl.toFixed(1)} {tUnits("mL")}
                        </Text>
                      ) : null}
                      {acidResult.acidRequiredGrams != null ? (
                        <Text fontSize={12}>
                          Acid required: {acidResult.acidRequiredGrams.toFixed(1)} {tUnits("g")}
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {acidResult.finalAlkalinityPpmCaCO3.toFixed(0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {acidResult.sulfateAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {acidResult.chlorideAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                  {manualResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Result (manual mode)
                      </Text>
                      <Text fontSize={12}>
                        Estimated achieved pH: {manualResult.achievedPh.toFixed(2)}
                      </Text>
                      <Text fontSize={12}>
                        Final alkalinity: {manualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(0)}{" "}
                        {tUnits("ppmAsCaCO3")}
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
                    <Heading fontSize={18}>{t("saltAdditionsHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("saltAdditionsBaseHelp")}
                </Text>
                <SaltAdditionsEditor
                  rows={saltAdditions}
                  onChange={setSaltAdditions}
                  idPrefix="boil"
                  disabled={!canCall}
                />
                <Button size="$3" mt="$2" chromeless onPress={() => { void onSaveSalts(); }} disabled={!canCall || saving}>
                  <Text>{saving ? "Saving…" : "Save salts"}</Text>
                </Button>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
