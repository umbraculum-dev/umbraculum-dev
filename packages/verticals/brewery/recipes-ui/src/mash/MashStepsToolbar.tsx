import React from "react";
import { XStack, YStack } from "tamagui";

import { MASH_TEMPLATES } from "@umbraculum/brewery-beerjson";

import { Button, Card, Input, Text } from "@umbraculum/ui";

import type { MashStepRowMoveState } from "./useMashStepsEditorState";

export interface MashProcedureEditorProps {
  mashProcedure: { name: string; grainTemperatureC: number };
  onUpdateProcedure: (patch: { name?: string; grainTemperatureC?: number }) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function MashProcedureEditor(props: MashProcedureEditorProps) {
  const { mashProcedure, onUpdateProcedure, t } = props;

  return (
    <Card gap="$2" padding="$3" background="$background" borderWidth={1} borderColor="$borderColor">
      <Text fontSize={12} fontWeight="700">
        {t("mashingProcedureName")}
      </Text>
      <Input
        value={mashProcedure.name}
        onChangeText={(text) => onUpdateProcedure({ name: text })}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      />
      <Text fontSize={12} fontWeight="700" marginTop="$2">
        {t("mashingGrainTemp")}
      </Text>
      <Input
        keyboardType="decimal-pad"
        value={String(mashProcedure.grainTemperatureC)}
        onChangeText={(text) => {
          const v = Number(text);
          onUpdateProcedure({ grainTemperatureC: Number.isFinite(v) ? v : mashProcedure.grainTemperatureC });
        }}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      />
    </Card>
  );
}

export interface MashStepRowActionsProps {
  index: number;
  rowId: string;
  move: MashStepRowMoveState;
  onMoveStep?: ((id: string, direction: "up" | "down") => void) | undefined;
  onDeleteStep?: ((id: string) => void) | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function MashStepRowActions(props: MashStepRowActionsProps) {
  const { index: idx, rowId, move, onMoveStep, onDeleteStep, t } = props;
  const { canReorder, disableMoveUp, disableMoveDown } = move;

  return (
    <XStack gap="$2" alignItems="center">
      {canReorder ? (
        <>
          <Button
            size="$2"
            chromeless
            disabled={disableMoveUp}
            onPress={() => onMoveStep?.(rowId, "up")}
            accessibilityLabel={t("moveUp")}
          >
            <Text fontSize={12}>{t("moveUp")}</Text>
          </Button>
          <Button
            size="$2"
            chromeless
            disabled={disableMoveDown}
            onPress={() => onMoveStep?.(rowId, "down")}
            accessibilityLabel={t("moveDown")}
          >
            <Text fontSize={12}>{t("moveDown")}</Text>
          </Button>
        </>
      ) : null}

      {idx > 0 && onDeleteStep ? (
        <Button size="$2" chromeless onPress={() => onDeleteStep(rowId)}>
          <Text fontSize={12}>{t("mashingDeleteStep")}</Text>
        </Button>
      ) : null}
    </XStack>
  );
}

export interface MashStepsToolbarProps {
  onAddStep?: (() => void) | undefined;
  onAddFromTemplate?: ((templateId: string) => void) | undefined;
  onSave?: (() => void) | undefined;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function MashStepsToolbar(props: MashStepsToolbarProps) {
  const { onAddStep, onAddFromTemplate, onSave, canSave = false, saving = false, saveStatus = null, t } = props;

  const hasAddControls = Boolean(onAddStep) || Boolean(onAddFromTemplate);
  const hasSaveControls = Boolean(onSave);

  if (!hasAddControls && !hasSaveControls) {
    return null;
  }

  return (
    <>
      {hasAddControls ? (
        <XStack gap="$2" flexWrap="wrap" alignItems="center">
          {onAddStep ? (
            <Button size="$3" onPress={onAddStep}>
              <Text>{t("mashingAddStep")}</Text>
            </Button>
          ) : null}

          {onAddFromTemplate ? (
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text fontSize={12} opacity={0.8}>
                {t("mashingAddFromTemplate")}:
              </Text>
              {MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => (
                <Button key={tpl.id} size="$3" chromeless onPress={() => onAddFromTemplate(tpl.id)}>
                  <Text fontSize={12}>{t(tpl.labelKey)}</Text>
                </Button>
              ))}
            </XStack>
          ) : null}
        </XStack>
      ) : null}

      {hasSaveControls ? (
        <YStack gap="$2">
          <Button size="$3" onPress={onSave} disabled={!canSave || saving}>
            <Text>{saving ? t("saving") : t("mashingSaveMashSteps")}</Text>
          </Button>
          {saveStatus ? (
            <Card gap="$1" padding="$2" background="$color4" borderWidth={1} borderColor="$borderColor">
              <Text fontSize={12}>{saveStatus}</Text>
            </Card>
          ) : null}
        </YStack>
      ) : null}
    </>
  );
}
