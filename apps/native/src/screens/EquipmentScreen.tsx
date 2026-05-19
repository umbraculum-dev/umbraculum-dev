import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import type { AuthMeResponse } from "@brewery/contracts";
import { parseAuthMeResponse } from "@brewery/contracts";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../components/AppInput";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

type EquipmentProfile = {
  id: string;
  name: string;
  equipment: {
    kettle: {
      kettleLossesLiters: number | null;
      kettleBoilEvaporationRatePercentPerHour: number | null;
      kettleCoolingShrinkagePercent: number | null;
      kettleVolumeLiters: number | null;
      kettleHopsAbsorptionLiters: number | null;
    };
    mash: {
      mashLossesLiters: number | null;
      mashThicknessLPerKg: number | null;
      mashGrainAbsorptionLPerKg: number | null;
      mashWaterLeftoverLiters: number | null;
      mashVolumeLiters: number | null;
      mashEfficiencyPercent: number | null;
    };
    misc: {
      otherLossesLiters: number | null;
    };
  };
};

function parseNullableNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function NumInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Input
        value={props.value}
        onChangeText={props.onChange}
        keyboardType="decimal-pad"
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      />
    </View>
  );
}

export function EquipmentScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("equipment");
  const { t: tUnits } = useT("units");
  const { t: tNav } = useT("nav");
  const { t: tCommon } = useT("common");

  const [authMe, setAuthMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<EquipmentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["list"]);

  const [createName, setCreateName] = useState("");
  const [createKettleVolumeLiters, setCreateKettleVolumeLiters] = useState("");
  const [createKettleLossesLiters, setCreateKettleLossesLiters] = useState("");
  const [createKettleBoilEvaporationRatePercentPerHour, setCreateKettleBoilEvaporationRatePercentPerHour] = useState("");
  const [createKettleCoolingShrinkagePercent, setCreateKettleCoolingShrinkagePercent] = useState("");
  const [createKettleHopsAbsorptionLiters, setCreateKettleHopsAbsorptionLiters] = useState("");
  const [createMashVolumeLiters, setCreateMashVolumeLiters] = useState("");
  const [createMashEfficiencyPercent, setCreateMashEfficiencyPercent] = useState("");
  const [createMashLossesLiters, setCreateMashLossesLiters] = useState("");
  const [createMashThicknessLPerKg, setCreateMashThicknessLPerKg] = useState("");
  const [createMashGrainAbsorptionLPerKg, setCreateMashGrainAbsorptionLPerKg] = useState("");
  const [createMashWaterLeftoverLiters, setCreateMashWaterLeftoverLiters] = useState("");
  const [createOtherLossesLiters, setCreateOtherLossesLiters] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const canWrite = authMe != null;

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const meRes = await api.get("/api/auth/me");
      if (meRes.ok && meRes.data) {
        setAuthMe(parseAuthMeResponse(meRes.data));
      } else {
        setAuthMe(null);
      }
      const listRes = await api.get("/api/equipment-profiles");
      if (!listRes.ok) throw new Error(JSON.stringify(listRes.data));
      const items = (listRes.data as { profiles?: EquipmentProfile[] })?.profiles;
      setProfiles(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: tNav("equipment") });
  }, [navigation, tNav]);

  const beginEdit = (p: EquipmentProfile) => {
    setEditingId(p.id);
    setEditError(null);
    setEditDraft({
      name: p.name ?? "",
      kettleVolumeLiters: p.equipment?.kettle?.kettleVolumeLiters == null ? "" : String(p.equipment.kettle.kettleVolumeLiters),
      kettleLossesLiters: p.equipment?.kettle?.kettleLossesLiters == null ? "" : String(p.equipment.kettle.kettleLossesLiters),
      kettleBoilEvaporationRatePercentPerHour:
        p.equipment?.kettle?.kettleBoilEvaporationRatePercentPerHour == null
          ? ""
          : String(p.equipment.kettle.kettleBoilEvaporationRatePercentPerHour),
      kettleCoolingShrinkagePercent:
        p.equipment?.kettle?.kettleCoolingShrinkagePercent == null ? "" : String(p.equipment.kettle.kettleCoolingShrinkagePercent),
      kettleHopsAbsorptionLiters:
        p.equipment?.kettle?.kettleHopsAbsorptionLiters == null ? "" : String(p.equipment.kettle.kettleHopsAbsorptionLiters),
      mashVolumeLiters: p.equipment?.mash?.mashVolumeLiters == null ? "" : String(p.equipment.mash.mashVolumeLiters),
      mashEfficiencyPercent: p.equipment?.mash?.mashEfficiencyPercent == null ? "" : String(p.equipment.mash.mashEfficiencyPercent),
      mashLossesLiters: p.equipment?.mash?.mashLossesLiters == null ? "" : String(p.equipment.mash.mashLossesLiters),
      mashThicknessLPerKg: p.equipment?.mash?.mashThicknessLPerKg == null ? "" : String(p.equipment.mash.mashThicknessLPerKg),
      mashGrainAbsorptionLPerKg:
        p.equipment?.mash?.mashGrainAbsorptionLPerKg == null ? "" : String(p.equipment.mash.mashGrainAbsorptionLPerKg),
      mashWaterLeftoverLiters:
        p.equipment?.mash?.mashWaterLeftoverLiters == null ? "" : String(p.equipment.mash.mashWaterLeftoverLiters),
      otherLossesLiters: p.equipment?.misc?.otherLossesLiters == null ? "" : String(p.equipment.misc.otherLossesLiters),
    });
  };

  const onCreate = async () => {
    if (!api) return;
    const name = createName.trim();
    if (!name) {
      setCreateError(t("errors.nameRequired"));
      return;
    }
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const kettleVolumeLiters = parseNullableNumber(createKettleVolumeLiters);
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));
      const mashEfficiencyPercent = parseNullableNumber(createMashEfficiencyPercent);
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      const res = await api.post("/api/equipment-profiles", {
        name,
        kettleVolumeLiters: parseNullableNumber(createKettleVolumeLiters),
        kettleLossesLiters: parseNullableNumber(createKettleLossesLiters),
        kettleBoilEvaporationRatePercentPerHour: parseNullableNumber(createKettleBoilEvaporationRatePercentPerHour),
        kettleCoolingShrinkagePercent: parseNullableNumber(createKettleCoolingShrinkagePercent),
        kettleHopsAbsorptionLiters: parseNullableNumber(createKettleHopsAbsorptionLiters),
        mashVolumeLiters: parseNullableNumber(createMashVolumeLiters),
        mashEfficiencyPercent,
        mashLossesLiters: parseNullableNumber(createMashLossesLiters),
        mashThicknessLPerKg: parseNullableNumber(createMashThicknessLPerKg),
        mashGrainAbsorptionLPerKg: parseNullableNumber(createMashGrainAbsorptionLPerKg),
        mashWaterLeftoverLiters: parseNullableNumber(createMashWaterLeftoverLiters),
        otherLossesLiters: parseNullableNumber(createOtherLossesLiters),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setCreateName("");
      setCreateKettleVolumeLiters("");
      setCreateKettleLossesLiters("");
      setCreateKettleBoilEvaporationRatePercentPerHour("");
      setCreateKettleCoolingShrinkagePercent("");
      setCreateKettleHopsAbsorptionLiters("");
      setCreateMashVolumeLiters("");
      setCreateMashEfficiencyPercent("");
      setCreateMashLossesLiters("");
      setCreateMashThicknessLPerKg("");
      setCreateMashGrainAbsorptionLPerKg("");
      setCreateMashWaterLeftoverLiters("");
      setCreateOtherLossesLiters("");
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onSaveEdit = async () => {
    if (!api || !editingId) return;
    const name = (editDraft['name'] ?? "").trim();
    if (!name) {
      setEditError(t("errors.nameRequired"));
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const mashEfficiencyPercent = parseNullableNumber(editDraft['mashEfficiencyPercent'] ?? "");
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      const res = await api.patch(`/api/equipment-profiles/${editingId}`, {
        name,
        kettleVolumeLiters: parseNullableNumber(editDraft['kettleVolumeLiters'] ?? ""),
        kettleLossesLiters: parseNullableNumber(editDraft['kettleLossesLiters'] ?? ""),
        kettleBoilEvaporationRatePercentPerHour: parseNullableNumber(editDraft['kettleBoilEvaporationRatePercentPerHour'] ?? ""),
        kettleCoolingShrinkagePercent: parseNullableNumber(editDraft['kettleCoolingShrinkagePercent'] ?? ""),
        kettleHopsAbsorptionLiters: parseNullableNumber(editDraft['kettleHopsAbsorptionLiters'] ?? ""),
        mashVolumeLiters: parseNullableNumber(editDraft['mashVolumeLiters'] ?? ""),
        mashEfficiencyPercent,
        mashLossesLiters: parseNullableNumber(editDraft['mashLossesLiters'] ?? ""),
        mashThicknessLPerKg: parseNullableNumber(editDraft['mashThicknessLPerKg'] ?? ""),
        mashGrainAbsorptionLPerKg: parseNullableNumber(editDraft['mashGrainAbsorptionLPerKg'] ?? ""),
        mashWaterLeftoverLiters: parseNullableNumber(editDraft['mashWaterLeftoverLiters'] ?? ""),
        otherLossesLiters: parseNullableNumber(editDraft['otherLossesLiters'] ?? ""),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setEditingId(null);
      setEditDraft({});
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const onDelete = (p: EquipmentProfile) => {
    if (!api) return;
    Alert.alert(
      t("delete"),
      `Delete "${p.name}"?`,
      [
        { text: tCommon("close"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
            setError(null);
            try {
              const res = await api.delete(`/api/equipment-profiles/${p.id}`);
              if (!res.ok) throw new Error(JSON.stringify(res.data));
              if (editingId === p.id) {
                setEditingId(null);
                setEditDraft({});
              }
              await refresh();
            } catch (err) {
              setError(String(err));
            }
            })();
          },
        },
      ]
    );
  };

  if (!api) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          {tCommon("loading") || "Loading…"}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Text fontSize={12} opacity={0.8}>
            {t("subtitle")}
          </Text>

          {error ? (
            <Text fontSize={12} color="$red10">
              {error}
            </Text>
          ) : null}

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
          >
            <Accordion.Item value="list">
              <Card gap="$2" aria-label={t("listTitle")}>
                <Accordion.Header>
                  <Accordion.Trigger
                    width="100%"
                    accessibilityRole="button"
                    accessibilityLabel={t("listTitle")}
                    accessibilityState={{ expanded: openSections.includes("list") }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Heading fontSize={18}>{t("listTitle")}</Heading>
                      <Text fontSize={18} opacity={0.7}>
                        {openSections.includes("list") ? "▾" : "▸"}
                      </Text>
                    </View>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  {loading && profiles.length === 0 ? (
                    <Spinner />
                  ) : profiles.length === 0 ? (
                    <Text fontSize={12} opacity={0.8}>
                      {t("noProfiles")}
                    </Text>
                  ) : (
                    <ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator>
                      <View>
                        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#2a2f3a", paddingVertical: 8 }}>
                          <View style={{ width: 140, paddingHorizontal: 8 }}>
                            <Text fontSize={12} fontWeight="600">{t("colName")}</Text>
                          </View>
                          <View style={{ width: 80, paddingHorizontal: 8 }}>
                            <Text fontSize={12} fontWeight="600">{t("colKettleVol", { unit: tUnits("L") })}</Text>
                          </View>
                          <View style={{ width: 80, paddingHorizontal: 8 }}>
                            <Text fontSize={12} fontWeight="600">{t("colMashEff")}</Text>
                          </View>
                          {canWrite ? (
                            <View style={{ width: 120, paddingHorizontal: 8 }}>
                              <Text fontSize={12} fontWeight="600">{t("colActions")}</Text>
                            </View>
                          ) : null}
                        </View>
                        {profiles.map((p, idx) => (
                          <View
                            key={p.id}
                            style={{
                              flexDirection: "row",
                              borderBottomWidth: 1,
                              borderColor: "#2a2f3a",
                              paddingVertical: 8,
                              backgroundColor: idx % 2 === 1 ? "rgba(42,47,58,0.3)" : "transparent",
                            }}
                          >
                            <View style={{ width: 140, paddingHorizontal: 8 }}>
                              <Text fontSize={12}>{p.name}</Text>
                            </View>
                            <View style={{ width: 80, paddingHorizontal: 8 }}>
                              <Text fontSize={12}>
                                {p.equipment?.kettle?.kettleVolumeLiters == null ? "—" : String(p.equipment.kettle.kettleVolumeLiters)}
                              </Text>
                            </View>
                            <View style={{ width: 80, paddingHorizontal: 8 }}>
                              <Text fontSize={12}>
                                {p.equipment?.mash?.mashEfficiencyPercent == null ? "—" : String(p.equipment.mash.mashEfficiencyPercent)}
                              </Text>
                            </View>
                            {canWrite ? (
                              <View style={{ width: 120, paddingHorizontal: 8, flexDirection: "row", gap: 8 }}>
                                <Button
                                  onPress={() => beginEdit(p)}
                                  size="$2"
                                  background="$background"
                                  borderWidth={1}
                                  borderColor="$borderColor"
                                >
                                  <Text fontSize={11}>{t("edit")}</Text>
                                </Button>
                                <Button
                                  onPress={() => onDelete(p)}
                                  size="$2"
                                  background="$background"
                                  borderWidth={1}
                                  borderColor="$borderColor"
                                >
                                  <Text fontSize={11} color="$red10">{t("delete")}</Text>
                                </Button>
                              </View>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </Accordion.Content>
              </Card>
            </Accordion.Item>

            {editingId ? (
              <Accordion.Item value="edit" mt="$3">
                <Card gap="$2" aria-label={t("editTitle")}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      width="100%"
                      accessibilityRole="button"
                      accessibilityLabel={t("editTitle")}
                      accessibilityState={{ expanded: openSections.includes("edit") }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Heading fontSize={18}>{t("editTitle")}</Heading>
                        <Text fontSize={18} opacity={0.7}>
                          {openSections.includes("edit") ? "▾" : "▸"}
                        </Text>
                      </View>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>
                    <View style={{ gap: 12, marginTop: 12 }}>
                      <NumInput
                        label={t("nameLabel")}
                        value={editDraft['name'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, name: v }))}
                      />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.kettle")}</Text>
                      <NumInput
                        label={t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['kettleVolumeLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: v }))}
                      />
                      <NumInput
                        label={t("kettleLossesLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['kettleLossesLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, kettleLossesLiters: v }))}
                      />
                      <NumInput
                        label={t("kettleBoilEvaporationRatePercentPerHourLabel")}
                        value={editDraft['kettleBoilEvaporationRatePercentPerHour'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: v }))}
                      />
                      <NumInput
                        label={t("kettleCoolingShrinkagePercentLabel")}
                        value={editDraft['kettleCoolingShrinkagePercent'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: v }))}
                      />
                      <NumInput
                        label={t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
                        value={editDraft['kettleHopsAbsorptionLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: v }))}
                      />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.mash")}</Text>
                      <NumInput
                        label={t("mashVolumeLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['mashVolumeLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashVolumeLiters: v }))}
                      />
                      <NumInput
                        label={t("mashEfficiencyPercentLabel")}
                        value={editDraft['mashEfficiencyPercent'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: v }))}
                      />
                      <NumInput
                        label={t("mashLossesLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['mashLossesLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashLossesLiters: v }))}
                      />
                      <NumInput
                        label={t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
                        value={editDraft['mashThicknessLPerKg'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: v }))}
                      />
                      <NumInput
                        label={t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
                        value={editDraft['mashGrainAbsorptionLPerKg'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: v }))}
                      />
                      <NumInput
                        label={t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['mashWaterLeftoverLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: v }))}
                      />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.misc")}</Text>
                      <NumInput
                        label={t("otherLossesLitersLabel", { unit: tUnits("L") })}
                        value={editDraft['otherLossesLiters'] ?? ""}
                        onChange={(v) => setEditDraft((d) => ({ ...d, otherLossesLiters: v }))}
                      />
                      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                        <Button
                          onPress={() => void onSaveEdit()}
                          disabled={editSubmitting}
                          size="$3"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        >
                          <Text>{editSubmitting ? t("saving") : t("save")}</Text>
                        </Button>
                        <Button
                          onPress={() => {
                            setEditingId(null);
                            setEditDraft({});
                            setEditError(null);
                          }}
                          disabled={editSubmitting}
                          size="$3"
                          chromeless
                        >
                          <Text>{t("cancel")}</Text>
                        </Button>
                      </View>
                      {editError ? (
                        <Text fontSize={12} color="$red10">
                          {editError}
                        </Text>
                      ) : null}
                    </View>
                  </Accordion.Content>
                </Card>
              </Accordion.Item>
            ) : null}

            {canWrite ? (
              <Accordion.Item value="create" mt="$3">
                <Card gap="$2" aria-label={t("createTitle")}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      width="100%"
                      accessibilityRole="button"
                      accessibilityLabel={t("createTitle")}
                      accessibilityState={{ expanded: openSections.includes("create") }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Heading fontSize={18}>{t("createTitle")}</Heading>
                        <Text fontSize={18} opacity={0.7}>
                          {openSections.includes("create") ? "▾" : "▸"}
                        </Text>
                      </View>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>
                    <View style={{ gap: 12, marginTop: 12 }}>
                      <NumInput label={t("nameLabel")} value={createName} onChange={setCreateName} />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.kettle")}</Text>
                      <NumInput
                        label={t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
                        value={createKettleVolumeLiters}
                        onChange={setCreateKettleVolumeLiters}
                      />
                      <NumInput
                        label={t("kettleLossesLitersLabel", { unit: tUnits("L") })}
                        value={createKettleLossesLiters}
                        onChange={setCreateKettleLossesLiters}
                      />
                      <NumInput
                        label={t("kettleBoilEvaporationRatePercentPerHourLabel")}
                        value={createKettleBoilEvaporationRatePercentPerHour}
                        onChange={setCreateKettleBoilEvaporationRatePercentPerHour}
                      />
                      <NumInput
                        label={t("kettleCoolingShrinkagePercentLabel")}
                        value={createKettleCoolingShrinkagePercent}
                        onChange={setCreateKettleCoolingShrinkagePercent}
                      />
                      <NumInput
                        label={t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
                        value={createKettleHopsAbsorptionLiters}
                        onChange={setCreateKettleHopsAbsorptionLiters}
                      />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.mash")}</Text>
                      <NumInput
                        label={t("mashVolumeLitersLabel", { unit: tUnits("L") })}
                        value={createMashVolumeLiters}
                        onChange={setCreateMashVolumeLiters}
                      />
                      <NumInput
                        label={t("mashEfficiencyPercentLabel")}
                        value={createMashEfficiencyPercent}
                        onChange={setCreateMashEfficiencyPercent}
                      />
                      <NumInput
                        label={t("mashLossesLitersLabel", { unit: tUnits("L") })}
                        value={createMashLossesLiters}
                        onChange={setCreateMashLossesLiters}
                      />
                      <NumInput
                        label={t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
                        value={createMashThicknessLPerKg}
                        onChange={setCreateMashThicknessLPerKg}
                      />
                      <NumInput
                        label={t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
                        value={createMashGrainAbsorptionLPerKg}
                        onChange={setCreateMashGrainAbsorptionLPerKg}
                      />
                      <NumInput
                        label={t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
                        value={createMashWaterLeftoverLiters}
                        onChange={setCreateMashWaterLeftoverLiters}
                      />
                      <Text fontSize={12} fontWeight="600">{t("sectionTitles.misc")}</Text>
                      <NumInput
                        label={t("otherLossesLitersLabel", { unit: tUnits("L") })}
                        value={createOtherLossesLiters}
                        onChange={setCreateOtherLossesLiters}
                      />
                      <Button
                        onPress={() => void onCreate()}
                        disabled={!createName.trim() || createSubmitting}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text>{createSubmitting ? t("saving") : t("create")}</Text>
                      </Button>
                      {createError ? (
                        <Text fontSize={12} color="$red10">
                          {createError}
                        </Text>
                      ) : null}
                    </View>
                  </Accordion.Content>
                </Card>
              </Accordion.Item>
            ) : null}
          </Accordion>
        </View>
      </ScrollView>
    </Screen>
  );
}
