"use client";

import { useTranslations } from "next-intl";
import { SizableText, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../_components/recipe-edit";

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";
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
                <select
                  id={`${idPrefix}-salt-key-${idx}`}
                  value={row.saltKey}
                  onChange={(e) => updateRow(idx, { saltKey: e.target.value as SaltKey })}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                  disabled={disabled}
                >
                  <option value="gypsum">Gypsum (CaSO4·2H2O)</option>
                  <option value="calcium_chloride">Calcium chloride (CaCl2·2H2O)</option>
                  <option value="epsom">Epsom (MgSO4·7H2O)</option>
                  <option value="table_salt">Table salt (NaCl)</option>
                  <option value="baking_soda">Baking soda (NaHCO3)</option>
                </select>
              </YStack>
              <YStack flex={1} minWidth={120} gap="$1.5">
                <RecipeEditFieldLabel htmlFor={`${idPrefix}-salt-grams-${idx}`}>
                  {tUi("amountLabel", { unit: tUnits("g") })}
                </RecipeEditFieldLabel>
                <input
                  id={`${idPrefix}-salt-grams-${idx}`}
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={row.grams}
                  onChange={(e) => updateRow(idx, { grams: Number(e.target.value) })}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                  disabled={disabled}
                />
              </YStack>
              <YStack alignSelf="flex-end">
                <button type="button" onClick={() => removeRow(idx)} disabled={disabled}>
                  Remove
                </button>
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
        <button type="button" onClick={addRow} disabled={disabled}>
          {tUi("addSalt")}
        </button>
      </YStack>
    </YStack>
  );
}
