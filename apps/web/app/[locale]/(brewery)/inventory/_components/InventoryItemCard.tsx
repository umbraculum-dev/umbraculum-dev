"use client";

import React from "react";
import { Button, Input, SizableText, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditIngredientCard } from "../../../../_components/recipe-edit";
import type { InventoryItem, InventoryUnit } from "../_lib/inventoryTypes";

export function InventoryItemCard(props: {
  item: InventoryItem;
  qtyDraft: Record<string, string>;
  setQtyDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  canCall: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  unitLabel: (u: InventoryUnit) => string;
}) {
  const { item: it, qtyDraft, setQtyDraft, updateQuantity, removeItem, canCall, t, unitLabel } = props;

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
