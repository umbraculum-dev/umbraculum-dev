import type {ReactNode} from "react";
import {SizableText, View, XStack} from "tamagui";

import {CodeInline} from "../../../../../../../../_shell/_components/CodeInline";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {buildRecipeAnalysisContext} from "./recipeAnalysisShared";

function colorNotes(warningCodes: Set<string>, tMath: RecipeEditPageModel["tMath"]): string {
  return warningCodes.has("missing_color_volume")
    ? tMath("analysis.common.noteMissingWaterSettings")
    : warningCodes.has("missing_fermentable_colors")
      ? tMath("analysis.common.noteMissingFermentableColors")
      : tMath("analysis.common.noteDependsOnWaterAndEquipment");
}

export function recipeAnalysisColorPanelRows(model: RecipeEditPageModel): ReactNode[] {
  const { tAnalysis, tMath } = model;
  const { a, fmtField, renderMath, renderDerivationMath, warningCodes } = buildRecipeAnalysisContext(model);
  const notes = colorNotes(warningCodes, tMath);

  return [
    (
      <XStack key="srm-morey" gap="$2" ai="baseline">
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
                  notes,
                }),
              ) ?? tMath("analysis.srmMorey.body", {
                srm: fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1),
                volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                notes,
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
      <XStack key="srm-daniels" gap="$2" ai="baseline">
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
                  notes,
                }),
              ) ?? tMath("analysis.srmDaniels.body", {
                srm: fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1),
                volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                notes,
              }),
            )}
          </XStack>
        </View>
        <View>
          <CodeInline>{fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1)}</CodeInline>
        </View>
      </XStack>
    ),
  ];
}

export function RecipeAnalysisColorPanel({ model }: { model: RecipeEditPageModel }) {
  return <>{recipeAnalysisColorPanelRows(model)}</>;
}
