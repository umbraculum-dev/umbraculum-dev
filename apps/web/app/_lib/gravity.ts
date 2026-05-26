/**
 * Gravity conversion utilities (SG ↔ Plato).
 * Re-exports from @umbraculum/brewery-core; formatSgWithPlato is web-specific.
 */

import { platoToSg, sgToPlato } from "@umbraculum/brewery-core";

export { platoToSg, sgToPlato };

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
