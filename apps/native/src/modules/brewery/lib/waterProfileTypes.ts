export function isAdmin(role: string | null): boolean {
  return role === "brewery_admin" || role === "owner";
}

export type PickerOption = { value: string; label: string };

export type WaterProfileIonState = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export const ION_KEYS = [
  ["calcium", "Calcium (Ca)"],
  ["magnesium", "Magnesium (Mg)"],
  ["sodium", "Sodium (Na)"],
  ["sulfate", "Sulfate (SO4)"],
  ["chloride", "Chloride (Cl)"],
  ["bicarbonate", "Bicarbonate (HCO3)"],
] as const;

export const EMPTY_ION_STATE: WaterProfileIonState = {
  calcium: 0,
  magnesium: 0,
  sodium: 0,
  sulfate: 0,
  chloride: 0,
  bicarbonate: 0,
};
