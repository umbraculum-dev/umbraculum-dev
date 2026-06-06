import {Input, SizableText, View, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
  RecipeEditSummary,
} from "../../../../../../_components/recipe-edit";
import type {GristRow} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesRowMash({
  model,
  row,
}: {
  model: RecipeEditPageModel;
  row: GristRow;
}) {
  const {updateGristRow, isRoastedLike, inferDehuskedFromName} = model;

  return (
    <View flexBasis="100%" w="100%">
      <details>
        <RecipeEditSummary>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            Mash pH model (v1) – Advanced users
          </SizableText>
        </RecipeEditSummary>
        <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
          {isRoastedLike(row) ? (
            <>
              <YStack gap="$1" w={220} maxW="100%">
                <RecipeEditFieldLabel>Dehusked/de-bittered</RecipeEditFieldLabel>
                <RecipeEditReadOnlyValue>
                  {typeof row.mashRoastDehuskedOverride === "boolean"
                    ? row.mashRoastDehuskedOverride
                      ? "yes"
                      : "no"
                    : row.mashRoastDehuskedSource === "inferred"
                      ? inferDehuskedFromName(row.name)
                        ? "yes"
                        : "no"
                      : ""}
                </RecipeEditReadOnlyValue>
              </YStack>
              <YStack gap="$1" w={260} maxW="100%">
                <RecipeEditFieldLabel htmlFor={`grist-roast-dehusked-override-${row.id}`}>
                  Override
                </RecipeEditFieldLabel>
                <BrewSelect
                  id={`grist-roast-dehusked-override-${row.id}`}
                  value={
                    typeof row.mashRoastDehuskedOverride === "boolean"
                      ? row.mashRoastDehuskedOverride
                        ? "force_dehusked"
                        : "force_husked"
                      : "auto"
                  }
                  onValueChange={(v) => {
                    if (v === "auto") {
                      updateGristRow(row.id, {
                        mashRoastDehuskedOverride: null,
                        mashRoastDehuskedSource: "unknown",
                      });
                    } else if (v === "force_husked") {
                      updateGristRow(row.id, {
                        mashRoastDehuskedOverride: false,
                        mashRoastDehuskedSource: "override",
                      });
                    } else if (v === "force_dehusked") {
                      updateGristRow(row.id, {
                        mashRoastDehuskedOverride: true,
                        mashRoastDehuskedSource: "override",
                      });
                    }
                  }}
                  options={[
                    { value: "auto", label: "Auto (detect)" },
                    { value: "force_husked", label: "Force husked" },
                    { value: "force_dehusked", label: "Force dehusked/de-bittered" },
                  ]}
                  width="full"
                />
              </YStack>
              <YStack gap="$1" w={200} maxW="100%">
                <RecipeEditFieldLabel>Dehusked source</RecipeEditFieldLabel>
                <RecipeEditReadOnlyValue>{row.mashRoastDehuskedSource ?? "unknown"}</RecipeEditReadOnlyValue>
              </YStack>
            </>
          ) : null}
          <YStack gap="$1" w={240} maxW="100%">
            <RecipeEditFieldLabel htmlFor={`grist-mash-di-ph-${row.id}`}>
              DI mash pH (room temp)
            </RecipeEditFieldLabel>
            <Input
              id={`grist-mash-di-ph-${row.id}`}
              value={row.mashDiPh ?? ""}
              onChangeText={(text) =>
                updateGristRow(row.id, {
                  mashDiPh: text === "" ? null : Number(text),
                  mashPhModelSource: "override",
                })
              }
              keyboardType="decimal-pad"
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
          <YStack gap="$1" w={280} maxW="100%">
            <RecipeEditFieldLabel htmlFor={`grist-mash-ta-${row.id}`}>
              Titratable acidity to pH 5.7 (mEq/kg)
            </RecipeEditFieldLabel>
            <Input
              id={`grist-mash-ta-${row.id}`}
              value={row.mashTaToPh57_mEqPerKg ?? ""}
              onChangeText={(text) =>
                updateGristRow(row.id, {
                  mashTaToPh57_mEqPerKg: text === "" ? null : Number(text),
                  mashPhModelSource: "override",
                })
              }
              keyboardType="decimal-pad"
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
          <YStack gap="$1" w={200} maxW="100%">
            <RecipeEditFieldLabel>Source</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{row.mashPhModelSource ?? "unknown"}</RecipeEditReadOnlyValue>
          </YStack>
        </XStack>
      </details>
    </View>
  );
}
