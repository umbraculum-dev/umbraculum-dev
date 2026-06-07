import {View} from "react-native";
import {Accordion} from "tamagui";
import {Card, Heading, Text} from "@umbraculum/ui";

import { SURFACE_BACKGROUND, SURFACE_BORDER } from "@umbraculum/native-shell/theme";
import { AdSlot } from "@umbraculum/native-shell/components";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";
import {RecipeEditFermentablesRowEditor} from "./RecipeEditFermentablesRowEditor";
import {RecipeEditFermentablesSearchSection} from "./RecipeEditFermentablesSearchSection";

export function RecipeEditFermentablesSection({ model }: { model: RecipeEditScreenModel }) {
  const {t, tUnits, openSections, gristTotals, openFermentableIds, setOpenFermentableIds, gristRows} = model;

  return (
    <Accordion.Item value="fermentables">
      <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.fermentables")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("sections.fermentables")}
            accessibilityState={{ expanded: openSections.includes("fermentables") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("sections.fermentables")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("fermentables") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ marginTop: 12 }}>
            <RecipeEditFermentablesSearchSection model={model} />
            <View style={{ height: 1, backgroundColor: SURFACE_BORDER, marginVertical: 12 }} />
            <Text fontSize={12} opacity={0.8} style={{ marginBottom: 12 }}>
              {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
              {gristTotals.weightedAvgLovibond != null
                ? ` · ${t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}`
                : ""}
            </Text>
            <Accordion
              type="multiple"
              value={openFermentableIds}
              onValueChange={(next) => setOpenFermentableIds(Array.isArray(next) ? next : next ? [next] : [])}
            >
              {gristRows.map((r, idx) => (
                <RecipeEditFermentablesRowEditor key={r.id} model={model} row={r} idx={idx} />
              ))}
            </Accordion>
          </View>
          <AdSlot placement="recipe_edit_after_fermentables" />
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
