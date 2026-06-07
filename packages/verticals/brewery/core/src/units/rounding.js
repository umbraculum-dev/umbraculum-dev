export function roundTo(value, decimals) {
  if (!(typeof value === "number" && Number.isFinite(value))) return NaN;
  const d = typeof decimals === "number" && Number.isFinite(decimals) ? Math.max(0, Math.round(decimals)) : 0;
  const factor = 10 ** d;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

