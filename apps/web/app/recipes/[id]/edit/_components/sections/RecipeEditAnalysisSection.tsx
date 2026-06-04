import {Link} from "../../../../../../src/i18n/navigation";
import {SizableText, View, XStack, YStack} from "tamagui";

import {formatFixed} from "../../../../../../src/i18n/format";
import {MathHelpPopover} from "../../../../../_components/MathHelpPopover";
import {CodeInline} from "../../../../../_components/CodeInline";
import {StripedRow} from "../../../../../_components/StripedRow";
import {RecipeEditList, RecipeEditSection, RecipeEditSummary} from "../../../../../_components/recipe-edit";
import {mathExplain} from "../../_lib/mathExplain";
import {parseGravityAnalysisResponseV1} from "@umbraculum/contracts";
import {renderDerivationBody} from "../../../water/_lib/mathBodies";
import {formatSgWithPlato} from "../../../../../_lib/gravity";
import {asRecord} from "../../../../../_lib/typeGuards";
import {getBeerJsonBatchSize, getRecipeEfficiencyPercent} from "../../_lib/recipeEditHelpers";
import type {DerivationsRecord, FormatHintsRecord, HopUse} from "../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditAnalysisSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tAnalysis,
    tMath,
    tUnits,
    locale,
    recipeId,
    openSections,
    setSectionOpen,
    surfaceMath,
    recipe,
    analysis,
    hopsRows,
    yeastRows,
    yeastAttenuationOverrides,
    gristWaterConsistency
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="analysis"
            headingId="analysis-heading"
            label={t("sections.analysis")}
            open={openSections['analysis']}
            onOpenChange={(open) => setSectionOpen("analysis", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tAnalysis("help")}
            </SizableText>

                {(() => {
                  const parsed = (() => {
                    try {
                      return parseGravityAnalysisResponseV1(analysis);
                    } catch {
                      return null;
                    }
                  })();
                  const a = parsed?.result ?? null;

                  const fmt = (v: unknown, decimals: number) =>
                    typeof v === "number" && Number.isFinite(v) ? formatFixed(locale, v, decimals) : tAnalysis("na");

                  const fmtField = (field: string, v: unknown, fallbackDecimals: number) => {
                    const hints = parsed?.formatHints as FormatHintsRecord | undefined;
                    const hint = hints ? hints[field] : undefined;
                    const decimals =
                      hint && typeof hint.decimals === "number" && Number.isFinite(hint.decimals)
                        ? hint.decimals
                        : fallbackDecimals;
                    return fmt(v, decimals);
                  };

                  const warnings = Array.isArray(a?.warnings) ? a.warnings : [];
                  const warningCodes = new Set(
                    warnings.map((w) => String((asRecord(w)?.['code'] ?? "") as string | number)),
                  );

                  const renderMath = (key: keyof typeof mathExplain, body: string) => {
                    if (!surfaceMath) return null;
                    const ex = mathExplain[key];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={body}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  };

                  const renderDerivationMath = (derivationKey: string, fallback: string) => {
                    if (!surfaceMath) return null;
                    const derivations = parsed?.derivations as DerivationsRecord | undefined;
                    const d = derivations ? derivations[derivationKey] : undefined;
                    if (!d) return null;
                    try {
                      return renderDerivationBody({
                        locale,
                        tMath,
                        derivation: d,
                        units: {
                          L: tUnits("L"),
                          ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                          ppm: tUnits("ppm"),
                          g: tUnits("g"),
                          LPerKg: tUnits("LPerKg"),
                        },
                      });
                    } catch {
                      return fallback;
                    }
                  };

                  const ibuGravityUsed = (() => {
                    const pbg = a?.pbgEstimatedSg;
                    if (typeof pbg === "number" && Number.isFinite(pbg)) return { value: fmtField("pbgEstimatedSg", pbg, 3), source: tMath("analysis.common.sources.pbg") };
                    const og = a?.ogEstimatedSg;
                    if (typeof og === "number" && Number.isFinite(og)) return { value: fmtField("ogEstimatedSg", og, 3), source: tMath("analysis.common.sources.og") };
                    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
                  })();

                  const ibuVolumeUsed = (() => {
                    const vol = a?.kettleVolumeLiters;
                    if (typeof vol === "number" && Number.isFinite(vol)) return { value: fmtField("kettleVolumeLiters", vol, 2), source: tMath("analysis.common.sources.kettleVolume") };
                    if (warningCodes.has("used_batch_size_volume")) {
                      const { unit, value } = getBeerJsonBatchSize(recipe);
                      const liters = value != null ? (unit === "l" ? value : unit === "ml" ? value / 1000 : null) : null;
                      return {
                        value: liters != null && liters > 0 ? fmt(liters, 2) : tAnalysis("na"),
                        source: tMath("analysis.common.sources.batchSize"),
                      };
                    }
                    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
                  })();

                  const hopLines = (() => {
                    const rows = Array.isArray(hopsRows) ? hopsRows : [];
                    const out: string[] = [];
                    for (const h of rows) {
                      const name = typeof h?.name === "string" ? h.name.trim() : "";
                      if (!name) continue;
                      const use: HopUse = h?.use === "whirlpool" || h?.use === "dryhop" ? h.use : "boil";
                      if (use === "dryhop") {
                        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeDryhop") }));
                        continue;
                      }
                      const amountOk = typeof h?.amountGrams === "number" && Number.isFinite(h.amountGrams) && h.amountGrams > 0;
                      const aaOk = typeof h?.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent) && h.alphaAcidPercent > 0;
                      const timeMin =
                        typeof h?.timeMinutes === "number" && Number.isFinite(h.timeMinutes) && h.timeMinutes >= 0
                          ? h.timeMinutes
                          : null;
                      if (!amountOk || !aaOk || timeMin === null) {
                        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeMissingInputs") }));
                        continue;
                      }
                      out.push(
                        tMath("analysis.common.hopLine", {
                          name,
                          use: tMath(`analysis.common.hopUse.${use}`),
                          amountG: fmt(h.amountGrams, 1),
                          alpha: fmt(h.alphaAcidPercent, 1),
                          timeMin: String(Math.round(timeMin)),
                        }),
                      );
                    }
                    return out.length ? out.join("\n") : tMath("analysis.common.noHops");
                  })();

                  const yeastLines = (() => {
                    const rows = Array.isArray(yeastRows) ? yeastRows : [];
                    const overrides = yeastAttenuationOverrides && typeof yeastAttenuationOverrides === "object" ? yeastAttenuationOverrides : {};

                    const effective: Array<{ id: string; name: string; eff: number | null; source: "override" | "beerjson" | "missing" }> = [];
                    for (const y of rows) {
                      const id = typeof y.id === "string" ? y.id : "";
                      const name = typeof y.name === "string" ? y.name.trim() : "";
                      if (!id || !name) continue;
                      const ovRawVal = overrides[id];
                      const ovRaw = typeof ovRawVal === "string" ? ovRawVal.trim() : "";
                      const ov = ovRaw ? Number(ovRaw) : null;
                      const overrideOk = ov != null && Number.isFinite(ov) ? Math.max(0, Math.min(100, ov)) : null;
                      const min =
                        typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin)
                          ? y.attenuationMin
                          : null;
                      const max =
                        typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax)
                          ? y.attenuationMax
                          : null;
                      const att =
                        min != null && max != null ? (min + max) / 2 : min != null ? min : max != null ? max : null;
                      const eff = overrideOk ?? (att != null ? Math.max(0, Math.min(100, att)) : null);
                      effective.push({ id, name, eff, source: overrideOk != null ? "override" : att != null ? "beerjson" : "missing" });
                    }

                    const sorted = [...effective].sort((a1, a2) => (a2.eff ?? -1) - (a1.eff ?? -1));
                    const top = sorted.filter((x) => x.eff != null).slice(0, 2);
                    const topAvg = top.length ? top.reduce((acc, x) => acc + (x.eff as number), 0) / top.length : null;

                    const lines = sorted.map((y) =>
                      tMath("analysis.common.yeastLine", {
                        name: y.name,
                        value: y.eff != null ? fmt(y.eff, 1) : tAnalysis("na"),
                        source:
                          y.source === "override"
                            ? tMath("analysis.common.yeastSource.override")
                            : y.source === "beerjson"
                              ? tMath("analysis.common.yeastSource.beerjson")
                              : tMath("analysis.common.yeastSource.missing"),
                      }),
                    );

                    const selected = top.map((y) => tMath("analysis.common.yeastSelectedLine", { name: y.name, value: fmt(y.eff as number, 1) }));

                    return {
                      lines: lines.length ? lines.join("\n") : tMath("analysis.common.noYeast"),
                      selectedLines: selected.length ? selected.join("\n") : tMath("analysis.common.noYeastSelected"),
                      topAvg: topAvg != null ? fmt(topAvg, 1) : tAnalysis("na"),
                    };
                  })();

                  return (
                    <>
                      <View overflowX="auto">
                        <YStack gap="$2">
                          {[
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.abv")}</SizableText>
                                    {renderMath(
                                      "analysis.abv",
                                      renderDerivationMath(
                                        "analysis.abv",
                                        tMath("analysis.abv.body", {
                                          og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                          fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                          abv: fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2),
                                        }),
                                      ) ?? tMath("analysis.abv.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                        abv: fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2)}</CodeInline>
                                    {typeof a?.abvEstimatedPercent === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">%</SizableText> : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.ibuTinseth")}</SizableText>
                                    {renderMath(
                                      "analysis.ibuTinseth",
                                      renderDerivationMath(
                                        "analysis.ibu_tinseth",
                                        tMath("analysis.ibuTinseth.body", {
                                          ibu: fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1),
                                          gravity: ibuGravityUsed.value,
                                          gravitySource: ibuGravityUsed.source,
                                          volume: ibuVolumeUsed.value,
                                          volumeSource: ibuVolumeUsed.source,
                                          hopsLines: hopLines,
                                        }),
                                      ) ?? tMath("analysis.ibuTinseth.body", {
                                        ibu: fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1),
                                        gravity: ibuGravityUsed.value,
                                        gravitySource: ibuGravityUsed.source,
                                        volume: ibuVolumeUsed.value,
                                        volumeSource: ibuVolumeUsed.source,
                                        hopsLines: hopLines,
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.ibuRager")}</SizableText>
                                    {renderMath(
                                      "analysis.ibuRager",
                                      renderDerivationMath(
                                        "analysis.ibu_rager",
                                        tMath("analysis.ibuRager.body", {
                                          ibu: fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1),
                                          gravity: ibuGravityUsed.value,
                                          gravitySource: ibuGravityUsed.source,
                                          volume: ibuVolumeUsed.value,
                                          volumeSource: ibuVolumeUsed.source,
                                          hopsLines: hopLines,
                                        }),
                                      ) ?? tMath("analysis.ibuRager.body", {
                                        ibu: fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1),
                                        gravity: ibuGravityUsed.value,
                                        gravitySource: ibuGravityUsed.source,
                                        volume: ibuVolumeUsed.value,
                                        volumeSource: ibuVolumeUsed.source,
                                        hopsLines: hopLines,
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.buGu")}</SizableText>
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("buGuRatio", a?.buGuRatio, 2)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.srmMorey")}</SizableText>
                                    {renderMath(
                                      "analysis.srmMorey",
                                      renderDerivationMath(
                                        "analysis.srm_morey",
                                        tMath("analysis.srmMorey.body", {
                                          srm: fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1),
                                          volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                          notes: warningCodes.has("missing_color_volume")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : warningCodes.has("missing_fermentable_colors")
                                              ? tMath("analysis.common.noteMissingFermentableColors")
                                              : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                        }),
                                      ) ?? tMath("analysis.srmMorey.body", {
                                        srm: fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes: warningCodes.has("missing_color_volume")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : warningCodes.has("missing_fermentable_colors")
                                            ? tMath("analysis.common.noteMissingFermentableColors")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.srmDaniels")}</SizableText>
                                    {renderMath(
                                      "analysis.srmDaniels",
                                      renderDerivationMath(
                                        "analysis.srm_daniels",
                                        tMath("analysis.srmDaniels.body", {
                                          srm: fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1),
                                          volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                          notes: warningCodes.has("missing_color_volume")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : warningCodes.has("missing_fermentable_colors")
                                              ? tMath("analysis.common.noteMissingFermentableColors")
                                              : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                        }),
                                      ) ?? tMath("analysis.srmDaniels.body", {
                                        srm: fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes: warningCodes.has("missing_color_volume")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : warningCodes.has("missing_fermentable_colors")
                                            ? tMath("analysis.common.noteMissingFermentableColors")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.boilTimeMinutes")}</SizableText>
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("boilTimeMinutes", a?.boilTimeMinutes, 0)}</CodeInline>
                                    {typeof a?.boilTimeMinutes === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span"> min</SizableText> : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.kettleVolume")}</SizableText>
                                    {renderMath(
                                      "analysis.kettleVolume",
                                      renderDerivationMath(
                                        "analysis.kettle_volume",
                                        tMath("analysis.kettleVolume.body", {
                                          kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                          notes:
                                            warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                              ? tMath("analysis.common.noteMissingWaterSettings")
                                              : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                        }),
                                      ) ?? tMath("analysis.kettleVolume.body", {
                                        kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes:
                                          warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2)}</CodeInline>
                                    {typeof a?.kettleVolumeLiters === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">L</SizableText> : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.preBoilVolume")}</SizableText>
                                    {renderMath(
                                      "analysis.preBoilVolume",
                                      renderDerivationMath(
                                        "analysis.pre_boil_volume",
                                        tMath("analysis.preBoilVolume.body", {
                                          preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                          notes:
                                            warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                              ? tMath("analysis.common.noteMissingWaterSettings")
                                              : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                        }),
                                      ) ?? tMath("analysis.preBoilVolume.body", {
                                        preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                        notes:
                                          warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2)}</CodeInline>
                                    {typeof a?.preBoilVolumeLiters === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">L</SizableText> : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.og")}</SizableText>
                                    {renderMath(
                                      "analysis.og",
                                      renderDerivationMath(
                                        "analysis.og",
                                        tMath("analysis.og.body", {
                                          og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                          volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                          efficiency: (() => {
                                            const eff = getRecipeEfficiencyPercent(recipe);
                                            return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                          })(),
                                        }),
                                      ) ?? tMath("analysis.og.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        efficiency: (() => {
                                          const eff = getRecipeEfficiencyPercent(recipe);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{formatSgWithPlato(a?.ogEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.fg")}</SizableText>
                                    {renderMath(
                                      "analysis.fg",
                                      renderDerivationMath(
                                        "analysis.fg",
                                        tMath("analysis.fg.body", {
                                          og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                          attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                          fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                        }),
                                      ) ?? tMath("analysis.fg.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                        fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{formatSgWithPlato(a?.fgEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.pbg")}</SizableText>
                                    {renderMath(
                                      "analysis.pbg",
                                      renderDerivationMath(
                                        "analysis.pbg",
                                        tMath("analysis.pbg.body", {
                                          pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                                          preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                          efficiency: (() => {
                                            const eff = getRecipeEfficiencyPercent(recipe);
                                            return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                          })(),
                                        }),
                                      ) ?? tMath("analysis.pbg.body", {
                                        pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                                        preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                        efficiency: (() => {
                                          const eff = getRecipeEfficiencyPercent(recipe);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{formatSgWithPlato(a?.pbgEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.attenuation")}</SizableText>
                                    {renderMath(
                                      "analysis.attenuation",
                                      renderDerivationMath(
                                        "analysis.attenuation",
                                        tMath("analysis.attenuation.body", {
                                          attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                          yeastLines: yeastLines.lines,
                                          selectedLines: yeastLines.selectedLines,
                                          topAvg: yeastLines.topAvg,
                                        }),
                                      ) ?? tMath("analysis.attenuation.body", {
                                        attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                        yeastLines: yeastLines.lines,
                                        selectedLines: yeastLines.selectedLines,
                                        topAvg: yeastLines.topAvg,
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1)}</CodeInline>
                                    {typeof a?.attenuationEffectivePercent === "number" ? (
                                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">%</SizableText>
                                    ) : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">
                                    {tAnalysis("gristWaterConsistencyCheck")}
                                  </SizableText>
                                </View>
                                <View>
                                  {gristWaterConsistency.status === "passed" ? (
                                    <CodeInline color="var(--success)">
                                      {tAnalysis("gristWaterConsistencyPassed")}
                                    </CodeInline>
                                  ) : gristWaterConsistency.status === "error" ? (
                                    <CodeInline color="var(--danger)">
                                      {tAnalysis("gristWaterConsistencyError")}
                                    </CodeInline>
                                  ) : (
                                    <CodeInline>—</CodeInline>
                                  )}
                                </View>
                              </XStack>
                            ),
                          ].map((row, idx) => (
                            <StripedRow key={idx} odd={idx % 2 === 1}>
                              {row}
                            </StripedRow>
                          ))}
                          {gristWaterConsistency.status === "error" ? (
                            <View
                              mt="$2"
                              px="$3"
                              py="$2"
                              bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                              borderWidth={1}
                              borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                              rounded="$2"
                            >
                              <SizableText size="$2" fontFamily="$body" color="var(--text)">
                                {tAnalysis.rich("gristWaterConsistencyWarning", {
                                  link: (chunks) => (
                                    <Link href={`/recipes/${recipeId}/water/mash#grist-summary-heading`}>
                                      {chunks}
                                    </Link>
                                  ),
                                })}
                              </SizableText>
                              {gristWaterConsistency.diffPct != null ? (
                                <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$1">
                                  {tAnalysis("gristWaterConsistencyDifference", {
                                    value: formatFixed(locale, gristWaterConsistency.diffPct, 2),
                                  })}
                                </SizableText>
                              ) : null}
                            </View>
                          ) : null}
                        </YStack>
                      </View>

                      {warnings.length ? (
                        <View
                          as="details"
                          bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))"
                          borderWidth={1}
                          borderColor="var(--field-computed-border)"
                          rounded="$2"
                          p="$3"
                          mt="$3"
                        >
                          <RecipeEditSummary>
                            <XStack gap="$2" flexWrap="wrap" items="baseline" display="inline-flex">
                              <SizableText size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                {tAnalysis("warningsTitle")}
                              </SizableText>
                              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                {tAnalysis("warningsClickToExpand")}
                              </SizableText>
                            </XStack>
                          </RecipeEditSummary>
                          <RecipeEditList gap="$1" mt="$2">
                            {warnings.map((w, idx) => (
                              <SizableText
                                as="li"
                                key={`${String(w?.code ?? "warn")}-${idx}`}
                                size="$2"
                                fontFamily="$body"
                                color="var(--text)"
                              >
                                <CodeInline>{String(w?.code ?? "warning")}</CodeInline>{" "}
                                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                                  {tAnalysis(`warnings.${String(w?.code ?? "unknown")}`)}
                                </SizableText>
                              </SizableText>
                            ))}
                          </RecipeEditList>
                        </View>
                      ) : null}
                    </>
                  );
                })()}
          </RecipeEditSection>
  );
}
