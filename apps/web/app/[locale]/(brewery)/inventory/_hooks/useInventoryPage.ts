"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import {
  createInventoryItem,
  deleteInventoryItem,
  listInventory,
  patchInventoryItem,
  searchFermentables,
  searchHops,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import {
  ACID_SALT_OPTIONS,
  DEFAULT_UNIT,
  PUBLIC_DB_PAGE_SIZE,
  type FermentableSearchItem,
  type HopSearchItem,
  type InventoryCategory,
  type InventoryItem,
  type InventoryUnit,
} from "../_lib/inventoryTypes";

export function useInventoryPage() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const tUnits = useTranslations("units");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me?.activeWorkspaceId;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const refresh = useCallback(async () => {
  if (!canCall) return;
  setError(null);
  setLoading(true);
  try {
    const data = await listInventory(webBreweryApiClient());
    setItems(Array.isArray(data.items) ? (data.items as InventoryItem[]) : []);
  } catch (err) {
    setError(String(err));
  } finally {
    setLoading(false);
  }
  }, [canCall]);

  useEffect(() => {
  void refresh();
  }, [refresh]);

  const setSectionOpen = (id: string, open: boolean) => {
  setOpenSections((prev) => ({ ...prev, [id]: open }));
  };

  const itemsByCategory = (cat: InventoryCategory) =>
  items.filter((i) => i.category === cat);

  const addCustom = async (category: InventoryCategory) => {
  if (!canCall) return;
  const name = (customName[category] ?? "").trim();
  if (!name) return;
  const qtyStr = customQty[category] ?? "0";
  const qty = parseFloat(qtyStr);
  const unit = category === "acid_salt" ? "ml" : DEFAULT_UNIT[category];
  const metadata = (() => {
    if (category === "fermentable") {
      const producer = customFermentableProducer.trim() || undefined;
      const colorLovibond = Number.isFinite(parseFloat(customFermentableLovibond)) ? parseFloat(customFermentableLovibond) : undefined;
      const yieldPercent = Number.isFinite(parseFloat(customFermentableYieldPercent)) ? parseFloat(customFermentableYieldPercent) : undefined;
      const ppg = Number.isFinite(parseFloat(customFermentablePpg)) ? parseFloat(customFermentablePpg) : undefined;
      const out: Record<string, unknown> = {
        ...(producer ? { producer } : {}),
        ...(colorLovibond !== undefined ? { colorLovibond } : {}),
        ...(yieldPercent !== undefined ? { yieldPercent } : {}),
        ...(ppg !== undefined ? { ppg } : {}),
      };
      return Object.keys(out).length ? out : undefined;
    }
    if (category === "hop") {
      const alphaMin = Number.isFinite(parseFloat(customHopAlphaMin)) ? parseFloat(customHopAlphaMin) : undefined;
      const alphaMax = Number.isFinite(parseFloat(customHopAlphaMax)) ? parseFloat(customHopAlphaMax) : undefined;
      const out: Record<string, unknown> = {
        ...(alphaMin !== undefined ? { alphaMin } : {}),
        ...(alphaMax !== undefined ? { alphaMax } : {}),
      };
      return Object.keys(out).length ? out : undefined;
    }
    return undefined;
  })();
  try {
    await createInventoryItem(webBreweryApiClient(), {
      category,
      name,
      quantity: Number.isFinite(qty) ? qty : 0,
      unit,
      metadata,
    });
    setCustomName((prev) => ({ ...prev, [category]: "" }));
    setCustomQty((prev) => ({ ...prev, [category]: "" }));
    if (category === "fermentable") {
      setCustomFermentableProducer("");
      setCustomFermentableLovibond("");
      setCustomFermentableYieldPercent("");
      setCustomFermentablePpg("");
    }
    if (category === "hop") {
      setCustomHopAlphaMin("");
      setCustomHopAlphaMax("");
    }
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const addFromFermentable = async (item: FermentableSearchItem) => {
  if (!canCall) return;
  try {
    const metadata = {
      ...(typeof item?.producer === "string" && item.producer.trim() ? { producer: item.producer.trim() } : {}),
      ...(typeof item?.colorLovibond === "number" && Number.isFinite(item.colorLovibond) ? { colorLovibond: item.colorLovibond } : {}),
      ...(typeof item?.yieldPercent === "number" && Number.isFinite(item.yieldPercent) ? { yieldPercent: item.yieldPercent } : {}),
      ...(typeof item?.ppg === "number" && Number.isFinite(item.ppg) ? { ppg: item.ppg } : {}),
    };
    await createInventoryItem(webBreweryApiClient(), {
      category: "fermentable",
      ingredientId: item.id,
      name: item.name,
      quantity: 0,
      unit: "kg",
      metadata,
    });
    setFermentableQuery("");
    setFermentableResults([]);
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const addFromHop = async (item: HopSearchItem) => {
  if (!canCall) return;
  try {
    const metadata = {
      ...(typeof item?.alphaMin === "number" && Number.isFinite(item.alphaMin) ? { alphaMin: item.alphaMin } : {}),
      ...(typeof item?.alphaMax === "number" && Number.isFinite(item.alphaMax) ? { alphaMax: item.alphaMax } : {}),
    };
    await createInventoryItem(webBreweryApiClient(), {
      category: "hop",
      ingredientId: item.id,
      name: item.name,
      quantity: 0,
      unit: "kg",
      metadata,
    });
    setHopQuery("");
    setHopResults([]);
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const addFromAcidSalt = async (opt: (typeof ACID_SALT_OPTIONS)[number]) => {
  if (!canCall) return;
  try {
    await createInventoryItem(webBreweryApiClient(), {
      category: "acid_salt",
      name: opt.label,
      quantity: 0,
      unit: opt.unit,
    });
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const updateQuantity = async (id: string, quantity: number) => {
  if (!canCall) return;
  try {
    await patchInventoryItem(webBreweryApiClient(), id, { quantity });
    setQtyDraft((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const removeItem = async (id: string) => {
  if (!canCall) return;
  try {
    await deleteInventoryItem(webBreweryApiClient(), id);
    await refresh();
  } catch (err) {
    setError(String(err));
  }
  };

  const onSearchFermentables = (e: FormEvent) => {
  e.preventDefault();
  const q = fermentableQuery;
  setFermentableActiveQuery(q);
  void fetchFermentablesPage(0, q);
  };

  const clearFermentablesSearch = () => {
  setFermentableQuery("");
  setFermentableActiveQuery("");
  setFermentableResults([]);
  setFermentableTotal(null);
  setFermentablePage(0);
  setFermentableSearched(false);
  };

  const fetchFermentablesPage = useCallback(
  async (page: number, query: string) => {
    if (!canCall) return;
    const safePage = Math.max(0, page);
    const offset = safePage * PUBLIC_DB_PAGE_SIZE;
    setFermentableSearching(true);
    setFermentableSearched(false);
    try {
      const data = await searchFermentables(webBreweryApiClient(), {
        query,
        limit: PUBLIC_DB_PAGE_SIZE,
        offset,
      });
      const items: FermentableSearchItem[] = Array.isArray(data.items)
        ? (data.items as FermentableSearchItem[])
        : [];
      setFermentableResults(items);
      setFermentableTotal(typeof data.total === "number" && Number.isFinite(data.total) ? data.total : null);
      setFermentablePage(safePage);
    } catch {
      setFermentableResults([]);
      setFermentableTotal(0);
      setFermentablePage(0);
    } finally {
      setFermentableSearched(true);
      setFermentableSearching(false);
    }
  },
  [canCall]
  );

  const onSearchHops = (e: FormEvent) => {
  e.preventDefault();
  const q = hopQuery;
  setHopActiveQuery(q);
  void fetchHopsPage(0, q);
  };

  const clearHopsSearch = () => {
  setHopQuery("");
  setHopActiveQuery("");
  setHopResults([]);
  setHopTotal(null);
  setHopPage(0);
  setHopSearched(false);
  };

  const onSearchAcidSalts = (e: FormEvent) => {
  e.preventDefault();
  const q = acidSaltQuery.trim().toLowerCase();
  const results =
    q
      ? ACID_SALT_OPTIONS.filter(
          (x) => x.label.toLowerCase().includes(q) || x.value.toLowerCase().includes(q)
        )
      : ACID_SALT_OPTIONS;
  setAcidSaltResults(results);
  setAcidSaltSearched(true);
  };

  const clearAcidSaltsSearch = () => {
  setAcidSaltQuery("");
  setAcidSaltResults([]);
  setAcidSaltSearched(false);
  };

  const fetchHopsPage = useCallback(
  async (page: number, query: string) => {
    if (!canCall) return;
    const safePage = Math.max(0, page);
    const offset = safePage * PUBLIC_DB_PAGE_SIZE;
    setHopSearching(true);
    setHopSearched(false);
    try {
      const data = await searchHops(webBreweryApiClient(), {
        query,
        limit: PUBLIC_DB_PAGE_SIZE,
        offset,
      });
      const items: HopSearchItem[] = Array.isArray(data.items) ? (data.items as HopSearchItem[]) : [];
      setHopResults(items);
      setHopTotal(typeof data.total === "number" && Number.isFinite(data.total) ? data.total : null);
      setHopPage(safePage);
    } catch {
      setHopResults([]);
      setHopTotal(0);
      setHopPage(0);
    } finally {
      setHopSearched(true);
      setHopSearching(false);
    }
  },
  [canCall]
  );

  const unitLabel = (u: InventoryUnit) => (u === "kg" ? tUnits("kg") : u === "g" ? tUnits("g") : u === "ml" ? tUnits("mL") : tUnits("count"));


  return {
    t, tCommon, tUnits, authState, canCall, items, loading, error, openSections, setSectionOpen,
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
    unitLabel, refresh,
  };
}
