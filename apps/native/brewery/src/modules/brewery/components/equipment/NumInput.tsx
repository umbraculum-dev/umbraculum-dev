import React from "react";
import { View } from "react-native";

import { Text } from "@umbraculum/ui";

import { Input } from "@umbraculum/native-shell/components";

export function NumInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Input
        value={props.value}
        onChangeText={props.onChange}
        keyboardType="decimal-pad"
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      />
    </View>
  );
}
