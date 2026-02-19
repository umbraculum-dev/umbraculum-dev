"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../../src/i18n/navigation";
import { NavSheet } from "../../_components/NavSheet";

export interface RecipeEditSection {
  id: string;
  label: string;
}

export interface RecipeEditSectionsNavProps {
  sections: readonly RecipeEditSection[];
  recipeId: string;
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
      <ul className="recipeEditNavList">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="recipeEditNavLink">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <hr className="recipeEditDivider" suppressHydrationWarning />
      <ul className="recipeEditNavList">
        <li>
          <Link href={`/recipes/${recipeId}/water`} className="recipeEditNavLink recipeEditNavLink--secondary">
            {t("nav.openWaterCalculator")}
          </Link>
        </li>
        <li>
          <Link href="/recipes" className="recipeEditNavLink recipeEditNavLink--secondary">
            {t("nav.backToRecipes")}
          </Link>
        </li>
      </ul>
    </>
  );
}

export function RecipeEditSectionsNav({ sections, recipeId }: RecipeEditSectionsNavProps) {
  const t = useTranslations("recipes.edit");

  const navContent = (
    <nav aria-label={t("nav.sectionsAriaLabel")} className="panel recipeEditSidebar">
      <p className="muted" style={{ marginTop: 0 }}>
        {t("nav.sectionsTitle")}
      </p>
      <SectionsNavContent sections={sections} recipeId={recipeId} t={t} />
    </nav>
  );

  return (
    <NavSheet triggerLabel={t("nav.sectionsTitle")} ariaLabel={t("nav.sectionsAriaLabel")} triggerVariant="text">
      {navContent}
    </NavSheet>
  );
}
