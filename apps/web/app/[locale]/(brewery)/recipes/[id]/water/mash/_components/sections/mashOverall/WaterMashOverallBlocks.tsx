import { Button, MessageBox, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, FieldBadge } from "../../../../../../../../../_components/recipe-edit";
import { MathHelpPopover } from "../../../../../../../../../_components/MathHelpPopover";

import { buildWaterMathBody } from "../../../../_lib/mathBodies";
import { mathExplain } from "../../../../_lib/mathExplain";
import type { WaterMashPageModel } from "../../../_hooks/useWaterMashPage";

export function WaterMashOverallActionsBlock({ model }: { model: WaterMashPageModel }) {
  const {
    canCall,
    savingOverall,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    onCalculateOverall,
  } = model;

  return (
    <YStack gap="$2" mt="$3">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
          {savingOverall ? "Calculating…" : "Preview overall"}
        </Button>
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
          {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
        </Button>
        {overallStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{overallStatus}</SizableText> : null}
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
  );
}

export function WaterMashOverallErrorBlock({ model }: { model: WaterMashPageModel }) {
  const { overallError } = model;
  if (!overallError) return null;
  return <ErrorBox mt="$3">{overallError}</ErrorBox>;
}

export function WaterMashOverallIonsBlock({ model }: { model: WaterMashPageModel }) {
  const { fmt, overallResult } = model;
  if (!overallResult) return null;

  return (
    <View className="brew-table-wrap-mt">
      <table className="brew-table">
        <thead>
          <tr>
            <th align="left">Ion</th>
            <th align="right">Overall (ppm)</th>
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
              <td align="right">{fmt("ppm", v, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </View>
  );
}

export function WaterMashOverallStatsBlock({ model }: { model: WaterMashPageModel }) {
  const {
    tMath,
    locale,
    tUnits,
    surfaceMath,
    fmt,
    derivedMashWaterVolumeLiters,
    overallDerivation,
    acidDerivation,
    overallResult,
  } = model;

  if (!overallResult) return null;

  return (
    <details className="brew-field-block brew-field-block--computed brew-mt3" open>
      <summary className="brew-field-block-header brew-details-summary">
        <strong>Overall mash snapshot</strong>
        {surfaceMath ? (() => {
          const ex = mathExplain["mash.overallSnapshot"];
          const title = tMath(ex.titleKey);
          return (
            <MathHelpPopover
              title={title}
              body={buildWaterMathBody({
                key: "mash.overallSnapshot",
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
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Uses latest inputs; persist a snapshot to debug</SizableText>
      </summary>
      <ul>
        <li>
          pH: {overallResult.ph.kind} <code>{fmt("pH", overallResult.ph.value, 2)}</code>
        </li>
        <li>
          Mash water volume: <code>{fmt("L", derivedMashWaterVolumeLiters, 2)}</code> {tUnits("L")}
        </li>
        <li>
          Final alkalinity{" "}
          {surfaceMath ? (() => {
            const ex = mathExplain["mash.finalAlkalinity"];
            const title = tMath(ex.titleKey);
            return (
              <MathHelpPopover
                title={title}
                body={buildWaterMathBody({
                  key: "mash.finalAlkalinity",
                  tMath,
                  locale,
                  ctx: { overallDerivation, acidDerivation },
                  units: {
                    L: tUnits("L"),
                    ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                    ppm: tUnits("ppm"),
                    LPerKg: tUnits("LPerKg"),
                  },
                })}
                ariaLabel={tMath("fxLabel", { topic: title })}
              />
            );
          })() : null}
          : <code>{fmt("ppm_as_CaCO3", overallResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
        </li>
      </ul>
      <WaterMashOverallIonsBlock model={model} />
    </details>
  );
}
