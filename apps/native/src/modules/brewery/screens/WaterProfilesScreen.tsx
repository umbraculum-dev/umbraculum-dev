import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
import type { AuthMeResponse, WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { parseAuthMeResponse, parseWaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../components/AppInput";
import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";

function isAdmin(role: string | null): boolean {
  return role === "brewery_admin" || role === "owner";
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

const ION_KEYS = [
  ["calcium", "Calcium (Ca)"],
  ["magnesium", "Magnesium (Mg)"],
  ["sodium", "Sodium (Na)"],
  ["sulfate", "Sulfate (SO4)"],
  ["chloride", "Chloride (Cl)"],
  ["bicarbonate", "Bicarbonate (HCO3)"],
] as const;

export function WaterProfilesScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("waterProfiles");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tEquipment } = useT("equipment");

  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createPh, setCreatePh] = useState("");
  const [createIon, setCreateIon] = useState({
    calcium: 0,
    magnesium: 0,
    sodium: 0,
    sulfate: 0,
    chloride: 0,
    bicarbonate: 0,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const meRes = await api.get("/api/auth/me");
      if (meRes.ok && meRes.data) {
        setMe(parseAuthMeResponse(meRes.data));
      } else {
        setMe(null);
      }

      const profRes = await api.get("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(parseWaterProfilesResponse(profRes.data));
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
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.workspace ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const admin = isAdmin(me?.role ?? null);

  const onCreateProfile = async () => {
    if (!api) return;
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const res = await api.post("/api/water-profiles", {
        scope: createScope,
        type: createType,
        name: createName,
        ph: createPh.trim() === "" ? null : Number(createPh),
        ...createIon,
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setCreateName("");
      setCreatePh("");
      setCreateIon({
        calcium: 0,
        magnesium: 0,
        sodium: 0,
        sulfate: 0,
        chloride: 0,
        bicarbonate: 0,
      });
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onToggleVerify = async (p: WaterProfile) => {
    if (!api) return;
    const action = p.verificationStatus === "verified" ? "unverify" : "verify";
    await api.post(`/api/water-profiles/${p.id}/${action}`, {});
    await refresh();
  };

  const onDeleteProfile = (p: WaterProfile) => {
    if (p.scope === "system" || !api) return;
    Alert.alert(
      tEquipment("delete"),
      `Delete water profile "${p.name}"? This cannot be undone.`,
      [
        { text: tCommon("close"), style: "cancel" },
        {
          text: tEquipment("delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setError(null);
              try {
                const res = await api.delete(`/api/water-profiles/${p.id}`);
                if (!res.ok) throw new Error(JSON.stringify(res.data));
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
          <Heading fontSize={28} mb="$2">
            {t("title")}
          </Heading>

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
          >
            <Accordion.Item value="table">
              <Card gap="$2" aria-label={t("viewAllTableTitle")}>
                <Accordion.Header>
                  <Accordion.Trigger
                    width="100%"
                    accessibilityRole="button"
                    accessibilityLabel={t("viewAllTableTitle")}
                    accessibilityState={{ expanded: openSections.includes("table") }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Heading fontSize={18}>{t("viewAllTableTitle")}</Heading>
                      <Text fontSize={18} opacity={0.7}>
                        {openSections.includes("table") ? "▾" : "▸"}
                      </Text>
                    </View>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
            <Text fontSize={12} opacity={0.8} mt="$2">
              {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
            </Text>

            {error ? (
              <Text fontSize={12} color="$red10" mt="$2">
                {error}
              </Text>
            ) : null}

            {loading && !profiles ? (
              <Spinner />
            ) : (
              <ScrollView horizontal style={{ marginTop: 12 }} showsHorizontalScrollIndicator>
                <View>
                  <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#2a2f3a", paddingVertical: 8 }}>
                    <View style={{ width: 120, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Name</Text></View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Scope</Text></View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Status</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">pH</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Ca</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Mg</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Na</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">SO4</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Cl</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">HCO3</Text></View>
                    <View style={{ width: 140, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Actions</Text></View>
                  </View>
                  {allProfiles.map((p, idx) => (
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
                      <View style={{ width: 120, paddingHorizontal: 8 }}><Text fontSize={12}>{p.name}</Text></View>
                      <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} opacity={0.8}>{p.scope}/{p.type}</Text></View>
                      <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} opacity={0.8}>{p.verificationStatus}</Text></View>
                      <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} opacity={0.8}>{p.ph == null ? "—" : p.ph.toFixed(2)}</Text></View>
                      <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.calcium}</Text></View>
                      <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.magnesium}</Text></View>
                      <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.sodium}</Text></View>
                      <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.sulfate}</Text></View>
                      <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.chloride}</Text></View>
                      <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.bicarbonate}</Text></View>
                      <View style={{ width: 140, paddingHorizontal: 8, flexDirection: "row", gap: 8 }}>
                        {admin && p.scope !== "system" ? (
                          <>
                            <Button
                              onPress={() => void onToggleVerify(p)}
                              size="$2"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text fontSize={11}>{p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}</Text>
                            </Button>
                            <Button
                              onPress={() => void onDeleteProfile(p)}
                              size="$2"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                              accessibilityLabel={`Delete water profile ${p.name}`}
                            >
                              <Text fontSize={11} color="$red10">Delete</Text>
                            </Button>
                          </>
                        ) : (
                          <Text fontSize={12} opacity={0.8}>—</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {!admin ? (
              <Text fontSize={12} opacity={0.8} mt="$2">
                Only owner and brewery_admin can add/verify profiles.
              </Text>
            ) : null}
                </Accordion.Content>
              </Card>
            </Accordion.Item>

            {admin ? (
            <Accordion.Item value="admin">
              <Card gap="$2" mt="$3" aria-label={t("adminAddTitle")}>
                <Accordion.Header>
                  <Accordion.Trigger
                    width="100%"
                    accessibilityRole="button"
                    accessibilityLabel={t("adminAddTitle")}
                    accessibilityState={{ expanded: openSections.includes("admin") }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Heading fontSize={18}>{t("adminAddTitle")}</Heading>
                      <Text fontSize={18} opacity={0.7}>
                        {openSections.includes("admin") ? "▾" : "▸"}
                      </Text>
                    </View>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
              <Text fontSize={12} opacity={0.8}>
                {t("createdProfilesStartUnverified")}
              </Text>

              <View style={{ gap: 12, marginTop: 12 }}>
                <View>
                  <Text fontSize={11} opacity={0.8} mb="$1">
                    Profile name
                  </Text>
                  <Input
                    value={createName}
                    onChangeText={setCreateName}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <PickerField
                      label="Scope"
                      value={createScope}
                      options={[
                        { value: "public", label: "Public" },
                        { value: "account", label: "Account" },
                      ]}
                      onChange={(v) => setCreateScope(v as "account" | "public")}
                      closeLabel={tCommon("close")}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PickerField
                      label="Type"
                      value={createType}
                      options={[
                        { value: "water", label: "Water" },
                        { value: "dilution", label: "Dilution" },
                      ]}
                      onChange={(v) => setCreateType(v as "water" | "dilution")}
                      closeLabel={tCommon("close")}
                    />
                  </View>
                </View>
                <View>
                  <Text fontSize={11} opacity={0.8} mb="$1">
                    pH (optional)
                  </Text>
                  <Input
                    value={createPh}
                    onChangeText={setCreatePh}
                    keyboardType="decimal-pad"
                    placeholder={t("phPlaceholder")}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                </View>
                <View>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("ionsLegend", { unit: tUnits("ppm") })}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {ION_KEYS.map(([k, label]) => (
                      <View key={k} style={{ flex: 1, minWidth: 80 }}>
                        <Text fontSize={11} opacity={0.8} mb="$1">
                          {label}
                        </Text>
                        <Input
                          value={String((createIon as Record<string, number>)[k])}
                          onChangeText={(text) => setCreateIon((prev) => ({ ...prev, [k]: Number(text) || 0 }))}
                          keyboardType="decimal-pad"
                          size="$3"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        />
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Button
                    onPress={() => void onCreateProfile()}
                    disabled={!createName.trim() || createSubmitting}
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text>{createSubmitting ? "Creating…" : "Create profile"}</Text>
                  </Button>
                </View>
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
