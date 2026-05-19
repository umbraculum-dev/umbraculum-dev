"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ManualCellCountHelpBox: () => ManualCellCountHelpBox,
  MashStepsEditor: () => MashStepsEditor,
  RecipeMetaLine: () => RecipeMetaLine,
  SaltAdditionsEditor: () => SaltAdditionsEditor,
  SpargeStepReadOnlyRow: () => SpargeStepReadOnlyRow,
  parseRecipeMetaFromGetRecipeResponse: () => parseRecipeMetaFromGetRecipeResponse
});
module.exports = __toCommonJS(index_exports);

// src/recipeMeta/RecipeMetaLine.tsx
var import_react = require("react");
var import_i18n_react = require("@umbraculum/i18n-react");
var import_ui = require("@umbraculum/ui");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const { t } = (0, import_i18n_react.useT)("waterHub");
  const enabled = enabledProp !== false;
  const [meta, setMeta] = (0, import_react.useState)({ name: null, version: null });
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Text, { fontSize: 12, opacity: 0.8, children: [
    t("recipeId"),
    ": ",
    recipeId,
    meta.name ? ` - ${t("recipeName")}: ${meta.name}` : null,
    meta.version !== null ? ` - ${t("recipeVersion")}: ${String(meta.version).padStart(2, "0")}` : null
  ] });
}

