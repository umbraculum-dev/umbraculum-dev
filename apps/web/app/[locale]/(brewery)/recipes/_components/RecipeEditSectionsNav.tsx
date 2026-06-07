"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../../../../src/i18n/navigation";
import { SizableText, useMedia, XStack, YStack } from "tamagui";

import { NavSheet } from "../../../../_shared-layout/_components/NavSheet";

export interface RecipeEditSection {
  id: string;
  label: string;
}

export interface RecipeEditSectionsNavProps {
  sections: readonly RecipeEditSection[];
  recipeId: string;
  layoutMode?: "rail" | "sheet";
  railLeftPx?: number | null;
  railTopPx?: number | null;
}

function SectionsNavContent({
  sections,
  recipeId,
  t,
}: {
  sections: readonly RecipeEditSection[];
  recipeId: string;
  t: (key: string) => string;
}) {
  return (
    <>
      <YStack gap="$1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="brew-link-contents"
          >
            <XStack
              display="block"
              width="100%"
              p="$2.5"
              borderRadius="$2"
              color="var(--text)"
              backgroundColor="transparent"
              textDecoration="none"
              cursor="pointer"
              hoverStyle={{
                textDecoration: "none",
                background: "color-mix(in srgb, var(--info) 10%, var(--surface-2))",
              }}
              focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
            >
              <SizableText size="$3" color="var(--text)" fontFamily="$body">
                {s.label}
              </SizableText>
            </XStack>
          </a>
        ))}
      </YStack>
      <XStack
        height={1}
        backgroundColor="var(--border)"
        my="$3"
        border={0}
      />
      <YStack gap="$1">
        <Link href={`/recipes/${recipeId}/water`} className="brew-link-contents">
          <XStack
            display="block"
            width="100%"
            p="$2.5"
            borderRadius="$2"
            color="var(--text-muted)"
            backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)"
            textDecoration="none"
            cursor="pointer"
            hoverStyle={{
              textDecoration: "none",
              color: "var(--text)",
            }}
            focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
          >
            <SizableText size="$3" color="inherit" fontFamily="$body">
              {t("nav.openWaterCalculator")}
            </SizableText>
          </XStack>
        </Link>
        <Link href={`/recipes/${recipeId}/yeast`} className="brew-link-contents">
          <XStack
            display="block"
            width="100%"
            p="$2.5"
            borderRadius="$2"
            color="var(--text-muted)"
            backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)"
            textDecoration="none"
            cursor="pointer"
            hoverStyle={{
              textDecoration: "none",
              color: "var(--text)",
            }}
            focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
          >
            <SizableText size="$3" color="inherit" fontFamily="$body">
              {t("nav.editYeast")}
            </SizableText>
          </XStack>
        </Link>
        <Link href="/recipes" className="brew-link-contents">
          <XStack
            display="block"
            width="100%"
            p="$2.5"
            borderRadius="$2"
            color="var(--text-muted)"
            backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)"
            textDecoration="none"
            cursor="pointer"
            hoverStyle={{
              textDecoration: "none",
              color: "var(--text)",
            }}
            focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
          >
            <SizableText size="$3" color="inherit" fontFamily="$body">
              {t("nav.backToRecipes")}
            </SizableText>
          </XStack>
        </Link>
      </YStack>
    </>
  );
}

const DESKTOP_RAIL_WIDTH_PX = 240;
const DESKTOP_RAIL_SHIFT_PX = 256; // 240 rail + 16 gap

export function RecipeEditSectionsNav({
  sections,
  recipeId,
  layoutMode,
  railLeftPx,
  railTopPx,
}: RecipeEditSectionsNavProps) {
  const t = useTranslations("recipes.edit");
  const media = useMedia();
  const narrow = media.narrow;

  const navContent = (
    <nav aria-label={t("nav.sectionsAriaLabel")}>
      <YStack
        backgroundColor="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        borderRadius="var(--radius)"
        padding="var(--panel-padding)"
      >
        <SizableText
          size="$2"
          color="var(--text-muted)"
          fontFamily="$body"
          marginTop={0}
          marginBottom="$2"
        >
          {t("nav.sectionsTitle")}
        </SizableText>
        <SectionsNavContent sections={sections} recipeId={recipeId} t={t} />
      </YStack>
    </nav>
  );

  const navSheet = (
    <NavSheet
      mode="sheet"
      triggerLabel={t("nav.sectionsTitle")}
      ariaLabel={t("nav.sectionsAriaLabel")}
      triggerVariant="text"
    >
      {navContent}
    </NavSheet>
  );

  const resolvedMode: "rail" | "sheet" = narrow ? "sheet" : (layoutMode ?? "sheet");

  if (resolvedMode === "rail") {
    const left = typeof railLeftPx === "number" ? railLeftPx - DESKTOP_RAIL_SHIFT_PX : null;
    const top = typeof railTopPx === "number" ? railTopPx : 16;

    if (typeof left !== "number") {
      // If we can't compute an exact gutter position, fall back to sheet mode.
      return (
        <YStack position="fixed" top={16} right={16} zIndex={1000}>
          {navSheet}
        </YStack>
      );
    }

    return (
      <YStack
        position="fixed"
        top={Math.max(top, 16)}
        left={left}
        width={DESKTOP_RAIL_WIDTH_PX}
        maxHeight="calc(100vh - 32px)"
        overflow="auto"
        zIndex={10}
      >
        {navContent}
      </YStack>
    );
  }

  // Sheet-style access (button + sheet), rendered in-flow by the caller.
  return <XStack jc="flex-start">{navSheet}</XStack>;
}
