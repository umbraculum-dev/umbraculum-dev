import { isObject } from "../../lib/typeGuards.js";

import { asArray, toNumber } from "./beerxmlParse.js";
import type { BeerXmlRecipe, XmlNode } from "./beerxmlTypes.js";

export function normMashStepType(typeRaw: string | null): "infusion" | "temperature" | "decoction" {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("infusion")) return "infusion";
  if (t.includes("decoction")) return "decoction";
  return "temperature";
}

export function parseBeerXmlMash(
  recipe: BeerXmlRecipe,
): {
  name: string;
  grain_temperature: { unit: "C"; value: number };
  mash_steps: Record<string, unknown>[];
} | null {
  const mash = isObject(recipe["MASH"]) ? recipe["MASH"] : null;
  if (!mash) return null;

  const name = typeof mash["NAME"] === "string" ? mash["NAME"].trim() : "Imported Mash";
  const grainTempC = toNumber(mash["GRAIN_TEMP"]);
  if (grainTempC == null || !Number.isFinite(grainTempC)) return null;

  const mashStepsContainer = isObject(mash["MASH_STEPS"]) ? mash["MASH_STEPS"] : null;
  const stepsRaw = mashStepsContainer?.["MASH_STEP"] ?? null;
  const stepsArr = asArray<unknown>(stepsRaw).filter((s): s is XmlNode => isObject(s));
  if (stepsArr.length === 0) return null;

  const mashSteps = stepsArr
    .map((s) => {
      const stepName = typeof s["NAME"] === "string" ? s["NAME"].trim() : "";
      const stepTempC = toNumber(s["STEP_TEMP"]);
      const stepTimeMin = toNumber(s["STEP_TIME"]);
      if (!stepName || stepTempC == null || stepTimeMin == null) return null;

      const type = normMashStepType(typeof s["TYPE"] === "string" ? s["TYPE"] : null);
      const step: Record<string, unknown> = {
        name: stepName,
        type,
        step_temperature: { unit: "C" as const, value: stepTempC },
        step_time: { unit: "min" as const, value: Math.max(0, stepTimeMin) },
      };

      const rampTime = toNumber(s["RAMP_TIME"]);
      if (rampTime != null && rampTime >= 0) {
        step["ramp_time"] = { unit: "min" as const, value: rampTime };
      }

      const endTemp = toNumber(s["END_TEMP"]);
      if (endTemp != null && Number.isFinite(endTemp)) {
        step["end_temperature"] = { unit: "C" as const, value: endTemp };
      }

      if (type === "infusion") {
        const infuseAmount = toNumber(s["INFUSE_AMOUNT"]);
        if (infuseAmount != null && infuseAmount >= 0) {
          step["amount"] = { unit: "l" as const, value: infuseAmount };
        }
        const infuseTemp = toNumber(s["INFUSE_TEMP"]);
        if (infuseTemp != null && Number.isFinite(infuseTemp)) {
          step["infuse_temperature"] = { unit: "C" as const, value: infuseTemp };
        }
      }

      const description = typeof s["DESCRIPTION"] === "string" ? s["DESCRIPTION"].trim() : null;
      if (description) {
        step["description"] = description;
      }

      return step;
    })
    .filter((s): s is Record<string, unknown> => s != null);

  if (mashSteps.length === 0) return null;

  return {
    name,
    grain_temperature: { unit: "C" as const, value: grainTempC },
    mash_steps: mashSteps,
  };
}
