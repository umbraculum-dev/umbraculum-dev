"use client";

import { Link } from "../../../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../../../_components/SurfaceMathToggleRow";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import { H1, SizableText, YStack } from "tamagui";

import type { WaterBoilPageModel } from "../_hooks/useWaterBoilPage";
import { WaterBoilAdjustmentSection } from "./sections/WaterBoilAdjustmentSection";
import { WaterBoilSaltsSection } from "./sections/WaterBoilSaltsSection";
import { WaterBoilAcidificationSection } from "./sections/WaterBoilAcidificationSection";

export function WaterBoilPageContent({ model }: { model: WaterBoilPageModel }) {
  const {
    t,
    tWater,
    locale,
    recipeId,
    loadRecipeMeta,
    authed,
    authChecked,
    canCall,
    surfaceMath,
    setSurfaceMath,
    settingsError,
    savingError,
  } = model;

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} loadRecipeMeta={loadRecipeMeta} />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/boil`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <WaterBoilAdjustmentSection model={model} />
        <WaterBoilSaltsSection model={model} />
        <WaterBoilAcidificationSection model={model} />

        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}
