import { Link } from "../../../../../src/i18n/navigation";
import { Button, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { formatFixed } from "../../../../../src/i18n/format";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { AdSlot } from "../../../../_components/AdSlot";
import { CodeInline } from "../../../../_components/CodeInline";
import { StripedRow } from "../../../../_components/StripedRow";
import { BrewSelect } from "../../../../_components/BrewSelect";
import {
  ErrorBox,
  MessageBox,
  RecipeEditField,
  RecipeEditFieldBlock,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditList,
  RecipeEditReadOnlyValue,
  RecipeEditSection,
  RecipeEditSummary,
} from "../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { MashStepsEditor, SpargeStepReadOnlyRow } from "@umbraculum/brewery-recipes-ui";
import { YeastEditor } from "../../../_components/YeastEditor";
import { RecipeEditSectionsNav } from "../../../_components/RecipeEditSectionsNav";
import { RecipeTitleWithMeta } from "../../../../_components/RecipeTitleWithMeta";
import { mathExplain } from "../_lib/mathExplain";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import { renderDerivationBody } from "../../water/_lib/mathBodies";
import { formatSgWithPlato } from "../../../../_lib/gravity";
import { asRecord } from "../../../../_lib/typeGuards";
import { miscTypeOptions, miscUseOptions } from "../_lib/recipeEditConstants";
import { getBeerJsonBatchSize, getRecipeEfficiencyPercent } from "../_lib/recipeEditHelpers";
import type {
  DerivationsRecord,
  FormatHintsRecord,
  GristMaltClass,
  GristPotentialKind,
  HopRow,
  HopUse,
  MiscType,
  MiscUse,
} from "../_lib/recipeEditTypes";
import type { RecipeEditPageModel } from "../_hooks/useRecipeEditPage";

export function RecipeEditPageContent({ model }: { model: RecipeEditPageModel }) {
  const {
    t, tHops, tEquip, tAnalysis, tMath, tNav, tUnits, tWater,
    locale, recipeId, authState, loadRecipeMeta,
    layoutMetrics, useDesktopRail, roundTo, sections,
    openSections, setSectionOpen, surfaceMath, setSurfaceMath,
    loading, loadError, saving, saveError, saveStatus, setSaveStatus,
    recipe, analysis, versions, _versionsLoading, versionsError,
    creatingVersion, createVersionError, duplicatingRecipe, creatingBrewSession,
    brewSessionError, brewSessions: _brewSessions, brewSessionsLoading, duplicateRecipeError,
    name, setName, styleKey, setStyleKey, notes, setNotes,
    gristRows, hopsRows, yeastRows,
    miscRows, mashProcedure,
    waterSettings, yeastAttenuationOverrides,
    boilTimeMinutes, setBoilTimeMinutes,
    styles, stylesLoading, stylesError,
    equipmentProfiles, equipmentProfilesLoading, equipmentProfilesError,
    selectedEquipmentProfileId, setSelectedEquipmentProfileId,
    equipmentApplyError, equipmentApplying,
    fermentableQuery, setFermentableQuery, fermentableResults, fermentableSearching,
    fermentableSearchError, fermentableAddMessage,
    hopQuery, setHopQuery, hopResults, hopSearching, hopSearchError,
    canCallAccountScoped, waterVolumes, spargeConfigured, mashRowsFiltered,
    programmedSessions, brewingNowSessions, lastBrewSessions,
    spargeStepTempDisplay, spargeMethodLabel,
    applyEquipmentProfileToRecipe, onSave, onCreateAnotherVersion, onDuplicateRecipe, onBrewRecipe,
    addGristRow, addFermentableFromDb, addHopFromDb,
    removeGristRow, updateGristRow, addHopRow, removeHopRow, updateHopRow,
    addMiscRow, removeMiscRow, updateMiscRow,
    isRoastedLike, inferDehuskedFromName,
    onSearchFermentables, clearFermentableSearchResults, onSearchHops, clearHopSearchResults,
    gristTotals, gristWaterConsistency,
  } = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={t("title")}
        recipeId={recipeId}
        enabled={authState.status === "ready"}
        loadRecipeMeta={loadRecipeMeta}
      />

      <SurfaceMathToggleRow
        left={null}
        rightHint={<SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{tMath("analysis.common.toggleHint")}</SizableText>}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mt="$2"
        mb="$2"
      />

      {authState.status === "loading" ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}
      {authState.status === "ready" && !canCallAccountScoped ? (
        <ErrorBox>{t("notReadyToLoad")}</ErrorBox>
      ) : null}

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {loadError ? (
        <ErrorBox aria-live="polite">{loadError}</ErrorBox>
      ) : null}

      {useDesktopRail ? (
        <RecipeEditSectionsNav
          sections={sections}
          recipeId={recipeId}
          layoutMode="rail"
          railLeftPx={layoutMetrics.leftGutterPx}
          railTopPx={layoutMetrics.railTopPx}
        />
      ) : null}

      {(saveStatus || saveError) ? (
        <View
          position="fixed"
          top={16}
          left={0}
          right={0}
          zIndex={1000}
          width="100%"
          px="$4"
        >
          <View width="100%" maxWidth={600} mx="auto">
            <YStack gap="$2" width="100%">
              {saveStatus ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => setSaveStatus(null)}
                >
                  {saveStatus}
                </MessageBox>
              ) : null}
              {saveError ? (
                <ErrorBox aria-live="polite">
                  {saveError}
                </ErrorBox>
              ) : null}
            </YStack>
          </View>
        </View>
      ) : null}

      <XStack
        flexDirection="column"
        gap="$4"
        $gtNarrow={{ flexDirection: "row" }}
        flex={1}
        minW={0}
      >
        <YStack gap="$0" flex={1} minW={0}>
          {!useDesktopRail ? (
            <View mb="$3">
              <RecipeEditSectionsNav sections={sections} recipeId={recipeId} layoutMode="sheet" />
            </View>
          ) : null}
          <RecipeEditSection
            id="basics"
            headingId="basics-heading"
            label={t("sections.basics")}
            open={openSections['basics']}
            onOpenChange={(open) => setSectionOpen("basics", open)}
          >
            <XStack
              gap="$3"
              mt="$2"
              flexWrap="wrap"
              $gtNarrow={{ flexWrap: "nowrap" }}
            >
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-name" label="Name">
                  <XStack gap="$2" items="center" flexWrap="wrap">
                    <Input
                      id="recipe-name"
                      value={name}
                      onChangeText={setName}
                      size="$3"
                      flex={1}
                      minW={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("versionLabel")}{" "}
                      <SizableText
                        size="$2"
                        color="var(--text-muted)"
                        fontFamily="$body"
                        fontWeight="bold"
                        as="span"
                      >
                        {typeof recipe?.version === "number"
                          ? String(recipe.version).padStart(2, "0")
                          : "—"}
                      </SizableText>
                    </SizableText>
                  </XStack>
                </RecipeEditField>
              </View>
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-style" label="Style">
                  <BrewSelect
                    id="recipe-style"
                    value={styleKey}
                    onValueChange={setStyleKey}
                    options={styles.map((s) => ({
                      value: s.key,
                      label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                    }))}
                    disabled={stylesLoading || styles.length === 0}
                    width="full"
                  />
                {stylesError ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                    {String(stylesError)}
                  </SizableText>
                ) : null}
                </RecipeEditField>
              </View>
            </XStack>

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap">
                <Button
                  onPress={() => { void onSave(); }}
                  disabled={!canCallAccountScoped || saving}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
                {recipe ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    Updated: <CodeInline>{recipe.updatedAt}</CodeInline>
                  </SizableText>
                ) : null}
              </XStack>
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("versionCreateNote")}
              </SizableText>
              <Button
                onPress={() => { void onCreateAnotherVersion(); }}
                disabled={
                  !canCallAccountScoped ||
                  creatingVersion ||
                  (Array.isArray(versions) && versions.some((v) => v.version >= 99))
                }
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {creatingVersion ? t("versionCreateWorking") : t("versionCreateButton")}
              </Button>
              {Array.isArray(versions) && versions.some((v) => v.version >= 99) ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("versionLimitReached")}
                </SizableText>
              ) : null}
              {(versionsError || createVersionError) ? (
                <ErrorBox mt="$1.5">
                  {createVersionError ? createVersionError : versionsError}
                </ErrorBox>
              ) : null}
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("duplicateRecipeNote")}
              </SizableText>
              <Button
                onPress={() => { void onDuplicateRecipe(); }}
                disabled={!canCallAccountScoped || duplicatingRecipe}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {duplicatingRecipe ? t("duplicateRecipeWorking") : t("duplicateRecipeButton")}
              </Button>
              {duplicateRecipeError ? (
                <ErrorBox mt="$1.5">{duplicateRecipeError}</ErrorBox>
              ) : null}
            </YStack>
          </RecipeEditSection>

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

          <RecipeEditSection
            spaced
            id="brewingHistory"
            headingId="brewing-history-heading"
            label={t("sections.brewingHistory")}
            open={openSections['brewingHistory']}
            onOpenChange={(open) => setSectionOpen("brewingHistory", open)}
          >
            <YStack gap="$2" mt="$2">
              {brewingNowSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="inProgress" header={t("brewingNowLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {brewingNowSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {programmedSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="programmed" header={t("programmedSectionLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {programmedSessions.map((s) => {
                      const displayDate = s.scheduledDate
                        ? new Date(s.scheduledDate).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {lastBrewSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="computed" header={t("lastBrewedLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {lastBrewSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {brewSessionsLoading ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("lastBrewedLoading")}
                </SizableText>
              ) : programmedSessions.length === 0 && lastBrewSessions.length === 0 && brewingNowSessions.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("brewingHistoryEmpty")}
                </SizableText>
              ) : null}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="brew"
            headingId="brew-heading"
            label={t("sections.brew")}
            open={openSections['brew']}
            onOpenChange={(open) => setSectionOpen("brew", open)}
          >
            <YStack gap="$2" mt="$2">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("brewNote")}
              </SizableText>
              <Button
                onPress={() => { void onBrewRecipe(); }}
                disabled={!canCallAccountScoped || creatingBrewSession}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("brewButton")}
              </Button>
              {brewSessionError ? <ErrorBox mt="$1.5">{brewSessionError}</ErrorBox> : null}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="equipment"
            headingId="equipment-heading"
            label={t("sections.equipment")}
            open={openSections['equipment']}
            onOpenChange={(open) => setSectionOpen("equipment", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tEquip("help")}
            </SizableText>

            {equipmentProfilesError ? (
              <ErrorBox>{equipmentProfilesError}</ErrorBox>
            ) : null}

            <XStack gap="$3" mt="$3" flexWrap="wrap" items="flex-end">
              <View flex={1} minW={200}>
                <RecipeEditField id="equipment-profile" label={tEquip("profileLabel")}>
                  <BrewSelect
                    id="equipment-profile"
                    value={selectedEquipmentProfileId}
                    onValueChange={setSelectedEquipmentProfileId}
                    options={[
                      { value: "", label: tEquip("noneOption") },
                      ...equipmentProfiles.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                    disabled={equipmentProfilesLoading}
                    width="full"
                  />
                </RecipeEditField>
              </View>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("apply")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("apply")}
              </Button>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("reload")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("reload")}
              </Button>
            </XStack>

            {equipmentApplyError ? (
              <ErrorBox mt="$3">{equipmentApplyError}</ErrorBox>
            ) : null}

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              {tEquip("manageTemplatesText")} <Link href="/equipment">{tEquip("manageTemplatesLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="mashing"
            headingId="mashing-heading"
            label={t("sections.mashing")}
            open={openSections['mashing']}
            onOpenChange={(open) => setSectionOpen("mashing", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("mashingHelp")}
            </SizableText>

            {waterVolumes ? (
              <RecipeEditFieldBlock
                variant="computed"
                header={t("mashingWaterVolumesTitle")}
                badge="Computed"
                source={t("mashingWaterVolumesSource")}
                mt="$3"
                mb="$3"
              >
                <RecipeEditList gap="$1" mt="$2" mb={0}>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Mash water: <CodeInline>{formatFixed(locale, waterVolumes.mashLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Sparge water: <CodeInline>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                </RecipeEditList>
              </RecipeEditFieldBlock>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$3">
                {t("mashingWaterVolumesUnavailable")}
              </SizableText>
            )}

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                  {t("mashStepsFromWaterPage")}
                </SizableText>
                <View mt="$3">
                  <MashStepsEditor
                    mashRows={mashRowsFiltered}
                    mashProcedure={mashProcedure}
                    waterVolumes={waterVolumes}
                    readOnly
                    recipeId={recipeId}
                    t={t}
                    tUnits={tUnits}
                    locale={locale}
                    formatFixed={formatFixed}
                  />
                </View>

                <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                  <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashStepConfigureLink")}</Link>
                </SizableText>

                {spargeConfigured ? (
                  <View mt="$4">
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                      {t("spargeStepFromWaterPage")}
                    </SizableText>
                    <SpargeStepReadOnlyRow
                      stepNumber={mashRowsFiltered.length + 1}
                      title="Sparge"
                      name="Sparge"
                      typeLabel={spargeMethodLabel}
                      tempDisplay={formatFixed(locale, spargeStepTempDisplay, 1)}
                      timeDisplay={String(waterSettings?.spargeStepTimeMin ?? 60)}
                      amountDisplay={`${formatFixed(locale, waterVolumes!.spargeLiters, 2)} ${tUnits("L")}`}
                      rampDisplay={String(waterSettings?.spargeStepRampMin ?? 0)}
                      labels={{
                        name: t("mashingStepName"),
                        type: t("mashingStepType"),
                        temp: t("mashingStepTemp", { unit: "°C" }),
                        time: t("mashingStepTime", { unit: "min" }),
                        amount: t("mashingStepAmount", { unit: "L" }),
                        ramp: t("mashingStepRamp", { unit: "min" }),
                      }}
                    />
                    <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                      <Link href={`/recipes/${recipeId}/water/sparge`}>
                        {t("spargeStepConfigureLink")}
                      </Link>
                    </SizableText>
                  </View>
                ) : null}
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="fermentables"
            headingId="fermentables-heading"
            label={t("sections.fermentables")}
            open={openSections['fermentables']}
            onOpenChange={(open) => setSectionOpen("fermentables", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              Enter your grist here. Water calculator can import a read-only snapshot.
            </SizableText>

            <View mt="$3">
              <form onSubmit={(...a) => { void onSearchFermentables(...(a as Parameters<typeof onSearchFermentables>)); }}>
                <RecipeEditFieldLabel htmlFor="fermentable-search">
                Search fermentables database
              </RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="fermentable-search"
                  value={fermentableQuery}
                  onChangeText={setFermentableQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || fermentableSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {fermentableSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  type="button"
                  onPress={clearFermentableSearchResults}
                  disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {fermentableSearchError ? (
                <ErrorBox mt="$2">{fermentableSearchError}</ErrorBox>
              ) : null}
              {fermentableResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={140}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Producer</SizableText></View>
                      <View minW={50} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">°L</SizableText></View>
                      <View minW={70} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">Yield %</SizableText></View>
                      <View minW={60} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">PPG</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {fermentableResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={140}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.producer ?? ""}</SizableText></View>
                        <View minW={50}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.colorLovibond === "number" ? it.colorLovibond.toFixed(1) : ""}</SizableText></View>
                        <View minW={70}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.yieldPercent === "number" ? it.yieldPercent.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.ppg === "number" ? it.ppg.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addFermentableFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                  </YStack>
                </View>
              ) : null}
              </form>
            </View>

            {fermentableAddMessage ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite" mt="$2">
                {fermentableAddMessage}
              </SizableText>
            ) : null}

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap" mt="$1">
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={addGristRow}
                  disabled={!canCallAccountScoped}
                >
                  {t("buttons.addCustomFermentable")}
                </Button>
              </XStack>
            </YStack>

            <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
              {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
              {gristTotals.weightedAvgLovibond !== null ? (
                <> · {t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}</>
              ) : null}
            </SizableText>

            {gristRows.length ? (
              <View overflowX="auto" mt="$2">
                <YStack gap="$3">
                  {gristRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={240} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`grist-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`grist-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateGristRow(r.id, {
                                          name: text,
                                          ingredientId: null,
                                          producer: null,
                                          group: null,
                                          mashDiPh: null,
                                          mashTaToPh57_mEqPerKg: null,
                                          mashRoastDehuskedOverride: null,
                                          mashRoastDehuskedSource: "unknown",
                                          mashPhModelSource: "unknown",
                                        })
                                      }
                                      autoComplete="off"
                                      size="$3"
                                      w="100%"
                                      bg="var(--surface)"
                                      borderWidth={1}
                                      borderColor="var(--border)"
                                      rounded="$2"
                                      fontFamily="$body"
                                    />
                                  </YStack>
                                  {(r.producer ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Producer</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.producer}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  {(r.group ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Group</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.group}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeGristRow(r.id)}
                                    aria-label={`Remove fermentable row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`grist-kg-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("kg") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-kg-${r.id}`}
                                    value={String(r.amountKg)}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, { amountKg: text === "" ? 0 : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={140}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={80}>
                                  <RecipeEditFieldLabel htmlFor={`grist-lov-${r.id}`}>
                                    {t("colorLabel", { unit: tUnits("lovibond") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-lov-${r.id}`}
                                    value={r.colorLovibond ?? ""}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, {
                                        colorLovibond: text === "" ? null : Number(text),
                                      })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={100}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-class-${r.id}`}>
                                    Mash pH class (legacy)
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-class-${r.id}`}
                                    value={r.maltClass}
                                    onValueChange={(v) => updateGristRow(r.id, { maltClass: v as GristMaltClass })}
                                    options={[
                                      { value: "base", label: "Base" },
                                      { value: "crystal", label: "Crystal" },
                                      { value: "roast", label: "Roast" },
                                      { value: "acid", label: "Acid malt" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-timing-${r.id}`}>
                                    {t("fermentableTimingLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-timing-${r.id}`}
                                    value={r.timingUse ?? "add_to_mash"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, {
                                        timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash",
                                      })
                                    }
                                    options={[
                                      { value: "add_to_mash", label: t("fermentableTimingMash") },
                                      { value: "add_to_boil", label: t("fermentableTimingKettle") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-late-${r.id}`}>
                                    {t("fermentableLateAdditionLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-late-${r.id}`}
                                    value={r.lateAddition === true ? "yes" : "no"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, { lateAddition: v === "yes" })
                                    }
                                    options={[
                                      { value: "no", label: t("fermentableLateAdditionNo") },
                                      { value: "yes", label: t("fermentableLateAdditionYes") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-kind-${r.id}`}>
                                    Potential kind
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-pot-kind-${r.id}`}
                                    value={r.potential?.kind ?? ""}
                                    onValueChange={(v) => {
                                      const kind = v as GristPotentialKind | "";
                                      if (!kind) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, {
                                        potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) },
                                      });
                                    }}
                                    options={[
                                      { value: "", label: "(none)" },
                                      { value: "ppg", label: "PPG" },
                                      { value: "yieldPercent", label: "Yield %" },
                                      { value: "sg", label: "SG (e.g. 1.037)" },
                                      { value: "plato", label: "Plato (°P)" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-val-${r.id}`}>
                                    Potential value
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-pot-val-${r.id}`}
                                    value={r.potential ? String(roundTo(r.potential.value, 3)) : ""}
                                    onChangeText={(text) => {
                                      const v = text === "" ? null : Number(text);
                                      if (!r.potential) return;
                                      if (v === null) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, { potential: { ...r.potential, value: roundTo(v, 3) } });
                                    }}
                                    disabled={!r.potential}
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={140}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <View flexBasis="100%" w="100%">
                                  <details>
                                    <RecipeEditSummary>
                                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                        Mash pH model (v1) – Advanced users
                                      </SizableText>
                                    </RecipeEditSummary>
                                    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                      {isRoastedLike(r) ? (
                                        <>
                                          <YStack gap="$1" w={220} maxW="100%">
                                            <RecipeEditFieldLabel>Dehusked/de-bittered</RecipeEditFieldLabel>
                                            <RecipeEditReadOnlyValue>
                                              {typeof r.mashRoastDehuskedOverride === "boolean"
                                                ? r.mashRoastDehuskedOverride
                                                  ? "yes"
                                                  : "no"
                                                : r.mashRoastDehuskedSource === "inferred"
                                                  ? inferDehuskedFromName(r.name)
                                                    ? "yes"
                                                    : "no"
                                                  : ""}
                                            </RecipeEditReadOnlyValue>
                                          </YStack>
                                          <YStack gap="$1" w={260} maxW="100%">
                                            <RecipeEditFieldLabel htmlFor={`grist-roast-dehusked-override-${r.id}`}>
                                              Override
                                            </RecipeEditFieldLabel>
                                            <BrewSelect
                                              id={`grist-roast-dehusked-override-${r.id}`}
                                              value={
                                                typeof r.mashRoastDehuskedOverride === "boolean"
                                                  ? r.mashRoastDehuskedOverride
                                                    ? "force_dehusked"
                                                    : "force_husked"
                                                  : "auto"
                                              }
                                              onValueChange={(v) => {
                                                if (v === "auto") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: null,
                                                    mashRoastDehuskedSource: "unknown",
                                                  });
                                                } else if (v === "force_husked") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: false,
                                                    mashRoastDehuskedSource: "override",
                                                  });
                                                } else if (v === "force_dehusked") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: true,
                                                    mashRoastDehuskedSource: "override",
                                                  });
                                                }
                                              }}
                                              options={[
                                                { value: "auto", label: "Auto (detect)" },
                                                { value: "force_husked", label: "Force husked" },
                                                { value: "force_dehusked", label: "Force dehusked/de-bittered" },
                                              ]}
                                              width="full"
                                            />
                                          </YStack>
                                          <YStack gap="$1" w={200} maxW="100%">
                                            <RecipeEditFieldLabel>Dehusked source</RecipeEditFieldLabel>
                                            <RecipeEditReadOnlyValue>{r.mashRoastDehuskedSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                          </YStack>
                                        </>
                                      ) : null}
                                      <YStack gap="$1" w={240} maxW="100%">
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-di-ph-${r.id}`}>
                                          DI mash pH (room temp)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-di-ph-${r.id}`}
                                          value={r.mashDiPh ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
                                              mashDiPh: text === "" ? null : Number(text),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          keyboardType="decimal-pad"
                                          size="$3"
                                          w="100%"
                                          bg="var(--surface)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          rounded="$2"
                                          fontFamily="$body"
                                        />
                                      </YStack>
                                      <YStack gap="$1" w={280} maxW="100%">
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-ta-${r.id}`}>
                                          Titratable acidity to pH 5.7 (mEq/kg)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-ta-${r.id}`}
                                          value={r.mashTaToPh57_mEqPerKg ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
                                              mashTaToPh57_mEqPerKg: text === "" ? null : Number(text),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          keyboardType="decimal-pad"
                                          size="$3"
                                          w="100%"
                                          bg="var(--surface)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          rounded="$2"
                                          fontFamily="$body"
                                        />
                                      </YStack>
                                      <YStack gap="$1" w={200} maxW="100%">
                                        <RecipeEditFieldLabel>Source</RecipeEditFieldLabel>
                                        <RecipeEditReadOnlyValue>{r.mashPhModelSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                      </YStack>
                                    </XStack>
                                  </details>
                                </View>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No fermentables yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={() => { void onSave(); }}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including grist)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_fermentables" />
          </View>

          <RecipeEditSection
            spaced
            id="hops"
            headingId="hops-heading"
            label={t("sections.hops")}
            open={openSections['hops']}
            onOpenChange={(open) => setSectionOpen("hops", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("hopsHelp")}
            </SizableText>

            <View mt="$3">
              <form onSubmit={(...a) => { void onSearchHops(...(a as Parameters<typeof onSearchHops>)); }}>
                <RecipeEditFieldLabel htmlFor="hop-search">Search hops database</RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="hop-search"
                  value={hopQuery}
                  onChangeText={setHopQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || hopSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {hopSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={clearHopSearchResults}
                  disabled={hopSearching || (!hopSearchError && hopResults.length === 0)}
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {hopSearchError ? <ErrorBox mt="$2">{hopSearchError}</ErrorBox> : null}
              {hopResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={180}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={80}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Country</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α min</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α max</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {hopResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={180}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={80}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.country ?? ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMin === "number" ? it.alphaMin.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMax === "number" ? it.alphaMax.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addHopFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                </YStack>
                </View>
              ) : null}
              </form>
            </View>

            <XStack gap="$3" items="center" mt="$3">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => addHopRow()}
                disabled={!canCallAccountScoped}
              >
                Add hop
              </Button>
            </XStack>

            {hopsRows.length ? (
              <View overflowX="auto" mt="$3">
                <YStack gap="$3">
                  {hopsRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={280} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`hop-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`hop-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateHopRow(r.id, { name: text, ingredientId: null, country: null })
                                      }
                                      autoComplete="off"
                                      size="$3"
                                      w="100%"
                                      bg="var(--surface)"
                                      borderWidth={1}
                                      borderColor="var(--border)"
                                      rounded="$2"
                                      fontFamily="$body"
                                    />
                                  </YStack>
                                  {(r.country ?? "") ? (
                                    <YStack gap="$1" w={240} maxW="100%">
                                      <RecipeEditFieldLabel>Country</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.country}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeHopRow(r.id)}
                                    aria-label={`Remove hop row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`hop-g-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("g") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-g-${r.id}`}
                                    value={String(r.amountGrams)}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { amountGrams: text === "" ? 0 : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={120}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-aa-${r.id}`}>Alpha (%)</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-aa-${r.id}`}
                                    value={r.alphaAcidPercent ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, {
                                        alphaAcidPercent: text === "" ? null : Number(text),
                                      })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={170}>
                                  <RecipeEditFieldLabel htmlFor={`hop-form-${r.id}`}>{tHops("typeLabel")}</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-form-${r.id}`}
                                    value={r.form ?? "pellet"}
                                    onValueChange={(v) =>
                                      updateHopRow(r.id, {
                                        form: v as NonNullable<HopRow["form"]>,
                                      })
                                    }
                                    options={[
                                      { value: "pellet", label: tHops("typeOptions.pellet") },
                                      { value: "leaf", label: tHops("typeOptions.leaf") },
                                      { value: "leaf (wet)", label: tHops("typeOptions.leafWet") },
                                      { value: "powder", label: tHops("typeOptions.powder") },
                                      { value: "extract", label: tHops("typeOptions.extract") },
                                      { value: "hop_extract", label: tHops("typeOptions.hopExtract") },
                                      { value: "plug", label: tHops("typeOptions.plug") },
                                      { value: "debittered_leaf", label: tHops("typeOptions.debitteredLeaf") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={130}>
                                  <RecipeEditFieldLabel htmlFor={`hop-use-${r.id}`}>Use</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-use-${r.id}`}
                                    value={r.use}
                                    onValueChange={(v) => updateHopRow(r.id, { use: v as HopUse })}
                                    options={[
                                      { value: "boil", label: "Boil" },
                                      { value: "whirlpool", label: "Whirlpool" },
                                      { value: "dryhop", label: "Dry hop" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-min-${r.id}`}>{tHops("timeBeforeEndOfBoilMin")}</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-min-${r.id}`}
                                    value={r.timeMinutes ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No hops yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={() => { void onSave(); }}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including hops)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_hops" />
          </View>

          <RecipeEditSection
            spaced
            id="yeast"
            headingId="yeast-heading"
            label={t("sections.yeast")}
            open={openSections['yeast']}
            onOpenChange={(open) => setSectionOpen("yeast", open)}
          >
            <View mt="$3">
              <YeastEditor
                yeastRows={yeastRows}
                yeastAttenuationOverrides={yeastAttenuationOverrides}
                readOnly
                recipeId={recipeId}
                t={t}
                tAnalysis={tAnalysis}
                tUnits={tUnits}
                locale={locale}
                formatFixed={formatFixed}
              />
            </View>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
              {t("rawMaterialsCtaPrefix")}{" "}
              <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_yeast" />
          </View>

          <RecipeEditSection
            spaced
            id="other"
            headingId="other-heading"
            label={t("sections.other")}
            open={openSections['other']}
            onOpenChange={(open) => setSectionOpen("other", open)}
          >
            <XStack jc="space-between" gap="$3" flexWrap="wrap">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
                {t("otherHelp")}
              </SizableText>
              <Button
                onPress={addMiscRow}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("buttons.addOtherIngredient")}
              </Button>
            </XStack>

            {miscRows.length ? (
              <YStack gap="$3" mt="$3" w="100%" minWidth={0}>
                {miscRows.map((r, idx) => {
                  const amountLabel = t("amountLabel", { unit: r.amountIsWeight ? tUnits("kg") : tUnits("L") });
                  return (
                    <RecipeEditIngredientCard key={r.id}>
                      <XStack gap="$3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}>
                        <View alignSelf="center" flexShrink={0}>
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                            {idx + 1}
                          </SizableText>
                        </View>
                        <YStack gap="$1" flex={1} minW={280} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-name-${r.id}`}>Name</RecipeEditFieldLabel>
                          <Input
                            id={`misc-name-${r.id}`}
                            value={r.name}
                            onChangeText={(text) => updateMiscRow(r.id, { name: text })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient name ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-type-${r.id}`}>Type</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-type-${r.id}`}
                            value={r.type}
                            onValueChange={(v) => updateMiscRow(r.id, { type: v as MiscType })}
                            options={miscTypeOptions}
                            aria-label={`Other ingredient type ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={160} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-${r.id}`}>Use</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-use-${r.id}`}
                            value={r.use}
                            onValueChange={(v) => updateMiscRow(r.id, { use: v as MiscUse })}
                            options={miscUseOptions}
                            aria-label={`Other ingredient use ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={140} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-time-${r.id}`}>Time (min)</RecipeEditFieldLabel>
                          <Input
                            id={`misc-time-${r.id}`}
                            value={typeof r.timeMinutes === "number" ? String(r.timeMinutes) : ""}
                            onChangeText={(text) =>
                              updateMiscRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                            }
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient time minutes ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={200} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-is-weight-${r.id}`}>Amount kind</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-amount-is-weight-${r.id}`}
                            value={r.amountIsWeight ? "weight" : "volume"}
                            onValueChange={(v) => updateMiscRow(r.id, { amountIsWeight: v === "weight" })}
                            options={[
                              { value: "weight", label: "Weight" },
                              { value: "volume", label: "Volume" },
                            ]}
                            aria-label={`Other ingredient amount kind ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-${r.id}`}>{amountLabel}</RecipeEditFieldLabel>
                          <Input
                            id={`misc-amount-${r.id}`}
                            value={
                              Number.isFinite(r.amount)
                                ? r.amountIsWeight
                                  ? formatFixed(locale, r.amount, 3)
                                  : formatFixed(locale, r.amount, 2)
                                : ""
                            }
                            onChangeText={(text) => {
                              const normalized = text.replace(",", ".");
                              const parsed = parseFloat(normalized);
                              updateMiscRow(r.id, {
                                amount: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
                              });
                            }}
                            onBlur={() => {
                              if (!Number.isFinite(r.amount)) return;
                              const decimals = r.amountIsWeight ? 3 : 2;
                              const rounded =
                                Math.round(r.amount * 10 ** decimals) / 10 ** decimals;
                              if (rounded !== r.amount) {
                                updateMiscRow(r.id, { amount: rounded });
                              }
                            }}
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient amount ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={240} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-for-${r.id}`}>Use for</RecipeEditFieldLabel>
                          <Input
                            id={`misc-use-for-${r.id}`}
                            value={r.useFor ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { useFor: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient use for ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={260} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-notes-${r.id}`}>Notes</RecipeEditFieldLabel>
                          <Input
                            id={`misc-notes-${r.id}`}
                            value={r.notes ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { notes: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient notes ${idx + 1}`}
                          />
                        </YStack>

                        <Button
                          size="$2"
                          flexShrink={0}
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => removeMiscRow(r.id)}
                          aria-label={`Remove other ingredient row ${idx + 1}`}
                        >
                          Remove
                        </Button>
                      </XStack>
                    </RecipeEditIngredientCard>
                  );
                })}
              </YStack>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No other ingredients yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={() => { void onSave(); }}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including other ingredients)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="boil"
            headingId="boil-heading"
            label={t("sections.boil")}
            open={openSections['boil']}
            onOpenChange={(open) => setSectionOpen("boil", open)}
          >
            <RecipeEditField id="recipe-boil-time" label={t("sections.boil")}>
              <Input
                id="recipe-boil-time"
                value={boilTimeMinutes}
                onChangeText={setBoilTimeMinutes}
                keyboardType="numeric"
                placeholder="60"
                size="$3"
                w={120}
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </RecipeEditField>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("boilTimeHelp")}
            </SizableText>
            <XStack mt="$3" justify="flex-end">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => { void onSave(); }}
                disabled={!canCallAccountScoped || saving}
              >
                {saving ? "Saving…" : t("boilSave")}
              </Button>
            </XStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="notes"
            headingId="notes-heading"
            label={t("sections.notes")}
            open={openSections['notes']}
            onOpenChange={(open) => setSectionOpen("notes", open)}
          >
            <RecipeEditField id="recipe-notes" label={t("sections.notes")}>
              <TextArea
                id="recipe-notes"
                numberOfLines={6}
                value={notes}
                onChangeText={setNotes}
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </RecipeEditField>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="water"
            headingId="water-heading"
            label={t("sections.water")}
            open={openSections['water']}
            onOpenChange={(open) => setSectionOpen("water", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("waterHelp")}
            </SizableText>
            <XStack gap="$2" flexWrap="wrap" ai="center" mt="$2">
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water`}>{t("nav.openWaterCalculator")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("mashWater")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("spargeWater")}</Link>
              </SizableText>
            </XStack>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("waterProfilesManageText")} <Link href="/water-profiles">{tNav("waterProfiles")}</Link>.
            </SizableText>
          </RecipeEditSection>
        </YStack>
      </XStack>
    </>
  );
}
