import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidType,
} from "../domain/waterCalc/spargeAcidification.js";

export async function waterCalcRoutes(app: FastifyInstance) {
  app.post("/water-calc/sparge-acidification", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body.acidType as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body.strengthKind === "string" ? body.strengthKind : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body.strengthValue === "number" ? body.strengthValue : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind as any, value: strengthValue } as AcidStrength;
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body.startingAlkalinityPpmCaCO3 === "number" ? body.startingAlkalinityPpmCaCO3 : 0;
    const startingPh = typeof body.startingPh === "number" ? body.startingPh : 7.0;
    const targetPh = typeof body.targetPh === "number" ? body.targetPh : 5.6;
    const volumeLiters = typeof body.volumeLiters === "number" ? body.volumeLiters : 1.0;

    const result = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strength,
    });

    return { ok: true, result };
  });
}

