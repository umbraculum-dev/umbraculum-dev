import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import { ErrorBox, FieldBadge, MessageBox } from "../../../../../../_components/recipe-edit";
import { mathExplain } from "../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../_lib/mathBodies";
import { Button, H3, SizableText, View, XStack, YStack } from "tamagui";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";

export function WaterBoilAcidificationOverallPanel({ model }: { model: WaterBoilPageModel }) {
  const {
    locale,
    t,
    tUnits,
    tMath,
    canCall,
    surfaceMath,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    overallDerivation,
    displayAlkalinityPpmCaCO3,
    onCalculateOverall,
  } = model;

  return (
    <>
      <View height={1} bg="var(--border)" my="$4" />

      <H3 id="overall-boil-water-result" mt={0}>
        {t("overallResultHeading")}
      </H3>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to
        persist a snapshot.
      </SizableText>
      <YStack mt="$3" gap="$2">
        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void onCalculateOverall(false)}
            disabled={!canCall || savingOverall}
          >
            {savingOverall ? "Calculating…" : "Preview overall"}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void onCalculateOverall(true)}
            disabled={!canCall || savingOverall}
          >
            {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
          </Button>
          {overallStatus ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {overallStatus}
            </SizableText>
          ) : null}
        </XStack>
        {overallSaveStatus ? (
          <MessageBox
            variant="success"
            role="status"
            aria-live="polite"
            dismissAfter={5000}
            onDismiss={() => setOverallSaveStatus(null)}
          >
            {overallSaveStatus}
          </MessageBox>
        ) : null}
      </YStack>
      {overallError ? <ErrorBox mt="$3">{overallError}</ErrorBox> : null}

      {overallResult ? (
        <View className="brew-field-block brew-field-block--computed brew-mt3">
          <View className="brew-field-block-header">
            <SizableText fontWeight="bold">Overall boil snapshot</SizableText>
            {surfaceMath ? (() => {
              const ex = mathExplain["boil.overallSnapshot"];
              const title = tMath(ex.titleKey);
              return (
                <MathHelpPopover
                  title={title}
                  body={buildWaterMathBody({
                    key: "boil.overallSnapshot",
                    tMath,
                    locale,
                    ctx: { overallDerivation },
                    units: {
                      L: tUnits("L"),
                      ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                      ppm: tUnits("ppm"),
                      g: tUnits("g"),
                      LPerKg: tUnits("LPerKg"),
                    },
                  })}
                  ariaLabel={tMath("fxLabel", { topic: title })}
                />
              );
            })() : null}
            <FieldBadge>Computed</FieldBadge>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
              Uses latest inputs; persist a snapshot to debug
            </SizableText>
          </View>
          <ul>
            <li>
              pH: {overallResult.ph.kind} <code>{model.fmt("pH", overallResult.ph.value, 2)}</code>
            </li>
            <li>
              Final alkalinity:{" "}
              <code>{model.fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(overallResult.finalAlkalinityPpmCaCO3), 0)}</code>{" "}
              {tUnits("ppmAsCaCO3")}
            </li>
          </ul>
          <View className="brew-table-wrap-mt">
            <table className="brew-table">
              <thead>
                <tr>
                  <th align="left">Ion</th>
                  <th align="left">Overall (ppm)</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Ca", overallResult.ionsPpm.calcium],
                    ["Mg", overallResult.ionsPpm.magnesium],
                    ["Na", overallResult.ionsPpm.sodium],
                    ["SO4", overallResult.ionsPpm.sulfate],
                    ["Cl", overallResult.ionsPpm.chloride],
                    ["HCO3", overallResult.ionsPpm.bicarbonate],
                  ] as const
                ).map(([label, v]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td align="left">{model.fmt("ppm", v, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>
        </View>
      ) : null}
    </>
  );
}
