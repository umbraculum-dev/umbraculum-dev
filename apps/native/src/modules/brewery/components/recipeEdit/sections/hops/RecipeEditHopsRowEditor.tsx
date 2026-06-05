import {View} from "react-native";
import type {EditorHopRow} from "@umbraculum/brewery-beerjson";
import {Accordion} from "tamagui";
import {Button, Card, Text} from "@umbraculum/ui";

import {Input} from "../../../../../../components/AppInput";
import {SURFACE_BACKGROUND} from "../../../../../../theme/colors";
import {HOP_FORM_OPTIONS, HOP_USE_OPTIONS} from "../../../../lib/recipeEditConstants";
import type {PickerOption} from "../../../../lib/recipeEditTypes";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";
import {PickerField} from "../../PickerField";

export function RecipeEditHopsRowEditor({
  model,
  row,
  idx,
}: {
  model: RecipeEditScreenModel;
  row: EditorHopRow;
  idx: number;
}) {
  const {tCommon, openHopIds, updateHopRow, removeHopRow} = model;

  return (
    <Accordion.Item key={row.id} value={`hop-${row.id}`}>
      <Card gap="$2" mb="$2" bg={SURFACE_BACKGROUND} borderWidth={1} borderColor="$borderColor" p="$3">
        <Accordion.Header>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Accordion.Trigger
              flex={1}
              unstyled
              accessibilityRole="button"
              accessibilityLabel={`${idx + 1}. ${row.name || "(unnamed)"}`}
              accessibilityState={{ expanded: openHopIds.includes(`hop-${row.id}`) }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text fontSize={14} fontWeight="600">
                  {idx + 1}. {row.name || "(unnamed)"}
                </Text>
                <Text fontSize={14} opacity={0.7}>
                  {openHopIds.includes(`hop-${row.id}`) ? "▾" : "▸"}
                </Text>
              </View>
            </Accordion.Trigger>
            <Button onPress={() => removeHopRow(row.id)} size="$2" chromeless>
              <Text color="$red10">{tCommon("remove")}</Text>
            </Button>
          </View>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 8, marginTop: 12 }}>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                Name
              </Text>
              <Input
                value={row.name}
                onChangeText={(text) => updateHopRow(row.id, { name: text, ingredientId: null, country: null })}
                placeholder="Hop name"
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  Amount (g)
                </Text>
                <Input
                  value={String(row.amountGrams)}
                  onChangeText={(text) => {
                    const n = parseFloat(text);
                    updateHopRow(row.id, { amountGrams: Number.isFinite(n) ? n : 0 });
                  }}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  α %
                </Text>
                <Input
                  value={row.alphaAcidPercent != null ? String(row.alphaAcidPercent) : ""}
                  onChangeText={(text) => {
                    const n = text.trim() ? parseFloat(text) : null;
                    updateHopRow(row.id, { alphaAcidPercent: n != null && Number.isFinite(n) ? n : null });
                  }}
                  placeholder="—"
                  keyboardType="decimal-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
              <View style={{ flex: 1, minWidth: 80 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  Time (min)
                </Text>
                <Input
                  value={row.timeMinutes != null ? String(row.timeMinutes) : ""}
                  onChangeText={(text) => {
                    const n = text.trim() ? parseFloat(text) : null;
                    updateHopRow(row.id, { timeMinutes: n != null && Number.isFinite(n) ? n : null });
                  }}
                  placeholder="60"
                  keyboardType="number-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            </View>
            <View>
              <PickerField
                label="Use"
                value={row.use ?? "boil"}
                options={HOP_USE_OPTIONS as unknown as PickerOption[]}
                onChange={(v) => updateHopRow(row.id, { use: v as EditorHopRow["use"] })}
                closeLabel={tCommon("close")}
                accessibilityLabel="Use"
              />
            </View>
            <View>
              <PickerField
                label="Form"
                value={row.form ?? "pellet"}
                options={HOP_FORM_OPTIONS as unknown as PickerOption[]}
                onChange={(v) => updateHopRow(row.id, { form: v as EditorHopRow["form"] })}
                closeLabel={tCommon("close")}
                accessibilityLabel="Form"
              />
            </View>
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
