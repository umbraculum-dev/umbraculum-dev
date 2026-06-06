import type {ReactNode} from "react";
import {SizableText, View, XStack} from "tamagui";

import {CodeInline} from "../../../../../../../../_components/CodeInline";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {buildRecipeAnalysisContext} from "./recipeAnalysisShared";

export function recipeAnalysisAbvPanelRows(model: RecipeEditPageModel): ReactNode[] {
  const { tAnalysis, tMath } = model;
  const { a, fmtField, renderMath, renderDerivationMath } = buildRecipeAnalysisContext(model);

  return [
    (
      <XStack key="abv" gap="$2" ai="baseline">
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
  ];
}

export function RecipeAnalysisAbvPanel({ model }: { model: RecipeEditPageModel }) {
  return <>{recipeAnalysisAbvPanelRows(model)}</>;
}
