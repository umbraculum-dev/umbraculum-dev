import {View} from "react-native";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import {Input} from "../../../../../components/AppInput";
import {SURFACE_BACKGROUND} from "../../../../../theme/colors";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditBasicsSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    openSections,
    name,
    setName,
    styles,
    stylesLoading,
    setStylePickerOpen,
    selectedStyleLabel
  } = model;

  return (
          <Accordion.Item value="basics">
            <Card gap="$2" bg={SURFACE_BACKGROUND} aria-label={t("sections.basics")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.basics")}
                  accessibilityState={{ expanded: openSections.includes("basics") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.basics")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("basics") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12, marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Name
                    </Text>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="Recipe name"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      {t("sections.basics")} — Style
                    </Text>
                    <Button
                      onPress={() => setStylePickerOpen(true)}
                      disabled={stylesLoading || styles.length === 0}
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      width="100%"
                      p="$3"
                      accessibilityRole="button"
                      accessibilityLabel={selectedStyleLabel}
                    >
                      <Text fontSize={14}>{selectedStyleLabel}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
  );
}
