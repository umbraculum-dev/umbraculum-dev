import React, { useCallback, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";
import { useFocusEffect, useNavigation, type NavigationProp } from "@react-navigation/native";

import { Input } from "../components/AppInput";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import type { RootStackParamList } from "../navigation/types";

type RecipeListItem = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  version?: number;
};

type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

function buildMinimalBeerJson(name: string): unknown {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [],
            hop_additions: [],
            culture_additions: [],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}

export function RecipesListScreen() {
  const auth = useAuth();
  const { t } = useT("recipes");
  const { t: tCommon } = useT("common");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStyleKey, setNewStyleKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const loadStyles = useCallback(async () => {
    if (!api) return;
    setStylesError(null);
    setStylesLoading(true);
    try {
      const res = await api.get("/api/styles");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as { styles?: unknown })?.styles;
      setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
    } catch (err) {
      setStyles([]);
      setStylesError(String(err));
    } finally {
      setStylesLoading(false);
    }
  }, [api]);

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/api/recipes");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as { recipes?: unknown })?.recipes;
      setRecipes(Array.isArray(items) ? (items as RecipeListItem[]) : []);
      setDeleteConfirmId(null);
    } catch (err) {
      setError(String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      if (canCall) {
        void loadStyles();
        void refresh();
      }
    }, [canCall, loadStyles, refresh]),
  );

  const onCreate = useCallback(async () => {
    if (!api) return;
    const name = newName.trim();
    const styleKey = newStyleKey.trim();
    if (!name || !styleKey) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post("/api/recipes", {
        name,
        styleKey,
        beerJsonRecipeJson: buildMinimalBeerJson(name),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setNewName("");
      setNewStyleKey("");
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }, [api, newName, newStyleKey, refresh]);

  const onAskDelete = useCallback((id: string) => {
    setError(null);
    setDeleteConfirmId((cur) => (cur === id ? null : id));
  }, []);

  const onDelete = useCallback(
    async (id: string) => {
      if (!api) return;
      setError(null);
      setDeletingId(id);
      try {
        const res = await api.delete(`/api/recipes/${id}`);
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        await refresh();
      } catch (err) {
        setError(String(err));
      } finally {
        setDeletingId(null);
        setDeleteConfirmId(null);
      }
    },
    [api, refresh],
  );

  const onDeleteConfirm = useCallback(
    (id: string) => {
      Alert.alert(
        t("delete.confirmTitle"),
        t("delete.confirmBody"),
        [
          { text: t("delete.cancel"), style: "cancel", onPress: () => setDeleteConfirmId(null) },
          { text: t("delete.confirmCta"), style: "destructive", onPress: () => void onDelete(id) },
        ],
      );
    },
    [t, onDelete],
  );

  const openEditor = useCallback(
    (recipeId: string) => {
      navigation.navigate("RecipeEdit", { recipeId });
    },
    [navigation],
  );

  const selectedStyleLabel =
    newStyleKey && styles.find((s) => s.key === newStyleKey)
      ? newStyleKey === "custom"
        ? styles.find((s) => s.key === "custom")?.name ?? "Custom"
        : `${styles.find((s) => s.key === newStyleKey)?.code ?? ""} — ${styles.find((s) => s.key === newStyleKey)?.name ?? newStyleKey}`
      : t("stylePlaceholder");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Heading fontSize={28}>{t("title")}</Heading>

        {!canCall ? (
          <Text fontSize={14} color="$red10" mt="$2">
            {!baseUrl ? "Missing API base URL." : "Not authenticated."}
          </Text>
        ) : null}

        <Card gap="$2" mt="$3" aria-label={t("createTitle")}>
          <Heading fontSize={18}>{t("createTitle")}</Heading>
          <View style={{ gap: 12 }}>
            <View>
              <Text fontSize={12} opacity={0.8} mb="$1">
                {t("nameLabel")}
              </Text>
              <Input
                value={newName}
                onChangeText={setNewName}
                placeholder={t("nameLabel")}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View>
              <Text fontSize={12} opacity={0.8} mb="$1">
                {t("styleLabel")}
              </Text>
              <Button
                onPress={() => setStylePickerOpen(true)}
                disabled={stylesLoading || styles.length === 0}
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
                width="100%"
                p="$3"
              >
                <Text fontSize={14}>{selectedStyleLabel}</Text>
              </Button>
              {stylesError ? (
                <Text fontSize={12} color="$red10" mt="$1">
                  {String(stylesError)}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                onPress={() => void onCreate()}
                disabled={creating || !newName.trim() || !newStyleKey.trim()}
                accessibilityRole="button"
                accessibilityLabel={t("createButton")}
              >
                <Text>{creating ? t("creating") : t("createButton")}</Text>
              </Button>
              <Button
                onPress={() => void refresh()}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t("refresh")}
              >
                <Text>{loading ? t("refreshing") : t("refresh")}</Text>
              </Button>
            </View>
          </View>
        </Card>

        <Card gap="$2" mt="$3" aria-label={t("listTitle")}>
          <Heading fontSize={18}>{t("listTitle")}</Heading>
          {loading && recipes.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Spinner />
            </View>
          ) : error ? (
            <Text fontSize={14} color="$red10">
              {error}
            </Text>
          ) : recipes.length === 0 ? (
            <Text fontSize={14} opacity={0.8}>
              {t("noRecipes")}
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {recipes.map((r) => (
                <View
                  key={r.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text fontWeight="700" fontSize={16}>
                        {r.name}
                      </Text>
                      {r.style ? (
                        <Text fontSize={12} opacity={0.8}>
                          {r.style}
                        </Text>
                      ) : null}
                      {typeof r.version === "number" ? (
                        <Text fontSize={12} opacity={0.8}>
                          {t("versionShort")} {String(r.version).padStart(2, "0")}
                        </Text>
                      ) : null}
                    </View>
                    <Button
                      onPress={() => onAskDelete(r.id)}
                      disabled={Boolean(deletingId)}
                      chromeless
                      size="$2"
                      accessibilityRole="button"
                      accessibilityLabel={t("delete.cta")}
                    >
                      <Text color="$red10">{t("delete.cta")}</Text>
                    </Button>
                  </View>
                  {deleteConfirmId === r.id ? (
                    <View style={{ marginTop: 12, gap: 8 }}>
                      <Text fontSize={12}>
                        <Text fontWeight="700">{t("delete.confirmTitle")}</Text>
                        <Text opacity={0.8}> {t("delete.confirmBody")}</Text>
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Button
                          onPress={() => onDeleteConfirm(r.id)}
                          disabled={deletingId === r.id}
                          background="$red10"
                          accessibilityRole="button"
                          accessibilityLabel={t("delete.confirmCta")}
                        >
                          <Text>{deletingId === r.id ? t("delete.deleting") : t("delete.confirmCta")}</Text>
                        </Button>
                        <Button
                          onPress={() => setDeleteConfirmId(null)}
                          disabled={Boolean(deletingId)}
                          accessibilityRole="button"
                          accessibilityLabel={t("delete.cancel")}
                        >
                          <Text>{t("delete.cancel")}</Text>
                        </Button>
                      </View>
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                    <Button
                      onPress={() => openEditor(r.id)}
                      size="$4"
                      width="100%"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      accessibilityRole="button"
                      accessibilityLabel={t("openEditor")}
                    >
                      <Text>{t("openEditor")}</Text>
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Modal
          visible={stylePickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStylePickerOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
            onPress={() => setStylePickerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t("styleLabel")}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: "#141820",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: "#2a2f3a",
              }}
              accessibilityRole="none"
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Heading fontSize={18}>{t("styleLabel")}</Heading>
                <Button
                  onPress={() => setStylePickerOpen(false)}
                  size="$2"
                  chromeless
                  accessibilityRole="button"
                  accessibilityLabel={tCommon("close")}
                >
                  <Text>{tCommon("close")}</Text>
                </Button>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {styles.map((s) => {
                    const label = s.key === "custom" ? s.name : `${s.code} — ${s.name}`;
                    const selected = newStyleKey === s.key;
                    return (
                      <Button
                        key={s.key}
                        onPress={() => {
                          setNewStyleKey(s.key);
                          setStylePickerOpen(false);
                        }}
                        background={selected ? "$color4" : "$background"}
                        borderWidth={1}
                        borderColor="$borderColor"
                        width="100%"
                        p="$3"
                        accessibilityRole="button"
                        accessibilityLabel={label}
                      >
                        <Text fontWeight={selected ? "700" : "400"}>{label}</Text>
                      </Button>
                    );
                  })}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </Screen>
  );
}
