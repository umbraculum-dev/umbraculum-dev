/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../../src/i18n/navigation";

import { MashStepsEditor } from "@umbraculum/brewery-recipes-ui";
import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeTitleWithMeta } from "../../../../../../_components/RecipeTitleWithMeta";
import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";
import { Accordion, Button, H3, Input, SizableText, View, XStack, YStack } from "tamagui";
import { mathExplain } from "../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../_lib/mathBodies";
import { formatFixed, formatWithHint } from "../../../../../../../src/i18n/format";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";

export function WaterMashMashStepsSection({ model }: { model: WaterMashPageModel }) {
  const {
    t,
    tEdit,
    tUnits,
    tMath,
    tWater,
    locale,
    recipeId,
    authState,
    loadRecipeMeta,
    me,
    openMashSections,
    setOpenMashSections,
    canCall,
    surfaceMath,
    setSurfaceMath,
    fmt,
    savingError,
    settingsError,
    profilesError,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    loadingProfiles,
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    waterProfiles,
    dilutionProfiles,
    mixedSourceProfile,
    selectedTarget,
    refreshProfiles,
    onSaveAdjustment,
    gristImportedRows,
    gristImportedAt,
    gristSourceRecipeUpdatedAt,
    gristImportStatus,
    gristImportError,
    importingGrist,
    gristTotalKg,
    lateAdditionsTotalKg,
    onImportGristFromRecipe,
    mashError,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    savingMash,
    mashResult,
    mashManualResult,
    mashStartingAlk,
    setMashStartingAlk,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    derivedMashWaterVolumeLiters,
    acidDerivation,
    overallDerivation,
    onSaveMashInputs,
    onSubmitMash,
    saltsError,
    saltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    savingSalts,
    saltAdditions,
    setSaltAdditions,
    saltsResult,
    saltDerivationForMath,
    onSaveSaltAdditions,
    onCalcSalts,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    onCalculateOverall,
    mashProcedure,
    mashRows,
    mashStepsSaveError,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaving,
    waterVolumes,
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
    recipe,
    admin,
  } = model;

  return (
    <Accordion.Item value="mashSteps">
            <View id="mash-steps" className="brew-panel brew-section" aria-labelledby="mash-steps-heading">
              <BrewAccordionHeader
                headingId="mash-steps-heading"
                title={t("mashStepsHeading")}
                open={openMashSections.includes("mashSteps")}
              />
              <Accordion.Content>
                {mashStepsSaveError ? <ErrorBox mb="$3">{mashStepsSaveError}</ErrorBox> : null}
                <MashStepsEditor
                  mashRows={mashRows}
                  mashProcedure={mashProcedure}
                  waterVolumes={waterVolumes}
                  mashWaterBudgetLiters={derivedMashWaterVolumeLiters > 0 ? derivedMashWaterVolumeLiters : null}
                  firstStepAmountComputed={
                    derivedMashWaterVolumeLiters > 0 && mashRows[0]?.type === "infusion"
                      ? computeFirstStepAmountL
                      : null
                  }
                  hideSpargeFromTypeOptions
                  recipeId={recipeId}
                  readOnly={false}
                  onUpdateProcedure={updateMashProcedure}
                  onUpdateStep={updateMashStep}
                  onMoveStep={moveMashStep}
                  onAddStep={addMashStep}
                  onDeleteStep={deleteMashStep}
                  onAddFromTemplate={addMashFromTemplate}
                  onSave={() => { void saveMashSteps(); }}
                  canSave={canCall && !!recipe?.beerJsonRecipeJson}
                  saving={mashStepsSaving}
                  t={tEdit}
                  tUnits={tUnits}
                  locale={locale}
                  formatFixed={formatFixed}
                />
                {mashStepsSaveStatus ? (
                  <MessageBox
                    variant="success"
                    role="status"
                    aria-live="polite"
                    dismissAfter={5000}
                    onDismiss={() => setMashStepsSaveStatus(null)}
                    mt="$3"
                  >
                    {mashStepsSaveStatus}
                  </MessageBox>
                ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>
  );
}
