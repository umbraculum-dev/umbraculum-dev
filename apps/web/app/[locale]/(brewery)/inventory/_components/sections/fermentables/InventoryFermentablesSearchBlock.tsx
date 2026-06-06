"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { StripedRow } from "../../../../../_components/StripedRow";
import { PUBLIC_DB_PAGE_SIZE } from "../../_lib/inventoryTypes";
import type { InventorySectionProps } from "../inventorySectionTypes";

export function InventoryFermentablesSearchBlock(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t,
    canCall,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    fermentableSearching,
    fermentableSearched,
    fermentablePage,
    fermentableTotal,
    fermentableActiveQuery,
    onSearchFermentables,
    clearFermentablesSearch,
    fetchFermentablesPage,
    addFromFermentable,
  } = m;

  return (
    <>
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
    </>
  );
}
