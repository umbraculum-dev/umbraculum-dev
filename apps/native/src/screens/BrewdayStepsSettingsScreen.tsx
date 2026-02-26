import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";
import { Input, TextArea } from "tamagui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

const PRESET_KEYS = [
  "preparation",
  "pre_mash",
  "mash",
  "lauter",
  "sparge",
  "boil",
  "post_boil",
  "fermentor",
  "cleanup",
  "quality",
  "miscellaneous",
] as const;

type PresetKey = (typeof PRESET_KEYS)[number];

type BrewdaySectionConfig = {
  presetExcludes: Record<string, boolean>;
  customSections: { id: string; name: string; exclude: boolean }[];
  customBrewingMethods?: string[];
};

type BrewdayStep = {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
};

const BREWING_TYPE_OPTIONS = [
  { value: "all_grain", labelKey: "brewingTypeAllGrain" },
  { value: "extract_partial_biab", labelKey: "brewingTypeExtractPartialBiab" },
] as const;

function newId() {
  try {
    return (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

const DEFAULT_STEPS_SEED: BrewdayStep[] = [
  { id: newId(), name: "Check ingredients are available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure tool and equipment are on hand", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure kettle and mash valves are closed", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure the requested water quantity is available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare brewing salts additions", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare acids addition", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare hops additions", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure yeast is available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash water", sectionId: "pre_mash", exclude: false, minutes: null },
  { id: newId(), name: "Add strike water volume to mash", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Vorlauf", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Collect mash pH", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating sparge water", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Add first wort hops to boil", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Bring to a strong boil", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Cool wort to fermentation temperature", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Transfer cooled wort to fermenter", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Pitch yeast", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Clean mash and boil kettle", sectionId: "cleanup", exclude: false, minutes: null },
];

function parseMinutes(val: string): number | null {
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function CheckboxRow(props: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <Pressable
      onPress={() => props.onChange(!props.checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: props.checked }}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderWidth: 1,
          borderColor: "var(--border)",
          borderRadius: 4,
          backgroundColor: props.checked ? "rgba(59,130,246,0.15)" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.checked ? (
          <Text fontSize={12} fontWeight="bold">
            ✓
          </Text>
        ) : null}
      </View>
      <Text fontSize={12} opacity={0.85}>
        {props.label}
      </Text>
    </Pressable>
  );
}

type PickerOption = { value: string; label: string };

function PickerField(props: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (nextValue: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "";
  const buttonText = selectedLabel || "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button onPress={() => setOpen(true)} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
        <Text fontSize={12}>{buttonText}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <View style={{ gap: 8 }}>
                {props.options.map((opt) => (
                  <Button
                    key={opt.value || "__empty"}
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

export function BrewdayStepsSettingsScreen() {
  const navigation = useNavigation<any>();
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("dashboard.brewdayStepsSettings");
  const { t: tCommon } = useT("common");

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const canCall = Boolean(baseUrl && token);

  const [brewingType, setBrewingType] = useState<string>("");
  const [sections, setSections] = useState<BrewdaySectionConfig>({ presetExcludes: {}, customSections: [], customBrewingMethods: [] });
  const [defaultSteps, setDefaultSteps] = useState<BrewdayStep[]>([]);
  const [customSteps, setCustomSteps] = useState<BrewdayStep[]>([]);
  const [brewdayNotes, setBrewdayNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [customSectionName, setCustomSectionName] = useState("");
  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");
  const [customBrewingMethodName, setCustomBrewingMethodName] = useState("");

  const [openSections, setOpenSections] = useState<string[]>(["recap", "brewingType", "sections"]);

  const sectionOptions = useMemo(() => {
    const preset = PRESET_KEYS.map((k) => ({ value: k, label: t(`presetSections.${k}` as any) }));
    const custom = (sections.customSections ?? []).map((s) => ({ value: s.id, label: s.name }));
    return [...preset, ...custom];
  }, [sections.customSections, t]);

  useEffect(() => {
    if (!canCall) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
    api
      .get("/api/brewday-settings")
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          const err = (res.data as any)?.error;
          const msg = typeof err === "string" ? err : err?.message ?? "Failed to load";
          setLoadError(msg);
          setLoading(false);
          return;
        }
        const s = (res.data as any)?.settings;
        if (s) {
          if (s.brewingType != null) setBrewingType(String(s.brewingType));
          setSections(s.sections ?? { presetExcludes: {}, customSections: [], customBrewingMethods: [] });
          const loadedDefault = Array.isArray(s.defaultSteps) ? s.defaultSteps : [];
          setDefaultSteps(loadedDefault.length > 0 ? loadedDefault : DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
          setCustomSteps(Array.isArray(s.customSteps) ? s.customSteps : []);
          setBrewdayNotes(typeof s.notes === "string" ? s.notes : "");
        } else {
          setSections({ presetExcludes: {}, customSections: [], customBrewingMethods: [] });
          setDefaultSteps(DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
          setCustomSteps([]);
          setBrewdayNotes("");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [baseUrl, canCall, token]);

  const onSave = useCallback(async () => {
    if (!canCall) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
      const res = await api.patch("/api/brewday-settings", {
        brewingType,
        sections,
        defaultSteps,
        customSteps,
        notes: brewdayNotes || null,
      });
      if (!res.ok) {
        const err = (res.data as any)?.error;
        const msg = typeof err === "string" ? err : err?.message ?? "Save failed";
        setSaveError(msg);
        return;
      }
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [baseUrl, brewdayNotes, brewingType, canCall, customSteps, defaultSteps, sections, t, token]);

  const recapLines = useMemo(() => {
    const all = [...defaultSteps, ...customSteps].filter((s) => s && s.exclude !== true);
    const groups: Record<string, number> = {};
    for (const st of all) groups[st.sectionId] = (groups[st.sectionId] ?? 0) + 1;
    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([sectionId, count]) => ({ sectionId, count }));
  }, [customSteps, defaultSteps]);

  const addCustomSection = () => {
    const name = customSectionName.trim();
    if (!name) return;
    const id = `custom_${newId()}`;
    setSections((prev) => ({ ...prev, customSections: [...(prev.customSections ?? []), { id, name, exclude: false }] }));
    setCustomSectionName("");
  };

  const addCustomBrewingMethod = () => {
    const name = customBrewingMethodName.trim();
    if (!name) return;
    setSections((prev) => ({ ...prev, customBrewingMethods: [...(prev.customBrewingMethods ?? []), name] }));
    setCustomBrewingMethodName("");
  };

  const addCustomStep = () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || "miscellaneous";
    setCustomSteps((prev) => [
      ...prev,
      { id: newId(), name, sectionId, exclude: false, minutes: parseMinutes(customStepMinutes) },
    ]);
    setCustomStepName("");
    setCustomStepMinutes("");
  };

  const toggleOpen = (key: string) => {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  if (loading) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ gap: 12 }}>
          <Text fontSize={12} opacity={0.85}>
            {t("subtitle")}
          </Text>

          {!canCall ? (
            <Card background="$red3" p="$3">
              <Text color="$red11">{t("accountRequired")}</Text>
            </Card>
          ) : null}

          {loadError ? (
            <Card background="$red3" p="$3">
              <Text color="$red11">{loadError}</Text>
            </Card>
          ) : null}

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("recap")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewdayStepsRecap.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("recap") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("recap") ? (
              recapLines.length > 0 ? (
                <View style={{ gap: 6 }}>
                  {recapLines.map((l) => (
                    <Text key={l.sectionId} fontSize={12} opacity={0.85}>
                      {l.sectionId}: {l.count}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text fontSize={12} opacity={0.85}>
                  {t("sections.brewdayStepsRecap.empty")}
                </Text>
              )
            ) : null}
          </Card>

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("brewingType")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewingType.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("brewingType") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("brewingType") ? (
              <View style={{ gap: 12 }}>
                <PickerField
                  label={t("sections.brewingType.label")}
                  value={brewingType}
                  options={[
                    { value: "", label: "—" },
                    ...BREWING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey as any) })),
                    ...(sections.customBrewingMethods ?? []).map((m) => ({ value: m, label: m })),
                  ]}
                  onChange={setBrewingType}
                  closeLabel={tCommon("close")}
                />
                <View>
                  <Text fontSize={11} opacity={0.8} mb="$1">
                    {t("addCustomBrewingMethod")}
                  </Text>
                  <Input
                    value={customBrewingMethodName}
                    onChangeText={setCustomBrewingMethodName}
                    placeholder={t("name")}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                  <Button size="$3" mt="$2" onPress={addCustomBrewingMethod} disabled={!customBrewingMethodName.trim()}>
                    <Text>{t("add")}</Text>
                  </Button>
                </View>
              </View>
            ) : null}
          </Card>

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("sections")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewdayStepsSections.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("sections") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("sections") ? (
              <View style={{ gap: 10 }}>
                <Heading fontSize={16}>{t("presetSections.preparation")}</Heading>
                <View style={{ gap: 4 }}>
                  {PRESET_KEYS.map((k) => (
                    <CheckboxRow
                      key={k}
                      label={`${t(`presetSections.${k}` as any)} · ${t("exclude")}`}
                      checked={sections.presetExcludes?.[k] === true}
                      onChange={(next) =>
                        setSections((prev) => ({
                          ...prev,
                          presetExcludes: { ...(prev.presetExcludes ?? {}), [k]: next },
                        }))
                      }
                    />
                  ))}
                </View>

                <View style={{ marginTop: 8, gap: 8 }}>
                  <Text fontSize={12} opacity={0.85}>
                    {t("customSectionNote")}
                  </Text>
                  <Input
                    value={customSectionName}
                    onChangeText={setCustomSectionName}
                    placeholder={t("name")}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                  <Button size="$3" onPress={addCustomSection} disabled={!customSectionName.trim()}>
                    <Text>{t("addCustomSection")}</Text>
                  </Button>
                  {sections.customSections?.length ? (
                    <View style={{ gap: 10 }}>
                      {sections.customSections.map((s) => (
                        <Card key={s.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                          <Text fontSize={12} fontWeight="600">
                            {s.name}
                          </Text>
                          <CheckboxRow
                            label={t("exclude")}
                            checked={s.exclude === true}
                            onChange={(next) =>
                              setSections((prev) => ({
                                ...prev,
                                customSections: (prev.customSections ?? []).map((x) => (x.id === s.id ? { ...x, exclude: next } : x)),
                              }))
                            }
                          />
                          <Button
                            size="$2"
                            chromeless
                            onPress={() =>
                              setSections((prev) => ({ ...prev, customSections: (prev.customSections ?? []).filter((x) => x.id !== s.id) }))
                            }
                          >
                            <Text color="$red10">{t("remove")}</Text>
                          </Button>
                        </Card>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
          </Card>

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("defaultSteps")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewdayStepsDefault.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("defaultSteps") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("defaultSteps") ? (
              <View style={{ gap: 10 }}>
                <Text fontSize={12} opacity={0.85}>
                  {t("defaultSectionNote")}
                </Text>
                {defaultSteps.map((st, idx) => (
                  <Card key={st.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                    <Text fontSize={12} fontWeight="600">
                      {idx + 1}. {st.name}
                    </Text>
                    <CheckboxRow
                      label={t("exclude")}
                      checked={st.exclude === true}
                      onChange={(next) =>
                        setDefaultSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, exclude: next } : x)))
                      }
                    />
                    <PickerField
                      label={t("assignedSection")}
                      value={st.sectionId}
                      options={sectionOptions}
                      onChange={(v) => setDefaultSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, sectionId: v } : x)))}
                      closeLabel={tCommon("close")}
                    />
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        {t("minutes")}
                      </Text>
                      <Input
                        value={st.minutes != null ? String(st.minutes) : ""}
                        onChangeText={(text) =>
                          setDefaultSteps((prev) =>
                            prev.map((x) => (x.id === st.id ? { ...x, minutes: text.trim() ? parseMinutes(text) : null } : x))
                          )
                        }
                        placeholder="—"
                        keyboardType="number-pad"
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}
          </Card>

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("customSteps")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewdayStepsCustom.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("customSteps") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("customSteps") ? (
              <View style={{ gap: 10 }}>
                <Text fontSize={12} opacity={0.85}>
                  {t("customSectionNote")}
                </Text>
                <View style={{ gap: 8 }}>
                  <Input
                    value={customStepName}
                    onChangeText={setCustomStepName}
                    placeholder={t("name")}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <PickerField
                        label={t("assignedSection")}
                        value={customStepSectionId}
                        options={[{ value: "", label: "—" }, ...sectionOptions]}
                        onChange={setCustomStepSectionId}
                        closeLabel={tCommon("close")}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        {t("minutes")}
                      </Text>
                      <Input
                        value={customStepMinutes}
                        onChangeText={setCustomStepMinutes}
                        placeholder="—"
                        keyboardType="number-pad"
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  </View>
                  <Button size="$3" onPress={addCustomStep} disabled={!customStepName.trim()}>
                    <Text>{t("addCustomStep")}</Text>
                  </Button>
                </View>

                {customSteps.map((st, idx) => (
                  <Card key={st.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                    <Text fontSize={12} fontWeight="600">
                      {idx + 1}. {st.name}
                    </Text>
                    <CheckboxRow
                      label={t("exclude")}
                      checked={st.exclude === true}
                      onChange={(next) => setCustomSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, exclude: next } : x)))}
                    />
                    <PickerField
                      label={t("assignedSection")}
                      value={st.sectionId}
                      options={sectionOptions}
                      onChange={(v) => setCustomSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, sectionId: v } : x)))}
                      closeLabel={tCommon("close")}
                    />
                    <Button size="$2" chromeless onPress={() => setCustomSteps((prev) => prev.filter((x) => x.id !== st.id))}>
                      <Text color="$red10">{t("remove")}</Text>
                    </Button>
                  </Card>
                ))}
              </View>
            ) : null}
          </Card>

          <Card gap="$2">
            <Button chromeless size="$3" onPress={() => toggleOpen("notes")} width="100%" justifyContent="space-between">
              <Heading fontSize={18}>{t("sections.brewdayNotes.title")}</Heading>
              <Text opacity={0.7}>{openSections.includes("notes") ? "▾" : "▸"}</Text>
            </Button>
            {openSections.includes("notes") ? (
              <View style={{ gap: 8 }}>
                <TextArea
                  value={brewdayNotes}
                  onChangeText={setBrewdayNotes}
                  placeholder={t("sections.brewdayNotes.title")}
                  minHeight={120}
                />
              </View>
            ) : null}
          </Card>

          <View style={{ gap: 8 }}>
            <Button size="$4" onPress={onSave} disabled={!canCall || saving}>
              <Text>{saving ? t("saving") : t("save")}</Text>
            </Button>
            {saveStatus ? (
              <Text fontSize={12} opacity={0.85}>
                {saveStatus}
              </Text>
            ) : null}
            {saveError ? (
              <Text fontSize={12} color="$red10">
                {saveError}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

