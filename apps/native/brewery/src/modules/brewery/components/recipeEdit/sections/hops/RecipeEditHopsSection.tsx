import {View} from "react-native";
import {Accordion} from "tamagui";
import {Card, Heading, Text} from "@umbraculum/ui";

import { SURFACE_BACKGROUND } from "@umbraculum/native-shell/theme";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";
import {RecipeEditHopsRowEditor} from "./RecipeEditHopsRowEditor";
import {RecipeEditHopsSearchSection} from "./RecipeEditHopsSearchSection";

export function RecipeEditHopsSection({ model }: { model: RecipeEditScreenModel }) {
  const {t, openSections, openHopIds, setOpenHopIds, hopsRows} = model;

  return (
    <Accordion.Item value="hops">
      <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.hops")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("sections.hops")}
            accessibilityState={{ expanded: openSections.includes("hops") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("sections.hops")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("hops") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ marginTop: 12 }}>
            <RecipeEditHopsSearchSection model={model} />
            <Accordion
              type="multiple"
              value={openHopIds}
              onValueChange={(next) => setOpenHopIds(Array.isArray(next) ? next : next ? [next] : [])}
            >
              {hopsRows.map((r, idx) => (
                <RecipeEditHopsRowEditor key={r.id} model={model} row={r} idx={idx} />
              ))}
            </Accordion>
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
