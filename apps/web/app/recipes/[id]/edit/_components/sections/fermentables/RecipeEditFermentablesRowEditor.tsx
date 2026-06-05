import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSummary,
} from "../../../../../../_components/recipe-edit";
import type {GristMaltClass, GristPotentialKind, GristRow} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesRowEditor({
  model,
  row,
  idx,
}: {
  model: RecipeEditPageModel;
  row: GristRow;
  idx: number;
}) {
  const {
    t,
    tUnits,
    roundTo,
    updateGristRow,
    removeGristRow,
    isRoastedLike,
    inferDehuskedFromName,
  } = model;

  return (
    <RecipeEditIngredientCard>
      <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
        <View alignSelf="center">
          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
            {idx + 1}
          </SizableText>
        </View>
        <YStack gap="$1" flex={1} minW={240} minWidth={0}>
          <RecipeEditFieldLabel htmlFor={`grist-name-${row.id}`}>Name</RecipeEditFieldLabel>
          <Input
            id={`grist-name-${row.id}`}
            value={row.name}
            onChangeText={(text) =>
              updateGristRow(row.id, {
                name: text,
                ingredientId: null,
                producer: null,
                group: null,
                mashDiPh: null,
                mashTaToPh57_mEqPerKg: null,
                mashRoastDehuskedOverride: null,
                mashRoastDehuskedSource: "unknown",
                mashPhModelSource: "unknown",
              })
            }
            autoComplete="off"
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        {(row.producer ?? "") ? (
          <YStack gap="$1" minW={100}>
            <RecipeEditFieldLabel>Producer</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{row.producer}</RecipeEditReadOnlyValue>
          </YStack>
        ) : null}
        {(row.group ?? "") ? (
          <YStack gap="$1" minW={100}>
            <RecipeEditFieldLabel>Group</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{row.group}</RecipeEditReadOnlyValue>
          </YStack>
        ) : null}
        <Button
          size="$2"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => removeGristRow(row.id)}
          aria-label={`Remove fermentable row ${idx + 1}`}
        >
          Remove
        </Button>
      </XStack>

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
      </XStack>
    </RecipeEditIngredientCard>
  );
}
