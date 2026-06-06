"use client";

import { Link } from "../../../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { RecipeTitleWithMeta } from "../../../../../_components/RecipeTitleWithMeta";
import { Accordion, SizableText, YStack } from "tamagui";

import type { WaterSpargePageModel } from "../_hooks/useWaterSpargePage";
import { WaterSpargeConfigSection } from "./sections/WaterSpargeConfigSection";
import { WaterSpargeAcidificationSection } from "./sections/WaterSpargeAcidificationSection";
import { WaterSpargeSaltsSection } from "./sections/WaterSpargeSaltsSection";

export function WaterSpargePageContent({ model }: { model: WaterSpargePageModel }) {
  const {
    t,
    tWater,
    locale,
    recipeId,
    loadRecipeMeta,
    authed,
    authChecked,
    canCall,
    openSpargeSections,
    setOpenSpargeSections,
    surfaceMath,
    setSurfaceMath,
    profilesError,
    settingsError,
    savingError,
  } = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={t("title")}
        recipeId={recipeId}
        enabled={authed}
        loadRecipeMeta={loadRecipeMeta}
      />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("goToMash")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/sparge`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <Accordion
          type="multiple"
          value={openSpargeSections}
          onValueChange={(next) => setOpenSpargeSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <WaterSpargeConfigSection model={model} />
          <WaterSpargeAcidificationSection model={model} />
          <WaterSpargeSaltsSection model={model} />
        </Accordion>

        {profilesError ? <ErrorBox>{profilesError}</ErrorBox> : null}
        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}
