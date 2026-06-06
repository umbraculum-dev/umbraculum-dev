import type { RecipeDrivenStepSeed } from "./brewSessionStepSeedingTypes.js";

export function buildRecipeMashScheduleSteps(
  steps: RecipeDrivenStepSeed[],
  mashScheduleSteps: { name: string; minutes: number }[],
): void {
  if (mashScheduleSteps.length > 0) {
    const mashBaseStepId = crypto.randomUUID();
    const totalMashMin = mashScheduleSteps.reduce((acc, s) => acc + s.minutes, 0);

    steps.push({
      id: mashBaseStepId,
      sectionId: "mash",
      sectionName: null,
      name: "Start mash",
      minutesPlanned: totalMashMin,
    });

    let startAtMin = 0;
    for (const st of mashScheduleSteps) {
      const offsetMinutesFromEnd = -(totalMashMin - startAtMin);
      steps.push({
        sectionId: "mash",
        sectionName: null,
        name: st.name,
        minutesPlanned: st.minutes,
        relativeToStepId: mashBaseStepId,
        offsetMinutesFromEnd,
      });
      startAtMin += st.minutes;
    }
  }
}
