import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button, Heading, Text } from "@umbraculum/ui";

import type { useNativeRecipesListScreen } from "../../hooks/recipesList/useNativeRecipesListScreen";
import { RecipesCreateSection } from "./RecipesCreateSection";
import { RecipesListSection } from "./RecipesListSection";

type RecipesListModel = ReturnType<typeof useNativeRecipesListScreen>;

export function RecipesListScreenContent({ model }: { model: RecipesListModel }) {
  const {
    t,
    tCommon,
    baseUrl,
    canCall,
    styles,
    stylePickerOpen,
    setStylePickerOpen,
    newStyleKey,
    setNewStyleKey,
  } = model;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <Heading fontSize={28}>{t("title")}</Heading>

      {!canCall ? (
        <Text fontSize={14} color="$red10" mt="$2">
          {!baseUrl ? "Missing API base URL." : "Not authenticated."}
        </Text>
      ) : null}

      <RecipesCreateSection model={model} />
      <RecipesListSection model={model} />

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
  );
}
