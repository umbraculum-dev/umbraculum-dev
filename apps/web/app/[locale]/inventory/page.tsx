"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, H1, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../_components/BrewSelect";
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
  accountId: string;
  category: InventoryCategory;
  ingredientId: string | null;
  name: string;
  quantity: number;
  unit: InventoryUnit;
  createdAt: string;
  updatedAt: string;
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

const CATEGORIES: InventoryCategory[] = [
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

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const tUnits = useTranslations("units");
  const authState = useRequireAuth({ requireActiveAccount: true });
  const canCall = authState.status === "ready" && !!authState.me?.activeAccountId;

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
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});
  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<any[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<any[]>([]);
  const [hopSearching, setHopSearching] = useState(false);

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
    try {
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, name, quantity: Number.isFinite(qty) ? qty : 0, unit }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setCustomName((prev) => ({ ...prev, [category]: "" }));
      setCustomQty((prev) => ({ ...prev, [category]: "" }));
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const addFromFermentable = async (item: { id: string; name: string }) => {
    if (!canCall) return;
    try {
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "fermentable",
          ingredientId: item.id,
          name: item.name,
          quantity: 0,
          unit: "kg",
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

  const addFromHop = async (item: { id: string; name: string }) => {
    if (!canCall) return;
    try {
      const res = await apiFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "hop",
          ingredientId: item.id,
          name: item.name,
          quantity: 0,
          unit: "kg",
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

  const onSearchFermentables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    setFermentableSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/fermentables?query=${encodeURIComponent(fermentableQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as { ok: boolean; items?: any[] };
      setFermentableResults(Array.isArray(data.items) ? data.items : []);
    } catch {
      setFermentableResults([]);
    } finally {
      setFermentableSearching(false);
    }
  };

  const onSearchHops = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    setHopSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/hops?query=${encodeURIComponent(hopQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as { ok: boolean; items?: any[] };
      setHopResults(Array.isArray(data.items) ? data.items : []);
    } catch {
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  };

  const unitLabel = (u: InventoryUnit) => (u === "kg" ? tUnits("kg") : u === "g" ? tUnits("g") : u === "ml" ? tUnits("mL") : tUnits("count"));

  const renderItemRow = (it: InventoryItem) => {
    const draft = qtyDraft[it.id];
    const displayQty = draft !== undefined ? draft : String(it.quantity);
    return (
      <RecipeEditIngredientCard key={it.id}>
        <XStack gap="$3" flexWrap="wrap" alignItems="center">
          <SizableText size="$2" fontFamily="$body" color="var(--text)" flex={1} minWidth={120}>
            {it.name}
          </SizableText>
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
            open={openSections.fermentables}
            onOpenChange={(o) => setSectionOpen("fermentables", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <form onSubmit={onSearchFermentables}>
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
                  </XStack>
                </form>
                {fermentableResults.length > 0 ? (
                  <BrewSelect
                    value=""
                    onValueChange={(v) => {
                      if (!v) return;
                      const it = fermentableResults.find((x) => x.id === v);
                      if (it) void addFromFermentable(it);
                    }}
                    options={[{ value: "", label: `— ${t("addFromList")} —` }, ...fermentableResults.slice(0, 20).map((x) => ({ value: x.id, label: x.name }))]}
                    width={220}
                  />
                ) : null}
              </XStack>
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.fermentable ?? ""}
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
                <YStack minWidth={80} gap="$1">
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("kg") })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty.fermentable ?? ""}
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
                <Button size="$3" onPress={() => void addCustom("fermentable")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
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
            open={openSections.hops}
            onOpenChange={(o) => setSectionOpen("hops", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <form onSubmit={onSearchHops}>
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
                  </XStack>
                </form>
                {hopResults.length > 0 ? (
                  <BrewSelect
                    value=""
                    onValueChange={(v) => {
                      if (!v) return;
                      const it = hopResults.find((x) => x.id === v);
                      if (it) void addFromHop(it);
                    }}
                    options={[{ value: "", label: `— ${t("addFromList")} —` }, ...hopResults.slice(0, 20).map((x) => ({ value: x.id, label: x.name }))]}
                    width={220}
                  />
                ) : null}
              </XStack>
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.hop ?? ""}
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
                <YStack minWidth={80} gap="$1">
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("kg") })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty.hop ?? ""}
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
                <Button size="$3" onPress={() => void addCustom("hop")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
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
            open={openSections.specialities}
            onOpenChange={(o) => setSectionOpen("specialities", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.speciality ?? ""}
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
                    value={customQty.speciality ?? ""}
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
            open={openSections.acidSalts}
            onOpenChange={(o) => setSectionOpen("acidSalts", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="center">
                <SizableText size="$2" fontFamily="$body" color="var(--text)">{t("addFromList")}:</SizableText>
                <BrewSelect
                  value=""
                  onValueChange={(v) => {
                    if (!v) return;
                    const opt = ACID_SALT_OPTIONS.find((x) => x.value === v);
                    if (opt) void addFromAcidSalt(opt);
                  }}
                  options={[{ value: "", label: `— ${t("addFromList")} —` }, ...ACID_SALT_OPTIONS.map((x) => ({ value: x.value, label: x.label }))]}
                  width={220}
                />
              </XStack>
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.acid_salt ?? ""}
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
                    value={customQty.acid_salt ?? ""}
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
            open={openSections.detergentsSanitizers}
            onOpenChange={(o) => setSectionOpen("detergentsSanitizers", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.detergent_sanitizer ?? ""}
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
                    value={customQty.detergent_sanitizer ?? ""}
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
            open={openSections.kegging}
            onOpenChange={(o) => setSectionOpen("kegging", o)}
          >
            <YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName.kegging ?? ""}
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
                    value={customQty.kegging ?? ""}
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
