import type {ReactNode} from "react";
import {SizableText, View, XStack} from "tamagui";

import {CodeInline} from "../../../../../../../../_shell/_components/CodeInline";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {buildRecipeAnalysisContext} from "./recipeAnalysisShared";

export function recipeAnalysisIbuPanelRows(model: RecipeEditPageModel): ReactNode[] {
  const { tAnalysis, tMath } = model;
  const { a, fmtField, renderMath, renderDerivationMath, ibuGravityUsed, ibuVolumeUsed, hopLines } =
    buildRecipeAnalysisContext(model);

  return [
    (
      <XStack key="ibu-tinseth" gap="$2" ai="baseline">
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
      <XStack key="ibu-rager" gap="$2" ai="baseline">
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
      <XStack key="bu-gu" gap="$2" ai="baseline">
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
  ];
}

export function RecipeAnalysisIbuPanel({ model }: { model: RecipeEditPageModel }) {
  return <>{recipeAnalysisIbuPanelRows(model)}</>;
}
