import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { TextArea } from "tamagui";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

// Tamagui v2 RC's typed Button surface omits `chromeless` and a few layout
// longhand props (`width`, `justifyContent`) even though they are valid at
// runtime (see packages/platform/ui/src/primitives/{Collapsible,SelectField}.tsx). We
// cast locally to keep the existing collapsible-section-header pattern
// without weakening shared typings.
export const SectionToggleButton = Button as unknown as React.ComponentType<
  React.ComponentProps<typeof Button> & {
    chromeless?: boolean;
    width?: number | string;
    justifyContent?: string;
  }
>;
export const NotesTextArea = TextArea as unknown as React.ComponentType<
  React.ComponentProps<typeof TextArea> & {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    minHeight?: number | string;
  }
>;

export function CheckboxRow(props: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <Pressable
      onPress={() => props.onChange(!props.checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: props.checked }}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderWidth: 1,
          borderColor: "var(--border)",
          borderRadius: 4,
          backgroundColor: props.checked ? "rgba(59,130,246,0.15)" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.checked ? (
          <Text fontSize={12} fontWeight="bold">
            ✓
          </Text>
        ) : null}
      </View>
      <Text fontSize={12} opacity={0.85}>
        {props.label}
      </Text>
    </Pressable>
  );
}

type PickerOption = { value: string; label: string };

export function PickerField(props: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (nextValue: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "";
  const buttonText = selectedLabel || "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button onPress={() => setOpen(true)} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
        <Text fontSize={12}>{buttonText}</Text>
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
                    key={opt.value || "__empty"}
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
