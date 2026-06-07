const LB_TO_KG = 0.453_592_37;
const OZ_TO_KG = 0.028_349_523_125;

const US_GAL_TO_L = 3.785_411_784;
const US_QT_TO_L = US_GAL_TO_L / 4;
const US_PT_TO_L = US_GAL_TO_L / 8;
const US_FL_OZ_TO_L = US_GAL_TO_L / 128;

export function isMassUnitV1(unit) {
  return unit === "kg" || unit === "g" || unit === "lb" || unit === "oz";
}

export function isVolumeUnitV1(unit) {
  return unit === "l" || unit === "ml" || unit === "gal" || unit === "qt" || unit === "pt" || unit === "fl_oz";
}

export function massToKg(value, unit) {
  if (!(typeof value === "number" && Number.isFinite(value))) return null;
  if (unit === "kg") return value;
  if (unit === "g") return value / 1000;
  if (unit === "lb") return value * LB_TO_KG;
  if (unit === "oz") return value * OZ_TO_KG;
  return null;
}

export function massToGrams(value, unit) {
  const kg = massToKg(value, unit);
  return kg === null ? null : kg * 1000;
}

export function volumeToLiters(value, unit) {
  if (!(typeof value === "number" && Number.isFinite(value))) return null;
  if (unit === "l") return value;
  if (unit === "ml") return value / 1000;
  if (unit === "gal") return value * US_GAL_TO_L;
  if (unit === "qt") return value * US_QT_TO_L;
  if (unit === "pt") return value * US_PT_TO_L;
  if (unit === "fl_oz") return value * US_FL_OZ_TO_L;
  return null;
}

export function litersToUsGallons(liters) {
  return liters / US_GAL_TO_L;
}

export function kgToLb(kg) {
  return kg / LB_TO_KG;
}

