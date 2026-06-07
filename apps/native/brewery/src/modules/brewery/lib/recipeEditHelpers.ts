import type { EditorGristRow } from "@umbraculum/brewery-beerjson";

export function newRowId(): string {
  try {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    return g.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}
export function roundTo(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function inferMaltClass(
  group: string | null | undefined,
  fermentableName: string
): EditorGristRow["maltClass"] {
  const g = (group ?? "").toLowerCase();
  const n = (fermentableName ?? "").toLowerCase();
  if (g.includes("caramel") || g.includes("crystal")) return "crystal";
  if (g.includes("roast") || g.includes("roasted")) return "roast";
  if (n.includes("acid")) return "acid";
  return "base";
}
