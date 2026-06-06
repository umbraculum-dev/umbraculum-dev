"use client";

import { useState } from "react";

import {
  ACID_SALT_OPTIONS,
  type FermentableSearchItem,
  type HopSearchItem,
} from "../_lib/inventoryTypes";

export function useInventoryPageFilters() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fermentables: false,
    hops: false,
    specialities: false,
    acidSalts: false,
    detergentsSanitizers: false,
    kegging: false,
  });

  const [customName, setCustomName] = useState<Record<string, string>>({});
  const [customQty, setCustomQty] = useState<Record<string, string>>({});
  const [customFermentableProducer, setCustomFermentableProducer] = useState("");
  const [customFermentableLovibond, setCustomFermentableLovibond] = useState("");
  const [customFermentableYieldPercent, setCustomFermentableYieldPercent] = useState("");
  const [customFermentablePpg, setCustomFermentablePpg] = useState("");
  const [customHopAlphaMin, setCustomHopAlphaMin] = useState("");
  const [customHopAlphaMax, setCustomHopAlphaMax] = useState("");
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});
  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableActiveQuery, setFermentableActiveQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchItem[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearched, setFermentableSearched] = useState(false);
  const [fermentablePage, setFermentablePage] = useState(0);
  const [fermentableTotal, setFermentableTotal] = useState<number | null>(null);
  const [hopQuery, setHopQuery] = useState("");
  const [hopActiveQuery, setHopActiveQuery] = useState("");
  const [hopResults, setHopResults] = useState<HopSearchItem[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearched, setHopSearched] = useState(false);
  const [hopPage, setHopPage] = useState(0);
  const [hopTotal, setHopTotal] = useState<number | null>(null);
  const [acidSaltQuery, setAcidSaltQuery] = useState("");
  const [acidSaltResults, setAcidSaltResults] = useState<(typeof ACID_SALT_OPTIONS)[number][]>([]);
  const [acidSaltSearched, setAcidSaltSearched] = useState(false);

  const setSectionOpen = (id: string, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [id]: open }));
  };

  return {
    openSections,
    setOpenSections,
    setSectionOpen,
    customName,
    setCustomName,
    customQty,
    setCustomQty,
    customFermentableProducer,
    setCustomFermentableProducer,
    customFermentableLovibond,
    setCustomFermentableLovibond,
    customFermentableYieldPercent,
    setCustomFermentableYieldPercent,
    customFermentablePpg,
    setCustomFermentablePpg,
    customHopAlphaMin,
    setCustomHopAlphaMin,
    customHopAlphaMax,
    setCustomHopAlphaMax,
    qtyDraft,
    setQtyDraft,
    fermentableQuery,
    setFermentableQuery,
    fermentableActiveQuery,
    setFermentableActiveQuery,
    fermentableResults,
    setFermentableResults,
    fermentableSearching,
    setFermentableSearching,
    fermentableSearched,
    setFermentableSearched,
    fermentablePage,
    setFermentablePage,
    fermentableTotal,
    setFermentableTotal,
    hopQuery,
    setHopQuery,
    hopActiveQuery,
    setHopActiveQuery,
    hopResults,
    setHopResults,
    hopSearching,
    setHopSearching,
    hopSearched,
    setHopSearched,
    hopPage,
    setHopPage,
    hopTotal,
    setHopTotal,
    acidSaltQuery,
    setAcidSaltQuery,
    acidSaltResults,
    setAcidSaltResults,
    acidSaltSearched,
    setAcidSaltSearched,
  };
}

export type InventoryPageFiltersModel = ReturnType<typeof useInventoryPageFilters>;
