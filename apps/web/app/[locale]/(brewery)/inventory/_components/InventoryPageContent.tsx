"use client";

import { Button, H1, Input, SizableText, View, XStack, YStack } from "tamagui";

import {
  ErrorBox,
  RecipeEditFieldLabel,
  RecipeEditSection,
} from "../../../../_components/recipe-edit";
import { DashboardClient } from "../../../../DashboardClient";
import { Link } from "../../../../../src/i18n/navigation";
import { StripedRow } from "../../../../_components/StripedRow";
import { InventoryItemCard } from "./InventoryItemCard";
import { PUBLIC_DB_PAGE_SIZE } from "../_lib/inventoryTypes";
import type { useInventoryPage } from "../_hooks/useInventoryPage";

type Model = ReturnType<typeof useInventoryPage>;

export function InventoryPageContent(props: { model: Model; tCommon: (key: string) => string }) {
  const { model: m, tCommon } = props;
  const {
    t, tUnits, authState, canCall, loading, error, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    customFermentableProducer, setCustomFermentableProducer,
    customFermentableLovibond, setCustomFermentableLovibond,
    customFermentableYieldPercent, setCustomFermentableYieldPercent,
    customFermentablePpg, setCustomFermentablePpg,
    customHopAlphaMin, setCustomHopAlphaMin, customHopAlphaMax, setCustomHopAlphaMax,
    qtyDraft, setQtyDraft,
    fermentableQuery, setFermentableQuery, fermentableResults, fermentableSearching, fermentableSearched,
    fermentablePage, fermentableTotal, fermentableActiveQuery,
    hopQuery, setHopQuery, hopResults, hopSearching, hopSearched, hopPage, hopTotal, hopActiveQuery,
    acidSaltQuery, setAcidSaltQuery, acidSaltResults, acidSaltSearched,
    itemsByCategory, addCustom, addFromFermentable, addFromHop, addFromAcidSalt,
    updateQuantity, removeItem,
    onSearchFermentables, clearFermentablesSearch, fetchFermentablesPage,
    onSearchHops, clearHopsSearch, fetchHopsPage, onSearchAcidSalts, clearAcidSaltsSearch,
    unitLabel,
  } = m;

  const renderItemRow = (it: Parameters<typeof InventoryItemCard>[0]["item"]) => (
    <InventoryItemCard
      key={it.id}
      item={it}
      qtyDraft={qtyDraft}
      setQtyDraft={setQtyDraft}
      updateQuantity={updateQuantity}
      removeItem={removeItem}
      canCall={canCall}
      t={t}
      unitLabel={unitLabel}
    />
  );

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>
      <Link href="/">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
          {t("backToDashboard")}
        </SizableText>
      </Link>

      {authState.status === "error" ? <ErrorBox>{authState.error}</ErrorBox> : null}
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {tCommon("loading")}
        </SizableText>
      ) : null}

      {canCall && !loading ? (
        <YStack gap="$3">
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
                <YStack gap="$2">{itemsByCategory("fermentable").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>

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
                <YStack gap="$2">{itemsByCategory("hop").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            id="specialities"
            headingId="inv-specialities"
            label={t("sections.specialities")}
            open={openSections['specialities']}
            onOpenChange={(o) => setSectionOpen("specialities", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['speciality'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, speciality: v }))}
                    placeholder={t("nameLabel")}
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
                    value={customQty['speciality'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, speciality: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("speciality")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("speciality").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("speciality").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            id="acidSalts"
            headingId="inv-acid-salts"
            label={t("sections.acidSalts")}
            open={openSections['acidSalts']}
            onOpenChange={(o) => setSectionOpen("acidSalts", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <form onSubmit={onSearchAcidSalts}>
                  <XStack gap="$2" alignItems="center">
                    <Input
                      value={acidSaltQuery}
                      onChangeText={setAcidSaltQuery}
                      placeholder={t("searchPlaceholder")}
                      size="$3"
                      minWidth={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <Button type="submit" size="$3">
                      {t("search")}
                    </Button>
                    <Button
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      onPress={clearAcidSaltsSearch}
                      disabled={!acidSaltQuery && !acidSaltResults.length && !acidSaltSearched}
                    >
                      {t("clearSearch")}
                    </Button>
                  </XStack>
                </form>
              </XStack>
              {acidSaltResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <StripedRow odd={false}>
                      <XStack gap="$2" ai="center" minW="max-content">
                        <View minW={260}>
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                            {t("columns.name")}
                          </SizableText>
                        </View>
                        <View minW={60} />
                      </XStack>
                    </StripedRow>
                    {acidSaltResults.map((opt, idx) => (
                      <StripedRow key={opt.value} odd={idx % 2 === 1}>
                        <XStack gap="$2" ai="center" minW="max-content">
                          <View minW={260}>
                            <SizableText size="$2" fontFamily="$body" color="var(--text)">
                              {opt.label}
                            </SizableText>
                          </View>
                          <View minW={60}>
                            <Button
                              size="$2"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              fontFamily="$body"
                              onPress={() => void addFromAcidSalt(opt)}
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
              {acidSaltSearched && acidSaltResults.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2">
                  {t("noResultsTryAnotherKey")}
                </SizableText>
              ) : null}
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['acid_salt'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, acid_salt: v }))}
                    placeholder={t("nameLabel")}
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <YStack minWidth={80} gap="$1">
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("mL") })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty['acid_salt'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, acid_salt: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("acid_salt")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("acid_salt").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("acid_salt").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            id="detergentsSanitizers"
            headingId="inv-detergents"
            label={t("sections.detergentsSanitizers")}
            open={openSections['detergentsSanitizers']}
            onOpenChange={(o) => setSectionOpen("detergentsSanitizers", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['detergent_sanitizer'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, detergent_sanitizer: v }))}
                    placeholder={t("nameLabel")}
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <YStack minWidth={80} gap="$1">
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("mL") })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty['detergent_sanitizer'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, detergent_sanitizer: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("detergent_sanitizer")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("detergent_sanitizer").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("detergent_sanitizer").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            id="kegging"
            headingId="inv-kegging"
            label={t("sections.kegging")}
            open={openSections['kegging']}
            onOpenChange={(o) => setSectionOpen("kegging", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['kegging'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, kegging: v }))}
                    placeholder={t("nameLabel")}
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <YStack minWidth={80} gap="$1">
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: "count" })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty['kegging'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, kegging: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("kegging")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("kegging").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("kegging").map(renderItemRow)}</YStack>
              )}
            </YStack>
          </RecipeEditSection>
        </YStack>
      ) : null}

      <DashboardClient />
    </YStack>
  );
}
