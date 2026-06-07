import React from "react";
import { View } from "react-native";
import type { EditorYeastRow } from "@umbraculum/brewery-beerjson";
import { Button, Text } from "@umbraculum/ui";
import type { TranslationValues } from "@umbraculum/i18n-react";
import { Accordion } from "tamagui";

export function YeastScreenRowActions(props: {
  row: EditorYeastRow;
  idx: number;
  t: (key: string, params?: TranslationValues) => string;
  removeYeastRow: (id: string) => void;
  openAdvancedSections: Record<string, boolean>;
  setOpenAdvancedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  children: React.ReactNode;
}) {
  const { row: r, idx, t, removeYeastRow, openAdvancedSections, setOpenAdvancedSections, children } = props;

  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text fontSize={14} fontWeight="600">
          {idx + 1}. {r.name || "(unnamed)"}
        </Text>
        <Button onPress={() => removeYeastRow(r.id)} size="$2" chromeless>
          <Text color="$red10">{t("yeastRemove")}</Text>
        </Button>
      </View>
      <Accordion
        type="multiple"
        value={openAdvancedSections[r.id] !== false ? [`advanced-${r.id}`] : []}
        onValueChange={(v) =>
          setOpenAdvancedSections((prev) => ({
            ...prev,
            [r.id]: Array.isArray(v) ? v.includes(`advanced-${r.id}`) : false,
          }))
        }
        style={{ marginTop: 8 }}
      >
        <Accordion.Item value={`advanced-${r.id}`}>
          <Accordion.Header>
            <Accordion.Trigger unstyled>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderTopWidth: 1,
                  borderColor: "#2a2f3a",
                }}
              >
                <Text fontSize={12} fontWeight="600">
                  {t("yeastAdvancedSubsectionHeading")}
                </Text>
                <Text opacity={0.7}>{openAdvancedSections[r.id] !== false ? "▾" : "▸"}</Text>
              </View>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <View style={{ gap: 8, paddingTop: 8 }}>{children}</View>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </>
  );
}
