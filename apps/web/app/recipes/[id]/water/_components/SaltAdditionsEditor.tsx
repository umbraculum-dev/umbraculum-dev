"use client";

import { useTranslations } from "next-intl";
import { Button, Input, SizableText, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../_components/recipe-edit";

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";

const SALT_OPTIONS: Array<{ value: SaltKey; label: string }> = [
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
  idPrefix: string;
  disabled?: boolean;
}) {
  const tUi = useTranslations("ui");
  const tUnits = useTranslations("units");
  const { rows, onChange, idPrefix, disabled } = props;

  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx: number, next: Partial<SaltAdditionRow>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...next } : r)));
  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <YStack gap="$3">
      {rows.length ? (
        <YStack gap="$3">
          {rows.map((row, idx) => (
            <XStack key={idx} gap="$3" flexWrap="wrap" alignItems="flex-end">
              <YStack flex={1} minWidth={120} gap="$1.5">
                <RecipeEditFieldLabel htmlFor={`${idPrefix}-salt-key-${idx}`}>
                  Salt
                </RecipeEditFieldLabel>
                <BrewSelect
                  id={`${idPrefix}-salt-key-${idx}`}
                  value={row.saltKey}
                  onValueChange={(v) => updateRow(idx, { saltKey: v as SaltKey })}
                  options={SALT_OPTIONS}
                  disabled={disabled}
                  width="full"
                />
              </YStack>
              <YStack flex={1} minWidth={120} gap="$1.5">
                <RecipeEditFieldLabel htmlFor={`${idPrefix}-salt-grams-${idx}`}>
                  {tUi("amountLabel", { unit: tUnits("g") })}
                </RecipeEditFieldLabel>
                <Input
                  id={`${idPrefix}-salt-grams-${idx}`}
                  keyboardType="decimal-pad"
                  value={String(row.grams)}
                  onChangeText={(text) => updateRow(idx, { grams: Number(text) || 0 })}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                  disabled={disabled}
                />
              </YStack>
              <YStack alignSelf="flex-end">
                <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => removeRow(idx)} disabled={disabled}>
                  Remove
                </Button>
              </YStack>
            </XStack>
          ))}
        </YStack>
      ) : (
        <YStack>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            No salts added yet.
          </SizableText>
        </YStack>
      )}

      <YStack>
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={addRow} disabled={disabled}>
          {tUi("addSalt")}
        </Button>
      </YStack>
    </YStack>
  );
}
