"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion, Button, H1, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";

import type { AuthMeResponse, WaterProfile, WaterProfilesResponse } from "@brewery/contracts";
import { parseAuthMeResponse, parseWaterProfilesResponse } from "@brewery/contracts";

import { apiFetch } from "../../_lib/apiClient";
import { BrewSelect } from "../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../_components/recipe-edit";

function isAdmin(role: string | null) {
  return role === "brewery_admin";
}

export default function WaterProfilesPage() {
  const t = useTranslations("waterProfiles");
  const tEquipment = useTranslations("equipment");
  const tUnits = useTranslations("units");
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createPh, setCreatePh] = useState<string>("");
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
  const [openSections, setOpenSections] = useState<string[]>(["table"]);

  const canCall = true;

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await apiFetch("/api/auth/me");
      if (meRes.ok && meRes.data) {
        const parsed = parseAuthMeResponse(meRes.data);
        setMe(parsed);
      } else {
        setMe(null);
      }

      const profRes = await apiFetch("/api/water-profiles");
      if (!profRes.ok) throw new Error(JSON.stringify(profRes.data));
      setProfiles(parseWaterProfilesResponse(profRes.data));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.account ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const admin = isAdmin(me?.role ?? null);

  const onCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const res = await apiFetch("/api/water-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: createScope,
          type: createType,
          name: createName,
          ph: createPh.trim() === "" ? null : Number(createPh),
          ...createIon,
        }),
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
    const action = p.verificationStatus === "verified" ? "unverify" : "verify";
    await apiFetch(`/api/water-profiles/${p.id}/${action}`, { method: "POST" });
    await refresh();
  };

  const onDeleteProfile = async (p: WaterProfile) => {
    if (p.scope === "system") return;
    const ok = window.confirm(`Delete water profile "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    try {
      const res = await apiFetch(`/api/water-profiles/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <>
      <YStack width="100%" gap="$1" mb="$2">
        <H1 mt={0} mb={0}>{t("title")}</H1>
        <SizableText size="$2" fontFamily="$body" mt={0} mb={0} display="block">
          <Link href="/recipes">{tEquipment("backToRecipes")}</Link>
        </SizableText>
      </YStack>

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
      >
        <Accordion.Item value="table">
          <View className="brew-panel" aria-labelledby="profiles-table-heading">
            <Accordion.Header>
              <Accordion.Trigger unstyled cursor="pointer">
                <XStack alignItems="center" justifyContent="space-between" width="100%">
                  <H2 id="profiles-table-heading" mt={0}>
                    {t("viewAllTableTitle")}
                  </H2>
                  <SizableText size="$2" opacity={0.7}>
                    {openSections.includes("table") ? "▾" : "▸"}
                  </SizableText>
                </XStack>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
            {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
          </SizableText>

          {error ? (
            <ErrorBox mt="$3">{error}</ErrorBox>
          ) : null}

          <View className="brew-table-wrap" mt="$3">
            <table className="brew-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th align="right">pH</th>
                  <th align="right">Ca</th>
                  <th align="right">Mg</th>
                  <th align="right">Na</th>
                  <th align="right">SO4</th>
                  <th align="right">Cl</th>
                  <th align="right">HCO3</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? "brew-table-row-alt" : undefined}>
                    <td>{p.name}</td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.scope}/{p.type}
                      </SizableText>
                    </td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.verificationStatus}
                      </SizableText>
                    </td>
                    <td align="right">
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.ph == null ? "—" : p.ph.toFixed(2)}
                      </SizableText>
                    </td>
                    <td align="right">{p.calcium}</td>
                    <td align="right">{p.magnesium}</td>
                    <td align="right">{p.sodium}</td>
                    <td align="right">{p.sulfate}</td>
                    <td align="right">{p.chloride}</td>
                    <td align="right">{p.bicarbonate}</td>
                    <td>
                      {admin && p.scope !== "system" ? (
                        <XStack gap="$2" alignItems="center">
                          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onToggleVerify(p)}>
                            {p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}
                          </Button>
                          <Button
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            onPress={() => void onDeleteProfile(p)}
                            aria-label={`Delete water profile ${p.name}`}
                          >
                            Delete
                          </Button>
                        </XStack>
                      ) : (
                        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                          —
                        </SizableText>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>

          {!admin ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              Only <code>owner</code> and <code>brewery_admin</code> can add/verify profiles.
            </SizableText>
          ) : null}
            </Accordion.Content>
          </View>
        </Accordion.Item>

        {admin ? (
        <Accordion.Item value="admin" mt="$3">
          <View className="brew-panel" aria-labelledby="admin-profiles-heading">
            <Accordion.Header>
              <Accordion.Trigger unstyled cursor="pointer">
                <XStack alignItems="center" justifyContent="space-between" width="100%">
                  <H2 id="admin-profiles-heading" mt={0}>
                    {t("adminAddTitle")}
                  </H2>
                  <SizableText size="$2" opacity={0.7}>
                    {openSections.includes("admin") ? "▾" : "▸"}
                  </SizableText>
                </XStack>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("createdProfilesStartUnverified")}
            </SizableText>

            <form onSubmit={onCreateProfile} aria-describedby={createError ? "create-error" : undefined}>
              <XStack gap="$3" flexWrap="wrap" ai="flex-end">
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                    <RecipeEditFieldLabel htmlFor="create-name">Profile name</RecipeEditFieldLabel>
                    <Input
                      id="create-name"
                      value={createName}
                      onChangeText={setCreateName}
                      size="$3"
                      w="100%"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                      required
                    />
                  </YStack>
                </View>
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-scope">Scope</RecipeEditFieldLabel>
                  <BrewSelect
                    id="create-scope"
                    value={createScope}
                    onValueChange={(v) => setCreateScope(v as "account" | "public")}
                    options={[
                      { value: "public", label: "Public" },
                      { value: "account", label: "Account" },
                    ]}
                    width="full"
                  />
                </YStack>
                </View>
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-type">Type</RecipeEditFieldLabel>
                  <BrewSelect
                    id="create-type"
                    value={createType}
                    onValueChange={(v) => setCreateType(v as "water" | "dilution")}
                    options={[
                      { value: "water", label: "Water" },
                      { value: "dilution", label: "Dilution" },
                    ]}
                    width="full"
                  />
                </YStack>
                </View>
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                    <RecipeEditFieldLabel htmlFor="create-ph">pH (optional)</RecipeEditFieldLabel>
                    <Input
                      id="create-ph"
                      keyboardType="decimal-pad"
                      value={createPh}
                      onChangeText={setCreatePh}
                      size="$3"
                      w="100%"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                      placeholder={t("phPlaceholder")}
                    />
                  </YStack>
                </View>
              </XStack>

              <fieldset className="brew-fieldset-noborder">
                <legend className="brew-fieldset-legend">
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                    {t("ionsLegend", { unit: tUnits("ppm") })}
                  </SizableText>
                </legend>
                <XStack gap="$3" flexWrap="wrap" ai="flex-end">
                  {(
                    [
                      ["calcium", "Calcium (Ca)"],
                      ["magnesium", "Magnesium (Mg)"],
                      ["sodium", "Sodium (Na)"],
                      ["sulfate", "Sulfate (SO4)"],
                      ["chloride", "Chloride (Cl)"],
                      ["bicarbonate", "Bicarbonate (HCO3)"],
                    ] as const
                  ).map(([k, label]) => (
                    <View key={k} flex={1} minWidth={180}>
                      <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor={`ion-${k}`}>{label}</RecipeEditFieldLabel>
                      <Input
                        id={`ion-${k}`}
                        keyboardType="decimal-pad"
                        value={String((createIon as Record<string, number>)[k])}
                        onChangeText={(text) => setCreateIon((prev) => ({ ...prev, [k]: Number(text) || 0 }))}
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
                  ))}
                </XStack>
              </fieldset>

              <XStack gap="$3" mt="$3" alignItems="center">
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!createName.trim() || createSubmitting}>
                  {createSubmitting ? "Creating…" : "Create profile"}
                </Button>
              </XStack>

              {createError ? (
                <ErrorBox id="create-error" mt="$3">{createError}</ErrorBox>
              ) : null}
            </form>
            </Accordion.Content>
          </View>
        </Accordion.Item>
        ) : null}
      </Accordion>

      <View className="brew-panel" mt="$3">
        <ul className="brew-recipe-edit-list-disc brew-list-mb0">
          <li>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("rawMaterialsCtaPrefix")} <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
            </SizableText>
          </li>
        </ul>
      </View>
    </>
  );
}
