import {View} from "react-native";
import {Accordion} from "tamagui";
import {Card, Heading, Text} from "@umbraculum/ui";

import {Input} from "../../../../../components/AppInput";
import {SURFACE_BACKGROUND} from "../../../../../theme/colors";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditBoilSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    openSections,
    boilTimeMinutes,
    setBoilTimeMinutes
  } = model;

  return (
          <Accordion.Item value="boil">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.boil")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.boil")}
                  accessibilityState={{ expanded: openSections.includes("boil") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.boil")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("boil") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Boil time (min)
                    </Text>
                    <Input
                      value={boilTimeMinutes}
                      onChangeText={setBoilTimeMinutes}
                      placeholder="60"
                      keyboardType="number-pad"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
  );
}
