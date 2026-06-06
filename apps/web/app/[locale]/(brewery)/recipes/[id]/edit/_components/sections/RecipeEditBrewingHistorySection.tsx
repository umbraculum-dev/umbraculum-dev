import {Link} from "../../../../../../../../src/i18n/navigation";
import {SizableText, YStack} from "tamagui";

import {RecipeEditFieldBlock, RecipeEditList, RecipeEditSection} from "../../../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditBrewingHistorySection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    locale,
    recipeId,
    openSections,
    setSectionOpen,
    brewSessionsLoading,
    programmedSessions,
    brewingNowSessions,
    lastBrewSessions
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="brewingHistory"
            headingId="brewing-history-heading"
            label={t("sections.brewingHistory")}
            open={openSections['brewingHistory']}
            onOpenChange={(open) => setSectionOpen("brewingHistory", open)}
          >
            <YStack gap="$2" mt="$2">
              {brewingNowSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="inProgress" header={t("brewingNowLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {brewingNowSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {programmedSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="programmed" header={t("programmedSectionLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {programmedSessions.map((s) => {
                      const displayDate = s.scheduledDate
                        ? new Date(s.scheduledDate).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {lastBrewSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="computed" header={t("lastBrewedLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {lastBrewSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {brewSessionsLoading ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("lastBrewedLoading")}
                </SizableText>
              ) : programmedSessions.length === 0 && lastBrewSessions.length === 0 && brewingNowSessions.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("brewingHistoryEmpty")}
                </SizableText>
              ) : null}
            </YStack>
          </RecipeEditSection>
  );
}
