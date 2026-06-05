"use client";

import { Link } from "../../../../../../src/i18n/navigation";
import { Button, SizableText, XStack } from "tamagui";

import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import { ErrorBox } from "../../../../../_components/recipe-edit";
import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubStatusSection({ model }: { model: UseWaterHubPageModel }) {
  const {
    t,
    recipeId,
    authState,
    openSections,
    summary,
    fmt,
    loading,
    error,
    profiles,
    refresh,
  } = model;

  return (
    <BrewAccordionSection
      value="status"
      headingId="water-hub-status"
      title={t("quickStatus")}
      open={openSections.includes("status")}
      spaced
    >
      <ul className="brew-recipe-edit-list-disc brew-list-mt0">
        <li>
          <SizableText size="$2" fontFamily="$body">
            {t("mashAcidMode")}: <code>{summary?.status.mashAcidificationMode ?? "—"}</code>
          </SizableText>
        </li>
        <li>
          <SizableText size="$2" fontFamily="$body">
            {t("spargeAcidMode")}: <code>{summary?.status.spargeAcidificationMode ?? "—"}</code>
          </SizableText>
        </li>
        <li>
          <SizableText size="$2" fontFamily="$body">
            {t("mashOverallSnapshot")}:{" "}
            {summary?.status.mashOverallSnapshot ? (
              <>
                pH ({summary.status.mashOverallSnapshot.ph.kind}) <code>{fmt("pH", summary.status.mashOverallSnapshot.ph.value, 2)}</code> · Final alkalinity{" "}
                <code>{fmt("ppm_as_CaCO3", summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 0)}</code>
              </>
            ) : (
              <SizableText color="var(--text-muted)">—</SizableText>
            )}
            {" · "}
            <Link href={`/recipes/${recipeId}/water/mash#overall-mash-water-result`}>{t("openMashOverall")}</Link>
          </SizableText>
        </li>
      </ul>

      <XStack gap="$3" alignItems="center">
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refresh()} disabled={authState.status !== "ready" || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
          {profiles ? t("profilesLoaded") : t("profilesNotLoaded")}
        </SizableText>
      </XStack>

      {error ? (
        <ErrorBox mt="$3">{error}</ErrorBox>
      ) : null}
    </BrewAccordionSection>
  );
}
