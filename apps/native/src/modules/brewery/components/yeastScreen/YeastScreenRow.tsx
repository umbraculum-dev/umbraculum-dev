import React from "react";
import { View } from "react-native";
import type { EditorYeastRow } from "@umbraculum/brewery-beerjson";
import { Card } from "@umbraculum/ui";
import type { TranslationValues } from "@umbraculum/i18n-react";

import { YeastScreenRowActions } from "./row/YeastScreenRowActions";
import { YeastScreenRowAttenuation } from "./row/YeastScreenRowAttenuation";
import { YeastScreenRowIdentity } from "./row/YeastScreenRowIdentity";
import { YeastScreenRowPitch, YeastScreenRowPitchAdvanced } from "./row/YeastScreenRowPitch";

export function YeastScreenRow(props: {
  row: EditorYeastRow;
  idx: number;
  locale: string;
  t: (key: string, params?: TranslationValues) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  tCommon: (key: string) => string;
  yeastAttenuationOverrides: Record<string, string>;
  onAttenuationOverrideChange: (id: string, value: string) => void;
  updateYeastRow: (id: string, patch: Partial<EditorYeastRow>) => void;
  removeYeastRow: (id: string) => void;
  batchSizeForCellsVal: number | null;
  analysisOg: number | null | undefined;
  openAdvancedSections: Record<string, boolean>;
  setOpenAdvancedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const sectionProps = {
    row: props.row,
    t: props.t,
    updateYeastRow: props.updateYeastRow,
  };

  return (
    <Card
      key={props.row.id}
      gap="$2"
      mb="$2"
      background="$background"
      borderWidth={1}
      borderColor="$borderColor"
      p="$3"
    >
      <View style={{ gap: 12 }}>
        <YeastScreenRowIdentity {...sectionProps} />
        <YeastScreenRowAttenuation
          {...sectionProps}
          locale={props.locale}
          tAnalysis={props.tAnalysis}
          tUnits={props.tUnits}
          tCommon={props.tCommon}
          yeastAttenuationOverrides={props.yeastAttenuationOverrides}
          onAttenuationOverrideChange={props.onAttenuationOverrideChange}
        />
        <YeastScreenRowPitch
          {...sectionProps}
          locale={props.locale}
          tUnits={props.tUnits}
          tCommon={props.tCommon}
          batchSizeForCellsVal={props.batchSizeForCellsVal}
          analysisOg={props.analysisOg}
        />
        <YeastScreenRowActions
          row={props.row}
          idx={props.idx}
          t={props.t}
          removeYeastRow={props.removeYeastRow}
          openAdvancedSections={props.openAdvancedSections}
          setOpenAdvancedSections={props.setOpenAdvancedSections}
        >
          <YeastScreenRowPitchAdvanced
            {...sectionProps}
            tCommon={props.tCommon}
            batchSizeForCellsVal={props.batchSizeForCellsVal}
            analysisOg={props.analysisOg}
          />
        </YeastScreenRowActions>
      </View>
    </Card>
  );
}
