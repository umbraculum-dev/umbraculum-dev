export function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatWithHint(
  locale: string,
  value: unknown,
  formatHints: Record<string, { decimals?: number }> | undefined,
  unitKey: string,
  fallbackDecimals: number
): string {
  const decimals =
    formatHints?.[unitKey]?.decimals != null && Number.isFinite(formatHints[unitKey].decimals)
      ? formatHints[unitKey].decimals
      : fallbackDecimals;
  return typeof value === "number" && Number.isFinite(value) ? formatFixed(locale, value, decimals) : "—";
}

export type DisplayStream = {
  key: "mash" | "sparge" | "boil";
  label: string;
  volumeLiters: number | null;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  saltsAddedLabel: string | null;
  acidType: string | null;
  acidAmountLabel: string | null;
};

export function formatSaltKeyLabel(saltKey: string, tsalts: (k: string) => string): string {
  switch (saltKey) {
    case "gypsum":
      return tsalts("gypsum");
    case "calcium_chloride":
      return tsalts("calciumChloride");
    case "epsom":
      return tsalts("epsom");
    case "table_salt":
      return tsalts("tableSalt");
    case "baking_soda":
      return tsalts("bakingSoda");
    default:
      return saltKey;
  }
}
