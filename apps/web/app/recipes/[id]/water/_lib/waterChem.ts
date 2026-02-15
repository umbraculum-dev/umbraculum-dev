export type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number) {
  // Convert mg/L as HCO3 to mg/L as CaCO3.
  // CaCO3 equivalent factor: 50/61.
  return bicarbPpm * (50 / 61);
}

