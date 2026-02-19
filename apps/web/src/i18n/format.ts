export function formatNumber(
  locale: string,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return formatNumber(locale, value, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatWithHint(
  locale: string,
  value: unknown,
  formatHints: Record<string, { decimals?: number }> | undefined,
  unitKey: string,
  fallbackDecimals: number,
): string {
  const decimals =
    formatHints?.[unitKey] && typeof formatHints[unitKey].decimals === "number" && Number.isFinite(formatHints[unitKey].decimals)
      ? formatHints[unitKey].decimals!
      : fallbackDecimals;
  return typeof value === "number" && Number.isFinite(value) ? formatFixed(locale, value, decimals) : "—";
}

