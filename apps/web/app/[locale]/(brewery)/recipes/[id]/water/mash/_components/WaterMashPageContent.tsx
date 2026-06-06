"use client";

import { Link } from "../../../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../../../_components/SurfaceMathToggleRow";
import { RecipeTitleWithMeta } from "../../../../../../../_components/RecipeTitleWithMeta";
import { Accordion, SizableText, YStack } from "tamagui";

import type { WaterMashPageModel } from "../_hooks/useWaterMashPage";
import { WaterMashAdjustmentSection } from "./sections/WaterMashAdjustmentSection";
import { WaterMashGristSection } from "./sections/WaterMashGristSection";
import { WaterMashAcidificationSection } from "./sections/WaterMashAcidificationSection";
import { WaterMashSaltsSection } from "./sections/WaterMashSaltsSection";
import { WaterMashOverallSection } from "./sections/WaterMashOverallSection";
import { WaterMashMashStepsSection } from "./sections/WaterMashMashStepsSection";

export function WaterMashPageContent({ model }: { model: WaterMashPageModel }) {
  const {
    t,
    tWater,
    authState,
    recipeId,
    loadRecipeMeta,
    me,
    openMashSections,
    setOpenMashSections,
    surfaceMath,
    setSurfaceMath,
    savingError,
    settingsError,
    admin,
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
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("goToSparge")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>{tWater("viewEditGrist")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <YStack gap="$4">
        <Accordion
          type="multiple"
          value={openMashSections}
          onValueChange={(next) =>
            setOpenMashSections(Array.isArray(next) ? next : next ? [next] : [])
          }
        >
          <WaterMashAdjustmentSection model={model} />
          <WaterMashGristSection model={model} />
          <WaterMashAcidificationSection model={model} />
          <WaterMashSaltsSection model={model} />
          <WaterMashOverallSection model={model} />
          <WaterMashMashStepsSection model={model} />
        </Accordion>

        {savingError ? (
          <ErrorBox mt="$3">{savingError}</ErrorBox>
        ) : null}
        {settingsError ? (
          <ErrorBox mt="$3">{settingsError}</ErrorBox>
        ) : null}

        {!admin ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Only <code>owner</code> and <code>brewery_admin</code> can manage water profiles. Current role:{" "}
            <code>{me?.role ?? "—"}</code>
          </SizableText>
        ) : null}
      </YStack>
    </>
  );
}
