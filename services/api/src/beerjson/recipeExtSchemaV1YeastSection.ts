export const recipeExtSchemaV1YeastProperties = {
  yeastAttenuationOverridesPercent: {
    type: "object",
    additionalProperties: { type: "number", minimum: 0, maximum: 100 },
  },
  yeastAttenuationRange: {
    type: "object",
    additionalProperties: {
      type: "object",
      additionalProperties: false,
      properties: {
        min: { type: "number", minimum: 0, maximum: 100 },
        max: { type: "number", minimum: 0, maximum: 100 },
      },
      required: ["min", "max"],
    },
  },
  yeastPitchRateOverrides: {
    type: "object",
    additionalProperties: { type: "string", minLength: 1 },
  },
  yeastFermentationTempOverrides: {
    type: "object",
    additionalProperties: { type: "number", minimum: -10, maximum: 50 },
  },
  yeastOxygenationOverrides: {
    type: "object",
    additionalProperties: { type: "string", enum: ["yes", "no"] },
  },
  yeastDiacetylRestOverrides: {
    type: "object",
    additionalProperties: { type: "string", enum: ["yes", "no"] },
  },
  yeastFormatOverrides: {
    type: "object",
    additionalProperties: { type: "string", enum: ["dry", "liquid", "slurry"] },
  },
  yeastSpeciesOverrides: {
    type: "object",
    additionalProperties: {
      type: "string",
      enum: ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"],
    },
  },
  yeastNeedsPropagationOverrides: {
    type: "object",
    additionalProperties: { type: "string", enum: ["yes", "no"] },
  },
  yeastCellsPerLOverrides: {
    type: "object",
    additionalProperties: { type: "number", exclusiveMinimum: 0 },
  },
  yeastCellsPerKGOverrides: {
    type: "object",
    additionalProperties: { type: "number", exclusiveMinimum: 0 },
  },
  yeastManualCellCountOverrides: {
    type: "object",
    additionalProperties: {
      type: "object",
      additionalProperties: false,
      properties: {
        dilutionFactor: { type: "number", enum: [200, 2000] },
        aliveCells: { type: "number", exclusiveMinimum: 0 },
        totalCells: { type: "number", exclusiveMinimum: 0 },
      },
      required: ["dilutionFactor", "aliveCells", "totalCells"],
    },
  },
} as const;

export const recipeExtSchemaV1InternalProperties = {
  ingredientLinks: {
    type: "object",
    additionalProperties: false,
    properties: {
      grist: { type: "object", additionalProperties: { type: "string" } },
      hops: { type: "object", additionalProperties: { type: "string" } },
      yeast: { type: "object", additionalProperties: { type: "string" } },
      misc: { type: "object", additionalProperties: { type: "string" } },
    },
  },
  hopFormOverrides: {
    type: "object",
    additionalProperties: { type: "string", enum: ["debittered_leaf", "hop_extract"] },
  },
  mashPhModel: {
    type: "object",
    additionalProperties: {
      type: "object",
      additionalProperties: false,
      properties: {
        mashDiPh: { type: "number" },
        mashTaToPh57_mEqPerKg: { type: "number" },
        roastDehuskedOverride: { type: ["boolean", "null"] },
      },
    },
  },
  mashStepDeduceFromMashIn: {
    type: "object",
    additionalProperties: { type: "boolean" },
  },
  boilTimeMinutesOverride: { type: "number", minimum: 0, maximum: 600 },
} as const;
