import { SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, MessageBox } from "../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { RecipeEditSectionsNav } from "../../../_components/RecipeEditSectionsNav";
import { RecipeTitleWithMeta } from "../../../../_components/RecipeTitleWithMeta";
import type { RecipeEditPageModel } from "../_hooks/useRecipeEditPage";
import {
  RecipeEditAnalysisSection,
  RecipeEditBasicsSection,
  RecipeEditBoilSection,
  RecipeEditBrewingHistorySection,
  RecipeEditBrewSection,
  RecipeEditEquipmentSection,
  RecipeEditFermentablesSection,
  RecipeEditHopsSection,
  RecipeEditMashingSection,
  RecipeEditNotesSection,
  RecipeEditOtherSection,
  RecipeEditWaterSection,
  RecipeEditYeastSection,
} from "./sections";

export function RecipeEditPageContent({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tMath,
    recipeId,
    authState,
    loadRecipeMeta,
    layoutMetrics,
    useDesktopRail,
    sections,
    surfaceMath,
    setSurfaceMath,
    loading,
    loadError,
    canCallAccountScoped,
    saveStatus,
    saveError,
    setSaveStatus,
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
          <RecipeEditBasicsSection model={model} />
          <RecipeEditAnalysisSection model={model} />
          <RecipeEditBrewingHistorySection model={model} />
          <RecipeEditBrewSection model={model} />
          <RecipeEditEquipmentSection model={model} />
          <RecipeEditMashingSection model={model} />
          <RecipeEditFermentablesSection model={model} />
          <RecipeEditHopsSection model={model} />
          <RecipeEditYeastSection model={model} />
          <RecipeEditOtherSection model={model} />
          <RecipeEditBoilSection model={model} />
          <RecipeEditNotesSection model={model} />
          <RecipeEditWaterSection model={model} />
        </YStack>
      </XStack>
    </>
  );
}
