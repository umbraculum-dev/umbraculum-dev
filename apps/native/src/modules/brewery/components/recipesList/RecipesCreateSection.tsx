import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

import { Input } from "../../../../components/AppInput";
import type { useNativeRecipesListScreen } from "../../hooks/recipesList/useNativeRecipesListScreen";

type RecipesListModel = ReturnType<typeof useNativeRecipesListScreen>;

export function RecipesCreateSection({ model }: { model: RecipesListModel }) {
  const {
    t,
    newName,
    setNewName,
    selectedStyleLabel,
    stylesLoading,
    styles,
    stylesError,
    setStylePickerOpen,
    creating,
    onCreate,
    loading,
    refresh,
    newStyleKey,
  } = model;

  return (
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
  );
}
