"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { H1, H2, SizableText, View } from "tamagui";

import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { getMediaPublicPath } from "@umbraculum/media";
import { ManualCellCountHelpBox } from "@umbraculum/brewery-recipes-ui";
import { YeastEditor } from "../../../_components/YeastEditor";
import { ErrorBox } from "../../../../_components/recipe-edit";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import type { UseYeastPageModel } from "../_hooks/useYeastPage";

export function YeastPageContent(props: { model: UseYeastPageModel }) {
  const {
    locale,
    t,
    tAnalysis,
    tUnits,
    recipeId,
    authState,
    loadRecipeMeta,
    recipe,
    loading,
    loadError,
    yeastRows,
    yeastAttenuationOverrides,
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    lowViabilityWarning,
    surfaceMath,
    setSurfaceMath,
    canCallAccountScoped,
    addYeastRow,
    removeYeastRow,
    updateYeastRow,
    onAttenuationOverrideChange,
    onSave,
    formatFixed,
  } = props.model;

  return (
    <>
      <H1 mb="$2">{t("yeastPageTitle")}</H1>
      <RecipeMetaLine
        recipeId={recipeId}
        enabled={authState.status === "ready"}
        loadRecipeMeta={loadRecipeMeta}
      />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/edit#yeast`}>{t("yeastBackToRecipe")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

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

      {!loading && !loadError && recipe ? (
          <View className="brew-panel" mt="$3" aria-labelledby="yeast-section-heading">
            <H2 id="yeast-section-heading" mt={0} size="$5" fontFamily="$heading" color="var(--text)">
              {t("yeastSectionHeading")}
            </H2>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$3">
            {t("yeastHelp")}
          </SizableText>
          <YeastEditor
            yeastRows={yeastRows}
            yeastAttenuationOverrides={yeastAttenuationOverrides}
            analysis={recipe?.analysis ?? null}
            recipeExtJson={recipe?.recipeExtJson ?? null}
            surfaceMath={surfaceMath}
            readOnly={false}
            recipeId={recipeId}
            onAddRow={addYeastRow}
            onRemoveRow={removeYeastRow}
            onUpdateRow={updateYeastRow}
            onAttenuationOverrideChange={onAttenuationOverrideChange}
            onSave={() => { void onSave(); }}
            canSave={canCallAccountScoped}
            saving={saving}
            saveStatus={saveStatus}
            onDismissSaveStatus={() => setSaveStatus(null)}
            canCallAccountScoped={canCallAccountScoped}
            t={t}
            tAnalysis={tAnalysis}
            tUnits={tUnits}
            locale={locale}
            formatFixed={formatFixed}
            lowViabilityWarning={lowViabilityWarning}
          />
          <ManualCellCountHelpBox
            renderImage={({ assetKey, alt, width, height: _height }) => (
              <img
                src={getMediaPublicPath(assetKey)}
                alt={alt}
                loading="lazy"
                style={{ maxWidth: width, width: "100%", height: "auto" }}
              />
            )}
          />
          {saveError ? (
            <ErrorBox mt="$3">{saveError}</ErrorBox>
          ) : null}
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
            {t("rawMaterialsCtaPrefix")}{" "}
            <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
          </SizableText>
          </View>
      ) : null}
    </>
  );
}
