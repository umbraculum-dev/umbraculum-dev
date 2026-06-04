import {Link} from "../../../../../../src/i18n/navigation";
import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {formatFixed} from "../../../../../../src/i18n/format";
import {BrewSelect} from "../../../../../_components/BrewSelect";
import {RecipeEditFieldLabel, RecipeEditIngredientCard, RecipeEditSection} from "../../../../../_components/recipe-edit";
import {miscTypeOptions, miscUseOptions} from "../../_lib/recipeEditConstants";
import type {MiscType, MiscUse} from "../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditOtherSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tUnits,
    locale,
    openSections,
    setSectionOpen,
    saving,
    miscRows,
    canCallAccountScoped,
    onSave,
    addMiscRow,
    removeMiscRow,
    updateMiscRow
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="other"
            headingId="other-heading"
            label={t("sections.other")}
            open={openSections['other']}
            onOpenChange={(open) => setSectionOpen("other", open)}
          >
            <XStack jc="space-between" gap="$3" flexWrap="wrap">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
                {t("otherHelp")}
              </SizableText>
              <Button
                onPress={addMiscRow}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("buttons.addOtherIngredient")}
              </Button>
            </XStack>

            {miscRows.length ? (
              <YStack gap="$3" mt="$3" w="100%" minWidth={0}>
                {miscRows.map((r, idx) => {
                  const amountLabel = t("amountLabel", { unit: r.amountIsWeight ? tUnits("kg") : tUnits("L") });
                  return (
                    <RecipeEditIngredientCard key={r.id}>
                      <XStack gap="$3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}>
                        <View alignSelf="center" flexShrink={0}>
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                            {idx + 1}
                          </SizableText>
                        </View>
                        <YStack gap="$1" flex={1} minW={280} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-name-${r.id}`}>Name</RecipeEditFieldLabel>
                          <Input
                            id={`misc-name-${r.id}`}
                            value={r.name}
                            onChangeText={(text) => updateMiscRow(r.id, { name: text })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient name ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-type-${r.id}`}>Type</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-type-${r.id}`}
                            value={r.type}
                            onValueChange={(v) => updateMiscRow(r.id, { type: v as MiscType })}
                            options={miscTypeOptions}
                            aria-label={`Other ingredient type ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={160} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-${r.id}`}>Use</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-use-${r.id}`}
                            value={r.use}
                            onValueChange={(v) => updateMiscRow(r.id, { use: v as MiscUse })}
                            options={miscUseOptions}
                            aria-label={`Other ingredient use ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={140} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-time-${r.id}`}>Time (min)</RecipeEditFieldLabel>
                          <Input
                            id={`misc-time-${r.id}`}
                            value={typeof r.timeMinutes === "number" ? String(r.timeMinutes) : ""}
                            onChangeText={(text) =>
                              updateMiscRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                            }
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient time minutes ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={200} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-is-weight-${r.id}`}>Amount kind</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-amount-is-weight-${r.id}`}
                            value={r.amountIsWeight ? "weight" : "volume"}
                            onValueChange={(v) => updateMiscRow(r.id, { amountIsWeight: v === "weight" })}
                            options={[
                              { value: "weight", label: "Weight" },
                              { value: "volume", label: "Volume" },
                            ]}
                            aria-label={`Other ingredient amount kind ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-${r.id}`}>{amountLabel}</RecipeEditFieldLabel>
                          <Input
                            id={`misc-amount-${r.id}`}
                            value={
                              Number.isFinite(r.amount)
                                ? r.amountIsWeight
                                  ? formatFixed(locale, r.amount, 3)
                                  : formatFixed(locale, r.amount, 2)
                                : ""
                            }
                            onChangeText={(text) => {
                              const normalized = text.replace(",", ".");
                              const parsed = parseFloat(normalized);
                              updateMiscRow(r.id, {
                                amount: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
                              });
                            }}
                            onBlur={() => {
                              if (!Number.isFinite(r.amount)) return;
                              const decimals = r.amountIsWeight ? 3 : 2;
                              const rounded =
                                Math.round(r.amount * 10 ** decimals) / 10 ** decimals;
                              if (rounded !== r.amount) {
                                updateMiscRow(r.id, { amount: rounded });
                              }
                            }}
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient amount ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={240} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-for-${r.id}`}>Use for</RecipeEditFieldLabel>
                          <Input
                            id={`misc-use-for-${r.id}`}
                            value={r.useFor ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { useFor: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient use for ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={260} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-notes-${r.id}`}>Notes</RecipeEditFieldLabel>
                          <Input
                            id={`misc-notes-${r.id}`}
                            value={r.notes ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { notes: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient notes ${idx + 1}`}
                          />
                        </YStack>

                        <Button
                          size="$2"
                          flexShrink={0}
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => removeMiscRow(r.id)}
                          aria-label={`Remove other ingredient row ${idx + 1}`}
                        >
                          Remove
                        </Button>
                      </XStack>
                    </RecipeEditIngredientCard>
                  );
                })}
              </YStack>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No other ingredients yet.
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
                    {saving ? "Saving…" : "Save (including other ingredients)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>
  );
}
