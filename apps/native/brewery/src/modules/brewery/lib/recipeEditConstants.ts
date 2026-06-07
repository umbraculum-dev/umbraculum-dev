import type { EditorGristRow, EditorHopRow, EditorYeastRow } from "@umbraculum/brewery-beerjson";

export const MALT_CLASS_OPTIONS: { value: EditorGristRow["maltClass"]; label: string }[] = [
  { value: "base", label: "Base" },
  { value: "crystal", label: "Crystal" },
  { value: "roast", label: "Roast" },
  { value: "acid", label: "Acid malt" },
];

export const HOP_USE_OPTIONS: { value: EditorHopRow["use"]; label: string }[] = [
  { value: "boil", label: "Boil" },
  { value: "whirlpool", label: "Whirlpool" },
  { value: "dryhop", label: "Dry hop" },
];

export const HOP_FORM_OPTIONS: { value: EditorHopRow["form"]; label: string }[] = [
  { value: "pellet", label: "Pellet" },
  { value: "leaf", label: "Leaf" },
  { value: "extract", label: "Extract" },
  { value: "powder", label: "Powder" },
  { value: "plug", label: "Plug" },
];

export const _YEAST_FORMAT_OPTIONS: { value: NonNullable<EditorYeastRow["format"]>; label: string }[] = [
  { value: "dry", label: "Dry" },
  { value: "liquid", label: "Liquid" },
  { value: "slurry", label: "Slurry" },
];
