"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion, Button, H1, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import type { AuthMeResponse } from "@umbraculum/contracts";

import {
  createEquipmentProfile,
  deleteEquipmentProfile,
  listEquipmentProfiles,
  patchEquipmentProfile,
} from "@umbraculum/api-client/brewery";

import { BrewAccordionSection } from "../../../_components/BrewAccordionSection";
import { ErrorBox, RecipeEditFieldLabel } from "../../../_components/recipe-edit";
import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../_lib/fetchAuthMe";

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

export default function EquipmentPage() {
  const t = useTranslations("equipment");
  const tUnits = useTranslations("units");
  const tNav = useTranslations("nav");

  const [auth, setAuth] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<EquipmentProfile[]>([]);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createKettleVolumeLiters, setCreateKettleVolumeLiters] = useState<string>("");
  const [createKettleLossesLiters, setCreateKettleLossesLiters] = useState<string>("");
  const [createKettleBoilEvaporationRatePercentPerHour, setCreateKettleBoilEvaporationRatePercentPerHour] = useState<string>("");
  const [createKettleCoolingShrinkagePercent, setCreateKettleCoolingShrinkagePercent] = useState<string>("");
  const [createKettleHopsAbsorptionLiters, setCreateKettleHopsAbsorptionLiters] = useState<string>("");

  const [createMashVolumeLiters, setCreateMashVolumeLiters] = useState<string>("");
  const [createMashEfficiencyPercent, setCreateMashEfficiencyPercent] = useState<string>("");
  const [createMashLossesLiters, setCreateMashLossesLiters] = useState<string>("");
  const [createMashThicknessLPerKg, setCreateMashThicknessLPerKg] = useState<string>("");
  const [createMashGrainAbsorptionLPerKg, setCreateMashGrainAbsorptionLPerKg] = useState<string>("");
  const [createMashWaterLeftoverLiters, setCreateMashWaterLeftoverLiters] = useState<string>("");

  const [createOtherLossesLiters, setCreateOtherLossesLiters] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const canWrite = auth != null;

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await fetchAuthMe();
      if (!meRes.ok) {
        setAuth(null);
        throw new Error(t("errors.notAuthenticated"));
      }
      setAuth(meRes.data);

      const listData = await listEquipmentProfiles(webBreweryApiClient());
      setProfiles(Array.isArray(listData.profiles) ? (listData.profiles as EquipmentProfile[]) : []);
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

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const name = createName.trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const parseNullableNumber = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return null;
        return n;
      };

      const kettleVolumeLiters = parseNullableNumber(createKettleVolumeLiters);
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));
      const kettleLossesLiters = parseNullableNumber(createKettleLossesLiters);
      if (kettleLossesLiters != null && kettleLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const kettleBoilEvaporationRatePercentPerHour = parseNullableNumber(createKettleBoilEvaporationRatePercentPerHour);
      if (
        kettleBoilEvaporationRatePercentPerHour != null &&
        (kettleBoilEvaporationRatePercentPerHour < 0 || kettleBoilEvaporationRatePercentPerHour > 100)
      ) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleCoolingShrinkagePercent = parseNullableNumber(createKettleCoolingShrinkagePercent);
      if (kettleCoolingShrinkagePercent != null && (kettleCoolingShrinkagePercent < 0 || kettleCoolingShrinkagePercent > 100)) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleHopsAbsorptionLiters = parseNullableNumber(createKettleHopsAbsorptionLiters);
      if (kettleHopsAbsorptionLiters != null && kettleHopsAbsorptionLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const mashVolumeLiters = parseNullableNumber(createMashVolumeLiters);
      if (mashVolumeLiters != null && mashVolumeLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashEfficiencyPercent = parseNullableNumber(createMashEfficiencyPercent);
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      const mashLossesLiters = parseNullableNumber(createMashLossesLiters);
      if (mashLossesLiters != null && mashLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashThicknessLPerKg = parseNullableNumber(createMashThicknessLPerKg);
      if (mashThicknessLPerKg != null && mashThicknessLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashGrainAbsorptionLPerKg = parseNullableNumber(createMashGrainAbsorptionLPerKg);
      if (mashGrainAbsorptionLPerKg != null && mashGrainAbsorptionLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashWaterLeftoverLiters = parseNullableNumber(createMashWaterLeftoverLiters);
      if (mashWaterLeftoverLiters != null && mashWaterLeftoverLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const otherLossesLiters = parseNullableNumber(createOtherLossesLiters);
      if (otherLossesLiters != null && otherLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      await createEquipmentProfile(webBreweryApiClient(), {
        name,
        kettleVolumeLiters,
        kettleLossesLiters,
        kettleBoilEvaporationRatePercentPerHour,
        kettleCoolingShrinkagePercent,
        kettleHopsAbsorptionLiters,
        mashVolumeLiters,
        mashEfficiencyPercent,
        mashLossesLiters,
        mashThicknessLPerKg,
        mashGrainAbsorptionLPerKg,
        mashWaterLeftoverLiters,
        otherLossesLiters,
      });

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

  const parseNullableNumber = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const name = (editDraft['name'] ?? "").trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const kettleVolumeLiters = parseNullableNumber(editDraft['kettleVolumeLiters'] ?? "");
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));

      const mashEfficiencyPercent = parseNullableNumber(editDraft['mashEfficiencyPercent'] ?? "");
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }

      await patchEquipmentProfile(webBreweryApiClient(), editingId, {
        name,
        kettleVolumeLiters,
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

      setEditingId(null);
      setEditDraft({});
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!id) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      await deleteEquipmentProfile(webBreweryApiClient(), id);
      if (editingId === id) {
        setEditingId(null);
        setEditDraft({});
      }
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <YStack gap="$3">
      <H1 mb="$2">{tNav("equipment")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <Link href="/recipes">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
          {t("backToRecipes")}
        </SizableText>
      </Link>

      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : null}

      <View mt="$3">
        <Accordion
          type="single"
          collapsible
          value={openSections.includes("list") ? "list" : ""}
          onValueChange={(v) =>
            setOpenSections((prev) =>
              v === "list"
                ? prev.includes("list")
                  ? prev
                  : [...prev, "list"]
                : prev.filter((x) => x !== "list")
            )
          }
        >
          <BrewAccordionSection
            value="list"
            headingId="equipment-list-heading"
            title={t("listTitle")}
            open={openSections.includes("list")}
          >
            <View mt="$3">
              {profiles.length ? (
                <View className="brew-table-wrap">
                  <table className="brew-table">
                    <thead>
                      <tr>
                        <th align="left">{t("colName")}</th>
                        <th align="left">{t("colKettleVol", { unit: tUnits("L") })}</th>
                        <th align="left">{t("colMashEff")}</th>
                        {canWrite ? <th align="left">{t("colActions")}</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.equipment?.kettle?.kettleVolumeLiters == null ? "—" : p.equipment.kettle.kettleVolumeLiters}</td>
                          <td>{p.equipment?.mash?.mashEfficiencyPercent == null ? "—" : p.equipment.mash.mashEfficiencyPercent}</td>
                          {canWrite ? (
                            <td>
                              <XStack gap="$2" display="inline-flex">
                                <Button
                                  size="$3"
                                  onPress={() => beginEdit(p)}
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                >
                                  {t("edit")}
                                </Button>
                                <Button
                                  size="$3"
                                  onPress={() => void onDelete(p.id)}
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                >
                                  {t("delete")}
                                </Button>
                              </XStack>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </View>
              ) : (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                  {t("noProfiles")}
                </SizableText>
              )}
            </View>
          </BrewAccordionSection>
        </Accordion>
      </View>

      {canWrite && editingId ? (
        <View
          mt="$3"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          p="$3"
          aria-labelledby="equipment-edit"
        >
          <H2 id="equipment-edit" mt={0}>
            {t("editTitle")}
          </H2>
          <form onSubmit={(...a) => { void onSaveEdit(...(a as Parameters<typeof onSaveEdit>)); }} aria-describedby={editError ? "equipment-edit-error" : undefined}>
            <YStack gap="$3">
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="equip-edit-name">{t("nameLabel")}</RecipeEditFieldLabel>
                <Input
                  id="equip-edit-name"
                  value={editDraft['name'] ?? ""}
                  onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))}
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
                    <RecipeEditFieldLabel htmlFor="equip-edit-kettle-vol">
                      {t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-kettle-vol"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['kettleVolumeLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-kettle-losses">
                      {t("kettleLossesLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-kettle-losses"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['kettleLossesLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleLossesLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-evap">
                      {t("kettleBoilEvaporationRatePercentPerHourLabel")}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-evap"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['kettleBoilEvaporationRatePercentPerHour'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-shrink">
                      {t("kettleCoolingShrinkagePercentLabel")}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-shrink"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['kettleCoolingShrinkagePercent'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-hops-abs">
                      {t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-hops-abs"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['kettleHopsAbsorptionLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-mash-vol">
                      {t("mashVolumeLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-mash-vol"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashVolumeLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashVolumeLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-mash-eff">
                      {t("mashEfficiencyPercentLabel")}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-mash-eff"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashEfficiencyPercent'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-mash-losses">
                      {t("mashLossesLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-mash-losses"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashLossesLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashLossesLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-thickness">
                      {t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-thickness"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashThicknessLPerKg'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-grain-abs">
                      {t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-grain-abs"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashGrainAbsorptionLPerKg'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-water-leftover">
                      {t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-water-leftover"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['mashWaterLeftoverLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: v }))}
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
                      <RecipeEditFieldLabel htmlFor="equip-edit-other-losses">
                      {t("otherLossesLitersLabel", { unit: tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id="equip-edit-other-losses"
                      type="number"
                      inputMode="decimal"
                      value={editDraft['otherLossesLiters'] ?? ""}
                      onChangeText={(v) => setEditDraft((d) => ({ ...d, otherLossesLiters: v }))}
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

            <XStack gap="$3" mt="$3">
              <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={editSubmitting}>
                {editSubmitting ? t("saving") : t("save")}
              </Button>
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                onPress={() => {
                  setEditingId(null);
                  setEditDraft({});
                  setEditError(null);
                }}
                disabled={editSubmitting}
              >
                {t("cancel")}
              </Button>
            </XStack>
            {editError ? (
              <ErrorBox id="equipment-edit-error" mt="$3">{editError}</ErrorBox>
            ) : null}
          </form>
        </View>
      ) : null}

      {canWrite ? (
        <View mt="$3">
          <Accordion
            type="single"
            collapsible
            value={openSections.includes("create") ? "create" : ""}
            onValueChange={(v) =>
              setOpenSections((prev) =>
                v === "create"
                  ? prev.includes("create")
                    ? prev
                    : [...prev, "create"]
                  : prev.filter((x) => x !== "create")
              )
            }
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
      ) : null}
    </YStack>
  );
}

