import {Link} from "../../../../../../src/i18n/navigation";
import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../_components/BrewSelect";
import {ErrorBox, RecipeEditFieldLabel, RecipeEditIngredientCard, RecipeEditReadOnlyValue, RecipeEditSection, RecipeEditSummary} from "../../../../../_components/recipe-edit";
import type {GristMaltClass, GristPotentialKind} from "../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tUnits,
    roundTo,
    openSections,
    setSectionOpen,
    saving,
    gristRows,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    fermentableSearching,
    fermentableSearchError,
    fermentableAddMessage,
    canCallAccountScoped,
    onSave,
    addGristRow,
    addFermentableFromDb,
    removeGristRow,
    updateGristRow,
    isRoastedLike,
    inferDehuskedFromName,
    onSearchFermentables,
    clearFermentableSearchResults,
    gristTotals
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="fermentables"
            headingId="fermentables-heading"
            label={t("sections.fermentables")}
            open={openSections['fermentables']}
            onOpenChange={(open) => setSectionOpen("fermentables", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              Enter your grist here. Water calculator can import a read-only snapshot.
            </SizableText>

            <View mt="$3">
              <form onSubmit={(...a) => { void onSearchFermentables(...(a as Parameters<typeof onSearchFermentables>)); }}>
                <RecipeEditFieldLabel htmlFor="fermentable-search">
                Search fermentables database
              </RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="fermentable-search"
                  value={fermentableQuery}
                  onChangeText={setFermentableQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || fermentableSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {fermentableSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  type="button"
                  onPress={clearFermentableSearchResults}
                  disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {fermentableSearchError ? (
                <ErrorBox mt="$2">{fermentableSearchError}</ErrorBox>
              ) : null}
              {fermentableResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={140}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Producer</SizableText></View>
                      <View minW={50} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">°L</SizableText></View>
                      <View minW={70} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">Yield %</SizableText></View>
                      <View minW={60} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">PPG</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {fermentableResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={140}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.producer ?? ""}</SizableText></View>
                        <View minW={50}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.colorLovibond === "number" ? it.colorLovibond.toFixed(1) : ""}</SizableText></View>
                        <View minW={70}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.yieldPercent === "number" ? it.yieldPercent.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.ppg === "number" ? it.ppg.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addFermentableFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                  </YStack>
                </View>
              ) : null}
              </form>
            </View>

            {fermentableAddMessage ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite" mt="$2">
                {fermentableAddMessage}
              </SizableText>
            ) : null}

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap" mt="$1">
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={addGristRow}
                  disabled={!canCallAccountScoped}
                >
                  {t("buttons.addCustomFermentable")}
                </Button>
              </XStack>
            </YStack>

            <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
              {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
              {gristTotals.weightedAvgLovibond !== null ? (
                <> · {t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}</>
              ) : null}
            </SizableText>

            {gristRows.length ? (
              <View overflowX="auto" mt="$2">
                <YStack gap="$3">
                  {gristRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={240} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`grist-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`grist-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateGristRow(r.id, {
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
                                  {(r.producer ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Producer</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.producer}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  {(r.group ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Group</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.group}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeGristRow(r.id)}
                                    aria-label={`Remove fermentable row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`grist-kg-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("kg") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-kg-${r.id}`}
                                    value={String(r.amountKg)}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, { amountKg: text === "" ? 0 : Number(text) })
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
                                  <RecipeEditFieldLabel htmlFor={`grist-lov-${r.id}`}>
                                    {t("colorLabel", { unit: tUnits("lovibond") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-lov-${r.id}`}
                                    value={r.colorLovibond ?? ""}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, {
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
                                  <RecipeEditFieldLabel htmlFor={`grist-class-${r.id}`}>
                                    Mash pH class (legacy)
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-class-${r.id}`}
                                    value={r.maltClass}
                                    onValueChange={(v) => updateGristRow(r.id, { maltClass: v as GristMaltClass })}
                                    options={[
                                      { value: "base", label: "Base" },
                                      { value: "crystal", label: "Crystal" },
                                      { value: "roast", label: "Roast" },
                                      { value: "acid", label: "Acid malt" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-timing-${r.id}`}>
                                    {t("fermentableTimingLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-timing-${r.id}`}
                                    value={r.timingUse ?? "add_to_mash"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, {
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
                                  <RecipeEditFieldLabel htmlFor={`grist-late-${r.id}`}>
                                    {t("fermentableLateAdditionLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-late-${r.id}`}
                                    value={r.lateAddition === true ? "yes" : "no"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, { lateAddition: v === "yes" })
                                    }
                                    options={[
                                      { value: "no", label: t("fermentableLateAdditionNo") },
                                      { value: "yes", label: t("fermentableLateAdditionYes") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-kind-${r.id}`}>
                                    Potential kind
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-pot-kind-${r.id}`}
                                    value={r.potential?.kind ?? ""}
                                    onValueChange={(v) => {
                                      const kind = v as GristPotentialKind | "";
                                      if (!kind) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, {
                                        potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) },
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
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-val-${r.id}`}>
                                    Potential value
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-pot-val-${r.id}`}
                                    value={r.potential ? String(roundTo(r.potential.value, 3)) : ""}
                                    onChangeText={(text) => {
                                      const v = text === "" ? null : Number(text);
                                      if (!r.potential) return;
                                      if (v === null) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, { potential: { ...r.potential, value: roundTo(v, 3) } });
                                    }}
                                    disabled={!r.potential}
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
                                      {isRoastedLike(r) ? (
                                        <>
                                          <YStack gap="$1" w={220} maxW="100%">
                                            <RecipeEditFieldLabel>Dehusked/de-bittered</RecipeEditFieldLabel>
                                            <RecipeEditReadOnlyValue>
                                              {typeof r.mashRoastDehuskedOverride === "boolean"
                                                ? r.mashRoastDehuskedOverride
                                                  ? "yes"
                                                  : "no"
                                                : r.mashRoastDehuskedSource === "inferred"
                                                  ? inferDehuskedFromName(r.name)
                                                    ? "yes"
                                                    : "no"
                                                  : ""}
                                            </RecipeEditReadOnlyValue>
                                          </YStack>
                                          <YStack gap="$1" w={260} maxW="100%">
                                            <RecipeEditFieldLabel htmlFor={`grist-roast-dehusked-override-${r.id}`}>
                                              Override
                                            </RecipeEditFieldLabel>
                                            <BrewSelect
                                              id={`grist-roast-dehusked-override-${r.id}`}
                                              value={
                                                typeof r.mashRoastDehuskedOverride === "boolean"
                                                  ? r.mashRoastDehuskedOverride
                                                    ? "force_dehusked"
                                                    : "force_husked"
                                                  : "auto"
                                              }
                                              onValueChange={(v) => {
                                                if (v === "auto") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: null,
                                                    mashRoastDehuskedSource: "unknown",
                                                  });
                                                } else if (v === "force_husked") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: false,
                                                    mashRoastDehuskedSource: "override",
                                                  });
                                                } else if (v === "force_dehusked") {
                                                  updateGristRow(r.id, {
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
                                            <RecipeEditReadOnlyValue>{r.mashRoastDehuskedSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                          </YStack>
                                        </>
                                      ) : null}
                                      <YStack gap="$1" w={240} maxW="100%">
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-di-ph-${r.id}`}>
                                          DI mash pH (room temp)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-di-ph-${r.id}`}
                                          value={r.mashDiPh ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
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
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-ta-${r.id}`}>
                                          Titratable acidity to pH 5.7 (mEq/kg)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-ta-${r.id}`}
                                          value={r.mashTaToPh57_mEqPerKg ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
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
                                        <RecipeEditReadOnlyValue>{r.mashPhModelSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                      </YStack>
                                    </XStack>
                                  </details>
                                </View>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No fermentables yet.
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
                    {saving ? "Saving…" : "Save (including grist)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>
  );
}
