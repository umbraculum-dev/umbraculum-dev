"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, H1, Input, SizableText, View, XStack, YStack } from "tamagui";

// BrewSelect (../../_components/BrewSelect) available for future use if needed.
import {
  ErrorBox,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSection,
} from "../../_components/recipe-edit";
import { apiFetch } from "../../_lib/apiClient";
import { useRequireAuth } from "../../_lib/useRequireAuth";
import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";
import { StripedRow } from "../../_components/StripedRow";

type InventoryCategory =
  | "fermentable"
  | "hop"
  | "speciality"
  | "acid_salt"
  | "detergent_sanitizer"
  | "kegging";

type InventoryUnit = "kg" | "g" | "ml" | "count";

type InventoryItem = {
  id: string;
  workspaceId: string;
  category: InventoryCategory;
  ingredientId: string | null;
  name: string;
  quantity: number;
  unit: InventoryUnit;
  metadataJson: unknown | null;
  createdAt: string;
  updatedAt: string;
};

type FermentableSearchItem = {
  id: string;
  name: string;
  producer?: string | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
};

type HopSearchItem = {
  id: string;
  name: string;
  type?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
};

const ACID_SALT_OPTIONS: Array<{ value: string; label: string; unit: InventoryUnit }> = [
  { value: "lactic_acid", label: "Lactic acid", unit: "ml" },
  { value: "phosphoric_acid", label: "Phosphoric acid", unit: "ml" },
  { value: "citric_acid", label: "Citric acid", unit: "ml" },
  { value: "gypsum", label: "Gypsum (CaSO4·2H2O)", unit: "g" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2·2H2O)", unit: "g" },
  { value: "epsom", label: "Epsom salt (MgSO4·7H2O)", unit: "g" },
  { value: "table_salt", label: "Table salt (NaCl)", unit: "g" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)", unit: "g" },
];

const _CATEGORIES: InventoryCategory[] = [
  "fermentable",
  "hop",
  "speciality",
  "acid_salt",
  "detergent_sanitizer",
  "kegging",
];

const DEFAULT_UNIT: Record<InventoryCategory, InventoryUnit> = {
  fermentable: "kg",
  hop: "kg",
  speciality: "kg",
  acid_salt: "g",
  detergent_sanitizer: "ml",
  kegging: "count",
};

const PUBLIC_DB_PAGE_SIZE = 20;

export default function InventoryPage() {
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
      const res = await apiFetch("/api/inventory");
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as { ok: boolean; items: InventoryItem[] };
      setItems(Array.isArray(data.items) ? data.items : []);
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
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, name, quantity: Number.isFinite(qty) ? qty : 0, unit, metadata }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
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
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "fermentable",
          ingredientId: item.id,
          name: item.name,
          quantity: 0,
          unit: "kg",
          metadata,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
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
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "hop",
          ingredientId: item.id,
          name: item.name,
          quantity: 0,
          unit: "kg",
          metadata,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
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
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "acid_salt",
          name: opt.label,
          quantity: 0,
          unit: opt.unit,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!canCall) return;
    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
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
      const res = await apiFetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const onSearchFermentables = (e: React.FormEvent) => {
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
        const res = await apiFetch(
          `/api/ingredients/fermentables?query=${encodeURIComponent(query)}&limit=${PUBLIC_DB_PAGE_SIZE}&offset=${offset}`
        );
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const data = res.data as { ok: boolean; items?: unknown; total?: number };
        const items: FermentableSearchItem[] = Array.isArray(data.items) ? (data.items as FermentableSearchItem[]) : [];
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

  const onSearchHops = (e: React.FormEvent) => {
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

  const onSearchAcidSalts = (e: React.FormEvent) => {
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
        const res = await apiFetch(
          `/api/ingredients/hops?query=${encodeURIComponent(query)}&limit=${PUBLIC_DB_PAGE_SIZE}&offset=${offset}`
        );
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const data = res.data as { ok: boolean; items?: unknown; total?: number };
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

  const renderItemRow = (it: InventoryItem) => {
    const draft = qtyDraft[it.id];
    const displayQty = draft !== undefined ? draft : String(it.quantity);
    const meta =
      it.metadataJson && typeof it.metadataJson === "object" && !Array.isArray(it.metadataJson)
        ? (it.metadataJson as Record<string, unknown>)
        : null;
    const producer = typeof meta?.['producer'] === "string" ? meta['producer'] : null;
    const colorLovibond = typeof meta?.['colorLovibond'] === "number" && Number.isFinite(meta['colorLovibond']) ? meta['colorLovibond'] : null;
    const yieldPercent = typeof meta?.['yieldPercent'] === "number" && Number.isFinite(meta['yieldPercent']) ? meta['yieldPercent'] : null;
    const ppg = typeof meta?.['ppg'] === "number" && Number.isFinite(meta['ppg']) ? meta['ppg'] : null;
    const alphaMin = typeof meta?.['alphaMin'] === "number" && Number.isFinite(meta['alphaMin']) ? meta['alphaMin'] : null;
    const alphaMax = typeof meta?.['alphaMax'] === "number" && Number.isFinite(meta['alphaMax']) ? meta['alphaMax'] : null;

    return (
      <RecipeEditIngredientCard key={it.id}>
        <XStack gap="$3" flexWrap="wrap" alignItems="center">
          <YStack flex={1} minWidth={160} gap="$1">
            <SizableText size="$2" fontFamily="$body" color="var(--text)">
              {it.name}
            </SizableText>
            {it.category === "fermentable" && (producer || colorLovibond != null || yieldPercent != null || ppg != null) ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {(producer ?? "").trim() ? `${t("producerLabel")}: ${producer}` : null}
                {colorLovibond != null ? ` · ${t("columns.lovibondShort")}: ${colorLovibond.toFixed(1)}` : null}
                {yieldPercent != null ? ` · ${t("yieldPercentLabel")}: ${yieldPercent.toFixed(1)}%` : null}
                {ppg != null ? ` · ${t("ppgLabel")}: ${ppg.toFixed(3)}` : null}
              </SizableText>
            ) : null}
            {it.category === "hop" && (alphaMin != null || alphaMax != null) ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {alphaMin != null ? `${t("alphaMinLabel")}: ${alphaMin.toFixed(1)}%` : null}
                {alphaMax != null ? `${alphaMin != null ? " · " : ""}${t("alphaMaxLabel")}: ${alphaMax.toFixed(1)}%` : null}
              </SizableText>
            ) : null}
          </YStack>
          <YStack minWidth={100} gap="$1">
            <RecipeEditFieldLabel htmlFor={`inv-qty-${it.id}`}>
              {t("quantityLabel", { unit: unitLabel(it.unit) })}
            </RecipeEditFieldLabel>
            <Input
              id={`inv-qty-${it.id}`}
              value={displayQty}
              onChangeText={(v) => setQtyDraft((p) => ({ ...p, [it.id]: v }))}
              onBlur={() => {
                const v = parseFloat(displayQty);
                if (Number.isFinite(v) && v >= 0 && Math.abs(v - it.quantity) > 1e-9) {
                  void updateQuantity(it.id, v);
                } else {
                  setQtyDraft((p) => {
                    const next = { ...p };
                    delete next[it.id];
                    return next;
                  });
                }
              }}
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
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void removeItem(it.id)}
            disabled={!canCall}
          >
            {t("remove")}
          </Button>
        </XStack>
      </RecipeEditIngredientCard>
    );
  };

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
