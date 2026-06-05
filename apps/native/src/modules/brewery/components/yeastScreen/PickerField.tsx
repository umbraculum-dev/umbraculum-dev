import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Button, Card, Heading, Text } from "@umbraculum/ui";

import type { PickerOption } from "../../hooks/yeastScreen/yeastScreenHelpers";

export function PickerField(props: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (nextValue: string) => void;
  placeholder?: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "";
  const buttonText = selectedLabel || props.placeholder || "—";

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
      >
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
