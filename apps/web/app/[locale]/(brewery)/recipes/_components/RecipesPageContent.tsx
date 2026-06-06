"use client";

import { Link } from "../../../../../src/i18n/navigation";
import { AskAiLink } from "../../../../_shell/_components/AskAiLink";
import { BrewAccordionSection } from "../../_components/BrewAccordionSection";
import { Accordion, H1, SizableText, YStack } from "tamagui";

import type { useRecipesPage } from "../_hooks/useRecipesPage";
import { RecipesCreateSection } from "./sections/RecipesCreateSection";
import { RecipesExportSection } from "./sections/RecipesExportSection";
import { RecipesListSection } from "./sections/RecipesListSection";

type RecipesPageModel = ReturnType<typeof useRecipesPage>;

export function RecipesPageContent({ model }: { model: RecipesPageModel }) {
  const { t, tImport, openSections, setOpenSections } = model;

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" mb="$2">
        <AskAiLink fromRoute="recipes" />
      </SizableText>

      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <RecipesCreateSection model={model} />

          <BrewAccordionSection
            value="import"
            headingId="recipes-import-heading"
            title={tImport("title")}
            open={openSections.includes("import")}
            spaced
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tImport("subtitle")}
            </SizableText>
            <SizableText size="$2" fontFamily="$body" mb={0}>
              <Link href="/recipes/import">{tImport("cta")}</Link>
            </SizableText>
          </BrewAccordionSection>

          <RecipesListSection model={model} />
          <RecipesExportSection model={model} />
        </Accordion>
      </YStack>
    </YStack>
  );
}
