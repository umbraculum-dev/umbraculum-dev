import type {
  BeerXmlGristRow,
  BeerXmlHopRow,
  BeerXmlMiscRow,
} from "./beerxmlTypes.js";

export function normUseHop(useRaw: string | null): BeerXmlHopRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("dry")) return "dryhop";
  if (u.includes("whirlpool") || u.includes("flame")) return "whirlpool";
  return "boil";
}

export function normMaltClass(typeRaw: string | null): BeerXmlGristRow["maltClass"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("crystal") || t.includes("caramel")) return "crystal";
  if (t.includes("roast") || t.includes("black") || t.includes("chocolate")) return "roast";
  if (t.includes("acid")) return "acid";
  return "base";
}

export function normMiscType(typeRaw: string | null): BeerXmlMiscRow["type"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("fin")) return "fining";
  if (t.includes("water")) return "water_agent";
  if (t.includes("herb")) return "herb";
  if (t.includes("flavor")) return "flavor";
  if (t.includes("spice")) return "spice";
  return "other";
}

export function normMiscUse(useRaw: string | null): BeerXmlMiscRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("mash")) return "mash";
  if (u.includes("primary")) return "primary";
  if (u.includes("secondary")) return "secondary";
  if (u.includes("bott")) return "bottling";
  return "boil";
}

export function toTiming(use: string, timeMinutes: number | null) {
  const useMap: Record<
    string,
    "add_to_mash" | "add_to_boil" | "add_to_fermentation" | "add_to_package"
  > = {
    mash: "add_to_mash",
    boil: "add_to_boil",
    whirlpool: "add_to_boil",
    dryhop: "add_to_fermentation",
    primary: "add_to_fermentation",
    secondary: "add_to_fermentation",
    bottling: "add_to_package",
  };

  const timing: Record<string, unknown> = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing["duration"] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

export function gristPotentialToBeerJsonYield(p: BeerXmlGristRow["potential"]) {
  if (!p) return { fine_grind: { unit: "%", value: 0 } };
  if (p.kind === "yieldPercent") return { fine_grind: { unit: "%", value: p.value } };
  if (p.kind === "sg") return { potential: { unit: "sg", value: p.value } };
  return { potential: { unit: "sg", value: 1 + p.value / 1000 } };
}

export function maltClassToGrainGroup(maltClass: BeerXmlGristRow["maltClass"]) {
  switch (maltClass) {
    case "base":
      return "base";
    case "crystal":
      return "caramel";
    case "roast":
      return "roasted";
    case "acid":
      return "specialty";
    default:
      return "base";
  }
}

export function miscTypeToBeerJsonType(t: BeerXmlMiscRow["type"]) {
  if (t === "water_agent") return "water agent";
  return t;
}
