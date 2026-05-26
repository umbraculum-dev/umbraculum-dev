import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
import { parseSpargeComputeAndSaveResponse, parseWaterProfilesResponse } from "@umbraculum/contracts";
import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@umbraculum/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { Input } from "../../../components/AppInput";
import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { useLocaleController } from "../../../i18n/I18nProvider";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

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

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}

export function WaterSpargeScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    const res = await api.get(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, [baseUrl, token]);

  const { t } = useT("recipes.water.sparge");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["spargeConfig", "acidification", "salts"]);

  const [spargeStepTimeMin, setSpargeStepTimeMin] = useState(60);
  const [spargeStepRampMin, setSpargeStepRampMin] = useState(0);
  const [spargeMethodType, setSpargeMethodType] = useState<"fly_sparge" | "batch_sparge">("fly_sparge");
  const [spargeStepTemp, setSpargeStepTemp] = useState(75);
  const [savingSpargeConfig, setSavingSpargeConfig] = useState(false);
  const [spargeConfigSaveStatus, setSpargeConfigSaveStatus] = useState<string | null>(null);

  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [spargeResult, setSpargeResult] = useState<{
    acidRequiredMl: number | null;
    acidRequiredTsp: number | null;
    acidRequiredGrams: number | null;
    acidRequiredKg: number | null;
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
  } | null>(null);
  const [spargeManualResult, setSpargeManualResult] = useState<{
    achievedPh: number;
    predicted: { finalAlkalinityPpmCaCO3: number; sulfateAddedPpm: number; chlorideAddedPpm: number };
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allProfiles = useMemo(() => {
    if (!profiles) return [];
    const sys = profiles.system ?? [];
    const pub = profiles.public ?? [];
    const ws = profiles.workspace ?? [];
    return [...sys, ...pub, ...ws];
  }, [profiles]);
  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
  const selectedProfile = useMemo(
    () => waterProfiles.find((p) => p.id === spargeWaterProfileId) ?? null,
    [spargeWaterProfileId, waterProfiles],
  );

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!selectedProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(selectedProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [selectedProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const loadData = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const [profRes, settingsRes] = await Promise.all([
        api.get("/api/water-profiles"),
        api.get(`/api/recipes/${recipeId}/water-settings`),
      ]);
      if (profRes.ok) setProfiles(parseWaterProfilesResponse(profRes.data));
      if (settingsRes.ok) {
        const s = (settingsRes.data as { settings?: Record<string, unknown> })?.settings;
        if (s) {
          setSettings(s);
          setSpargeWaterProfileId((s['spargeWaterProfileId'] as string) ?? "");
          const savedAlk = s['spargeStartingAlkalinityPpmCaCO3'];
          setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
          setStartingAlkTouched(
            typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0,
          );
          setStartingPh(String(s['spargeStartingPh'] ?? 7.0));
          setTargetPh((s['spargeTargetPh'] as number) ?? 5.6);
          setVolumeLiters((s['spargeVolumeLiters'] as number) ?? 20);
          setAcidType((s['spargeAcidType'] as string) ?? "phosphoric");
          setStrengthKind(((s['spargeStrengthKind'] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
          setStrengthValue((s['spargeStrengthValue'] as number) ?? 10);
          setAcidificationMode(s['spargeAcidificationMode'] === "manual" ? "manual" : "targetPh");
          setSpargeStepTimeMin((s['spargeStepTimeMin'] as number) ?? 60);
          setSpargeStepRampMin((s['spargeStepRampMin'] as number) ?? 0);
          setSpargeMethodType(
            (s['spargeMethodType'] as string) === "batch_sparge" ? "batch_sparge" : "fly_sparge",
          );
          setSpargeStepTemp((s['spargeStepTemperatureC'] as number) ?? 75);
          const savedManual =
            (s['spargeStrengthKind'] as string) === "solid"
              ? (s['spargeManualAcidAddedGrams'] as number) ?? 0
              : (s['spargeManualAcidAddedMl'] as number) ?? 0;
          setManualAcidAdded(savedManual);
          if (Array.isArray(s['spargeSaltAdditionsJson'])) setSaltAdditions(s['spargeSaltAdditionsJson'] as SaltAdditionRow[]);
          if (s['spargeLastCalculatedAt']) {
            setSpargeResult({
              acidRequiredMl: s['spargeLastAcidRequiredMl'] as number | null,
              acidRequiredTsp: s['spargeLastAcidRequiredTsp'] as number | null,
              acidRequiredGrams: s['spargeLastAcidRequiredGrams'] as number | null,
              acidRequiredKg: s['spargeLastAcidRequiredKg'] as number | null,
              finalAlkalinityPpmCaCO3: (s['spargeLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
              sulfateAddedPpm: (s['spargeLastSulfateAddedPpm'] as number) ?? 0,
              chlorideAddedPpm: (s['spargeLastChlorideAddedPpm'] as number) ?? 0,
            });
          }
          if (s['spargeManualLastCalculatedAt']) {
            setSpargeManualResult({
              achievedPh: (s['spargeManualLastAchievedPh'] as number) ?? 0,
              predicted: {
                finalAlkalinityPpmCaCO3: (s['spargeManualLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
                sulfateAddedPpm: (s['spargeManualLastSulfateAddedPpm'] as number) ?? 0,
                chlorideAddedPpm: (s['spargeManualLastChlorideAddedPpm'] as number) ?? 0,
              },
            });
          }
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, baseUrl, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!canCall) return;
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const res = await api.put(`/api/recipes/${recipeId}/water-settings`, patch);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const d = res.data as { settings?: Record<string, unknown> };
      if (d?.settings) setSettings(d.settings);
    },
    [canCall, recipeId, baseUrl, token],
  );

  const onSaveDraft = async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings({
        spargeWaterProfileId: spargeWaterProfileId || null,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode: acidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
        spargeSaltAdditionsJson: saltAdditions,
      });
      setSaveStatus("Saved sparge draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onCalculateAndSave = async () => {
    if (!canCall) return;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      setError("Sparge water volume must be > 0.");
      return;
    }
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setError("Starting pH is required.");
      return;
    }
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSpargeResult(null);
    setSpargeManualResult(null);
    setSubmitting(true);
    try {
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const payload: Record<string, unknown> = {
        spargeWaterProfileId: spargeWaterProfileId,
        spargeSaltAdditionsJson: saltAdditions,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: Number(startingPh),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode: acidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
      };
      const res = await api.post(
        `/api/recipes/${recipeId}/water-settings/sparge/compute-and-save`,
        payload,
      );
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const computed = parseSpargeComputeAndSaveResponse(res.data);
      setSpargeManualResult(null);
      setSpargeResult(null);
      if (computed.acid.kind === "sparge_acidification_manual") {
        const r = computed.acid.result;
        setSpargeManualResult({
          achievedPh: r.achievedPh ?? 0,
          predicted: {
            finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
            sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
            chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
          },
        });
        setSpargeResult(r.predicted ?? null);
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        const r = computed.acid.result;
        setSpargeResult({
          acidRequiredMl: r.acidRequiredMl ?? null,
          acidRequiredTsp: r.acidRequiredTsp ?? null,
          acidRequiredGrams: r.acidRequiredGrams ?? null,
          acidRequiredKg: r.acidRequiredKg ?? null,
          finalAlkalinityPpmCaCO3: r.finalAlkalinityPpmCaCO3 ?? 0,
          sulfateAddedPpm: r.sulfateAddedPpm ?? 0,
          chlorideAddedPpm: r.chlorideAddedPpm ?? 0,
        });
        setCalcSaveStatus("Calculated & saved snapshot.");
      }
      const d = (res.data as { settings?: Record<string, unknown> })?.settings;
      if (d) setSettings(d);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveSpargeConfig = async () => {
    if (!canCall) return;
    setError(null);
    setSpargeConfigSaveStatus(null);
    setSavingSpargeConfig(true);
    try {
      await saveSettings({
        spargeStepTimeMin: Math.max(0, Math.min(600, spargeStepTimeMin)),
        spargeStepRampMin: Math.max(0, Math.min(120, spargeStepRampMin)),
        spargeMethodType,
        spargeStepTemperatureC: Math.round(Math.max(0, Math.min(100, spargeStepTemp)) * 10) / 10,
      });
      setSpargeConfigSaveStatus("Saved sparge configuration.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingSpargeConfig(false);
    }
  };

  const onSaveSalts = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: saltAdditions });
      setSaveStatus("Saved salts draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const acidTypeOptions = [
    { value: "phosphoric", label: "Phosphoric" },
    { value: "lactic", label: "Lactic" },
    { value: "hydrochloric", label: "Hydrochloric" },
    { value: "sulfuric", label: "Sulfuric" },
    { value: "acetic", label: "Acetic" },
    { value: "citric", label: "Citric (solid)" },
    { value: "tartaric", label: "Tartaric (solid)" },
    { value: "malic", label: "Malic (solid)" },
  ];

  const strengthKindOptions = [
    { value: "percent", label: "Percent (%)" },
    { value: "normality", label: "Normality (N)" },
    { value: "molarity", label: "Molarity (M)" },
    { value: "solid", label: "Solid (pure)" },
  ];

  if (loading && !profiles) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

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
        <Button chromeless size="$3" mb="$3" onPress={() => navigation.navigate("WaterMash", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("goToMash")}</Text>
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
          <Accordion.Item value="spargeConfig">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("spargeConfigurationHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("spargeConfig") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepTime", { unit: "min" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(spargeStepTimeMin)}
                      onChangeText={(text) =>
                        setSpargeStepTimeMin(Math.max(0, Math.min(600, Number(text) || 0)))
                      }
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepRamp", { unit: "min" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(spargeStepRampMin)}
                      onChangeText={(text) =>
                        setSpargeStepRampMin(Math.max(0, Math.min(120, Number(text) || 0)))
                      }
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <PickerField
                    label={tEdit("mashingStepType")}
                    value={spargeMethodType}
                    options={[
                      { value: "fly_sparge", label: t("spargeMethodFlySparge") },
                      { value: "batch_sparge", label: t("spargeMethodBatchSparge") },
                    ]}
                    onChange={(v) => setSpargeMethodType(v as "fly_sparge" | "batch_sparge")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepTemp", { unit: tUnits("C") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={formatFixed(locale, spargeStepTemp, 1)}
                      onChangeText={(text) => {
                        const parsed = Number(String(text).replace(",", "."));
                        setSpargeStepTemp(
                          Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0)),
                        );
                      }}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <Button
                    size="$3"
                    chromeless
                    onPress={() => { void onSaveSpargeConfig(); }}
                    disabled={!canCall || savingSpargeConfig}
                  >
                    <Text>{savingSpargeConfig ? "Saving…" : "Save"}</Text>
                  </Button>
                  {spargeConfigSaveStatus ? (
                    <Text fontSize={12} color="$green11">
                      {spargeConfigSaveStatus}
                    </Text>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="acidification">
            <Card gap="$2" mt="$2">
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
                  <PickerField
                    label="Sparge water profile"
                    value={spargeWaterProfileId}
                    options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
                    onChange={setSpargeWaterProfileId}
                    closeLabel={tCommon("close")}
                  />
                  {selectedProfile ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <Button
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        onPress={() => {
                          setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(selectedProfile.bicarbonate));
                          setStartingPh(
                            selectedProfile.ph == null ? "" : String(selectedProfile.ph),
                          );
                        }}
                        disabled={!canCall}
                      >
                        <Text fontSize={12}>Use profile alkalinity + pH</Text>
                      </Button>
                    </View>
                  ) : null}
                  <ModeFieldset
                    legend="Mode"
                    name="sparge-mode"
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
                      {t("waterVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(volumeLiters)}
                      onChangeText={(text) => setVolumeLiters(Number(text) || 0)}
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
                  {spargeResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        {t("resultLastCalculated")}
                      </Text>
                      {spargeResult.acidRequiredMl != null ? (
                        <Text fontSize={12}>
                          Acid required: {spargeResult.acidRequiredMl.toFixed(1)} {tUnits("mL")}
                          {spargeResult.acidRequiredTsp != null
                            ? ` (${spargeResult.acidRequiredTsp.toFixed(1)} ${tUnits("tsp")})`
                            : ""}
                        </Text>
                      ) : null}
                      {spargeResult.acidRequiredGrams != null ? (
                        <Text fontSize={12}>
                          Acid required: {spargeResult.acidRequiredGrams.toFixed(1)} {tUnits("g")}
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {spargeResult.finalAlkalinityPpmCaCO3.toFixed(0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {spargeResult.sulfateAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {spargeResult.chlorideAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                  {spargeManualResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Result (manual mode)
                      </Text>
                      <Text fontSize={12}>
                        Estimated achieved pH: {spargeManualResult.achievedPh.toFixed(2)}
                      </Text>
                      <Text fontSize={12}>
                        Final alkalinity:{" "}
                        {spargeManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(0)}{" "}
                        {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {spargeManualResult.predicted.sulfateAddedPpm.toFixed(0)}{" "}
                        {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {spargeManualResult.predicted.chlorideAddedPpm.toFixed(0)}{" "}
                        {tUnits("ppm")}
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
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("saltAdditionsHelp")}
                </Text>
                <SaltAdditionsEditor
                  rows={saltAdditions}
                  onChange={setSaltAdditions}
                  idPrefix="sparge"
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
