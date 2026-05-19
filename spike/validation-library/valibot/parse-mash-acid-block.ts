/**
 * Valibot equivalent of `parseMashAcidBlock` in
 * packages/contracts/src/water/parseComputeAndSave.ts lines 207-235.
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15
 * — comparison axis to the Zod v4 implementation in
 * spike/validation-library/zod/parse-mash-acid-block.ts.
 */
import {
  array,
  enum_,
  literal,
  nullable,
  number,
  object,
  optional,
  record,
  string,
  unknown,
  variant,
  type InferOutput,
} from "valibot";

const IonProfilePpmSchema = object({
  calcium: number(),
  magnesium: number(),
  sodium: number(),
  sulfate: number(),
  chloride: number(),
  bicarbonate: number(),
});

const NumberOrNullSchema = nullable(number());

const WaterAcidificationResultSchema = object({
  acidRequiredMl: NumberOrNullSchema,
  acidRequiredTsp: NumberOrNullSchema,
  acidRequiredGrams: NumberOrNullSchema,
  acidRequiredKg: NumberOrNullSchema,
  finalAlkalinityPpmCaCO3: number(),
  sulfateAddedPpm: number(),
  chlorideAddedPpm: number(),
  debug: optional(record(string(), unknown())),
});

const WaterAcidificationManualResultSchema = object({
  achievedPh: number(),
  predicted: WaterAcidificationResultSchema,
  clamped: enum_({ none: "none", low: "low", high: "high" }),
  iterations: number(),
  targetAmount: number(),
  predictedAmount: number(),
});

// Valibot has no .extend(); we re-spell the result object inline. Less
// DRY than Zod's .extend(), but tree-shake-friendly (each field
// referenced once).
const MashAcidificationTargetMashPhResultSchema = object({
  acidRequiredMl: NumberOrNullSchema,
  acidRequiredTsp: NumberOrNullSchema,
  acidRequiredGrams: NumberOrNullSchema,
  acidRequiredKg: NumberOrNullSchema,
  finalAlkalinityPpmCaCO3: number(),
  sulfateAddedPpm: number(),
  chlorideAddedPpm: number(),
  debug: optional(record(string(), unknown())),
  estimatedMashPhRoomTemp: number(),
});

const WaterCalcDerivationSchema = object({
  kind: string(),
  version: literal(1),
  formulaId: string(),
  inputs: array(unknown()),
  intermediates: array(unknown()),
});
void IonProfilePpmSchema;

export const MashAcidComputeBlockSchema = variant("kind", [
  object({
    kind: literal("mash_acidification_manual"),
    mode: literal("manual"),
    result: WaterAcidificationManualResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
  object({
    kind: literal("mash_acidification_target_mash_ph"),
    mode: literal("targetPh"),
    result: MashAcidificationTargetMashPhResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
  object({
    kind: literal("mash_acidification"),
    mode: literal("targetPh"),
    result: WaterAcidificationResultSchema,
    derivation: WaterCalcDerivationSchema,
  }),
]);

export type MashAcidComputeBlock = InferOutput<typeof MashAcidComputeBlockSchema>;
