"use client";

import React, { useState } from "react";
import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { searchYeasts } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { ErrorBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import { type EditorYeastRow } from "../../../_lib/beerjsonRecipe";
import type { YeastSearchItem } from "../yeastEditorTypes";

type YeastEditorEditableSearchProps = {
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onAddRow: (row?: Partial<EditorYeastRow>) => void;
};

export function YeastEditorEditableSearch(props: YeastEditorEditableSearchProps) {
  const { canCallAccountScoped, t, onAddRow } = props;
  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<YeastSearchItem[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [yeastSearchError, setYeastSearchError] = useState<string | null>(null);

  const onSearchYeasts = async (e: React.FormEvent) => {
    e.preventDefault();
    setYeastSearchError(null);
    setYeastSearching(true);
    try {
      const data = await searchYeasts(webBreweryApiClient(), { query: yeastQuery });
      setYeastResults(data.items as YeastSearchItem[]);
    } catch (err) {
      setYeastSearchError(String(err));
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  };

  const clearYeastSearchResults = () => {
    setYeastSearchError(null);
    setYeastResults([]);
  };

  const addYeastFromDb = (item: YeastSearchItem) => {
    const id = typeof item?.id === "string" ? item.id : null;
    const nameRaw = typeof item?.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item?.lab === "string" ? item.lab : null;
    const productId = typeof item?.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item?.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item?.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    onAddRow({ ingredientId: id, name: nameRaw, lab, productId, attenuationMin, attenuationMax });
  };

  return (
    <form onSubmit={(...a) => { void onSearchYeasts(...(a as Parameters<typeof onSearchYeasts>)); }}>
      <RecipeEditFieldLabel htmlFor="yeast-search">{t("yeastSearchLabel")}</RecipeEditFieldLabel>
      <XStack gap="$2" items="center" flexWrap="wrap" mt="$1">
        <Input
          id="yeast-search"
          value={yeastQuery}
          onChangeText={setYeastQuery}
          flex={1}
          minW={200}
          autoComplete="off"
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
        <Button
          type="submit"
          disabled={!canCallAccountScoped || yeastSearching}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {yeastSearching ? "Searching…" : "Search"}
        </Button>
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={clearYeastSearchResults}
          disabled={yeastSearching || (!yeastSearchError && yeastResults.length === 0)}
        >
          {t("buttons.clear")}
        </Button>
      </XStack>
      {yeastSearchError ? <ErrorBox mt="$2">{yeastSearchError}</ErrorBox> : null}
      {yeastResults.length ? (
        <View overflowX="auto" mt="$2">
          <YStack gap="$1">
            <XStack gap="$2" ai="center" minW="max-content">
              <View minW={180}>
                <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                  {t("yeastNameLabel")}
                </SizableText>
              </View>
              <View minW={100}>
                <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                  {t("yeastLabLabel")}
                </SizableText>
              </View>
              <View minW={100}>
                <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                  {t("yeastProductIdLabel")}
                </SizableText>
              </View>
              <View minW={80}>
                <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                  {t("yeastFormatLabel")}
                </SizableText>
              </View>
              <View minW={60} />
            </XStack>
            {yeastResults.slice(0, 20).map((it) => (
              <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                <View minW={180}>
                  <SizableText size="$2" fontFamily="$body" color="var(--text)">
                    {it.name}
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontFamily="$body" color="var(--text)">
                    {it.lab ?? ""}
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontFamily="$body" color="var(--text)">
                    {it.productId ?? ""}
                  </SizableText>
                </View>
                <View minW={80}>
                  <SizableText size="$2" fontFamily="$body" color="var(--text)">
                    {it.type ?? ""}
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
                    onPress={() => addYeastFromDb(it)}
                    disabled={!canCallAccountScoped}
                  >
                    Add
                  </Button>
                </View>
              </XStack>
            ))}
          </YStack>
        </View>
      ) : null}
    </form>
  );
}
