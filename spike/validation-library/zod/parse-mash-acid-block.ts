/**
 * Zod v4 equivalent of `parseMashAcidBlock` in
 * packages/contracts/src/water/parseComputeAndSave.ts lines 207-235,
 * plus the shared parsers it depends on
 * (parseAcidificationManualResult, parseMashTargetMashPhResult,
 * parseAcidificationResult, parseDerivation).
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15.
 */
import { z } from "zod";

const IonProfilePpmSchema = z.object({
  calcium: z.number(),
  magnesium: z.number(),
  sodium: z.number(),
  sulfate: z.number(),
  chloride: z.number(),
  bicarbonate: z.number(),
});

const NumberOrNullSchema = z.number().nullable();

const WaterAcidificationResultSchema = z.object({
  acidRequiredMl: NumberOrNullSchema,
  acidRequiredTsp: NumberOrNullSchema,
  acidRequiredGrams: NumberOrNullSchema,
  acidRequiredKg: NumberOrNullSchema,
  finalAlkalinityPpmCaCO3: z.number(),
  sulfateAddedPpm: z.number(),
  chlorideAddedPpm: z.number(),
  debug: z.record(z.string(), z.unknown()).optional(),
});

const WaterAcidificationManualResultSchema = z.object({
  achievedPh: z.number(),
  predicted: WaterAcidificationResultSchema,
  clamped: z.enum(["none", "low", "high"]),
  iterations: z.number(),
  targetAmount: z.number(),
  predictedAmount: z.number(),
});

const MashAcidificationTargetMashPhResultSchema =
  WaterAcidificationResultSchema.extend({
    estimatedMashPhRoomTemp: z.number(),
  });

// Minimal placeholder for the spike — real WaterCalcDerivation is richer
// but the discriminated-union ergonomic comparison does not depend on its
// shape.
const WaterCalcDerivationSchema = z.object({
  kind: z.string(),
  version: z.literal(1),
  formulaId: z.string(),
  inputs: z.array(z.unknown()),
  intermediates: z.array(z.unknown()),
});

export const MashAcidComputeBlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mash_acidification_manual"),
    mode: z.literal("manual"),
    result: WaterAcidificationManualResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
  z.object({
    kind: z.literal("mash_acidification_target_mash_ph"),
    mode: z.literal("targetPh"),
    result: MashAcidificationTargetMashPhResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
  z.object({
    kind: z.literal("mash_acidification"),
    mode: z.literal("targetPh"),
    result: WaterAcidificationResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
]);

export type MashAcidComputeBlock = z.infer<typeof MashAcidComputeBlockSchema>;
