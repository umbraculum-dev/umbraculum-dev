import type {ReactNode} from "react";
import {SizableText, View, XStack} from "tamagui";

import {CodeInline} from "../../../../../../../../_components/CodeInline";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {buildRecipeAnalysisContext} from "./recipeAnalysisShared";

export function recipeAnalysisHopsYeastPanelRows(model: RecipeEditPageModel): ReactNode[] {
  const { tAnalysis, tMath } = model;
  const { a, fmtField, renderMath, renderDerivationMath, yeastLines } = buildRecipeAnalysisContext(model);

  return [
    (
      <XStack key="attenuation" gap="$2" ai="baseline">
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
  ];
}

export function RecipeAnalysisHopsYeastPanel({ model }: { model: RecipeEditPageModel }) {
  return <>{recipeAnalysisHopsYeastPanelRows(model)}</>;
}
