import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import type { EditorMashStep, EditorMashStepType } from "@brewery/beerjson";
import { MASH_STEP_TYPE_OPTIONS, newMashRowId } from "@brewery/beerjson";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Text } from "@brewery/ui";
import { Input } from "./AppInput";

export type WaterVolumes = { mashLiters: number; spargeLiters: number };

function CheckboxRow(props: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={() => (props.disabled ? null : props.onChange(!props.checked))}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: props.checked, disabled: props.disabled }}
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
          opacity: props.disabled ? 0.5 : 1,
        }}
      >
        {props.checked ? (
          <Text fontSize={12} fontWeight="bold">
            ✓
          </Text>
        ) : null}
      </View>
      <Text fontSize={12} opacity={props.disabled ? 0.5 : 0.8}>
        {props.label}
      </Text>
    </Pressable>
  );
}

function PickerField(props: {
  label: string;
  value: EditorMashStepType;
  options: Array<{ value: EditorMashStepType; label: string }>;
  onChange: (next: EditorMashStepType) => void;
  closeLabel: string;
  disabled?: boolean;
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
        disabled={props.disabled}
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

type MashStepsEditorProps = {
  mashRows: EditorMashStep[];
  waterVolumes: WaterVolumes | null;
  mashWaterBudgetLiters?: number | null;
  firstStepAmountComputed?: number | null;
  readOnly?: boolean;
  onUpdateStep?: (id: string, patch: Partial<EditorMashStep>) => void;
  onAddStep?: () => void;
  onDeleteStep?: (id: string) => void;
  onAddFromTemplate?: (templateId: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
};

export function MashStepsEditor({
  mashRows,
  waterVolumes,
  mashWaterBudgetLiters = null,
  firstStepAmountComputed = null,
  readOnly = false,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onAddFromTemplate,
  t,
  tUnits,
  locale,
  formatFixed,
}: MashStepsEditorProps) {
  const { t: tCommon } = useT("common");

  if (readOnly) {
    return (
      <View style={{ gap: 12 }}>
        {mashRows.length > 0 ? (
          mashRows.map((r, idx) => {
            const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
            const amountDisplay =
              isSpargeStep && waterVolumes
                ? formatFixed(locale, waterVolumes.spargeLiters, 2)
                : r.amountL != null && Number.isFinite(r.amountL)
                  ? formatFixed(locale, r.amountL, 2)
                  : "—";
            return (
              <View key={r.id} style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                <Text fontSize={12} fontWeight="bold">
                  {idx + 1}. {r.name}
                </Text>
                <Text fontSize={12} opacity={0.8}>
                  {t("mashingStepType")}: {r.type} · {t("mashingStepTemp", { unit: "°C" })}: {r.stepTemperatureC} · {t("mashingStepTime", { unit: "min" })}: {r.stepTimeMin} · {t("mashingStepAmount", { unit: "L" })}: {amountDisplay} {tUnits("L")}
                </Text>
              </View>
            );
          })
        ) : (
          <Text fontSize={12} opacity={0.8}>
            {t("mashingEmpty")}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {mashRows.map((r, idx) => (
        <Card key={r.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text fontSize={14} fontWeight="bold">
              {idx + 1}. {r.name}
            </Text>
            {onDeleteStep ? (
              <Button size="$2" chromeless onPress={() => onDeleteStep(r.id)}>
                <Text fontSize={12} color="$red10">{tCommon("remove")}</Text>
              </Button>
            ) : null}
          </View>
          <View style={{ gap: 8 }}>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("mashingStepName")}
              </Text>
              {idx === 0 && mashWaterBudgetLiters != null && firstStepAmountComputed != null ? (
                <Text fontSize={12} opacity={0.9} mt="$1">
                  {r.name || "Mash In"}
                </Text>
              ) : (
                <Input
                  value={r.name}
                  onChangeText={(text: string) => onUpdateStep?.(r.id, { name: text })}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              )}
            </View>
            <PickerField
              label={t("mashingStepType")}
              value={r.type}
              options={MASH_STEP_TYPE_OPTIONS}
              onChange={(v) => onUpdateStep?.(r.id, { type: v })}
              closeLabel={tCommon("close")}
              disabled={idx === 0 && mashWaterBudgetLiters != null && firstStepAmountComputed != null}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("mashingStepTemp", { unit: "°C" })}
                </Text>
                <Input
                  keyboardType="decimal-pad"
                  value={String(r.stepTemperatureC)}
                  onChangeText={(text: string) => onUpdateStep?.(r.id, { stepTemperatureC: Number(text) || 0 })}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("mashingStepTime", { unit: "min" })}
                </Text>
                <Input
                  keyboardType="decimal-pad"
                  value={String(r.stepTimeMin)}
                  onChangeText={(text: string) => onUpdateStep?.(r.id, { stepTimeMin: Number(text) || 0 })}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            </View>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("mashingStepAmount", { unit: "L" })} ({tUnits("L")})
              </Text>
              {idx === 0 && mashWaterBudgetLiters != null && firstStepAmountComputed != null ? (
                <Text fontSize={12} opacity={0.9} mt="$1">
                  {formatFixed(locale, firstStepAmountComputed, 2)} {tUnits("L")}
                </Text>
              ) : (
                <Input
                  keyboardType="decimal-pad"
                  value={r.amountL != null ? String(r.amountL) : ""}
                  onChangeText={(text: string) =>
                    onUpdateStep?.(r.id, { amountL: text.trim() ? Math.max(0, Number(text) || 0) : null })
                  }
                  placeholder="—"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  disabled={idx > 0 && r.deduceFromMashIn !== true}
                />
              )}
            </View>

            {idx > 0 ? (
              <CheckboxRow
                label={t("mashingDeduceFromMashIn")}
                checked={r.deduceFromMashIn === true}
                onChange={(checked) => onUpdateStep?.(r.id, { deduceFromMashIn: checked, ...(checked ? {} : { amountL: 0 }) })}
              />
            ) : null}
          </View>
        </Card>
      ))}
      {onAddStep ? (
        <Button size="$3" onPress={onAddStep}>
          <Text>{t("mashingAddStep")}</Text>
        </Button>
      ) : null}
      {onAddFromTemplate ? (
        <View style={{ gap: 8 }}>
          <Text fontSize={12} opacity={0.8}>
            {t("mashingAddFromTemplate")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { id: "single_infusion", key: "mashingTemplateSingleInfusion" },
              { id: "step_mash", key: "mashingTemplateStepMash" },
              { id: "sparge", key: "mashingTemplateSparge" },
            ].map(({ id, key }) => (
              <Button key={id} size="$3" chromeless onPress={() => onAddFromTemplate(id)}>
                <Text fontSize={12}>{t(key)}</Text>
              </Button>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
