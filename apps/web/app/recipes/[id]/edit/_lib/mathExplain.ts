export const mathExplain = {
  "analysis.abv": { titleKey: "analysis.abv.title" },
  "analysis.ibuTinseth": { titleKey: "analysis.ibuTinseth.title" },
  "analysis.ibuRager": { titleKey: "analysis.ibuRager.title" },
  "analysis.srmMorey": { titleKey: "analysis.srmMorey.title" },
  "analysis.srmDaniels": { titleKey: "analysis.srmDaniels.title" },
  "analysis.kettleVolume": { titleKey: "analysis.kettleVolume.title" },
  "analysis.preBoilVolume": { titleKey: "analysis.preBoilVolume.title" },
  "analysis.og": { titleKey: "analysis.og.title" },
  "analysis.fg": { titleKey: "analysis.fg.title" },
  "analysis.attenuation": { titleKey: "analysis.attenuation.title" },
  "analysis.pbg": { titleKey: "analysis.pbg.title" },
} as const;

export type MathExplainKey = keyof typeof mathExplain;

