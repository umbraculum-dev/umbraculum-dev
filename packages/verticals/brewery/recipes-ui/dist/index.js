// src/recipeMeta/RecipeMetaLine.tsx
import { useEffect, useState } from "react";
import { useT } from "@umbraculum/i18n-react";
import { Text } from "@umbraculum/ui";
import { jsxs } from "react/jsx-runtime";
function parseRecipeMetaFromGetRecipeResponse(data) {
  if (!data || typeof data !== "object") return null;
  const d = data;
  const r = d.recipe;
  if (!r || typeof r !== "object") return null;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  const version = typeof r.version === "number" && Number.isInteger(r.version) && r.version >= 0 ? r.version : null;
  return { name: name ? name : null, version };
}
function RecipeMetaLine(props) {
  const { recipeId, loadRecipeMeta, enabled: enabledProp } = props;
  const { t } = useT("waterHub");
  const enabled = enabledProp !== false;
  const [meta, setMeta] = useState({ name: null, version: null });
  useEffect(() => {
    let cancelled = false;
    setMeta({ name: null, version: null });
    if (!enabled) return () => {
    };
    if (!recipeId) return () => {
    };
    void loadRecipeMeta(recipeId).then((res) => {
      if (cancelled) return;
      if (!res) return;
      setMeta(res);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, recipeId, loadRecipeMeta]);
  return /* @__PURE__ */ jsxs(Text, { fontSize: 12, opacity: 0.8, children: [
    t("recipeId"),
    ": ",
    recipeId,
    meta.name ? ` - ${t("recipeName")}: ${meta.name}` : null,
    meta.version !== null ? ` - ${t("recipeVersion")}: ${String(meta.version).padStart(2, "0")}` : null
  ] });
}

// src/yeast/ManualCellCountHelpBox.tsx
import { useState as useState2 } from "react";
import { useT as useT2 } from "@umbraculum/i18n-react";
import { Card, Collapsible, Text as Text2 } from "@umbraculum/ui";
import { View, YStack } from "tamagui";
import { jsx, jsxs as jsxs2 } from "react/jsx-runtime";
function StepBlock(props) {
  return /* @__PURE__ */ jsxs2(View, { children: [
    /* @__PURE__ */ jsxs2(Text2, { fontSize: 14, fontWeight: "600", marginBottom: "$1", children: [
      props.step,
      ". ",
      props.title
    ] }),
    /* @__PURE__ */ jsx(Text2, { fontSize: 12, opacity: 0.85, children: props.body })
  ] });
}
function ManualCellCountHelpBox(props) {
  const { t } = useT2("recipes.edit");
  const [expanded, setExpanded] = useState2(false);
  return /* @__PURE__ */ jsx(Card, { gap: "$2", marginTop: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: /* @__PURE__ */ jsx(
    Collapsible,
    {
      title: t("yeastManualCellCountSummary"),
      expanded,
      onExpandedChange: setExpanded,
      accessibilityLabel: t("yeastManualCellCountSummary"),
      summary: /* @__PURE__ */ jsx(Text2, { fontSize: 16, fontWeight: "700", children: t("yeastManualCellCountSummary") }),
      children: /* @__PURE__ */ jsxs2(View, { style: { gap: 12, marginTop: 8 }, children: [
        /* @__PURE__ */ jsx(Text2, { fontSize: 14, fontWeight: "600", children: t("yeastManualCellCountTitle") }),
        /* @__PURE__ */ jsx(
          StepBlock,
          {
            step: 0,
            title: t("yeastManualCellCountPrerequisitesTitle"),
            body: t("yeastManualCellCountPrerequisitesBody")
          }
        ),
        /* @__PURE__ */ jsxs2(YStack, { gap: "$2", children: [
          /* @__PURE__ */ jsx(StepBlock, { step: 1, title: t("yeastManualCellCountStep1Title"), body: t("yeastManualCellCountStep1Body") }),
          /* @__PURE__ */ jsxs2(View, { children: [
            props.renderImage({
              assetKey: "yeast/dilution-1-100.png",
              alt: t("yeastManualCellCountStep1ImageAlt"),
              width: 320,
              height: 200
            }),
            /* @__PURE__ */ jsx(Text2, { fontSize: 11, opacity: 0.8, marginTop: "$1", children: t("yeastManualCellCountStep1ImageLegend") })
          ] }),
          /* @__PURE__ */ jsx(StepBlock, { step: 2, title: t("yeastManualCellCountStep2Title"), body: t("yeastManualCellCountStep2Body") }),
          /* @__PURE__ */ jsx(StepBlock, { step: 3, title: t("yeastManualCellCountStep3Title"), body: t("yeastManualCellCountStep3Body") }),
          /* @__PURE__ */ jsx(View, { children: props.renderImage({
            assetKey: "yeast/hemocytometer-5-squares.png",
            alt: t("yeastManualCellCountStep3ImageAlt"),
            width: 320,
            height: 200
          }) }),
          /* @__PURE__ */ jsx(StepBlock, { step: 4, title: t("yeastManualCellCountStep4Title"), body: t("yeastManualCellCountStep4Body") }),
          /* @__PURE__ */ jsx(StepBlock, { step: 5, title: t("yeastManualCellCountStep5Title"), body: t("yeastManualCellCountStep5Body") }),
          /* @__PURE__ */ jsx(StepBlock, { step: 6, title: t("yeastManualCellCountStep6Title"), body: t("yeastManualCellCountStep6Body") })
        ] }),
        /* @__PURE__ */ jsx(Text2, { fontSize: 14, fontWeight: "600", children: t("yeastManualCellCountGlossaryTitle") }),
        /* @__PURE__ */ jsx(Text2, { fontSize: 12, opacity: 0.85, children: t("yeastManualCellCountGlossary") }),
        /* @__PURE__ */ jsx(Text2, { fontSize: 11, opacity: 0.8, children: t("yeastManualCellCountReference") })
      ] })
    }
  ) });
}

// src/water/SaltAdditionsEditor.tsx
import "react";
import { XStack, YStack as YStack2 } from "tamagui";
import { useT as useT3 } from "@umbraculum/i18n-react";
import { Button, Card as Card2, Input, SelectField, Text as Text3 } from "@umbraculum/ui";
import { jsx as jsx2, jsxs as jsxs3 } from "react/jsx-runtime";
var SALT_OPTIONS = [
  { value: "gypsum", label: "Gypsum (CaSO4\xB72H2O)" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2\xB72H2O)" },
  { value: "epsom", label: "Epsom (MgSO4\xB77H2O)" },
  { value: "table_salt", label: "Table salt (NaCl)" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)" }
];
function SaltAdditionsEditor(props) {
  const { t } = useT3("ui");
  const { t: tUnits } = useT3("units");
  const { t: tCommon } = useT3("common");
  const { rows, onChange, idPrefix = "salt", disabled } = props;
  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx, next) => onChange(rows.map((r, i) => i === idx ? { ...r, ...next } : r));
  const removeRow = (idx) => onChange(rows.filter((_, i) => i !== idx));
  return /* @__PURE__ */ jsxs3(Card2, { gap: "$3", padding: 0, backgroundColor: "transparent", borderWidth: 0, children: [
    rows.length ? /* @__PURE__ */ jsx2(YStack2, { gap: "$3", children: rows.map((row, idx) => /* @__PURE__ */ jsxs3(XStack, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children: [
      /* @__PURE__ */ jsxs3(YStack2, { flex: 1, minWidth: 180, gap: "$1.5", children: [
        /* @__PURE__ */ jsx2(Text3, { fontSize: 11, opacity: 0.8, marginBottom: "$1", children: t("salt") }),
        /* @__PURE__ */ jsx2(
          SelectField,
          {
            id: `${idPrefix}-salt-key-${idx}`,
            value: row.saltKey,
            onValueChange: (v) => updateRow(idx, { saltKey: v }),
            options: SALT_OPTIONS,
            ...disabled !== void 0 ? { disabled } : {},
            width: "full",
            "aria-label": t("salt"),
            closeLabel: tCommon("close")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3(YStack2, { flex: 1, minWidth: 140, gap: "$1.5", children: [
        /* @__PURE__ */ jsx2(Text3, { fontSize: 11, opacity: 0.8, marginBottom: "$1", children: t("amountLabel", { unit: tUnits("g") }) }),
        /* @__PURE__ */ jsx2(
          Input,
          {
            id: `${idPrefix}-salt-grams-${idx}`,
            keyboardType: "decimal-pad",
            value: String(row.grams),
            onChangeText: (text) => updateRow(idx, { grams: Number(text) || 0 }),
            size: "$3",
            background: "$background",
            borderWidth: 1,
            borderColor: "$borderColor",
            disabled
          }
        )
      ] }),
      /* @__PURE__ */ jsx2(
        Button,
        {
          size: "$3",
          chromeless: true,
          onPress: () => removeRow(idx),
          disabled,
          accessibilityLabel: tCommon("remove"),
          children: /* @__PURE__ */ jsx2(Text3, { fontSize: 12, children: tCommon("remove") })
        }
      )
    ] }, idx)) }) : /* @__PURE__ */ jsx2(Text3, { fontSize: 12, opacity: 0.8, children: t("noSaltsAddedYet") }),
    /* @__PURE__ */ jsx2(Button, { size: "$3", onPress: addRow, disabled, children: /* @__PURE__ */ jsx2(Text3, { children: t("addSalt") }) })
  ] });
}

// src/mash/MashStepsEditor.tsx
import "react";
import { YStack as YStack6 } from "tamagui";
import { Text as Text9 } from "@umbraculum/ui";

// src/mash/MashStepRowEditable.tsx
import "react";
import { XStack as XStack3, YStack as YStack4 } from "tamagui";

// src/primitives/BrewCheckbox.tsx
import "react";
import { Platform } from "react-native";
import { Checkbox as TamaguiCheckbox } from "tamagui";
import { Text as Text4 } from "@umbraculum/ui";
import { jsx as jsx3 } from "react/jsx-runtime";
function BrewCheckbox(props) {
  const { accessibilityLabel, accessibilityRole, checked, disabled, size, ...rest } = props;
  const isChecked = checked === true;
  const sharedProps = {
    // Keep this custom-rendered so we control contrast/indicator on web.
    native: Platform.OS === "web" ? false : void 0,
    size: size ?? "$2",
    ...disabled !== void 0 ? { disabled } : {},
    checked,
    unstyled: true,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: isChecked ? "$color8" : "$borderColor",
    backgroundColor: isChecked ? "$color8" : "transparent",
    alignItems: "center",
    justifyContent: "center",
    ...rest
  };
  if (Platform.OS === "web") {
    return /* @__PURE__ */ jsx3(TamaguiCheckbox, { "aria-label": accessibilityLabel, ...sharedProps, children: /* @__PURE__ */ jsx3(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx3(Text4, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
  }
  return /* @__PURE__ */ jsx3(TamaguiCheckbox, { accessibilityLabel, accessibilityRole, ...sharedProps, children: /* @__PURE__ */ jsx3(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx3(Text4, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
}

// src/mash/MashStepRowEditable.tsx
import { Card as Card4, Input as Input3, SelectField as SelectField2, Text as Text6 } from "@umbraculum/ui";

// src/mash/MashStepsToolbar.tsx
import "react";
import { XStack as XStack2, YStack as YStack3 } from "tamagui";
import { MASH_TEMPLATES } from "@umbraculum/brewery-beerjson";
import { Button as Button2, Card as Card3, Input as Input2, Text as Text5 } from "@umbraculum/ui";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function MashProcedureEditor(props) {
  const { mashProcedure, onUpdateProcedure, t } = props;
  return /* @__PURE__ */ jsxs4(Card3, { gap: "$2", padding: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", children: [
    /* @__PURE__ */ jsx4(Text5, { fontSize: 12, fontWeight: "700", children: t("mashingProcedureName") }),
    /* @__PURE__ */ jsx4(
      Input2,
      {
        value: mashProcedure.name,
        onChangeText: (text) => onUpdateProcedure({ name: text }),
        size: "$3",
        background: "$background",
        borderWidth: 1,
        borderColor: "$borderColor"
      }
    ),
    /* @__PURE__ */ jsx4(Text5, { fontSize: 12, fontWeight: "700", marginTop: "$2", children: t("mashingGrainTemp") }),
    /* @__PURE__ */ jsx4(
      Input2,
      {
        keyboardType: "decimal-pad",
        value: String(mashProcedure.grainTemperatureC),
        onChangeText: (text) => {
          const v = Number(text);
          onUpdateProcedure({ grainTemperatureC: Number.isFinite(v) ? v : mashProcedure.grainTemperatureC });
        },
        size: "$3",
        background: "$background",
        borderWidth: 1,
        borderColor: "$borderColor"
      }
    )
  ] });
}
function MashStepRowActions(props) {
  const { index: idx, rowId, move, onMoveStep, onDeleteStep, t } = props;
  const { canReorder, disableMoveUp, disableMoveDown } = move;
  return /* @__PURE__ */ jsxs4(XStack2, { gap: "$2", alignItems: "center", children: [
    canReorder ? /* @__PURE__ */ jsxs4(Fragment, { children: [
      /* @__PURE__ */ jsx4(
        Button2,
        {
          size: "$2",
          chromeless: true,
          disabled: disableMoveUp,
          onPress: () => onMoveStep?.(rowId, "up"),
          accessibilityLabel: t("moveUp"),
          children: /* @__PURE__ */ jsx4(Text5, { fontSize: 12, children: t("moveUp") })
        }
      ),
      /* @__PURE__ */ jsx4(
        Button2,
        {
          size: "$2",
          chromeless: true,
          disabled: disableMoveDown,
          onPress: () => onMoveStep?.(rowId, "down"),
          accessibilityLabel: t("moveDown"),
          children: /* @__PURE__ */ jsx4(Text5, { fontSize: 12, children: t("moveDown") })
        }
      )
    ] }) : null,
    idx > 0 && onDeleteStep ? /* @__PURE__ */ jsx4(Button2, { size: "$2", chromeless: true, onPress: () => onDeleteStep(rowId), children: /* @__PURE__ */ jsx4(Text5, { fontSize: 12, children: t("mashingDeleteStep") }) }) : null
  ] });
}
function MashStepsToolbar(props) {
  const { onAddStep, onAddFromTemplate, onSave, canSave = false, saving = false, saveStatus = null, t } = props;
  const hasAddControls = Boolean(onAddStep) || Boolean(onAddFromTemplate);
  const hasSaveControls = Boolean(onSave);
  if (!hasAddControls && !hasSaveControls) {
    return null;
  }
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    hasAddControls ? /* @__PURE__ */ jsxs4(XStack2, { gap: "$2", flexWrap: "wrap", alignItems: "center", children: [
      onAddStep ? /* @__PURE__ */ jsx4(Button2, { size: "$3", onPress: onAddStep, children: /* @__PURE__ */ jsx4(Text5, { children: t("mashingAddStep") }) }) : null,
      onAddFromTemplate ? /* @__PURE__ */ jsxs4(XStack2, { gap: "$2", flexWrap: "wrap", alignItems: "center", children: [
        /* @__PURE__ */ jsxs4(Text5, { fontSize: 12, opacity: 0.8, children: [
          t("mashingAddFromTemplate"),
          ":"
        ] }),
        MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => /* @__PURE__ */ jsx4(Button2, { size: "$3", chromeless: true, onPress: () => onAddFromTemplate(tpl.id), children: /* @__PURE__ */ jsx4(Text5, { fontSize: 12, children: t(tpl.labelKey) }) }, tpl.id))
      ] }) : null
    ] }) : null,
    hasSaveControls ? /* @__PURE__ */ jsxs4(YStack3, { gap: "$2", children: [
      /* @__PURE__ */ jsx4(Button2, { size: "$3", onPress: onSave, disabled: !canSave || saving, children: /* @__PURE__ */ jsx4(Text5, { children: saving ? t("saving") : t("mashingSaveMashSteps") }) }),
      saveStatus ? /* @__PURE__ */ jsx4(Card3, { gap: "$1", padding: "$2", background: "$color4", borderWidth: 1, borderColor: "$borderColor", children: /* @__PURE__ */ jsx4(Text5, { fontSize: 12, children: saveStatus }) }) : null
    ] }) : null
  ] });
}

// src/mash/MashStepRowEditable.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function MashStepRowEditable(props) {
  const {
    row: r,
    index: idx,
    editState,
    waterVolumes,
    firstStepAmountComputed = null,
    onUpdateStep,
    onMoveStep,
    onDeleteStep,
    t,
    tUnits,
    locale,
    formatFixed
  } = props;
  const { isSpargeStep, disableName, disableType, disableAmount, typeValue, typeOptions, move } = editState;
  return /* @__PURE__ */ jsxs5(Card4, { gap: "$2", padding: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", children: [
    /* @__PURE__ */ jsxs5(XStack3, { justifyContent: "space-between", alignItems: "center", children: [
      /* @__PURE__ */ jsxs5(Text6, { fontSize: 14, fontWeight: "700", children: [
        idx + 1,
        ". ",
        r.name || t("mashingStepName")
      ] }),
      /* @__PURE__ */ jsx5(
        MashStepRowActions,
        {
          index: idx,
          rowId: r.id,
          move,
          onMoveStep,
          onDeleteStep,
          t
        }
      )
    ] }),
    /* @__PURE__ */ jsxs5(YStack4, { gap: "$2", children: [
      /* @__PURE__ */ jsxs5(YStack4, { gap: "$1", children: [
        /* @__PURE__ */ jsx5(Text6, { fontSize: 11, opacity: 0.8, children: t("mashingStepName") }),
        disableName ? /* @__PURE__ */ jsx5(Text6, { fontSize: 12, opacity: 0.85, children: isSpargeStep ? "Sparge" : r.name || "Mash In" }) : /* @__PURE__ */ jsx5(
          Input3,
          {
            value: r.name,
            onChangeText: (text) => onUpdateStep?.(r.id, { name: text }),
            size: "$3",
            background: "$background",
            borderWidth: 1,
            borderColor: "$borderColor"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs5(YStack4, { gap: "$1", children: [
        /* @__PURE__ */ jsx5(Text6, { fontSize: 11, opacity: 0.8, children: t("mashingStepType") }),
        disableType ? /* @__PURE__ */ jsx5(Text6, { fontSize: 12, opacity: 0.85, children: "Sparge" }) : /* @__PURE__ */ jsx5(
          SelectField2,
          {
            value: typeValue,
            onValueChange: (v) => onUpdateStep?.(r.id, { type: v }),
            options: typeOptions,
            width: "full",
            "aria-label": t("mashingStepType")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs5(XStack3, { gap: "$2", flexWrap: "wrap", children: [
        /* @__PURE__ */ jsxs5(YStack4, { gap: "$1", flex: 1, minWidth: 120, children: [
          /* @__PURE__ */ jsx5(Text6, { fontSize: 11, opacity: 0.8, children: t("mashingStepTemp", { unit: "\xB0C" }) }),
          /* @__PURE__ */ jsx5(
            Input3,
            {
              keyboardType: "decimal-pad",
              value: String(r.stepTemperatureC),
              onChangeText: (text) => onUpdateStep?.(r.id, { stepTemperatureC: Number(text) || 0 }),
              size: "$3",
              background: "$background",
              borderWidth: 1,
              borderColor: "$borderColor"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs5(YStack4, { gap: "$1", flex: 1, minWidth: 120, children: [
          /* @__PURE__ */ jsx5(Text6, { fontSize: 11, opacity: 0.8, children: t("mashingStepTime", { unit: "min" }) }),
          /* @__PURE__ */ jsx5(
            Input3,
            {
              keyboardType: "decimal-pad",
              value: String(r.stepTimeMin),
              onChangeText: (text) => onUpdateStep?.(r.id, { stepTimeMin: Math.max(0, Number(text) || 0) }),
              size: "$3",
              background: "$background",
              borderWidth: 1,
              borderColor: "$borderColor"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs5(YStack4, { gap: "$1", children: [
        /* @__PURE__ */ jsx5(Text6, { fontSize: 11, opacity: 0.8, children: t("mashingStepAmount", { unit: tUnits("L") }) }),
        isSpargeStep ? /* @__PURE__ */ jsx5(Text6, { fontSize: 12, opacity: 0.85, children: waterVolumes ? `${formatFixed(locale, waterVolumes.spargeLiters, 2)} ${tUnits("L")}` : "\u2014" }) : idx === 0 && firstStepAmountComputed != null ? /* @__PURE__ */ jsxs5(Text6, { fontSize: 12, opacity: 0.85, children: [
          formatFixed(locale, firstStepAmountComputed, 2),
          " ",
          tUnits("L")
        ] }) : /* @__PURE__ */ jsx5(
          Input3,
          {
            keyboardType: "decimal-pad",
            value: r.amountL != null ? String(r.amountL) : "",
            onChangeText: (text) => onUpdateStep?.(r.id, { amountL: text.trim() ? Math.max(0, Number(text) || 0) : null }),
            placeholder: "\u2014",
            size: "$3",
            background: "$background",
            borderWidth: 1,
            borderColor: "$borderColor",
            disabled: disableAmount
          }
        )
      ] }),
      idx > 0 ? /* @__PURE__ */ jsxs5(XStack3, { gap: "$2", alignItems: "center", children: [
        /* @__PURE__ */ jsx5(
          BrewCheckbox,
          {
            id: `mash-step-deduce-${r.id}`,
            checked: r.deduceFromMashIn === true,
            onCheckedChange: (checked) => onUpdateStep?.(r.id, {
              deduceFromMashIn: checked === true
            }),
            size: "$2",
            accessibilityLabel: t("mashingDeduceFromMashIn"),
            accessibilityRole: "checkbox"
          }
        ),
        /* @__PURE__ */ jsx5(Text6, { fontSize: 12, opacity: 0.85, children: t("mashingDeduceFromMashIn") })
      ] }) : null
    ] })
  ] }, r.id);
}

// src/mash/MashStepRowReadOnly.tsx
import "react";
import { MASH_STEP_TYPE_OPTIONS } from "@umbraculum/brewery-beerjson";
import { Card as Card5, ReadOnlyField, ReadOnlyFieldRow, Text as Text7 } from "@umbraculum/ui";
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function MashStepRowReadOnly(props) {
  const { row: r, index: idx, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } = props;
  const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
  const amountDisplay = isSpargeStep && waterVolumes ? formatFixed(locale, waterVolumes.spargeLiters, 2) : r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : null;
  const typeLabel = MASH_STEP_TYPE_OPTIONS.find((o) => o.value === r.type)?.label ?? r.type;
  return /* @__PURE__ */ jsxs6(
    Card5,
    {
      "data-mash-step-card": true,
      ...cardBackgroundColor ?? cardBorderColor ? {} : { theme: "surface2" },
      gap: "$2",
      padding: "$3",
      backgroundColor: cardBackgroundColor ?? "$background",
      borderWidth: 1,
      borderColor: cardBorderColor ?? "$borderColor",
      children: [
        /* @__PURE__ */ jsxs6(Text7, { fontSize: 12, fontWeight: "700", children: [
          idx + 1,
          ". ",
          r.name
        ] }),
        /* @__PURE__ */ jsxs6(ReadOnlyFieldRow, { children: [
          /* @__PURE__ */ jsx6(ReadOnlyField, { label: t("mashingStepType"), value: typeLabel, minWidth: 120, flex: 1 }),
          /* @__PURE__ */ jsx6(
            ReadOnlyField,
            {
              label: t("mashingStepTemp", { unit: "\xB0C" }),
              value: String(r.stepTemperatureC),
              minWidth: 90
            }
          ),
          /* @__PURE__ */ jsx6(
            ReadOnlyField,
            {
              label: t("mashingStepTime", { unit: "min" }),
              value: String(r.stepTimeMin),
              minWidth: 90
            }
          ),
          /* @__PURE__ */ jsx6(
            ReadOnlyField,
            {
              label: t("mashingStepAmount", { unit: "L" }),
              value: amountDisplay != null ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
                amountDisplay,
                " ",
                tUnits("L")
              ] }) : "\u2014",
              minWidth: 120
            }
          )
        ] })
      ]
    },
    r.id
  );
}

// src/mash/MashStepsReadOnlyView.tsx
import "react";
import { YStack as YStack5 } from "tamagui";
import { Text as Text8 } from "@umbraculum/ui";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function MashStepsReadOnlyView(props) {
  const { mashRows, mashProcedure = null, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } = props;
  return /* @__PURE__ */ jsxs7(YStack5, { gap: "$2", children: [
    mashProcedure ? /* @__PURE__ */ jsxs7(Text8, { fontSize: 12, opacity: 0.8, children: [
      mashProcedure.name,
      " \xB7 ",
      t("mashingGrainTemp"),
      ": ",
      mashProcedure.grainTemperatureC,
      " \xB0C"
    ] }) : null,
    mashRows.length ? mashRows.map((r, idx) => /* @__PURE__ */ jsx7(
      MashStepRow,
      {
        readOnly: true,
        row: r,
        index: idx,
        waterVolumes,
        cardBackgroundColor,
        cardBorderColor,
        t,
        tUnits,
        locale,
        formatFixed
      },
      r.id
    )) : /* @__PURE__ */ jsx7(Text8, { fontSize: 12, opacity: 0.8, children: t("mashingEmpty") })
  ] });
}

// src/mash/MashStepRow.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function MashStepRow(props) {
  if (props.readOnly) {
    return /* @__PURE__ */ jsx8(MashStepRowReadOnly, { ...props });
  }
  return /* @__PURE__ */ jsx8(MashStepRowEditable, { ...props });
}

// src/mash/useMashStepsEditorState.ts
import { MASH_STEP_TYPE_OPTIONS as MASH_STEP_TYPE_OPTIONS2 } from "@umbraculum/brewery-beerjson";
function isSpargeRow(r) {
  return r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
}
function stepTypeOptions(hideSparge) {
  return hideSparge ? MASH_STEP_TYPE_OPTIONS2.filter((o) => o.value !== "sparge") : MASH_STEP_TYPE_OPTIONS2;
}
function useMashStepsEditorState(mashRows, options) {
  const { hideSpargeFromTypeOptions = false, onMoveStep, firstStepAmountComputed = null } = options;
  const movableIndices = mashRows.map((r, idx) => ({ r, idx })).filter(({ r, idx }) => idx > 0 && !isSpargeRow(r)).map(({ idx }) => idx);
  const firstMovableIdx = movableIndices.length ? movableIndices[0] : null;
  const lastMovableIdx = movableIndices.length ? movableIndices[movableIndices.length - 1] : null;
  function getRowEditState(r, idx) {
    const isSpargeStep = isSpargeRow(r);
    const disableName = isSpargeStep || idx === 0 && firstStepAmountComputed != null;
    const disableType = isSpargeStep;
    const disableAmount = isSpargeStep || idx === 0 && firstStepAmountComputed != null || idx > 0 && r.deduceFromMashIn !== true;
    const typeOptions = stepTypeOptions(hideSpargeFromTypeOptions);
    const typeValue = r.type;
    const canReorder = Boolean(onMoveStep) && idx > 0 && !isSpargeStep;
    const disableMoveUp = !canReorder || firstMovableIdx == null || idx === firstMovableIdx;
    const disableMoveDown = !canReorder || lastMovableIdx == null || idx === lastMovableIdx;
    return {
      isSpargeStep,
      disableName,
      disableType,
      disableAmount,
      typeValue,
      typeOptions,
      move: { canReorder, disableMoveUp, disableMoveDown }
    };
  }
  return { getRowEditState };
}

// src/mash/MashStepsEditor.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function MashStepsEditor(props) {
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
    formatFixed
  } = props;
  const { getRowEditState } = useMashStepsEditorState(mashRows, {
    hideSpargeFromTypeOptions,
    onMoveStep,
    firstStepAmountComputed
  });
  if (readOnly) {
    return /* @__PURE__ */ jsx9(
      MashStepsReadOnlyView,
      {
        mashRows,
        mashProcedure,
        waterVolumes,
        cardBackgroundColor,
        cardBorderColor,
        t,
        tUnits,
        locale,
        formatFixed
      }
    );
  }
  return /* @__PURE__ */ jsxs8(YStack6, { gap: "$3", children: [
    mashWaterBudgetLiters != null ? /* @__PURE__ */ jsx9(Text9, { fontSize: 12, opacity: 0.8, children: t("mashStepsWaterBudgetNote") }) : null,
    mashProcedure && onUpdateProcedure ? /* @__PURE__ */ jsx9(MashProcedureEditor, { mashProcedure, onUpdateProcedure, t }) : null,
    mashRows.map((r, idx) => /* @__PURE__ */ jsx9(
      MashStepRow,
      {
        row: r,
        index: idx,
        editState: getRowEditState(r, idx),
        waterVolumes,
        firstStepAmountComputed,
        onUpdateStep,
        onMoveStep,
        onDeleteStep,
        t,
        tUnits,
        locale,
        formatFixed
      },
      r.id
    )),
    /* @__PURE__ */ jsx9(
      MashStepsToolbar,
      {
        onAddStep,
        onAddFromTemplate,
        onSave,
        canSave,
        saving,
        saveStatus,
        t
      }
    )
  ] });
}

// src/mash/SpargeStepReadOnlyRow.tsx
import "react";
import { YStack as YStack7 } from "tamagui";
import { Card as Card6, ReadOnlyField as ReadOnlyField2, ReadOnlyFieldRow as ReadOnlyFieldRow2, Text as Text10 } from "@umbraculum/ui";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function SpargeStepReadOnlyRow(props) {
  const { cardBackgroundColor, cardBorderColor, labels, ...rest } = props;
  return /* @__PURE__ */ jsxs9(
    Card6,
    {
      "data-mash-step-card": true,
      ...cardBackgroundColor ?? cardBorderColor ? {} : { theme: "surface2" },
      backgroundColor: cardBackgroundColor ?? "$background",
      borderWidth: 1,
      borderColor: cardBorderColor ?? "$borderColor",
      padding: "$3",
      gap: "$2",
      children: [
        /* @__PURE__ */ jsxs9(Text10, { fontSize: 12, fontWeight: "700", children: [
          rest.stepNumber,
          ". ",
          rest.title
        ] }),
        /* @__PURE__ */ jsx10(YStack7, { gap: "$2", children: /* @__PURE__ */ jsxs9(ReadOnlyFieldRow2, { children: [
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.name, value: rest.name, minWidth: 90 }),
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.type, value: rest.typeLabel, minWidth: 110 }),
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.temp, value: rest.tempDisplay, minWidth: 90 }),
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.time, value: rest.timeDisplay, minWidth: 90 }),
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.amount, value: rest.amountDisplay, minWidth: 120 }),
          /* @__PURE__ */ jsx10(ReadOnlyField2, { label: labels.ramp, value: rest.rampDisplay, minWidth: 90 })
        ] }) })
      ]
    }
  );
}
export {
  BrewCheckbox,
  ManualCellCountHelpBox,
  MashStepsEditor,
  RecipeMetaLine,
  SaltAdditionsEditor,
  SpargeStepReadOnlyRow,
  parseRecipeMetaFromGetRecipeResponse
};
