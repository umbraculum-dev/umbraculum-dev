import React from "react";
import { XStack, YStack } from "tamagui";

import { useT } from "@brewery/i18n-react";
import { Button, Card, Input, SelectField, Text } from "@brewery/ui";

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";

export const SALT_OPTIONS: Array<{ value: SaltKey; label: string }> = [
  { value: "gypsum", label: "Gypsum (CaSO4·2H2O)" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2·2H2O)" },
  { value: "epsom", label: "Epsom (MgSO4·7H2O)" },
  { value: "table_salt", label: "Table salt (NaCl)" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)" },
];

export type SaltAdditionRow = { saltKey: SaltKey; grams: number };

export function SaltAdditionsEditor(props: {
  rows: SaltAdditionRow[];
  onChange: (next: SaltAdditionRow[]) => void;
  idPrefix?: string;
  disabled?: boolean;
}) {
  const { t } = useT("ui");
  const { t: tUnits } = useT("units");
  const { t: tCommon } = useT("common");

  const { rows, onChange, idPrefix = "salt", disabled } = props;

  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx: number, next: Partial<SaltAdditionRow>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...next } : r)));
  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <Card gap="$3" padding={0} backgroundColor="transparent" borderWidth={0}>
      {rows.length ? (
        <YStack gap="$3">
          {rows.map((row, idx) => (
            <XStack key={idx} gap="$3" flexWrap="wrap" alignItems="flex-end">
              <YStack flex={1} minWidth={180} gap="$1.5">
                <Text fontSize={11} opacity={0.8} marginBottom="$1">
                  {t("salt")}
                </Text>
                <SelectField
                  id={`${idPrefix}-salt-key-${idx}`}
                  value={row.saltKey}
                  onValueChange={(v) => updateRow(idx, { saltKey: v as SaltKey })}
                  options={SALT_OPTIONS}
                  {...(disabled !== undefined ? { disabled } : {})}
                  width="full"
                  aria-label={t("salt")}
                  closeLabel={tCommon("close")}
                />
              </YStack>

              <YStack flex={1} minWidth={140} gap="$1.5">
                <Text fontSize={11} opacity={0.8} marginBottom="$1">
                  {t("amountLabel", { unit: tUnits("g") })}
                </Text>
                <Input
                  id={`${idPrefix}-salt-grams-${idx}`}
                  keyboardType="decimal-pad"
                  value={String(row.grams)}
                  onChangeText={(text) => updateRow(idx, { grams: Number(text) || 0 })}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  disabled={disabled}
                />
              </YStack>

              <Button
                size="$3"
                chromeless
                onPress={() => removeRow(idx)}
                disabled={disabled}
                accessibilityLabel={tCommon("remove")}
              >
                <Text fontSize={12}>{tCommon("remove")}</Text>
              </Button>
            </XStack>
          ))}
        </YStack>
      ) : (
        <Text fontSize={12} opacity={0.8}>
          {t("noSaltsAddedYet")}
        </Text>
      )}

      <Button size="$3" onPress={addRow} disabled={disabled}>
        <Text>{t("addSalt")}</Text>
      </Button>
    </Card>
  );
}

