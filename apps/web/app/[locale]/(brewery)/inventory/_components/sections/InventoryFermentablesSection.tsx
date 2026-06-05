"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../../../_components/recipe-edit";
import { StripedRow } from "../../../../../_components/StripedRow";
import { PUBLIC_DB_PAGE_SIZE } from "../../_lib/inventoryTypes";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventoryFermentablesSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, tUnits, canCall, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
    customFermentableProducer, setCustomFermentableProducer,
    customFermentableLovibond, setCustomFermentableLovibond,
    customFermentableYieldPercent, setCustomFermentableYieldPercent,
    customFermentablePpg, setCustomFermentablePpg,
    fermentableQuery, setFermentableQuery, fermentableResults, fermentableSearching, fermentableSearched,
    fermentablePage, fermentableTotal, fermentableActiveQuery,
    onSearchFermentables, clearFermentablesSearch, fetchFermentablesPage,
    addFromFermentable,
  } = m;

  return (
    <RecipeEditSection
      id="fermentables"
      headingId="inv-fermentables"
      label={t("sections.fermentables")}
      open={openSections['fermentables']}
      onOpenChange={(o) => setSectionOpen("fermentables", o)}
    >
<YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <form onSubmit={(...a) => { void onSearchFermentables(...(a as Parameters<typeof onSearchFermentables>)); }}>
                  <XStack gap="$2" alignItems="center">
                    <Input
                      value={fermentableQuery}
                      onChangeText={setFermentableQuery}
                      placeholder={t("searchPlaceholder")}
                      size="$3"
                      minWidth={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <Button type="submit" size="$3" disabled={fermentableSearching}>
                      {fermentableSearching ? "…" : t("search")}
                    </Button>
                    <Button
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      onPress={clearFermentablesSearch}
                      disabled={fermentableSearching || (!fermentableQuery && !fermentableResults.length && !fermentableSearched)}
                    >
                      {t("clearSearch")}
                    </Button>
                  </XStack>
                </form>
              </XStack>
              {fermentableResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <StripedRow odd={false}>
                      <XStack gap="$2" ai="center" minW="max-content">
                        <View minW={185}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.name")}</SizableText></View>
                      <View minW={110}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.producer")}</SizableText></View>
                      <View minW={50} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">{t("columns.lovibondShort")}</SizableText></View>
                      <View minW={70} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">{t("columns.yieldPercentShort")}</SizableText></View>
                      <View minW={60} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">{t("columns.ppg")}</SizableText></View>
                      <View minW={60} />
                      </XStack>
                    </StripedRow>
                    {fermentableResults.map((it, idx) => (
                      <StripedRow key={it.id} odd={idx % 2 === 1}>
                        <XStack gap="$2" ai="center" minW="max-content">
                          <View minW={185}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={110}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.producer ?? ""}</SizableText></View>
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
                            onPress={() => void addFromFermentable(it)}
                            disabled={!canCall}
                          >
                            {t("addFromListAdd")}
                          </Button>
                        </View>
                        </XStack>
                      </StripedRow>
                    ))}
                  </YStack>
                </View>
              ) : null}
              {fermentableSearched && !fermentableSearching && fermentableResults.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2">
                  {t("noResultsTryAnotherKey")}
                </SizableText>
              ) : null}
              {fermentableResults.length && (fermentableTotal ?? fermentableResults.length) > PUBLIC_DB_PAGE_SIZE ? (
                <XStack
                  mt="$2"
                  gap="$2"
                  ai="center"
                  jc="flex-end"
                  aria-label={t("pagination.ariaLabel")}
                >
                  <Button
                    size="$2"
                    disabled={fermentablePage <= 0 || fermentableSearching}
                    onPress={() => void fetchFermentablesPage(fermentablePage - 1, fermentableActiveQuery)}
                  >
                    {t("pagination.prev")}
                  </Button>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("pagination.status", {
                      page: fermentablePage + 1,
                      pages: Math.max(
                        1,
                        Math.ceil((fermentableTotal ?? fermentableResults.length) / PUBLIC_DB_PAGE_SIZE)
                      ),
                    })}
                  </SizableText>
                  <Button
                    size="$2"
                    disabled={
                      fermentableSearching ||
                      (fermentableTotal != null
                        ? (fermentablePage + 1) * PUBLIC_DB_PAGE_SIZE >= fermentableTotal
                        : fermentableResults.length < PUBLIC_DB_PAGE_SIZE)
                    }
                    onPress={() => void fetchFermentablesPage(fermentablePage + 1, fermentableActiveQuery)}
                  >
                    {t("pagination.next")}
                  </Button>
                </XStack>
              ) : null}
              <View
                borderWidth={1}
                borderColor="var(--border)"
                bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))"
                rounded="$2"
                p="$3"
              >
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2">
                  {t("addCustomGuidance")}
                </SizableText>
                <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                  <YStack minWidth={120} gap="$1">
                    <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customName['fermentable'] ?? ""}
                      onChangeText={(v) => setCustomName((p) => ({ ...p, fermentable: v }))}
                      placeholder={t("nameLabel")}
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={140} gap="$1">
                    <RecipeEditFieldLabel>{t("producerLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customFermentableProducer}
                      onChangeText={setCustomFermentableProducer}
                      placeholder={t("producerLabel")}
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={80} gap="$1">
                    <RecipeEditFieldLabel>{t("lovibondLabel", { unit: tUnits("lovibond") })}</RecipeEditFieldLabel>
                    <Input
                      value={customFermentableLovibond}
                      onChangeText={setCustomFermentableLovibond}
                      keyboardType="decimal-pad"
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={90} gap="$1">
                    <RecipeEditFieldLabel>{t("yieldPercentLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customFermentableYieldPercent}
                      onChangeText={setCustomFermentableYieldPercent}
                      keyboardType="decimal-pad"
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={90} gap="$1">
                    <RecipeEditFieldLabel>{t("ppgLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customFermentablePpg}
                      onChangeText={setCustomFermentablePpg}
                      keyboardType="decimal-pad"
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={80} gap="$1">
                    <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("kg") })}</RecipeEditFieldLabel>
                    <Input
                      value={customQty['fermentable'] ?? ""}
                      onChangeText={(v) => setCustomQty((p) => ({ ...p, fermentable: v }))}
                      keyboardType="decimal-pad"
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <Button
                    size="$3"
                    onPress={() => void addCustom("fermentable")}
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                  >
                    {t("addCustom")}
                  </Button>
                </XStack>
              </View>
              {itemsByCategory("fermentable").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("fermentable").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
