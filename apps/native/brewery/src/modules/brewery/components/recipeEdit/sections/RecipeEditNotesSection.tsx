import {View} from "react-native";
import {Accordion, TextArea} from "tamagui";
import {Card, Heading, Text} from "@umbraculum/ui";

import {SURFACE_BACKGROUND} from "../../../../../theme/colors";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditNotesSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    scrollRef,
    openSections,
    notes,
    setNotes
  } = model;

  return (
          <Accordion.Item value="notes">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.notes")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.notes")}
                  accessibilityState={{ expanded: openSections.includes("notes") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.notes")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("notes") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <TextArea
                    value={notes}
                    onChangeText={setNotes}
                    onFocus={() => {
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                    }}
                    placeholder="Notes"
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    height={80}
                  />
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
  );
}
