"use client";

import { Input, YStack } from "tamagui";

import { BrewSelect } from "../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
} from "../../../../../_components/recipe-edit";
import { type EditorYeastRow } from "../../_lib/beerjsonRecipe";
import { type YeastEditorRowContext } from "./yeastEditorTypes";

type YeastEditorRowIdentityProps = {
  row: EditorYeastRow;
  ctx: YeastEditorRowContext;
  variant: "primary" | "advanced";
};

export function YeastEditorRowIdentity(props: YeastEditorRowIdentityProps) {
  const { row: r, ctx, variant } = props;
  const { onUpdateRow, t } = ctx;

  if (variant === "primary") {
    return (
      <>
        <YStack gap="$1" flex={1} minW={200}>
          <RecipeEditFieldLabel htmlFor={!r.name ? `yeast-name-${r.id}` : undefined}>
            {t("yeastNameLabel")}
          </RecipeEditFieldLabel>
          {r.name ? (
            <RecipeEditReadOnlyValue>{r.name}</RecipeEditReadOnlyValue>
          ) : (
            <Input
              id={`yeast-name-${r.id}`}
              value={r.name}
              onChangeText={(text) =>
                onUpdateRow(r.id, {
                  name: text,
                  ingredientId: null,
                  lab: null,
                  productId: null,
                  attenuationMin: null,
                  attenuationMax: null,
                })
              }
              placeholder={t("yeastCustomNamePlaceholder")}
              autoComplete="off"
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          )}
        </YStack>
        {(r.lab ?? "") ? (
          <YStack gap="$1" minW={120}>
            <RecipeEditFieldLabel>{t("yeastLabLabel")}</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
          </YStack>
        ) : null}
        {(r.productId ?? "") ? (
          <YStack gap="$1" minW={100}>
            <RecipeEditFieldLabel>{t("yeastProductIdLabel")}</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
          </YStack>
        ) : null}
      </>
    );
  }

  return (
    <>
      <YStack gap="$1" minW={200}>
        <RecipeEditFieldLabel htmlFor={`yeast-species-${r.id}`}>
          {t("yeastSpeciesLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`yeast-species-${r.id}`}
          value={
            r.species === "saccharomyces_cerevisiae" ||
            r.species === "saccharomyces_pastorianus" ||
            r.species === "brettanomyces" ||
            r.species === "diastaticus" ||
            r.species === "other"
              ? r.species
              : ""
          }
          onValueChange={(v) =>
            onUpdateRow(r.id, {
              species:
                v === "saccharomyces_cerevisiae" ||
                v === "saccharomyces_pastorianus" ||
                v === "brettanomyces" ||
                v === "diastaticus" ||
                v === "other"
                  ? v
                  : null,
            })
          }
          options={[
            { value: "", label: "—" },
            { value: "saccharomyces_cerevisiae", label: t("yeastSpeciesSaccharomycesCerevisiae") },
            { value: "saccharomyces_pastorianus", label: t("yeastSpeciesSaccharomycesPastorianus") },
            { value: "brettanomyces", label: t("yeastSpeciesBrettanomyces") },
            { value: "diastaticus", label: t("yeastSpeciesDiastaticus") },
            { value: "other", label: t("yeastSpeciesOther") },
          ]}
          placeholder="—"
        />
      </YStack>
      <YStack gap="$1" minW={140}>
        <RecipeEditFieldLabel htmlFor={`yeast-needs-propagation-${r.id}`}>
          {t("yeastNeedsPropagationLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`yeast-needs-propagation-${r.id}`}
          value={r.needsPropagation === "yes" || r.needsPropagation === "no" ? r.needsPropagation : ""}
          onValueChange={(v) =>
            onUpdateRow(r.id, {
              needsPropagation: v === "yes" || v === "no" ? v : null,
            })
          }
          options={[
            { value: "yes", label: t("yeastNeedsPropagationYes") },
            { value: "no", label: t("yeastNeedsPropagationNo") },
          ]}
          placeholder="—"
        />
      </YStack>
    </>
  );
}
