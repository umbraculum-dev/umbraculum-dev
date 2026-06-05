import type {ReactNode} from "react";
import {SizableText, View, XStack} from "tamagui";

import {formatFixed} from "../../../../../../../src/i18n/format";
import {CodeInline} from "../../../../../../_components/CodeInline";
import {formatSgWithPlato} from "../../../../../../_lib/gravity";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {buildRecipeAnalysisContext} from "./recipeAnalysisShared";

export function recipeAnalysisGristConsistencyRow(model: RecipeEditPageModel): ReactNode {
  const { tAnalysis, gristWaterConsistency } = model;

  return (
    <XStack key="grist-water" gap="$2" ai="baseline">
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
  );
}

export function recipeAnalysisGravityPanelRows(model: RecipeEditPageModel): ReactNode[] {
  const { tAnalysis, tMath, locale } = model;
  const { a, fmtField, renderMath, renderDerivationMath, warningCodes, efficiencyFormatted } =
    buildRecipeAnalysisContext(model);
  const volumeNotes =
    warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
      ? tMath("analysis.common.noteMissingWaterSettings")
      : tMath("analysis.common.noteDependsOnWaterAndEquipment");

  return [
    (
      <XStack key="boil-time" gap="$2" ai="baseline">
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
      <XStack key="kettle-volume" gap="$2" ai="baseline">
        <View minW={180} pr="$3">
          <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
            <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.kettleVolume")}</SizableText>
            {renderMath(
              "analysis.kettleVolume",
              renderDerivationMath(
                "analysis.kettle_volume",
                tMath("analysis.kettleVolume.body", {
                  kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                  notes: volumeNotes,
                }),
              ) ?? tMath("analysis.kettleVolume.body", {
                kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                notes: volumeNotes,
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
      <XStack key="pre-boil-volume" gap="$2" ai="baseline">
        <View minW={180} pr="$3">
          <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
            <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.preBoilVolume")}</SizableText>
            {renderMath(
              "analysis.preBoilVolume",
              renderDerivationMath(
                "analysis.pre_boil_volume",
                tMath("analysis.preBoilVolume.body", {
                  preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                  notes: volumeNotes,
                }),
              ) ?? tMath("analysis.preBoilVolume.body", {
                preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                notes: volumeNotes,
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
      <XStack key="og" gap="$2" ai="baseline">
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
                  efficiency: efficiencyFormatted,
                }),
              ) ?? tMath("analysis.og.body", {
                og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                efficiency: efficiencyFormatted,
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
      <XStack key="fg" gap="$2" ai="baseline">
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
      <XStack key="pbg" gap="$2" ai="baseline">
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
                  efficiency: efficiencyFormatted,
                }),
              ) ?? tMath("analysis.pbg.body", {
                pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                efficiency: efficiencyFormatted,
              }),
            )}
          </XStack>
        </View>
        <View>
          <CodeInline>{formatSgWithPlato(a?.pbgEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
        </View>
      </XStack>
    ),
  ];
}

export function RecipeAnalysisGravityPanel({ model }: { model: RecipeEditPageModel }) {
  return <>{recipeAnalysisGravityPanelRows(model)}</>;
}
