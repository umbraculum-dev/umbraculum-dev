export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatPercent(p: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(p);
}
