import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { ManualCellCountHelpBox, RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { isMediaAssetKey } from "@umbraculum/brewery-media-assets";

import { useAuth, getApiBaseUrl, nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import { Input } from "@umbraculum/native-shell/components";
import { YeastScreenRow } from "../components/yeastScreen/YeastScreenRow";
import type { RootStackParamList } from "../../../navigation/types";
import { RemoteImage } from "../../../media/RemoteImage";
import { useNativeYeastScreenActions } from "../hooks/yeastScreen/useNativeYeastScreenActions";
import { useNativeYeastScreenLoad } from "../hooks/yeastScreen/useNativeYeastScreenLoad";
import { useNativeYeastScreenRows } from "../hooks/yeastScreen/useNativeYeastScreenRows";
import { useNativeYeastScreenSearch } from "../hooks/yeastScreen/useNativeYeastScreenSearch";

export function YeastScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RecipeYeast">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const recipeId = route.params?.recipeId ?? "";

  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const client = nativePlatformApiClient(token);
    try {
      const res = await getRecipe(client, id);
      return parseRecipeMetaFromGetRecipeResponse(res);
    } catch {
      return null;
    }
  }, [baseUrl, token]);

  const { t } = useT("recipes.edit");
  const { t: tAnalysis } = useT("recipes.analysis");
  const { t: tUnits } = useT("units");
  const { t: tCommon } = useT("common");
  const { locale } = useLocaleController();

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const load = useNativeYeastScreenLoad({ api, recipeId });
  const search = useNativeYeastScreenSearch({ api });
  const rows = useNativeYeastScreenRows({
    recipe: load.recipe,
    yeastRows: load.yeastRows,
    setYeastRows: load.setYeastRows,
    yeastAttenuationOverrides: load.yeastAttenuationOverrides,
    setYeastAttenuationOverrides: load.setYeastAttenuationOverrides,
  });
  const actions = useNativeYeastScreenActions({
    api,
    recipeId,
    recipe: load.recipe,
    setRecipe: load.setRecipe,
    t,
    gristRows: load.gristRows,
    hopsRows: load.hopsRows,
    miscRows: load.miscRows,
    mash: load.mash,
    yeastRows: load.yeastRows,
    yeastAttenuationOverrides: load.yeastAttenuationOverrides,
  });

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("yeastPageTitle") });
  }, [navigation, t]);

  if (!api) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">{tCommon("loading")}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Heading fontSize={28} mb="$2">
            {t("yeastPageTitle")}
          </Heading>
          <RecipeMetaLine recipeId={recipeId} enabled={!!recipeId} loadRecipeMeta={loadRecipeMeta} />

          {load.loadError ? (
            <Text fontSize={12} color="$red10">{load.loadError}</Text>
          ) : null}

          {load.loading ? (
            <Spinner />
          ) : load.recipe ? (
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={18}>{t("yeastSectionHeading")}</Heading>
              <Text fontSize={12} opacity={0.8} mb="$2">
                {t("yeastHelp")}
              </Text>

              <View style={{ gap: 8, marginBottom: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                <Input
                  value={search.yeastQuery}
                  onChangeText={search.setYeastQuery}
                  placeholder={t("yeastSearchLabel")}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  style={{ flex: 1, minWidth: 140 }}
                />
                <Button onPress={() => void search.searchYeasts()} disabled={search.yeastSearching} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                  <Text>{search.yeastSearching ? "Searching…" : "Search"}</Text>
                </Button>
                <Button
                  onPress={search.clearSearch}
                  disabled={search.yeastSearching || (!search.yeastResults.length && !search.yeastQuery.trim())}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text>{t("buttons.clear")}</Text>
                </Button>
              </View>
              {search.yeastResults.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    {search.yeastResults.slice(0, 20).map((it) => (
                      <Button
                        key={it.id}
                        onPress={() => {
                          const attMin = typeof it.attenuationMin === "number" && Number.isFinite(it.attenuationMin) ? it.attenuationMin : null;
                          const attMax = typeof it.attenuationMax === "number" && Number.isFinite(it.attenuationMax) ? it.attenuationMax : null;
                          rows.addYeastRow({
                            ingredientId: it.id,
                            name: it.name,
                            lab: it.lab ?? null,
                            productId: it.productId ?? null,
                            attenuationMin: attMin ?? attMax,
                            attenuationMax: attMax ?? attMin,
                          });
                        }}
                        size="$2"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text fontSize={12}>{it.name} {it.lab ? `(${it.lab})` : ""} — Add</Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              ) : null}

              <Button onPress={() => rows.addYeastRow()} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mb="$2">
                <Text>{t("yeastAddCustomButton")}</Text>
              </Button>

              {load.yeastRows.map((r, idx) => (
                <YeastScreenRow
                  key={r.id}
                  row={r}
                  idx={idx}
                  locale={locale}
                  t={t}
                  tAnalysis={tAnalysis}
                  tUnits={tUnits}
                  tCommon={tCommon}
                  yeastAttenuationOverrides={load.yeastAttenuationOverrides}
                  onAttenuationOverrideChange={rows.onAttenuationOverrideChange}
                  updateYeastRow={rows.updateYeastRow}
                  removeYeastRow={rows.removeYeastRow}
                  batchSizeForCellsVal={rows.batchSizeForCellsVal}
                  analysisOg={rows.analysisOg}
                  openAdvancedSections={rows.openAdvancedSections}
                  setOpenAdvancedSections={rows.setOpenAdvancedSections}
                />
              ))}

              <Button onPress={() => void actions.onSave()} disabled={actions.saving} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mt="$2">
                <Text>{actions.saving ? "Saving…" : t("yeastSaveButton")}</Text>
              </Button>
              {actions.saveStatus ? <Text fontSize={12} color="$green10">{actions.saveStatus}</Text> : null}
              {actions.lowViabilityWarning != null ? <Text fontSize={12} color="$yellow10">Low viability warning: {actions.lowViabilityWarning.toFixed(1)}% (slurry + manual cell count &lt; 85%)</Text> : null}
              {actions.saveError ? <Text fontSize={12} color="$red10">{actions.saveError}</Text> : null}
            </Card>
          ) : null}

          <ManualCellCountHelpBox
            renderImage={({ assetKey, alt, width, height }) =>
              isMediaAssetKey(assetKey) ? (
                <RemoteImage
                  assetKey={assetKey}
                  accessibilityLabel={alt}
                  unavailableText={alt}
                  width={width}
                  height={height}
                />
              ) : null
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
