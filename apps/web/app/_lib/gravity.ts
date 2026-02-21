/**
 * Gravity conversion utilities (SG ↔ Plato).
 * ASBC polynomial for SG → Plato.
 */

/**
 * Convert degrees Plato to specific gravity.
 * Formula: SG ≈ 1 + (°P / (258.6 - (°P/258.2)*227.1))
 *
 * @param plato - Degrees Plato (e.g. 12)
 * @returns Specific gravity, or null if plato is invalid or out of range
 */
export function platoToSg(plato: number): number | null {
  if (typeof plato !== "number" || !Number.isFinite(plato) || plato < 0 || plato > 100) return null;
  const denom = 258.6 - (plato / 258.2) * 227.1;
  if (!(denom > 0)) return null;
  const sg = 1 + plato / denom;
  return Number.isFinite(sg) && sg > 1 && sg < 2 ? sg : null;
}

/**
 * Convert specific gravity to degrees Plato using ASBC polynomial.
 * Formula: °P = 135.997×SG³ - 630.272×SG² + 1111.14×SG - 616.868
 *
 * @param sg - Specific gravity (e.g. 1.049)
 * @returns Degrees Plato, or null if sg is invalid or ≤ 1
 */
export function sgToPlato(sg: number): number | null {
  if (typeof sg !== "number" || !Number.isFinite(sg) || sg <= 1) return null;
  const p = 135.997 * sg ** 3 - 630.272 * sg ** 2 + 1111.14 * sg - 616.868;
  return Number.isFinite(p) && p >= 0 ? p : null;
}

/**
 * Format SG as "Plato/SG" (e.g. "12.2°P/1.049").
 * If SG is invalid or ≤ 1, returns "—".
 *
 * @param sg - Specific gravity
 * @param formatNum - Function to format numbers (e.g. (v, d) => formatFixed(locale, v, d))
 * @param sgDecimals - Decimal places for SG (default 3)
 * @param platoDecimals - Decimal places for Plato (default 1)
 */
export function formatSgWithPlato(
  sg: number | null | undefined,
  formatNum: (value: number, decimals: number) => string,
  sgDecimals = 3,
  platoDecimals = 1,
): string {
  if (sg == null || typeof sg !== "number" || !Number.isFinite(sg) || sg <= 1) {
    return "—";
  }
  const plato = sgToPlato(sg);
  const sgStr = formatNum(sg, sgDecimals);
  if (plato == null) {
    return sgStr;
  }
  const platoStr = formatNum(plato, platoDecimals);
  return `${platoStr}°P/${sgStr}`;
}
