import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Spinner, Text } from "@umbraculum/ui";

import type { useNativeRecipesListScreen } from "../../hooks/recipesList/useNativeRecipesListScreen";

type RecipesListModel = ReturnType<typeof useNativeRecipesListScreen>;

export function RecipesListSection({ model }: { model: RecipesListModel }) {
  const {
    t,
    loading,
    error,
    recipes,
    deleteConfirmId,
    deletingId,
    onAskDelete,
    onDeleteConfirm,
    setDeleteConfirmId,
    openEditor,
  } = model;

  return (
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
  );
}
