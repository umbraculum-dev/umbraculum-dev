export type EquipmentProfile = {
  id: string;
  name: string;
  equipment: {
    kettle: {
      kettleLossesLiters: number | null;
      kettleBoilEvaporationRatePercentPerHour: number | null;
      kettleCoolingShrinkagePercent: number | null;
      kettleVolumeLiters: number | null;
      kettleHopsAbsorptionLiters: number | null;
    };
    mash: {
      mashLossesLiters: number | null;
      mashThicknessLPerKg: number | null;
      mashGrainAbsorptionLPerKg: number | null;
      mashWaterLeftoverLiters: number | null;
      mashVolumeLiters: number | null;
      mashEfficiencyPercent: number | null;
    };
    misc: {
      otherLossesLiters: number | null;
    };
  };
};
