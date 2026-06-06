"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../_components/recipe-edit";
import { StripedRow } from "../../../_components/StripedRow";
import { PUBLIC_DB_PAGE_SIZE } from "../../_lib/inventoryTypes";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventoryHopsSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, tUnits, canCall, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
    customHopAlphaMin, setCustomHopAlphaMin, customHopAlphaMax, setCustomHopAlphaMax,
    hopQuery, setHopQuery, hopResults, hopSearching, hopSearched, hopPage, hopTotal, hopActiveQuery,
    onSearchHops, clearHopsSearch, fetchHopsPage, addFromHop,
  } = m;

  return (
    <RecipeEditSection
      id="hops"
      headingId="inv-hops"
      label={t("sections.hops")}
      open={openSections['hops']}
      onOpenChange={(o) => setSectionOpen("hops", o)}
    >
<YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <form onSubmit={(...a) => { void onSearchHops(...(a as Parameters<typeof onSearchHops>)); }}>
                  <XStack gap="$2" alignItems="center">
                    <Input
                      value={hopQuery}
                      onChangeText={setHopQuery}
                      placeholder={t("searchPlaceholder")}
                      size="$3"
                      minWidth={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <Button type="submit" size="$3" disabled={hopSearching}>
                      {hopSearching ? "…" : t("search")}
                    </Button>
                    <Button
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      onPress={clearHopsSearch}
                      disabled={hopSearching || (!hopQuery && !hopResults.length && !hopSearched)}
                    >
                      {t("clearSearch")}
                    </Button>
                  </XStack>
                </form>
              </XStack>
              {hopResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <StripedRow odd={false}>
                      <XStack gap="$2" ai="center" minW="max-content">
                        <View minW={235}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.name")}</SizableText></View>
                        <View minW={120}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.type")}</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.alphaMin")}</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">{t("columns.alphaMax")}</SizableText></View>
                      <View minW={60} />
                      </XStack>
                    </StripedRow>
                    {hopResults.map((it, idx) => (
                      <StripedRow key={it.id} odd={idx % 2 === 1}>
                        <XStack gap="$2" ai="center" minW="max-content">
                          <View minW={235}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                          <View minW={120}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.type ?? ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMin === "number" ? it.alphaMin.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMax === "number" ? it.alphaMax.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => void addFromHop(it)}
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
              {hopSearched && !hopSearching && hopResults.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2">
                  {t("noResultsTryAnotherKey")}
                </SizableText>
              ) : null}
              {hopResults.length && (hopTotal ?? hopResults.length) > PUBLIC_DB_PAGE_SIZE ? (
                <XStack
                  mt="$2"
                  gap="$2"
                  ai="center"
                  jc="flex-end"
                  aria-label={t("pagination.ariaLabel")}
                >
                  <Button
                    size="$2"
                    disabled={hopPage <= 0 || hopSearching}
                    onPress={() => void fetchHopsPage(hopPage - 1, hopActiveQuery)}
                  >
                    {t("pagination.prev")}
                  </Button>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("pagination.status", {
                      page: hopPage + 1,
                      pages: Math.max(1, Math.ceil((hopTotal ?? hopResults.length) / PUBLIC_DB_PAGE_SIZE)),
                    })}
                  </SizableText>
                  <Button
                    size="$2"
                    disabled={
                      hopSearching ||
                      (hopTotal != null
                        ? (hopPage + 1) * PUBLIC_DB_PAGE_SIZE >= hopTotal
                        : hopResults.length < PUBLIC_DB_PAGE_SIZE)
                    }
                    onPress={() => void fetchHopsPage(hopPage + 1, hopActiveQuery)}
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
                      value={customName['hop'] ?? ""}
                      onChangeText={(v) => setCustomName((p) => ({ ...p, hop: v }))}
                      placeholder={t("nameLabel")}
                      size="$3"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack minWidth={90} gap="$1">
                    <RecipeEditFieldLabel>{t("alphaMinLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customHopAlphaMin}
                      onChangeText={setCustomHopAlphaMin}
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
                    <RecipeEditFieldLabel>{t("alphaMaxLabel")}</RecipeEditFieldLabel>
                    <Input
                      value={customHopAlphaMax}
                      onChangeText={setCustomHopAlphaMax}
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
                      value={customQty['hop'] ?? ""}
                      onChangeText={(v) => setCustomQty((p) => ({ ...p, hop: v }))}
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
                    onPress={() => void addCustom("hop")}
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                  >
                    {t("addCustom")}
                  </Button>
                </XStack>
              </View>
              {itemsByCategory("hop").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("hop").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
