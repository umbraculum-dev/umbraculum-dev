import { Accordion, SizableText, View } from "tamagui";

import { ErrorBox } from "../../../../../../_components/recipe-edit";
import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";
import {
  WaterAcidificationManualResultPanel,
  WaterAcidificationTargetPhResultPanel,
} from "../../../_lib/acidification/WaterAcidificationResultPanel";
import { WaterAcidificationSaveBar } from "../../../_lib/acidification/WaterAcidificationSaveBar";

import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";
import { WaterSpargeAcidificationInputs } from "./WaterSpargeAcidificationInputs";

export function WaterSpargeAcidificationSection({ model }: { model: WaterSpargePageModel }) {
  const {
    locale,
    t,
    tUnits,
    tMath,
    canCall,
    surfaceMath,
    spargeError,
    spargeStatus,
    spargeSaveStatus,
    setSpargeSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    spargeResult,
    acidDerivation,
    spargeManualResult,
    spargeSubmitting,
    savingSparge,
    spargeAcidificationMode,
    strengthKind,
    selectedSpargeProfile,
    openSpargeSections,
    onSaveSpargeInputs,
    onSubmitSparge,
  } = model;

  const profilePhNote =
    selectedSpargeProfile?.ph == null ? (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
        Note: this profile has no pH. The calculation uses only the manually entered <strong>Starting pH</strong>.
      </SizableText>
    ) : null;

  return (
    <Accordion.Item value="acidification">
      <View className="brew-panel brew-section" aria-labelledby="sparge-heading">
        <BrewAccordionHeader
          headingId="sparge-heading"
          title={t("acidificationHeading")}
          open={openSpargeSections.includes("acidification")}
        />
        <Accordion.Content>
          <form
            onSubmit={(...a) => {
              void onSubmitSparge(...(a as Parameters<typeof onSubmitSparge>));
            }}
            aria-describedby={spargeError ? "sparge-error" : undefined}
          >
            <WaterSpargeAcidificationInputs model={model} />

            <WaterAcidificationSaveBar
              canCall={canCall}
              submitting={spargeSubmitting}
              saving={savingSparge}
              acidificationMode={spargeAcidificationMode}
              saveDraftLabel="Save sparge draft"
              onSave={() => {
                void onSaveSpargeInputs();
              }}
              saveStatus={spargeSaveStatus}
              calcSaveStatus={calcSaveStatus}
              onDismissStatus={() => {
                setSpargeSaveStatus(null);
                setCalcSaveStatus(null);
              }}
              inlineStatus={spargeStatus}
              submitFirst
            />

            {spargeError ? <ErrorBox id="sparge-error" mt="$3">{spargeError}</ErrorBox> : null}
          </form>

          {spargeAcidificationMode === "targetPh" && spargeResult ? (
            <WaterAcidificationTargetPhResultPanel
              stream="sparge"
              result={spargeResult}
              resultHeading={t("resultLastCalculated")}
              surfaceMath={surfaceMath}
              locale={locale}
              tMath={tMath}
              tUnits={tUnits}
              fmt={model.fmt}
              acidDerivation={acidDerivation}
              variant="detailed"
              profilePhNote={profilePhNote}
            />
          ) : null}

          {spargeAcidificationMode === "manual" && spargeManualResult ? (
            <WaterAcidificationManualResultPanel
              manualResult={spargeManualResult}
              strengthKind={strengthKind}
              tUnits={tUnits}
              fmt={model.fmt}
              profilePhNote={profilePhNote}
            />
          ) : null}
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
