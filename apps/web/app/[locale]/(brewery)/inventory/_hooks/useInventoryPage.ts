"use client";

import { useTranslations } from "next-intl";

import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { type InventoryUnit } from "../_lib/inventoryTypes";
import { useInventoryPageData } from "./useInventoryPageData";
import { useInventoryPageFilters } from "./useInventoryPageFilters";
import { useInventoryPageMutations } from "./useInventoryPageMutations";

export function useInventoryPage() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const tUnits = useTranslations("units");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me?.activeWorkspaceId;

  const filters = useInventoryPageFilters();
  const data = useInventoryPageData(canCall, filters);
  const mutations = useInventoryPageMutations({
    canCall,
    refresh: data.refresh,
    setError: data.setError,
    filters,
    fetchFermentablesPage: data.fetchFermentablesPage,
    fetchHopsPage: data.fetchHopsPage,
  });

  const unitLabel = (u: InventoryUnit) =>
    u === "kg" ? tUnits("kg") : u === "g" ? tUnits("g") : u === "ml" ? tUnits("mL") : tUnits("count");

  return {
    t,
    tCommon,
    tUnits,
    authState,
    canCall,
    items: data.items,
    loading: data.loading,
    error: data.error,
    openSections: filters.openSections,
    setSectionOpen: filters.setSectionOpen,
    customName: filters.customName,
    setCustomName: filters.setCustomName,
    customQty: filters.customQty,
    setCustomQty: filters.setCustomQty,
    customFermentableProducer: filters.customFermentableProducer,
    setCustomFermentableProducer: filters.setCustomFermentableProducer,
    customFermentableLovibond: filters.customFermentableLovibond,
    setCustomFermentableLovibond: filters.setCustomFermentableLovibond,
    customFermentableYieldPercent: filters.customFermentableYieldPercent,
    setCustomFermentableYieldPercent: filters.setCustomFermentableYieldPercent,
    customFermentablePpg: filters.customFermentablePpg,
    setCustomFermentablePpg: filters.setCustomFermentablePpg,
    customHopAlphaMin: filters.customHopAlphaMin,
    setCustomHopAlphaMin: filters.setCustomHopAlphaMin,
    customHopAlphaMax: filters.customHopAlphaMax,
    setCustomHopAlphaMax: filters.setCustomHopAlphaMax,
    qtyDraft: filters.qtyDraft,
    setQtyDraft: filters.setQtyDraft,
    fermentableQuery: filters.fermentableQuery,
    setFermentableQuery: filters.setFermentableQuery,
    fermentableResults: filters.fermentableResults,
    fermentableSearching: filters.fermentableSearching,
    fermentableSearched: filters.fermentableSearched,
    fermentablePage: filters.fermentablePage,
    fermentableTotal: filters.fermentableTotal,
    fermentableActiveQuery: filters.fermentableActiveQuery,
    hopQuery: filters.hopQuery,
    setHopQuery: filters.setHopQuery,
    hopResults: filters.hopResults,
    hopSearching: filters.hopSearching,
    hopSearched: filters.hopSearched,
    hopPage: filters.hopPage,
    hopTotal: filters.hopTotal,
    hopActiveQuery: filters.hopActiveQuery,
    acidSaltQuery: filters.acidSaltQuery,
    setAcidSaltQuery: filters.setAcidSaltQuery,
    acidSaltResults: filters.acidSaltResults,
    acidSaltSearched: filters.acidSaltSearched,
    itemsByCategory: data.itemsByCategory,
    addCustom: mutations.addCustom,
    addFromFermentable: mutations.addFromFermentable,
    addFromHop: mutations.addFromHop,
    addFromAcidSalt: mutations.addFromAcidSalt,
    updateQuantity: mutations.updateQuantity,
    removeItem: mutations.removeItem,
    onSearchFermentables: mutations.onSearchFermentables,
    clearFermentablesSearch: mutations.clearFermentablesSearch,
    fetchFermentablesPage: data.fetchFermentablesPage,
    onSearchHops: mutations.onSearchHops,
    clearHopsSearch: mutations.clearHopsSearch,
    fetchHopsPage: data.fetchHopsPage,
    onSearchAcidSalts: mutations.onSearchAcidSalts,
    clearAcidSaltsSearch: mutations.clearAcidSaltsSearch,
    unitLabel,
    refresh: data.refresh,
  };
}
