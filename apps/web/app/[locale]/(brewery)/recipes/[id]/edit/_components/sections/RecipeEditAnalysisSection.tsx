import {Link} from "../../../../../../../../src/i18n/navigation";
import {SizableText, View, XStack, YStack} from "tamagui";

import {formatFixed} from "../../../../../../../../src/i18n/format";
import {CodeInline} from "../../../../../../../_shell/_components/CodeInline";
import {StripedRow} from "../../../../../_components/StripedRow";
import {RecipeEditList, RecipeEditSection, RecipeEditSummary} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";
import {recipeAnalysisAbvPanelRows} from "./analysis/RecipeAnalysisAbvPanel";
import {recipeAnalysisColorPanelRows} from "./analysis/RecipeAnalysisColorPanel";
import {recipeAnalysisGristConsistencyRow, recipeAnalysisGravityPanelRows} from "./analysis/RecipeAnalysisGravityPanel";
import {recipeAnalysisHopsYeastPanelRows} from "./analysis/RecipeAnalysisHopsYeastPanel";
import {recipeAnalysisIbuPanelRows} from "./analysis/RecipeAnalysisIbuPanel";
import {buildRecipeAnalysisContext} from "./analysis/recipeAnalysisShared";

export function RecipeEditAnalysisSection({ model }: { model: RecipeEditPageModel }) {
  const { t, tAnalysis, locale, recipeId, openSections, setSectionOpen, gristWaterConsistency } = model;
  const { warnings } = buildRecipeAnalysisContext(model);

  const rows = [
    ...recipeAnalysisAbvPanelRows(model),
    ...recipeAnalysisIbuPanelRows(model),
    ...recipeAnalysisColorPanelRows(model),
    ...recipeAnalysisGravityPanelRows(model),
    ...recipeAnalysisHopsYeastPanelRows(model),
    recipeAnalysisGristConsistencyRow(model),
  ];

  return (
    <RecipeEditSection
      spaced
      id="analysis"
      headingId="analysis-heading"
      label={t("sections.analysis")}
      open={openSections["analysis"]}
      onOpenChange={(open) => setSectionOpen("analysis", open)}
    >
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {tAnalysis("help")}
      </SizableText>

      <View overflowX="auto">
        <YStack gap="$2">
          {rows.map((row, idx) => (
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
    </RecipeEditSection>
  );
}
