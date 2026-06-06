import {Link} from "../../../../../../src/i18n/navigation";
import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../_components/BrewSelect";
import {RecipeEditFieldLabel, RecipeEditIngredientCard, RecipeEditReadOnlyValue} from "../../../../../_components/recipe-edit";
import type {HopRow, HopUse} from "../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditHopsRows({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tHops,
    tUnits,
    saving,
    hopsRows,
    canCallAccountScoped,
    onSave,
    addHopRow,
    removeHopRow,
    updateHopRow,
  } = model;

  return (
    <>
            <XStack gap="$3" items="center" mt="$3">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => addHopRow()}
                disabled={!canCallAccountScoped}
              >
                Add hop
              </Button>
            </XStack>

            {hopsRows.length ? (
              <View overflowX="auto" mt="$3">
                <YStack gap="$3">
                  {hopsRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={280} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`hop-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`hop-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateHopRow(r.id, { name: text, ingredientId: null, country: null })
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
                                  {(r.country ?? "") ? (
                                    <YStack gap="$1" w={240} maxW="100%">
                                      <RecipeEditFieldLabel>Country</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.country}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeHopRow(r.id)}
                                    aria-label={`Remove hop row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`hop-g-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("g") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-g-${r.id}`}
                                    value={String(r.amountGrams)}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { amountGrams: text === "" ? 0 : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={120}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-aa-${r.id}`}>Alpha (%)</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-aa-${r.id}`}
                                    value={r.alphaAcidPercent ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, {
                                        alphaAcidPercent: text === "" ? null : Number(text),
                                      })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={170}>
                                  <RecipeEditFieldLabel htmlFor={`hop-form-${r.id}`}>{tHops("typeLabel")}</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-form-${r.id}`}
                                    value={r.form ?? "pellet"}
                                    onValueChange={(v) =>
                                      updateHopRow(r.id, {
                                        form: v as NonNullable<HopRow["form"]>,
                                      })
                                    }
                                    options={[
                                      { value: "pellet", label: tHops("typeOptions.pellet") },
                                      { value: "leaf", label: tHops("typeOptions.leaf") },
                                      { value: "leaf (wet)", label: tHops("typeOptions.leafWet") },
                                      { value: "powder", label: tHops("typeOptions.powder") },
                                      { value: "extract", label: tHops("typeOptions.extract") },
                                      { value: "hop_extract", label: tHops("typeOptions.hopExtract") },
                                      { value: "plug", label: tHops("typeOptions.plug") },
                                      { value: "debittered_leaf", label: tHops("typeOptions.debitteredLeaf") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={130}>
                                  <RecipeEditFieldLabel htmlFor={`hop-use-${r.id}`}>Use</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-use-${r.id}`}
                                    value={r.use}
                                    onValueChange={(v) => updateHopRow(r.id, { use: v as HopUse })}
                                    options={[
                                      { value: "boil", label: "Boil" },
                                      { value: "whirlpool", label: "Whirlpool" },
                                      { value: "dryhop", label: "Dry hop" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-min-${r.id}`}>{tHops("timeBeforeEndOfBoilMin")}</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-min-${r.id}`}
                                    value={r.timeMinutes ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No hops yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={() => { void onSave(); }}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including hops)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
    </>
  );
}
