"use client";

import { Input, YStack } from "tamagui";

import { BrewSelect } from "../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
} from "../../../../../_components/recipe-edit";
import { type EditorYeastRow } from "../../_lib/beerjsonRecipe";
import { roundTo, type YeastEditorRowContext } from "./yeastEditorTypes";

type YeastEditorRowAttenuationProps = {
  row: EditorYeastRow;
  ctx: YeastEditorRowContext;
};

export function YeastEditorRowAttenuation(props: YeastEditorRowAttenuationProps) {
  const { row: r, ctx } = props;
  const { yeastAttenuationOverrides, onUpdateRow, onAttenuationOverrideChange, t, tAnalysis, tUnits } =
    ctx;

  return (
    <>
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel>{t("yeastAttenMinLabel")}</RecipeEditFieldLabel>
        <RecipeEditReadOnlyValue>
          {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
        </RecipeEditReadOnlyValue>
      </YStack>
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel>{t("yeastAttenMaxLabel")}</RecipeEditFieldLabel>
        <RecipeEditReadOnlyValue>
          {typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
        </RecipeEditReadOnlyValue>
      </YStack>
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel htmlFor={`yeast-atten-override-${r.id}`}>
          {tAnalysis("customAttenuationPercentLabel")}
        </RecipeEditFieldLabel>
        <Input
          id={`yeast-atten-override-${r.id}`}
          value={yeastAttenuationOverrides[r.id] ?? ""}
          onChangeText={(text) => onAttenuationOverrideChange(r.id, text)}
          keyboardType="decimal-pad"
          size="$3"
          w={100}
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </YStack>
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel htmlFor={`yeast-fermentation-temp-${r.id}`}>
          {t("yeastFermentationTempLabel", { unit: tUnits("C") })}
        </RecipeEditFieldLabel>
        <Input
          id={`yeast-fermentation-temp-${r.id}`}
          value={
            r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
              ? String(r.fermentationTempC)
              : ""
          }
          onChangeText={(text) => {
            const trimmed = text.trim();
            const parsed = trimmed === "" ? null : Number(trimmed);
            onUpdateRow(r.id, {
              fermentationTempC:
                parsed != null && Number.isFinite(parsed) && parsed >= -10 && parsed <= 50
                  ? parsed
                  : null,
            });
          }}
          keyboardType="decimal-pad"
          size="$3"
          w={80}
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </YStack>
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel htmlFor={`yeast-diacetyl-rest-${r.id}`}>
          {t("yeastDiacetylRestLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`yeast-diacetyl-rest-${r.id}`}
          value={r.diacetylRest === "yes" || r.diacetylRest === "no" ? r.diacetylRest : ""}
          onValueChange={(v) =>
            onUpdateRow(r.id, {
              diacetylRest: v === "yes" || v === "no" ? v : null,
            })
          }
          options={[
            { value: "yes", label: t("yeastDiacetylRestYes") },
            { value: "no", label: t("yeastDiacetylRestNo") },
          ]}
          placeholder="—"
        />
      </YStack>
    </>
  );
}
