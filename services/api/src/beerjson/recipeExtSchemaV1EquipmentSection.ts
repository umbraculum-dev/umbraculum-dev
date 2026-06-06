export const recipeExtSchemaV1EquipmentProperties = {
  equipment: {
    type: "object",
    additionalProperties: false,
    properties: {
      kettle: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          kettleVolumeLiters: { type: "number", exclusiveMinimum: 0 },
          kettleLossesLiters: { type: "number", minimum: 0 },
          kettleBoilEvaporationRatePercentPerHour: { type: "number", minimum: 0, maximum: 100 },
          kettleCoolingShrinkagePercent: { type: "number", minimum: 0, maximum: 100 },
          kettleHopsAbsorptionLiters: { type: "number", minimum: 0 },
        },
      },
      mash: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          mashVolumeLiters: { type: "number", minimum: 0 },
          mashEfficiencyPercent: { type: "number", minimum: 0, maximum: 100 },
          mashLossesLiters: { type: "number", minimum: 0 },
          mashThicknessLPerKg: { type: "number", minimum: 0 },
          mashGrainAbsorptionLPerKg: { type: "number", minimum: 0 },
          mashWaterLeftoverLiters: { type: "number", minimum: 0 },
        },
      },
      misc: {
        type: "object",
        additionalProperties: false,
        properties: {
          otherLossesLiters: { type: "number", minimum: 0 },
        },
      },
    },
  },
  equipmentSource: {
    type: "object",
    additionalProperties: false,
    properties: {
      equipmentProfileId: { type: "string", minLength: 1 },
      copiedAt: { type: "string", minLength: 1 },
    },
    required: ["equipmentProfileId", "copiedAt"],
  },
} as const;
