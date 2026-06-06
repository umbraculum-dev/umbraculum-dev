"use client";

import { Link } from "../../../../../../../src/i18n/navigation";
import { Accordion, H1, SizableText, YStack } from "tamagui";

import { SurfaceMathToggleRow } from "../../../../_components/SurfaceMathToggleRow";
import { ErrorBox } from "../../../../_components/recipe-edit";
import { RecipeMetaLine } from "@umbraculum/brewery-recipes-ui";
import type { UseWaterHubPageModel } from "../_hooks/useWaterHubPage";
import { WaterHubLinksSection } from "./sections/WaterHubLinksSection";
import { WaterHubStatusSection } from "./sections/WaterHubStatusSection";
import { WaterHubRecapSection } from "./sections/WaterHubRecapSection";
import { WaterHubFinalRecapSection } from "./sections/WaterHubFinalRecapSection";
import { WaterHubAlkVsBicarbSection } from "./sections/WaterHubAlkVsBicarbSection";

export function WaterHubPageContent({ model }: { model: UseWaterHubPageModel }) {
  const {
    t,
    recipeId,
    authState,
    loadRecipeMeta,
    surfaceMath,
    setSurfaceMath,
    openSections,
    setOpenSections,
  } = model;

  return (
    <>
      <YStack width="100%" gap="$1" mb="$2">
        <H1 mt={0} mb={0}>{t("title")}</H1>
        <RecipeMetaLine
          recipeId={recipeId}
          enabled={authState.status === "ready"}
          loadRecipeMeta={loadRecipeMeta}
        />
        <SizableText size="$2" fontFamily="$body" mt={0} mb={0} display="block">
          <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEditor")}</Link>
        </SizableText>
      </YStack>

      <SurfaceMathToggleRow
        left={null}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
      >
        <WaterHubLinksSection model={model} />
        <WaterHubStatusSection model={model} />
        <WaterHubRecapSection model={model} />
        <WaterHubFinalRecapSection model={model} />
        <WaterHubAlkVsBicarbSection model={model} />
      </Accordion>
    </>
  );
}
