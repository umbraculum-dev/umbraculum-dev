"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../../../_components/recipe-edit";
import { StripedRow } from "../../../../../_components/StripedRow";
import { PUBLIC_DB_PAGE_SIZE } from "../../_lib/inventoryTypes";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventoryAcidSaltsSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, tUnits, canCall, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
    acidSaltQuery, setAcidSaltQuery, acidSaltResults, acidSaltSearched,
    onSearchAcidSalts, clearAcidSaltsSearch, addFromAcidSalt,
  } = m;

  return (
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
                <YStack gap="$2">{itemsByCategory("acid_salt").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
