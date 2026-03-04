import type { ReactNode } from "react";
import React from "react";
import { Platform } from "react-native";
import { YStack } from "tamagui";

import { Button } from "./Button";
import { Text } from "./Text";

export interface CollapsibleProps {
  title: string;
  summary?: ReactNode;
  children: ReactNode;
  expanded: boolean;
  onExpandedChange: (next: boolean) => void;
  accessibilityLabel?: string;
}

export function Collapsible(props: CollapsibleProps) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;

  if (Platform.OS === "web") {
    return (
      <details open={expanded} onToggle={(e) => onExpandedChange((e.target as HTMLDetailsElement).open)}>
        <summary
          className="brew-details-summary"
          style={{ fontSize: 12 }}
          aria-label={accessibilityLabel ?? title}
        >
          {summary ?? title}
        </summary>
        {children}
      </details>
    );
  }

  return (
    <YStack gap="$2">
      <Button
        onPress={() => onExpandedChange(!expanded)}
        chromeless
        size="$4"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ expanded }}
      >
        <Text fontSize={16} fontWeight="700">
          {title}
        </Text>
      </Button>
      {expanded ? children : null}
    </YStack>
  );
}

