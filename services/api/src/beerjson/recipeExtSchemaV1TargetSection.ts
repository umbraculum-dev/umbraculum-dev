export const recipeExtSchemaV1TargetProperties = {
  batchSizeLiters: { type: "number", exclusiveMinimum: 0 },
  brewhouseEfficiencyPercent: { type: "number", minimum: 0, maximum: 100 },
  ogTarget: {
    type: "object",
    additionalProperties: false,
    properties: {
      sg: { type: "number", minimum: 0.9, maximum: 1.3 },
    },
    required: ["sg"],
  },
  fgTarget: {
    type: "object",
    additionalProperties: false,
    properties: {
      sg: { type: "number", minimum: 0.9, maximum: 1.3 },
    },
    required: ["sg"],
  },
  abvTarget: {
    type: "object",
    additionalProperties: false,
    properties: {
      percent: { type: "number", minimum: 0, maximum: 100 },
    },
    required: ["percent"],
  },
} as const;
