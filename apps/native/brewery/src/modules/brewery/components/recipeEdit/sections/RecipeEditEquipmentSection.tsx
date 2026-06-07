import {ScrollView, View} from "react-native";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import { SURFACE_BACKGROUND } from "@umbraculum/native-shell/theme";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditEquipmentSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    navigation,
    openSections,
    equipmentProfilesError,
    equipmentProfiles,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
    equipmentApplying,
    applyEquipmentProfileToRecipe,
    equipmentApplyError
  } = model;

  return (
          <Accordion.Item value="equipment">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.equipment")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.equipment")}
                  accessibilityState={{ expanded: openSections.includes("equipment") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.equipment")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("equipment") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("equipmentSection.help")}
                  </Text>
                  {equipmentProfilesError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {equipmentProfilesError}
                    </Text>
                  ) : null}
                  <View style={{ gap: 8 }}>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        {t("equipmentSection.profileLabel")}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                          <Button
                            onPress={() => setSelectedEquipmentProfileId("")}
                            size="$3"
                            background={!selectedEquipmentProfileId ? "$color4" : "$background"}
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={14}>{t("equipmentSection.noneOption")}</Text>
                          </Button>
                          {equipmentProfiles.map((p) => (
                            <Button
                              key={p.id}
                              onPress={() => setSelectedEquipmentProfileId(p.id)}
                              size="$3"
                              background={selectedEquipmentProfileId === p.id ? "$color4" : "$background"}
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text fontSize={14}>{p.name}</Text>
                            </Button>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("apply")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                      >
                        <Text>{equipmentApplying ? t("equipmentSection.working") : t("equipmentSection.apply")}</Text>
                      </Button>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("reload")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("equipmentSection.reload")}</Text>
                      </Button>
                    </View>
                  </View>
                  {equipmentApplyError ? (
                    <Text fontSize={12} color="$red10" mt="$2">
                      {equipmentApplyError}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <Text fontSize={12} opacity={0.8}>{t("equipmentSection.manageTemplatesText")}</Text>
                    <Button chromeless size="$3" onPress={() => navigation.navigate("Equipment")}>
                      <Text fontSize={12} color="$blue10">{t("equipmentSection.manageTemplatesLinkText")}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

  );
}
