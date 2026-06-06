import { ModeFieldset } from "@umbraculum/ui";
import { Accordion, View } from "tamagui";

import { ErrorBox } from "../../../../../../../../_components/recipe-edit";
import { BrewAccordionHeader } from "../../../../../../../../_components/BrewAccordionHeader";
import {
  WaterAcidificationManualResultPanel,
  WaterAcidificationTargetPhResultPanel,
} from "../../../_lib/acidification/WaterAcidificationResultPanel";
import { WaterAcidificationSaveBar } from "../../../_lib/acidification/WaterAcidificationSaveBar";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";
import { WaterMashAcidificationInputs } from "./WaterMashAcidificationInputs";

export function WaterMashAcidificationSection({ model }: { model: WaterMashPageModel }) {
  const {
    t,
    tUnits,
    tMath,
    locale,
    openMashSections,
    canCall,
    surfaceMath,
    mashError,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    savingMash,
    mashResult,
    mashManualResult,
    mashStrengthKind,
    mashAcidificationMode,
    setMashAcidificationMode,
    acidDerivation,
    overallDerivation,
    onSaveMashInputs,
    onSubmitMash,
  } = model;

  return (
    <Accordion.Item value="acidification">
      <View className="brew-panel brew-section" aria-labelledby="mash-heading">
        <BrewAccordionHeader
          headingId="mash-heading"
          title={t("acidificationHeading")}
          open={openMashSections.includes("acidification")}
        />
        <Accordion.Content>
          <form
            onSubmit={(...a) => {
              void onSubmitMash(...(a as Parameters<typeof onSubmitMash>));
            }}
            aria-describedby={mashError ? "mash-error" : undefined}
          >
            <ModeFieldset
              legend="Mode"
              name="mash-acid-mode"
              value={mashAcidificationMode}
              onChange={(v) => setMashAcidificationMode(v)}
              options={[
                { value: "targetPh", label: "Target mash pH (compute required acid)" },
                { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
              ]}
            />

            <WaterMashAcidificationInputs model={model} />

            <WaterAcidificationSaveBar
              canCall={canCall}
              submitting={mashSubmitting}
              saving={savingMash}
              acidificationMode={mashAcidificationMode}
              saveDraftLabel="Save mash draft"
              onSave={() => {
                void onSaveMashInputs();
              }}
              saveStatus={mashSaveStatus}
              calcSaveStatus={mashCalcSaveStatus}
              onDismissStatus={() => {
                setMashSaveStatus(null);
                setMashCalcSaveStatus(null);
              }}
            />

            {mashError ? <ErrorBox id="mash-error" mt="$3">{mashError}</ErrorBox> : null}
          </form>

          {mashAcidificationMode === "targetPh" && mashResult ? (
            <div className="brew-mt3">
              <WaterAcidificationTargetPhResultPanel
                stream="mash"
                result={mashResult}
                resultHeading={t("resultLastCalculated")}
                surfaceMath={surfaceMath}
                locale={locale}
                tMath={tMath}
                tUnits={tUnits}
                fmt={model.fmt}
                acidDerivation={acidDerivation}
                overallDerivation={overallDerivation}
                variant="plain"
              />
            </div>
          ) : null}

          {mashAcidificationMode === "manual" && mashManualResult ? (
            <WaterAcidificationManualResultPanel
              manualResult={mashManualResult}
              strengthKind={mashStrengthKind}
              tUnits={tUnits}
              fmt={model.fmt}
            />
          ) : null}
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
