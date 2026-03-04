import type { ReactNode } from "react";
import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";

import { Button } from "./Button";
import { Card } from "./Card";
import { Text } from "./Text";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  width?: "auto" | "full";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  renderValue?: (value: string) => ReactNode;
  closeLabel?: string;
}

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  id,
  width = "auto",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  renderValue,
  closeLabel,
}: SelectFieldProps) {
  const findLabel = (v: string) => options.find((opt) => opt.value === v)?.label ?? v;

  const isWeb = Platform.OS === "web";
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => findLabel(value), [value, options]);

  if (isWeb) {
    // Use a native <select> on web to avoid Tamagui Select type + DOM-prop issues.
    // Styling is intentionally minimal; app-level CSS can enhance if needed.
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        style={{
          width: width === "full" ? "100%" : 180,
          minWidth: width === "full" ? undefined : 180,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--border, rgba(0,0,0,0.2))",
          background: "var(--surface, #fff)",
          color: "var(--text, #111)",
          fontFamily: "var(--font-body, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)",
        }}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // Native: modal picker.
  {
    return (
      <View>
        <Button
          onPress={() => setOpen(true)}
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
          disabled={disabled}
          accessibilityLabel={ariaLabel}
        >
          <Text fontSize={12}>{(renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "—"}</Text>
        </Button>
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
            onPress={() => setOpen(false)}
          >
            <Pressable onPress={() => null}>
              <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" padding="$3">
                {ariaLabel ? <Text fontSize={16} fontWeight="700">{ariaLabel}</Text> : null}
                <ScrollView style={{ maxHeight: 320 }}>
                  <View style={{ gap: 8 }}>
                    {options.map((opt) => (
                      <Button
                        key={opt.value}
                        onPress={() => {
                          onValueChange(opt.value);
                          setOpen(false);
                        }}
                        size="$3"
                        background={opt.value === value ? "$color4" : "$background"}
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text fontSize={12}>{opt.label}</Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
                {closeLabel ? (
                  <Button onPress={() => setOpen(false)} size="$3" chromeless>
                    <Text>{closeLabel}</Text>
                  </Button>
                ) : null}
              </Card>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }
}