// src/yeast/ManualCellCountHelpBox.tsx
var import_react2 = require("react");
var import_i18n_react2 = require("@umbraculum/i18n-react");
var import_ui2 = require("@umbraculum/ui");
var import_tamagui = require("tamagui");
var import_jsx_runtime2 = require("react/jsx-runtime");
function StepBlock(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_tamagui.View, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_ui2.Text, { fontSize: 14, fontWeight: "600", marginBottom: "$1", children: [
      props.step,
      ". ",
      props.title
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 12, opacity: 0.85, children: props.body })
  ] });
}
function ManualCellCountHelpBox(props) {
  const { t } = (0, import_i18n_react2.useT)("recipes.edit");
  const [expanded, setExpanded] = (0, import_react2.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Card, { gap: "$2", marginTop: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_ui2.Collapsible,
    {
      title: t("yeastManualCellCountSummary"),
      expanded,
      onExpandedChange: setExpanded,
      accessibilityLabel: t("yeastManualCellCountSummary"),
      summary: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 16, fontWeight: "700", children: t("yeastManualCellCountSummary") }),
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_tamagui.View, { style: { gap: 12, marginTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 14, fontWeight: "600", children: t("yeastManualCellCountTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          StepBlock,
          {
            step: 0,
            title: t("yeastManualCellCountPrerequisitesTitle"),
            body: t("yeastManualCellCountPrerequisitesBody")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_tamagui.YStack, { gap: "$2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 1, title: t("yeastManualCellCountStep1Title"), body: t("yeastManualCellCountStep1Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_tamagui.View, { children: [
            props.renderImage({
              assetKey: "yeast/dilution-1-100.png",
              alt: t("yeastManualCellCountStep1ImageAlt"),
              width: 320,
              height: 200
            }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 11, opacity: 0.8, marginTop: "$1", children: t("yeastManualCellCountStep1ImageLegend") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 2, title: t("yeastManualCellCountStep2Title"), body: t("yeastManualCellCountStep2Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 3, title: t("yeastManualCellCountStep3Title"), body: t("yeastManualCellCountStep3Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_tamagui.View, { children: props.renderImage({
            assetKey: "yeast/hemocytometer-5-squares.png",
            alt: t("yeastManualCellCountStep3ImageAlt"),
            width: 320,
            height: 200
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 4, title: t("yeastManualCellCountStep4Title"), body: t("yeastManualCellCountStep4Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 5, title: t("yeastManualCellCountStep5Title"), body: t("yeastManualCellCountStep5Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StepBlock, { step: 6, title: t("yeastManualCellCountStep6Title"), body: t("yeastManualCellCountStep6Body") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 14, fontWeight: "600", children: t("yeastManualCellCountGlossaryTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 12, opacity: 0.85, children: t("yeastManualCellCountGlossary") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Text, { fontSize: 11, opacity: 0.8, children: t("yeastManualCellCountReference") })
      ] })
    }
  ) });
}

// src/water/SaltAdditionsEditor.tsx
var import_react3 = require("react");
var import_tamagui2 = require("tamagui");
var import_i18n_react3 = require("@umbraculum/i18n-react");
var import_ui3 = require("@umbraculum/ui");
var import_jsx_runtime3 = require("react/jsx-runtime");
var SALT_OPTIONS = [
  { value: "gypsum", label: "Gypsum (CaSO4\xB72H2O)" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2\xB72H2O)" },
  { value: "epsom", label: "Epsom (MgSO4\xB77H2O)" },
  { value: "table_salt", label: "Table salt (NaCl)" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)" }
];
function SaltAdditionsEditor(props) {
  const { t } = (0, import_i18n_react3.useT)("ui");
  const { t: tUnits } = (0, import_i18n_react3.useT)("units");
  const { t: tCommon } = (0, import_i18n_react3.useT)("common");
  const { rows, onChange, idPrefix = "salt", disabled } = props;
  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx, next) => onChange(rows.map((r, i) => i === idx ? { ...r, ...next } : r));
  const removeRow = (idx) => onChange(rows.filter((_, i) => i !== idx));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_ui3.Card, { gap: "$3", padding: 0, backgroundColor: "transparent", borderWidth: 0, children: [
    rows.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_tamagui2.YStack, { gap: "$3", children: rows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_tamagui2.XStack, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_tamagui2.YStack, { flex: 1, minWidth: 180, gap: "$1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Text, { fontSize: 11, opacity: 0.8, marginBottom: "$1", children: t("salt") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_ui3.SelectField,
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_tamagui2.YStack, { flex: 1, minWidth: 140, gap: "$1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Text, { fontSize: 11, opacity: 0.8, marginBottom: "$1", children: t("amountLabel", { unit: tUnits("g") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_ui3.Input,
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_ui3.Button,
        {
          size: "$3",
          chromeless: true,
          onPress: () => removeRow(idx),
          disabled,
          accessibilityLabel: tCommon("remove"),
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Text, { fontSize: 12, children: tCommon("remove") })
        }
      )
    ] }, idx)) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Text, { fontSize: 12, opacity: 0.8, children: t("noSaltsAddedYet") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Button, { size: "$3", onPress: addRow, disabled, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_ui3.Text, { children: t("addSalt") }) })
  ] });
}

// src/mash/MashStepsEditor.tsx
var import_react4 = require("react");
var import_tamagui3 = require("tamagui");
var import_brewery_beerjson = require("@umbraculum/brewery-beerjson");
var import_ui4 = require("@umbraculum/ui");
var import_jsx_runtime4 = require("react/jsx-runtime");
function stepTypeOptions(hideSparge) {
  return hideSparge ? import_brewery_beerjson.MASH_STEP_TYPE_OPTIONS.filter((o) => o.value !== "sparge") : import_brewery_beerjson.MASH_STEP_TYPE_OPTIONS;
}
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
  const isSpargeRow = (r) => r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
  const movableIndices = mashRows.map((r, idx) => ({ r, idx })).filter(({ r, idx }) => idx > 0 && !isSpargeRow(r)).map(({ idx }) => idx);
  const firstMovableIdx = movableIndices.length ? movableIndices[0] : null;
  const lastMovableIdx = movableIndices.length ? movableIndices[movableIndices.length - 1] : null;
  if (readOnly) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$2", children: [
      mashProcedure ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Text, { fontSize: 12, opacity: 0.8, children: [
        mashProcedure.name,
        " \xB7 ",
        t("mashingGrainTemp"),
        ": ",
        mashProcedure.grainTemperatureC,
        " \xB0C"
      ] }) : null,
      mashRows.length ? mashRows.map((r, idx) => {
        const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
        const amountDisplay = isSpargeStep && waterVolumes ? formatFixed(locale, waterVolumes.spargeLiters, 2) : r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : null;
        const typeLabel = import_brewery_beerjson.MASH_STEP_TYPE_OPTIONS.find((o) => o.value === r.type)?.label ?? r.type;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          import_ui4.Card,
          {
            "data-mash-step-card": true,
            ...cardBackgroundColor ?? cardBorderColor ? {} : { theme: "surface2" },
            gap: "$2",
            padding: "$3",
            backgroundColor: cardBackgroundColor ?? "$background",
            borderWidth: 1,
            borderColor: cardBorderColor ?? "$borderColor",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Text, { fontSize: 12, fontWeight: "700", children: [
                idx + 1,
                ". ",
                r.name
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.ReadOnlyFieldRow, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.ReadOnlyField, { label: t("mashingStepType"), value: typeLabel, minWidth: 120, flex: 1 }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  import_ui4.ReadOnlyField,
                  {
                    label: t("mashingStepTemp", { unit: "\xB0C" }),
                    value: String(r.stepTemperatureC),
                    minWidth: 90
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  import_ui4.ReadOnlyField,
                  {
                    label: t("mashingStepTime", { unit: "min" }),
                    value: String(r.stepTimeMin),
                    minWidth: 90
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  import_ui4.ReadOnlyField,
                  {
                    label: t("mashingStepAmount", { unit: "L" }),
                    value: amountDisplay != null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
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
      }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.8, children: t("mashingEmpty") })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$3", children: [
    mashWaterBudgetLiters != null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.8, children: t("mashStepsWaterBudgetNote") }) : null,
    mashProcedure && onUpdateProcedure ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Card, { gap: "$2", padding: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, fontWeight: "700", children: t("mashingProcedureName") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_ui4.Input,
        {
          value: mashProcedure.name,
          onChangeText: (text) => onUpdateProcedure({ name: text }),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, fontWeight: "700", marginTop: "$2", children: t("mashingGrainTemp") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_ui4.Input,
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
    ] }) : null,
    mashRows.map((r, idx) => {
      const isSpargeStep = isSpargeRow(r);
      const disableName = isSpargeStep || idx === 0 && firstStepAmountComputed != null;
      const disableType = isSpargeStep;
      const disableAmount = isSpargeStep || idx === 0 && firstStepAmountComputed != null || idx > 0 && r.deduceFromMashIn !== true;
      const typeOptions = stepTypeOptions(hideSpargeFromTypeOptions);
      const typeValue = r.type;
      const canReorder = Boolean(onMoveStep) && idx > 0 && !isSpargeStep;
      const disableMoveUp = !canReorder || firstMovableIdx == null || idx === firstMovableIdx;
      const disableMoveDown = !canReorder || lastMovableIdx == null || idx === lastMovableIdx;
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Card, { gap: "$2", padding: "$3", background: "$background", borderWidth: 1, borderColor: "$borderColor", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { justifyContent: "space-between", alignItems: "center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Text, { fontSize: 14, fontWeight: "700", children: [
            idx + 1,
            ". ",
            r.name || t("mashingStepName")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { gap: "$2", alignItems: "center", children: [
            canReorder ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_ui4.Button,
                {
                  size: "$2",
                  chromeless: true,
                  disabled: disableMoveUp,
                  onPress: () => onMoveStep?.(r.id, "up"),
                  accessibilityLabel: t("moveUp"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, children: t("moveUp") })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_ui4.Button,
                {
                  size: "$2",
                  chromeless: true,
                  disabled: disableMoveDown,
                  onPress: () => onMoveStep?.(r.id, "down"),
                  accessibilityLabel: t("moveDown"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, children: t("moveDown") })
                }
              )
            ] }) : null,
            idx > 0 && onDeleteStep ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Button, { size: "$2", chromeless: true, onPress: () => onDeleteStep(r.id), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, children: t("mashingDeleteStep") }) }) : null
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 11, opacity: 0.8, children: t("mashingStepName") }),
            disableName ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.85, children: isSpargeStep ? "Sparge" : r.name || "Mash In" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_ui4.Input,
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
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 11, opacity: 0.8, children: t("mashingStepType") }),
            disableType ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.85, children: "Sparge" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_ui4.SelectField,
              {
                value: typeValue,
                onValueChange: (v) => onUpdateStep?.(r.id, { type: v }),
                options: typeOptions,
                width: "full",
                "aria-label": t("mashingStepType")
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { gap: "$2", flexWrap: "wrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$1", flex: 1, minWidth: 120, children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 11, opacity: 0.8, children: t("mashingStepTemp", { unit: "\xB0C" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_ui4.Input,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$1", flex: 1, minWidth: 120, children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 11, opacity: 0.8, children: t("mashingStepTime", { unit: "min" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_ui4.Input,
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
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 11, opacity: 0.8, children: t("mashingStepAmount", { unit: tUnits("L") }) }),
            isSpargeStep ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.85, children: waterVolumes ? `${formatFixed(locale, waterVolumes.spargeLiters, 2)} ${tUnits("L")}` : "\u2014" }) : idx === 0 && firstStepAmountComputed != null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Text, { fontSize: 12, opacity: 0.85, children: [
              formatFixed(locale, firstStepAmountComputed, 2),
              " ",
              tUnits("L")
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_ui4.Input,
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
          idx > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { gap: "$2", alignItems: "center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_ui4.BrewCheckbox,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, opacity: 0.85, children: t("mashingDeduceFromMashIn") })
          ] }) : null
        ] })
      ] }, r.id);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { gap: "$2", flexWrap: "wrap", alignItems: "center", children: [
      onAddStep ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Button, { size: "$3", onPress: onAddStep, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { children: t("mashingAddStep") }) }) : null,
      onAddFromTemplate ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.XStack, { gap: "$2", flexWrap: "wrap", alignItems: "center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ui4.Text, { fontSize: 12, opacity: 0.8, children: [
          t("mashingAddFromTemplate"),
          ":"
        ] }),
        import_brewery_beerjson.MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Button, { size: "$3", chromeless: true, onPress: () => onAddFromTemplate(tpl.id), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, children: t(tpl.labelKey) }) }, tpl.id))
      ] }) : null
    ] }),
    onSave ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_tamagui3.YStack, { gap: "$2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Button, { size: "$3", onPress: onSave, disabled: !canSave || saving, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { children: saving ? t("saving") : t("mashingSaveMashSteps") }) }),
      saveStatus ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Card, { gap: "$1", padding: "$2", background: "$color4", borderWidth: 1, borderColor: "$borderColor", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ui4.Text, { fontSize: 12, children: saveStatus }) }) : null
    ] }) : null
  ] });
}

