import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

export function PickerField(props: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  closeLabel: string;
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
              <ScrollView style={{ maxHeight: 300 }}>
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
              </ScrollView>
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
