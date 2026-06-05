import React from "react";
import { View } from "react-native";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  type EditorYeastRow,
  YEAST_PITCH_RATE_OPTIONS,
} from "@umbraculum/brewery-beerjson";
import { Button, Card, Text } from "@umbraculum/ui";
import type { TranslationValues } from "@umbraculum/i18n-react";
import { Accordion } from "tamagui";

import { ReadOnlyField } from "../../../../components/ReadOnlyField";
import { Input } from "../../../../components/AppInput";
import { PickerField } from "./PickerField";
import {
  formatFixed,
  SPECIES_OPTIONS,
  YEAST_FORMAT_OPTIONS,
  YES_NO_OPTIONS,
} from "../../hooks/yeastScreen/yeastScreenHelpers";

export function YeastScreenRow(props: {
  row: EditorYeastRow;
  idx: number;
  locale: string;
  t: (key: string, params?: TranslationValues) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  tCommon: (key: string) => string;
  yeastAttenuationOverrides: Record<string, string>;
  onAttenuationOverrideChange: (id: string, value: string) => void;
  updateYeastRow: (id: string, patch: Partial<EditorYeastRow>) => void;
  removeYeastRow: (id: string) => void;
  batchSizeForCellsVal: number | null;
  analysisOg: number | null | undefined;
  openAdvancedSections: Record<string, boolean>;
  setOpenAdvancedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const {
    row: r,
    idx,
    locale,
    t,
    tAnalysis,
    tUnits,
    tCommon,
    yeastAttenuationOverrides,
    onAttenuationOverrideChange,
    updateYeastRow,
    removeYeastRow,
    batchSizeForCellsVal,
    analysisOg,
    openAdvancedSections,
    setOpenAdvancedSections,
  } = props;

  return (
    <Card key={r.id} gap="$2" mb="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text fontSize={14} fontWeight="600">{idx + 1}. {r.name || "(unnamed)"}</Text>
        <Button onPress={() => removeYeastRow(r.id)} size="$2" chromeless>
          <Text color="$red10">{t("yeastRemove")}</Text>
        </Button>
      </View>
      <View style={{ gap: 12 }}>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastNameLabel")}</Text>
          <Input value={r.name} onChangeText={(text) => updateYeastRow(r.id, { name: text, ingredientId: null })} placeholder={t("yeastCustomNamePlaceholder")} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ minWidth: 140, flexGrow: 1 }}>
            <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastLabLabel")}</Text>
            <ReadOnlyField value={r.lab ?? ""} />
          </View>
          <View style={{ minWidth: 140, flexGrow: 1 }}>
            <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastProductIdLabel")}</Text>
            <ReadOnlyField value={r.productId ?? ""} />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
            <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>{t("yeastAttenMinLabel")}</Text>
            <ReadOnlyField
              value={typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin) ? formatFixed(locale, r.attenuationMin, 3) : ""}
              textAlign="center"
            />
          </View>
          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
            <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>{t("yeastAttenMaxLabel")}</Text>
            <ReadOnlyField
              value={typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax) ? formatFixed(locale, r.attenuationMax, 3) : ""}
              textAlign="center"
            />
          </View>
        </View>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">{tAnalysis("customAttenuationPercentLabel")}</Text>
          <Input value={yeastAttenuationOverrides[r.id] ?? ""} onChangeText={(text) => onAttenuationOverrideChange(r.id, text)} keyboardType="decimal-pad" placeholder="—" size="$3" background="$background" borderWidth={1} borderColor="$borderColor" />
        </View>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastFermentationTempLabel", { unit: tUnits("C") })}</Text>
          <Input
            value={r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) ? String(r.fermentationTempC) : ""}
            onChangeText={(text) => {
              const trimmed = text.trim();
              const parsed = trimmed === "" ? null : Number(trimmed);
              updateYeastRow(r.id, { fermentationTempC: parsed != null && Number.isFinite(parsed) && parsed >= -10 && parsed <= 50 ? parsed : null });
            }}
            keyboardType="decimal-pad"
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
        </View>
        <View>
          <PickerField label={t("yeastDiacetylRestLabel")} value={r.diacetylRest === "yes" || r.diacetylRest === "no" ? r.diacetylRest : ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastDiacetylRestYes") : t("yeastDiacetylRestNo") }))]} onChange={(v) => updateYeastRow(r.id, { diacetylRest: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
        </View>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}</Text>
          {(() => {
            const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
            const pitchRateSet = r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate);
            const isComputed = format != null && pitchRateSet && batchSizeForCellsVal != null && analysisOg != null;
            const amountDecimals = r.format === "dry" ? 3 : 2;
            const rawVal =
              r.format === "dry"
                ? (r.amountKg != null && Number.isFinite(r.amountKg) ? r.amountKg : null)
                : (r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null);
            if (isComputed) {
              return (
                <ReadOnlyField
                  value={rawVal != null ? formatFixed(locale, rawVal, amountDecimals) : ""}
                />
              );
            }
            return (
              <Input
                value={
                  r.format === "dry"
                    ? (r.amountKg != null && Number.isFinite(r.amountKg) ? formatFixed(locale, r.amountKg, 3) : "")
                    : (r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : "")
                }
                onChangeText={(text) => {
                  const normalized = text.trim().replace(",", ".");
                  const n = normalized ? parseFloat(normalized) : null;
                  const valid = n != null && Number.isFinite(n) && n >= 0;
                  if (r.format === "dry") updateYeastRow(r.id, { amountKg: valid ? n : null });
                  else updateYeastRow(r.id, { amountL: valid ? n : null });
                }}
                keyboardType="decimal-pad"
                placeholder="—"
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            );
          })()}
        </View>
        <View>
          <PickerField label={t("yeastOxygenationLabel")} value={r.oxygenation === "yes" || r.oxygenation === "no" ? r.oxygenation : ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastOxygenationYes") : t("yeastOxygenationNo") }))]} onChange={(v) => updateYeastRow(r.id, { oxygenation: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
        </View>

        <Accordion
          type="multiple"
          value={openAdvancedSections[r.id] !== false ? [`advanced-${r.id}`] : []}
          onValueChange={(v) =>
            setOpenAdvancedSections((prev) => ({
              ...prev,
              [r.id]: Array.isArray(v) ? v.includes(`advanced-${r.id}`) : false,
            }))
          }
          style={{ marginTop: 8 }}
        >
          <Accordion.Item value={`advanced-${r.id}`}>
            <Accordion.Header>
              <Accordion.Trigger unstyled>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderColor: "#2a2f3a" }}>
                  <Text fontSize={12} fontWeight="600">{t("yeastAdvancedSubsectionHeading")}</Text>
                  <Text opacity={0.7}>{openAdvancedSections[r.id] !== false ? "▾" : "▸"}</Text>
                </View>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <View style={{ gap: 8, paddingTop: 8 }}>
                <Text fontSize={12} color="$gray11" mb="$1">{t("yeastPitchRateAmountNote")}</Text>
                <Text fontSize={12} color="$gray11" mb="$2">{t("yeastEstimatedCellsRecalcNote")}</Text>
                <PickerField label={t("yeastFormatLabel")} value={r.format ?? ""} options={[{ value: "", label: "—" }, ...YEAST_FORMAT_OPTIONS.map((o) => ({ value: o.value, label: o.value === "dry" ? t("yeastFormatDry") : o.value === "liquid" ? t("yeastFormatLiquid") : t("yeastFormatSlurry") }))]} onChange={(v) => updateYeastRow(r.id, { format: v === "dry" || v === "liquid" || v === "slurry" ? v : null })} closeLabel={tCommon("close")} />
                <PickerField
                  label={t("yeastPitchRateLabel")}
                  value={r.pitchRate ?? ""}
                  options={[{ value: "", label: `(${t("yeastPitchRateNone")})` }, ...YEAST_PITCH_RATE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))]}
                  onChange={(v) => updateYeastRow(r.id, { pitchRate: v || null })}
                  closeLabel={tCommon("close")}
                />
                <View>
                  <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastEstimatedCellsLabel")}</Text>
                  <ReadOnlyField
                    value={
                      batchSizeForCellsVal != null && analysisOg != null && r.format && r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate)
                        ? (() => {
                            const cellsB = computeEstimatedCellsB(batchSizeForCellsVal, analysisOg, r.pitchRate);
                            return cellsB != null ? t("yeastEstimatedCellsValue", { value: Math.round(cellsB) }) : "";
                          })()
                        : ""
                    }
                  />
                </View>
                {(r.format === "liquid" || r.format === "slurry") ? (
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastCellsPerLLabel")}</Text>
                    {r.format === "slurry" && r.manualCellCount && computeCellsPerLFromManualCount(r.manualCellCount) != null ? (
                      <ReadOnlyField value={String(Math.round(computeCellsPerLFromManualCount(r.manualCellCount)!))} />
                    ) : (
                      <Input
                        value={
                          r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride)
                            ? String(r.cellsPerLOverride)
                            : r.format === "liquid"
                              ? String(CELLS_PER_L_LIQUID)
                              : String(CELLS_PER_L_SLURRY)
                        }
                        onChangeText={(text) => {
                          const trimmed = text.trim();
                          const parsed = trimmed === "" ? null : Number(trimmed);
                          updateYeastRow(r.id, { cellsPerLOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null });
                        }}
                        keyboardType="decimal-pad"
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    )}
                  </View>
                ) : r.format === "dry" ? (
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastCellsPerKGLabel")}</Text>
                    <Input
                      value={
                        r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride)
                          ? String(r.cellsPerKGOverride)
                          : String(CELLS_PER_KG_DRY)
                      }
                      onChangeText={(text) => {
                        const trimmed = text.trim();
                        const parsed = trimmed === "" ? null : Number(trimmed);
                        updateYeastRow(r.id, { cellsPerKGOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null });
                      }}
                      keyboardType="decimal-pad"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Text fontSize={11} color="$gray11">{t("yeastCellsPerDefaultNote")}</Text>
                  <Text fontSize={11} color="$gray11">{t("yeastCellsPerOverrideNote")}</Text>
                </View>
                {r.format === "slurry" ? (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: "#2a2f3a" }}>
                    <Text fontSize={12} fontWeight="600" mb="$1">{t("yeastManualCountSectionTitle")}</Text>
                    <Text fontSize={12} color="$gray11" mb="$1">{t("yeastManualCountFirstNote")}</Text>
                    <Text fontSize={12} color="$gray11" style={{ textDecorationLine: "underline" }} mb="$1">{t("yeastManualCountDisclaimer")}</Text>
                    <Text fontSize={12} color="$gray11" fontWeight="600" mb="$2">{t("yeastManualCountDirectlyInfluencesAmount")}</Text>
                    <View style={{ gap: 8 }}>
                      <View>
                        <PickerField
                          label={t("yeastManualCountDFLabel")}
                          value={r.manualCellCount?.dilutionFactor === 200 || r.manualCellCount?.dilutionFactor === 2000 ? String(r.manualCellCount.dilutionFactor) : ""}
                          options={[{ value: "", label: "—" }, { value: "200", label: t("yeastManualCountDF200") }, { value: "2000", label: t("yeastManualCountDF2000") }]}
                          onChange={(v) => {
                            const df = v === "200" ? 200 : v === "2000" ? 2000 : null;
                            if (df == null) {
                              updateYeastRow(r.id, { manualCellCount: undefined });
                              return;
                            }
                            const prev = r.manualCellCount;
                            updateYeastRow(r.id, {
                              manualCellCount: {
                                dilutionFactor: df,
                                aliveCells: prev?.aliveCells != null && prev.aliveCells > 0 ? prev.aliveCells : 0,
                                totalCells: prev?.totalCells != null && prev.totalCells > 0 ? prev.totalCells : 0,
                              },
                            });
                          }}
                          closeLabel={tCommon("close")}
                        />
                      </View>
                      <View>
                        <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountAliveCellsLabel")}</Text>
                        <Input
                          value={r.manualCellCount?.aliveCells != null && Number.isFinite(r.manualCellCount.aliveCells) ? String(Math.round(r.manualCellCount.aliveCells)) : ""}
                          onChangeText={(text) => {
                            const trimmed = text.trim();
                            const parsed = trimmed === "" ? null : Number(trimmed);
                            const alive = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                            const df = r.manualCellCount?.dilutionFactor;
                            if (df !== 200 && df !== 2000) return;
                            const prevTotal = r.manualCellCount?.totalCells != null && r.manualCellCount.totalCells > 0 ? r.manualCellCount.totalCells : 0;
                            updateYeastRow(r.id, { manualCellCount: { dilutionFactor: df, aliveCells: alive ?? 0, totalCells: prevTotal } });
                          }}
                          placeholder="—"
                          keyboardType="number-pad"
                          size="$3"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        />
                      </View>
                      <View>
                        <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountTotalCellsLabel")}</Text>
                        <Input
                          value={r.manualCellCount?.totalCells != null && Number.isFinite(r.manualCellCount.totalCells) ? String(Math.round(r.manualCellCount.totalCells)) : ""}
                          onChangeText={(text) => {
                            const trimmed = text.trim();
                            const parsed = trimmed === "" ? null : Number(trimmed);
                            const total = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                            const df = r.manualCellCount?.dilutionFactor;
                            if (df !== 200 && df !== 2000) return;
                            const prevAlive = r.manualCellCount?.aliveCells != null && r.manualCellCount.aliveCells >= 0 ? r.manualCellCount.aliveCells : 0;
                            updateYeastRow(r.id, { manualCellCount: { dilutionFactor: df, aliveCells: prevAlive, totalCells: total ?? 0 } });
                          }}
                          placeholder="—"
                          keyboardType="number-pad"
                          size="$3"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        />
                      </View>
                      {r.manualCellCount && r.manualCellCount.totalCells > 0 && Number.isFinite(r.manualCellCount.aliveCells) ? (
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountViabilityLabel")}</Text>
                          <ReadOnlyField
                            value={
                              (() => {
                                const raw = (r.manualCellCount!.aliveCells / r.manualCellCount!.totalCells) * 100;
                                return raw <= 100 ? `${Math.min(100, raw).toFixed(1)}%` : "";
                              })()
                            }
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : null}
                <PickerField label={t("yeastSpeciesLabel")} value={r.species ?? ""} options={[{ value: "", label: "—" }, ...SPECIES_OPTIONS]} onChange={(v) => updateYeastRow(r.id, { species: v && ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"].includes(v) ? (v as NonNullable<EditorYeastRow["species"]>) : null })} closeLabel={tCommon("close")} />
                <PickerField label={t("yeastNeedsPropagationLabel")} value={r.needsPropagation ?? ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastNeedsPropagationYes") : t("yeastNeedsPropagationNo") }))]} onChange={(v) => updateYeastRow(r.id, { needsPropagation: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
              </View>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </View>
    </Card>
  );
}
