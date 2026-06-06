import { H2, View } from "tamagui";

import { ErrorBox } from "../../../../../../../../_components/recipe-edit";
import {
  WaterAcidificationManualResultPanel,
  WaterAcidificationTargetPhResultPanel,
} from "../../../_lib/acidification/WaterAcidificationResultPanel";
import { WaterAcidificationSaveBar } from "../../../_lib/acidification/WaterAcidificationSaveBar";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";
import { WaterBoilAcidificationInputs } from "./WaterBoilAcidificationInputs";
import { WaterBoilAcidificationOverallPanel } from "./WaterBoilAcidificationOverallPanel";

export function WaterBoilAcidificationSection({ model }: { model: WaterBoilPageModel }) {
  const {
    locale,
    t,
    tUnits,
    tMath,
    canCall,
    boilError,
    boilStatus,
    boilSaveStatus,
    setBoilSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    savingInputs,
    acidResult,
    manualResult,
    acidificationMode,
    strengthKind,
    displayAlkalinityPpmCaCO3,
    onSaveInputs,
    onSubmitAcid,
  } = model;

  return (
    <>
      <View className="brew-panel" aria-labelledby="boil-acid-heading">
        <H2 id="boil-acid-heading" mt={0}>
          {t("acidificationHeading")}
        </H2>

        <form
          onSubmit={(...a) => {
            void onSubmitAcid(...(a as Parameters<typeof onSubmitAcid>));
          }}
          aria-describedby={boilError ? "boil-error" : undefined}
        >
          <WaterBoilAcidificationInputs model={model} />

          <WaterAcidificationSaveBar
            canCall={canCall}
            submitting={submitting}
            saving={savingInputs}
            acidificationMode={acidificationMode}
            saveDraftLabel="Save boil draft"
            onSave={() => {
              void onSaveInputs();
            }}
            saveStatus={boilSaveStatus}
            calcSaveStatus={calcSaveStatus}
            onDismissStatus={() => {
              setBoilSaveStatus(null);
              setCalcSaveStatus(null);
            }}
            inlineStatus={boilStatus}
            submitFirst
          />

          {boilError ? <ErrorBox id="boil-error" mt="$3">{boilError}</ErrorBox> : null}
        </form>

        {acidificationMode === "targetPh" && acidResult ? (
          <WaterAcidificationTargetPhResultPanel
            stream="boil"
            result={acidResult}
            resultHeading=""
            surfaceMath={false}
            locale={locale}
            tMath={tMath}
            tUnits={tUnits}
            fmt={model.fmt}
            acidDerivation={null}
            displayAlkalinity={displayAlkalinityPpmCaCO3}
            variant="simple"
          />
        ) : null}

        {acidificationMode === "manual" && manualResult ? (
          <WaterAcidificationManualResultPanel
            manualResult={manualResult}
            strengthKind={strengthKind}
            tUnits={tUnits}
            fmt={model.fmt}
            displayAlkalinity={displayAlkalinityPpmCaCO3}
            showIonAdds={false}
          />
        ) : null}

        <WaterBoilAcidificationOverallPanel model={model} />
      </View>
    </>
  );
}
