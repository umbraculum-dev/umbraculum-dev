import React from "react";
import { YStack } from "tamagui";

import { Text } from "@umbraculum/ui";

import { MashStepRow, MashStepsReadOnlyView } from "./MashStepRow";
import { MashProcedureEditor, MashStepsToolbar } from "./MashStepsToolbar";
import {
  useMashStepsEditorState,
  type MashStepsEditorProps,
  type WaterVolumes,
} from "./useMashStepsEditorState";

export type { MashStepsEditorProps, WaterVolumes };

export function MashStepsEditor(props: MashStepsEditorProps) {
  const {
    mashRows,
    mashProcedure = null,
    waterVolumes,
    mashWaterBudgetLiters = null,
    firstStepAmountComputed = null,
    hideSpargeFromTypeOptions = false,
    readOnly = false,
    cardBackgroundColor,
    cardBorderColor,
    onUpdateProcedure,
    onUpdateStep,
    onMoveStep,
    onAddStep,
    onDeleteStep,
    onAddFromTemplate,
    onSave,
    canSave = false,
    saving = false,
    saveStatus = null,
    t,
    tUnits,
    locale,
    formatFixed,
  } = props;

  const { getRowEditState } = useMashStepsEditorState(mashRows, {
    hideSpargeFromTypeOptions,
    onMoveStep,
    firstStepAmountComputed,
  });

  if (readOnly) {
    return (
      <MashStepsReadOnlyView
        mashRows={mashRows}
        mashProcedure={mashProcedure}
        waterVolumes={waterVolumes}
        cardBackgroundColor={cardBackgroundColor}
        cardBorderColor={cardBorderColor}
        t={t}
        tUnits={tUnits}
        locale={locale}
        formatFixed={formatFixed}
      />
    );
  }

  return (
    <YStack gap="$3">
      {mashWaterBudgetLiters != null ? (
        <Text fontSize={12} opacity={0.8}>
          {t("mashStepsWaterBudgetNote")}
        </Text>
      ) : null}

      {mashProcedure && onUpdateProcedure ? (
        <MashProcedureEditor mashProcedure={mashProcedure} onUpdateProcedure={onUpdateProcedure} t={t} />
      ) : null}

      {mashRows.map((r, idx) => (
        <MashStepRow
          key={r.id}
          row={r}
          index={idx}
          editState={getRowEditState(r, idx)}
          waterVolumes={waterVolumes}
          firstStepAmountComputed={firstStepAmountComputed}
          onUpdateStep={onUpdateStep}
          onMoveStep={onMoveStep}
          onDeleteStep={onDeleteStep}
          t={t}
          tUnits={tUnits}
          locale={locale}
          formatFixed={formatFixed}
        />
      ))}

      <MashStepsToolbar
        onAddStep={onAddStep}
        onAddFromTemplate={onAddFromTemplate}
        onSave={onSave}
        canSave={canSave}
        saving={saving}
        saveStatus={saveStatus}
        t={t}
      />
    </YStack>
  );
}
