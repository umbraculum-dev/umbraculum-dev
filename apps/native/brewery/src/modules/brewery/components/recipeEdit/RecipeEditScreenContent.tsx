import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { Accordion } from "tamagui";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";

import type { RecipeEditScreenModel } from "../../hooks/useRecipeEditScreen";
import {
  RecipeEditBasicsSection,
  RecipeEditBoilSection,
  RecipeEditEquipmentSection,
  RecipeEditFermentablesSection,
  RecipeEditHopsSection,
  RecipeEditMashingSection,
  RecipeEditNotesSection,
  RecipeEditYeastSection,
} from "./sections";

export function RecipeEditScreenContent(props: { model: RecipeEditScreenModel }) {
  const {
    canCall,
    loading,
    recipe,
    loadError,
    t,
    tBrewSessions,
    tCommon,
    tEquip,
    navigation,
    recipeId,
    saveStatus,
    saveError,
    scrollRef,
    openSections,
    setOpenSections,
    styleKey,
    setStyleKey,
    styles,
    stylePickerOpen,
    setStylePickerOpen,
    saving,
    save,
  } = props.model;

  if (!canCall) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          Not authenticated or missing API base URL.
        </Text>
      </Screen>
    );
  }

  if (loading && !recipe) {
    return (
      <Screen>
        <View style={{ paddingVertical: 48, alignItems: "center" }}>
          <Spinner />
          <Text fontSize={14} opacity={0.8} mt="$2">
            {t("loading")}
          </Text>
        </View>
      </Screen>
    );
  }

  if (loadError || !recipe) {
    return (
      <Screen>
        <Heading fontSize={22}>Error</Heading>
        <Text fontSize={14} color="$red10">
          {loadError ?? "Recipe not found"}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {(saveStatus || saveError) ? (
          <Card gap="$2" mb="$3" bg={saveError ? "rgba(255,80,80,0.15)" : "rgba(80,200,80,0.15)"}>
            {saveStatus ? <Text fontSize={14}>{saveStatus}</Text> : null}
            {saveError ? <Text fontSize={14} color="$red10">{saveError}</Text> : null}
          </Card>
        ) : null}

        <Card gap="$2" mb="$3">
          <Heading fontSize={16}>{tBrewSessions("listTitle")}</Heading>
          <Button
            onPress={() => navigation.navigate("BrewSessionsList", { recipeId })}
            accessibilityLabel={tBrewSessions("listTitle")}
          >
            <Text>{tBrewSessions("listTitle")}</Text>
          </Button>
        </Card>

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
        >
          <RecipeEditBasicsSection model={props.model} />
          <RecipeEditFermentablesSection model={props.model} />
          <RecipeEditHopsSection model={props.model} />
          <RecipeEditYeastSection model={props.model} />
          <RecipeEditEquipmentSection model={props.model} />
          <RecipeEditMashingSection model={props.model} />
          <RecipeEditBoilSection model={props.model} />
          <RecipeEditNotesSection model={props.model} />
        </Accordion>

        <Button
          onPress={() => void save()}
          disabled={saving}
          mt="$4"
          accessibilityRole="button"
          accessibilityLabel={tEquip("save")}
        >
          <Text>{saving ? t("status.saved") + "…" : tEquip("save")}</Text>
        </Button>

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
                <Heading fontSize={18}>Style</Heading>
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
                    const selected = styleKey === s.key;
                    return (
                      <Button
                        key={s.key}
                        onPress={() => {
                          setStyleKey(s.key);
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
      </KeyboardAvoidingView>
    </Screen>
  );
}
