import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { parseBoilComputeAndSaveResponse, parseWaterProfilesResponse } from "@brewery/contracts";
import type { WaterProfile, WaterProfilesResponse } from "@brewery/contracts";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@brewery/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@brewery/recipes-ui";
import { Input } from "../components/AppInput";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";

type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function mixIonProfilesByVolume(
  a: IonProfilePpm,
  aVolumeLiters: number,
  b: IonProfilePpm,
  bVolumeLiters: number,
): IonProfilePpm | null {
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;
  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
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

export function WaterBoilScreen() {
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

  const { t } = useT("recipes.water.boil");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification", "salts"]);

  const [sourceProfileId, setSourceProfileId] = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [dilutionProfileId, setDilutionProfileId] = useState("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);

  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [acidResult, setAcidResult] = useState<{
    acidRequiredMl: number | null;
    acidRequiredTsp: number | null;
    acidRequiredGrams: number | null;
    acidRequiredKg: number | null;
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
  } | null>(null);
  const [manualResult, setManualResult] = useState<{
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
  const dilutionProfiles = useMemo(() => allProfiles.filter((p) => p.type === "dilution"), [allProfiles]);
  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedDilution = useMemo(
    () => dilutionProfiles.find((p) => p.id === dilutionProfileId) ?? null,
    [dilutionProfileId, dilutionProfiles],
  );

  const mixedSourceProfile = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    const total = tap + dil;
    if (!(total > 0)) return null;
    if (!(tap > 0) || !selectedSource) return null;
    if (dil > 0 && !selectedDilution) return null;
    if (!(dil > 0)) {
      return {
        name: `Source (${selectedSource.name})`,
        totalVolumeLiters: tap,
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      };
    }
    if (!selectedSource || !selectedDilution) return null;
    const mixed = mixIonProfilesByVolume(
      {
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      },
      tap,
      {
        calcium: selectedDilution.calcium,
        magnesium: selectedDilution.magnesium,
        sodium: selectedDilution.sodium,
        sulfate: selectedDilution.sulfate,
        chloride: selectedDilution.chloride,
        bicarbonate: selectedDilution.bicarbonate,
      },
      dil,
    );
    if (!mixed) return null;
    return {
      name: `Mixed`,
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const derivedBoilWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  const loadData = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
      const [profRes, settingsRes] = await Promise.all([
        api.get("/api/water-profiles"),
        api.get(`/api/recipes/${recipeId}/water-settings`),
      ]);
      if (profRes.ok) setProfiles(parseWaterProfilesResponse(profRes.data));
      if (settingsRes.ok) {
        const s = (settingsRes.data as { settings?: Record<string, unknown> })?.settings;
        if (s) {
          setSettings(s);
          setSourceProfileId((s.boilSourceWaterProfileId as string) ?? "");
          setTargetProfileId((s.boilTargetWaterProfileId as string) ?? "");
          setDilutionProfileId((s.boilDilutionWaterProfileId as string) ?? "");
          setTapVolumeLiters((s.boilTapWaterVolumeLiters as number) ?? 0);
          setDilutionVolumeLiters((s.boilDilutionWaterVolumeLiters as number) ?? 0);
          const savedAlk = s.boilStartingAlkalinityPpmCaCO3;
          setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
          setStartingAlkTouched(
            typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0,
          );
          setStartingPh(String(s.boilStartingPh ?? 7.0));
          setTargetPh((s.boilTargetPh as number) ?? 5.6);
          setAcidType((s.boilAcidType as string) ?? "phosphoric");
          setStrengthKind(((s.boilStrengthKind as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
          setStrengthValue((s.boilStrengthValue as number) ?? 10);
          setAcidificationMode(s.boilAcidificationMode === "manual" ? "manual" : "targetPh");
          const savedManual =
            (s.boilStrengthKind as string) === "solid"
              ? (s.boilManualAcidAddedGrams as number) ?? 0
              : (s.boilManualAcidAddedMl as number) ?? 0;
          setManualAcidAdded(savedManual);
          if (Array.isArray(s.boilSaltAdditionsJson)) setSaltAdditions(s.boilSaltAdditionsJson as SaltAdditionRow[]);
          if (s.boilLastCalculatedAt) {
            setAcidResult({
              acidRequiredMl: s.boilLastAcidRequiredMl as number | null,
              acidRequiredTsp: s.boilLastAcidRequiredTsp as number | null,
              acidRequiredGrams: s.boilLastAcidRequiredGrams as number | null,
              acidRequiredKg: s.boilLastAcidRequiredKg as number | null,
              finalAlkalinityPpmCaCO3: (s.boilLastFinalAlkalinityPpmCaCO3 as number) ?? 0,
              sulfateAddedPpm: (s.boilLastSulfateAddedPpm as number) ?? 0,
              chlorideAddedPpm: (s.boilLastChlorideAddedPpm as number) ?? 0,
            });
          }
          if (s.boilManualLastCalculatedAt) {
            setManualResult({
              achievedPh: (s.boilManualLastAchievedPh as number) ?? 0,
              predicted: {
                finalAlkalinityPpmCaCO3: (s.boilManualLastFinalAlkalinityPpmCaCO3 as number) ?? 0,
                sulfateAddedPpm: (s.boilManualLastSulfateAddedPpm as number) ?? 0,
                chlorideAddedPpm: (s.boilManualLastChlorideAddedPpm as number) ?? 0,
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
      const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
      const res = await api.put(`/api/recipes/${recipeId}/water-settings`, patch);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const d = res.data as { settings?: Record<string, unknown> };
      if (d?.settings) setSettings(d.settings);
    },
    [canCall, recipeId, baseUrl, token],
  );

  const onSaveAdjustment = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onSaveDraft = async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
        boilStartingAlkalinityPpmCaCO3: startingAlk,
        boilStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
        boilTargetPh: targetPh,
        boilAcidType: acidType,
        boilStrengthKind: strengthKind,
        boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
        boilAcidificationMode: acidificationMode,
        boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
        boilSaltAdditionsJson: saltAdditions,
      });
      setSaveStatus("Saved boil draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onCalculateAndSave = async () => {
    if (!canCall) return;
    if (!sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
      setError("Boil water volume must be > 0 (set Water adjustment volumes).");
      return;
    }
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setError("Starting pH is required.");
      return;
    }
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setAcidResult(null);
    setManualResult(null);
    setSubmitting(true);
    try {
      const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
      const payload: Record<string, unknown> = {
        boilSourceWaterProfileId: sourceProfileId,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
        boilStartingAlkalinityPpmCaCO3: startingAlk,
        boilStartingPh: Number(startingPh),
        boilTargetPh: targetPh,
        boilAcidType: acidType,
        boilStrengthKind: strengthKind,
        boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
        boilAcidificationMode: acidificationMode,
        boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
        boilSaltAdditionsJson: saltAdditions,
      };
      const res = await api.post(
        `/api/recipes/${recipeId}/water-settings/boil/compute-and-save`,
        payload,
      );
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const computed = parseBoilComputeAndSaveResponse(res.data);
      setManualResult(null);
      setAcidResult(null);
      if (computed.acid.kind === "boil_acidification_manual") {
        const r = computed.acid.result;
        setManualResult({
          achievedPh: r.achievedPh ?? 0,
          predicted: {
            finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
            sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
            chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
          },
        });
        setAcidResult(r.predicted ?? null);
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        const r = computed.acid.result;
        setAcidResult({
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

  const onSaveSalts = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({ boilSaltAdditionsJson: saltAdditions });
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
                  <Button size="$3" onPress={onSaveAdjustment} disabled={!canCall || saving}>
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
                      onPress={onCalculateAndSave}
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
                    <Button size="$3" chromeless onPress={onSaveDraft} disabled={!canCall || saving}>
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
                <Button size="$3" mt="$2" chromeless onPress={onSaveSalts} disabled={!canCall || saving}>
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
