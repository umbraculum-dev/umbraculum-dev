export type MassUnitV1 = "kg" | "g" | "lb" | "oz";
export type VolumeUnitV1 = "l" | "ml" | "gal" | "qt" | "pt" | "fl_oz";

export interface UnitConversionWarningV1 {
  code: "unit_normalized" | "unsupported_unit";
  path: string;
  fromUnit: string;
  toUnit: string;
}

export function isMassUnitV1(unit: string): unit is MassUnitV1;
export function isVolumeUnitV1(unit: string): unit is VolumeUnitV1;

export function massToKg(value: number, unit: MassUnitV1): number | null;
export function massToGrams(value: number, unit: MassUnitV1): number | null;
export function volumeToLiters(value: number, unit: VolumeUnitV1): number | null;

export function litersToUsGallons(liters: number): number;
export function kgToLb(kg: number): number;

export function roundTo(value: number, decimals: number): number;

export function platoToSg(plato: number): number | null;
export function sgToPlato(sg: number): number | null;

