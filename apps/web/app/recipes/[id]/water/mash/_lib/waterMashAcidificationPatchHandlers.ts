import type { FormEvent } from "react";

import { buildMashSaveSettingsPayload } from "./waterMashAcidificationPayloads";
import type { WaterMashAcidificationHandlerDeps } from "./waterMashAcidificationHandlerMethods";
import type { buildWaterMashAcidificationComputeMethods } from "./waterMashAcidificationComputeMethods";

export function buildWaterMashAcidificationPatchHandlers(
  deps: WaterMashAcidificationHandlerDeps,
  compute: ReturnType<typeof buildWaterMashAcidificationComputeMethods>,
) {
  return {
    onSaveMashInputs: async () => {
      const { tapVolumeLiters, dilutionVolumeLiters, derivedMashWaterVolumeLiters } =
        deps.adjustmentFieldsRef.current;
      deps.setSavingError(null);
      deps.setMashSaveStatus(null);
      deps.setSavingMash(true);
      try {
        await deps.saveSettings(
          buildMashSaveSettingsPayload({
            tapVolumeLiters,
            dilutionVolumeLiters,
            derivedMashWaterVolumeLiters,
            mashStartingAlk: deps.mashStartingAlk,
            mashStartingPh: deps.mashStartingPh,
            mashTargetPh: deps.mashTargetPh,
            mashAcidType: deps.mashAcidType,
            mashStrengthKind: deps.mashStrengthKind,
            mashStrengthValue: deps.mashStrengthValue,
            mashAcidificationMode: deps.mashAcidificationMode,
            mashManualAcidAdded: deps.mashManualAcidAdded,
          }),
        );
        deps.setMashSaveStatus("Saved mash draft.");
      } catch (err) {
        deps.setSavingError(String(err));
      } finally {
        deps.setSavingMash(false);
      }
    },
    onSubmitMash: async (e: FormEvent) => {
      e.preventDefault();
      if (!deps.canCall) return;
      deps.setMashError(null);
      deps.setMashStatus(null);
      deps.setMashManualStatus(null);
      deps.setMashCalcSaveStatus(null);
      deps.setMashResult(null);
      deps.setMashManualResult(null);
      deps.setAcidDerivation(null);
      deps.setMashSubmitting(true);
      try {
        compute.applyComputeResults(await compute.computeAndSaveMashSnapshots());
      } catch (err) {
        deps.setMashError(String(err));
      } finally {
        deps.setMashSubmitting(false);
      }
    },
    onCalculateOverall: async (saveAlso: boolean) => {
      deps.setOverallError(null);
      deps.setOverallStatus(null);
      deps.setOverallSaveStatus(null);
      deps.setSavingOverall(true);
      try {
        if (saveAlso) {
          compute.applyComputeResults(await compute.computeAndSaveMashSnapshots());
          deps.setOverallSaveStatus("Calculated & saved overall snapshot.");
        } else {
          await deps.saltsBridgeRef.current.ensureZeroSaltsSnapshotIfMissing();
          deps.setOverallResult(await compute.computeOverallMash());
          deps.setOverallStatus("Calculated.");
        }
      } catch (err) {
        deps.setOverallError(String(err));
      } finally {
        deps.setSavingOverall(false);
      }
    },
  };
}
