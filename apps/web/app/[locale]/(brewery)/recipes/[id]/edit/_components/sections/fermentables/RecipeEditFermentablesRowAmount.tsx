import {Input, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../../../../_components/BrewSelect";
import {RecipeEditFieldLabel} from "../../../../../../../../_components/recipe-edit";
import type {GristMaltClass, GristPotentialKind, GristRow} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesRowAmount({
  model,
  row,
}: {
  model: RecipeEditPageModel;
  row: GristRow;
}) {
  const {t, tUnits, roundTo, updateGristRow} = model;

  return (
    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel htmlFor={`grist-kg-${row.id}`}>
          {t("amountLabel", { unit: tUnits("kg") })}
        </RecipeEditFieldLabel>
        <Input
          id={`grist-kg-${row.id}`}
          value={String(row.amountKg)}
          onChangeText={(text) =>
            updateGristRow(row.id, { amountKg: text === "" ? 0 : Number(text) })
          }
          keyboardType="decimal-pad"
          size="$3"
          w={140}
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </YStack>

      <YStack gap="$1" minW={80}>
        <RecipeEditFieldLabel htmlFor={`grist-lov-${row.id}`}>
          {t("colorLabel", { unit: tUnits("lovibond") })}
        </RecipeEditFieldLabel>
        <Input
          id={`grist-lov-${row.id}`}
          value={row.colorLovibond ?? ""}
          onChangeText={(text) =>
            updateGristRow(row.id, {
              colorLovibond: text === "" ? null : Number(text),
            })
          }
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

      <YStack gap="$1" minW={140}>
        <RecipeEditFieldLabel htmlFor={`grist-class-${row.id}`}>
          Mash pH class (legacy)
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`grist-class-${row.id}`}
          value={row.maltClass}
          onValueChange={(v) => updateGristRow(row.id, { maltClass: v as GristMaltClass })}
          options={[
            { value: "base", label: "Base" },
            { value: "crystal", label: "Crystal" },
            { value: "roast", label: "Roast" },
            { value: "acid", label: "Acid malt" },
          ]}
        />
      </YStack>

      <YStack gap="$1" minW={140}>
        <RecipeEditFieldLabel htmlFor={`grist-timing-${row.id}`}>
          {t("fermentableTimingLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`grist-timing-${row.id}`}
          value={row.timingUse ?? "add_to_mash"}
          onValueChange={(v) =>
            updateGristRow(row.id, {
              timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash",
            })
          }
          options={[
            { value: "add_to_mash", label: t("fermentableTimingMash") },
            { value: "add_to_boil", label: t("fermentableTimingKettle") },
          ]}
        />
      </YStack>

      <YStack gap="$1" minW={140}>
        <RecipeEditFieldLabel htmlFor={`grist-late-${row.id}`}>
          {t("fermentableLateAdditionLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`grist-late-${row.id}`}
          value={row.lateAddition === true ? "yes" : "no"}
          onValueChange={(v) =>
            updateGristRow(row.id, { lateAddition: v === "yes" })
          }
          options={[
            { value: "no", label: t("fermentableLateAdditionNo") },
            { value: "yes", label: t("fermentableLateAdditionYes") },
          ]}
        />
      </YStack>

      <YStack gap="$1" minW={140}>
        <RecipeEditFieldLabel htmlFor={`grist-pot-kind-${row.id}`}>
          Potential kind
        </RecipeEditFieldLabel>
        <BrewSelect
          id={`grist-pot-kind-${row.id}`}
          value={row.potential?.kind ?? ""}
          onValueChange={(v) => {
            const kind = v as GristPotentialKind | "";
            if (!kind) return updateGristRow(row.id, { potential: null });
            updateGristRow(row.id, {
              potential: { kind, value: roundTo(row.potential?.value ?? 0, 3) },
            });
          }}
          options={[
            { value: "", label: "(none)" },
            { value: "ppg", label: "PPG" },
            { value: "yieldPercent", label: "Yield %" },
            { value: "sg", label: "SG (e.g. 1.037)" },
            { value: "plato", label: "Plato (°P)" },
          ]}
        />
      </YStack>

      <YStack gap="$1" minW={100}>
        <RecipeEditFieldLabel htmlFor={`grist-pot-val-${row.id}`}>
          Potential value
        </RecipeEditFieldLabel>
        <Input
          id={`grist-pot-val-${row.id}`}
          value={row.potential ? String(roundTo(row.potential.value, 3)) : ""}
          onChangeText={(text) => {
            const v = text === "" ? null : Number(text);
            if (!row.potential) return;
            if (v === null) return updateGristRow(row.id, { potential: null });
            updateGristRow(row.id, { potential: { ...row.potential, value: roundTo(v, 3) } });
          }}
          disabled={!row.potential}
          keyboardType="decimal-pad"
          size="$3"
          w={140}
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </YStack>
    </XStack>
  );
}
