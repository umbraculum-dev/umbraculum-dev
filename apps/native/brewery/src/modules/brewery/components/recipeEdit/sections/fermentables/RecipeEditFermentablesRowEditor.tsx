import {View} from "react-native";
import type {EditorGristRow} from "@umbraculum/brewery-beerjson";
import {Accordion} from "tamagui";
import {Button, Card, Text} from "@umbraculum/ui";

import { SURFACE_BACKGROUND } from "@umbraculum/native-shell/theme";
import { Input } from "@umbraculum/native-shell/components";
import {roundTo} from "../../../../lib/recipeEditHelpers";
import {MALT_CLASS_OPTIONS} from "../../../../lib/recipeEditConstants";
import type {PickerOption} from "../../../../lib/recipeEditTypes";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";
import {PickerField} from "../../PickerField";

export function RecipeEditFermentablesRowEditor({
  model,
  row,
  idx,
}: {
  model: RecipeEditScreenModel;
  row: EditorGristRow;
  idx: number;
}) {
  const {t, tCommon, tUnits, openFermentableIds, updateGristRow, removeGristRow} = model;

  return (
    <Accordion.Item key={row.id} value={`grist-${row.id}`}>
      <Card gap="$2" mb="$2" bg={SURFACE_BACKGROUND} borderWidth={1} borderColor="$borderColor" p="$3">
        <Accordion.Header>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Accordion.Trigger
              flex={1}
              unstyled
              accessibilityRole="button"
              accessibilityLabel={`${idx + 1}. ${row.name || "(unnamed)"}`}
              accessibilityState={{ expanded: openFermentableIds.includes(`grist-${row.id}`) }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text fontSize={14} fontWeight="600">
                  {idx + 1}. {row.name || "(unnamed)"}
                </Text>
                <Text fontSize={14} opacity={0.7}>
                  {openFermentableIds.includes(`grist-${row.id}`) ? "▾" : "▸"}
                </Text>
              </View>
            </Accordion.Trigger>
            <Button onPress={() => removeGristRow(row.id)} size="$2" chromeless>
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
                onChangeText={(text) =>
                  updateGristRow(row.id, { name: text, ingredientId: undefined, producer: null, group: null })
                }
                placeholder="Fermentable name"
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("amountLabel", { unit: tUnits("kg") })}
                </Text>
                <Input
                  value={String(row.amountKg)}
                  onChangeText={(text) => {
                    const n = parseFloat(text);
                    updateGristRow(row.id, { amountKg: Number.isFinite(n) ? n : 0 });
                  }}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("colorLabel", { unit: "°L" })}
                </Text>
                <Input
                  value={row.colorLovibond != null ? String(row.colorLovibond) : ""}
                  onChangeText={(text) => {
                    const n = text.trim() ? parseFloat(text) : null;
                    updateGristRow(row.id, { colorLovibond: n != null && Number.isFinite(n) ? n : null });
                  }}
                  placeholder="—"
                  keyboardType="decimal-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            </View>
            <PickerField
              label={t("fermentables.mashPhClassLegacyLabel")}
              value={row.maltClass ?? "base"}
              options={MALT_CLASS_OPTIONS as unknown as PickerOption[]}
              onChange={(v) => updateGristRow(row.id, { maltClass: v as EditorGristRow["maltClass"] })}
              closeLabel={tCommon("close")}
              accessibilityLabel={t("fermentables.mashPhClassLegacyLabel")}
            />
            <PickerField
              label={t("fermentableTimingLabel")}
              value={row.timingUse ?? "add_to_mash"}
              options={[
                { value: "add_to_mash", label: t("fermentableTimingMash") },
                { value: "add_to_boil", label: t("fermentableTimingKettle") },
              ]}
              onChange={(v) =>
                updateGristRow(row.id, { timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash" })
              }
              closeLabel={tCommon("close")}
              accessibilityLabel={t("fermentableTimingLabel")}
            />
            <PickerField
              label={t("fermentableLateAdditionLabel")}
              value={row.lateAddition === true ? "yes" : "no"}
              options={[
                { value: "no", label: t("fermentableLateAdditionNo") },
                { value: "yes", label: t("fermentableLateAdditionYes") },
              ]}
              onChange={(v) => updateGristRow(row.id, { lateAddition: v === "yes" })}
              closeLabel={tCommon("close")}
              accessibilityLabel={t("fermentableLateAdditionLabel")}
            />
            {(row.group ?? "") ? (
              <View>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("fermentables.groupLabel")}
                </Text>
                <Input
                  value={row.group ?? ""}
                  disabled
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            ) : null}
            <View>
              <PickerField
                label={t("fermentables.potentialKindLabel")}
                value={row.potential?.kind ?? ""}
                options={[
                  { value: "", label: "(none)" },
                  { value: "ppg", label: "PPG" },
                  { value: "yieldPercent", label: "Yield %" },
                  { value: "sg", label: "SG (e.g. 1.037)" },
                  { value: "plato", label: "Plato (°P)" },
                ]}
                onChange={(v) => {
                  const kind = v as "" | NonNullable<EditorGristRow["potential"]>["kind"];
                  if (!kind) return updateGristRow(row.id, { potential: null });
                  updateGristRow(row.id, {
                    potential: { kind, value: roundTo(row.potential?.value ?? 0, 3) },
                  });
                }}
                closeLabel={tCommon("close")}
                accessibilityLabel={t("fermentables.potentialKindLabel")}
              />
            </View>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("fermentables.potentialValueLabel")}
              </Text>
              <Input
                value={row.potential ? String(roundTo(row.potential.value, 3)) : ""}
                onChangeText={(text) => {
                  if (!row.potential) return;
                  const v = text === "" ? null : Number(text);
                  if (v === null) return updateGristRow(row.id, { potential: null });
                  updateGristRow(row.id, {
                    potential: { ...row.potential, value: roundTo(v, 3) },
                  });
                }}
                placeholder="—"
                keyboardType="decimal-pad"
                disabled={!row.potential}
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