// src/mash/SpargeStepReadOnlyRow.tsx
var import_react5 = require("react");
var import_tamagui4 = require("tamagui");
var import_ui5 = require("@umbraculum/ui");
var import_jsx_runtime5 = require("react/jsx-runtime");
function SpargeStepReadOnlyRow(props) {
  const { cardBackgroundColor, cardBorderColor, labels, ...rest } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    import_ui5.Card,
    {
      "data-mash-step-card": true,
      ...cardBackgroundColor ?? cardBorderColor ? {} : { theme: "surface2" },
      backgroundColor: cardBackgroundColor ?? "$background",
      borderWidth: 1,
      borderColor: cardBorderColor ?? "$borderColor",
      padding: "$3",
      gap: "$2",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_ui5.Text, { fontSize: 12, fontWeight: "700", children: [
          rest.stepNumber,
          ". ",
          rest.title
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui4.YStack, { gap: "$2", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_ui5.ReadOnlyFieldRow, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.name, value: rest.name, minWidth: 90 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.type, value: rest.typeLabel, minWidth: 110 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.temp, value: rest.tempDisplay, minWidth: 90 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.time, value: rest.timeDisplay, minWidth: 90 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.amount, value: rest.amountDisplay, minWidth: 120 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_ui5.ReadOnlyField, { label: labels.ramp, value: rest.rampDisplay, minWidth: 90 })
        ] }) })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ManualCellCountHelpBox,
  MashStepsEditor,
  RecipeMetaLine,
  SaltAdditionsEditor,
  SpargeStepReadOnlyRow,
  parseRecipeMetaFromGetRecipeResponse
});
