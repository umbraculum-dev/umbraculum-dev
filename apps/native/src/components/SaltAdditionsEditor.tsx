import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Text } from "@brewery/ui";
import { Input } from "./AppInput";

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";

const SALT_OPTIONS: Array<{ value: SaltKey; label: string }> = [
  { value: "gypsum", label: "Gypsum (CaSO4·2H2O)" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2·2H2O)" },
  { value: "epsom", label: "Epsom (MgSO4·7H2O)" },
  { value: "table_salt", label: "Table salt (NaCl)" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)" },
];

export type SaltAdditionRow = { saltKey: SaltKey; grams: number };

function PickerField(props: {
  label: string;
  value: SaltKey;
  options: Array<{ value: SaltKey; label: string }>;
  onChange: (next: SaltKey) => void;
  closeLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button
        onPress={() => setOpen(true)}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
        disabled={props.disabled}
      >
        <Text fontSize={12}>{selectedLabel}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <View style={{ gap: 8 }}>
                {props.options.map((opt) => (
                  <Button
                    key={opt.value}
                    onPress={() => {
                      props.onChange(opt.value);
                      setOpen(false);
                    }}
                    size="$3"
                    background={opt.value === props.value ? "$color4" : "$background"}
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontSize={12}>{opt.label}</Text>
                  </Button>
                ))}
              </View>
              <Button onPress={() => setOpen(false)} size="$3" chromeless>
                <Text>{props.closeLabel}</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function SaltAdditionsEditor(props: {
  rows: SaltAdditionRow[];
  onChange: (next: SaltAdditionRow[]) => void;
  idPrefix: string;
  disabled?: boolean;
}) {
  const { t } = useT("ui");
  const { t: tUnits } = useT("units");
  const { t: tCommon } = useT("common");
  const { rows, onChange, disabled } = props;

  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx: number, next: Partial<SaltAdditionRow>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...next } : r)));
  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <View style={{ gap: 12 }}>
      {rows.length ? (
        <View style={{ gap: 12 }}>
          {rows.map((row, idx) => (
            <View key={idx} style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <View style={{ flex: 1, minWidth: 120 }}>
                <PickerField
                  label="Salt"
                  value={row.saltKey}
                  options={SALT_OPTIONS}
                  onChange={(v) => updateRow(idx, { saltKey: v })}
                  closeLabel={tCommon("close")}
                  disabled={disabled}
                />
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("amountLabel", { unit: tUnits("g") })}
                </Text>
                <Input
                  keyboardType="decimal-pad"
                  value={String(row.grams)}
                  onChangeText={(text: string) => updateRow(idx, { grams: Number(text) || 0 })}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  disabled={disabled}
                />
              </View>
              <Button
                size="$3"
                chromeless
                onPress={() => removeRow(idx)}
                disabled={disabled}
              >
                <Text fontSize={12}>{tCommon("remove")}</Text>
              </Button>
            </View>
          ))}
        </View>
      ) : (
        <Text fontSize={12} opacity={0.8}>
          No salts added yet.
        </Text>
      )}

      <Button
        size="$3"
        onPress={addRow}
        disabled={disabled}
      >
        <Text>{t("addSalt")}</Text>
      </Button>
    </View>
  );
}
