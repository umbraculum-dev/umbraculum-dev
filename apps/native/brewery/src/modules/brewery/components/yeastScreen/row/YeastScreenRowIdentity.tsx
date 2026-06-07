import React from "react";
import { View } from "react-native";
import type { EditorYeastRow } from "@umbraculum/brewery-beerjson";
import { Text } from "@umbraculum/ui";
import type { TranslationValues } from "@umbraculum/i18n-react";

import { ReadOnlyField } from "../../../../../components/ReadOnlyField";
import { Input } from "../../../../../components/AppInput";

export type YeastScreenRowSectionProps = {
  row: EditorYeastRow;
  t: (key: string, params?: TranslationValues) => string;
  updateYeastRow: (id: string, patch: Partial<EditorYeastRow>) => void;
};

export function YeastScreenRowIdentity(props: YeastScreenRowSectionProps) {
  const { row: r, t, updateYeastRow } = props;

  return (
    <>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {t("yeastNameLabel")}
        </Text>
        <Input
          value={r.name}
          onChangeText={(text) => updateYeastRow(r.id, { name: text, ingredientId: null })}
          placeholder={t("yeastCustomNamePlaceholder")}
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <View style={{ minWidth: 140, flexGrow: 1 }}>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastLabLabel")}
          </Text>
          <ReadOnlyField value={r.lab ?? ""} />
        </View>
        <View style={{ minWidth: 140, flexGrow: 1 }}>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastProductIdLabel")}
          </Text>
          <ReadOnlyField value={r.productId ?? ""} />
        </View>
      </View>
    </>
  );
}
