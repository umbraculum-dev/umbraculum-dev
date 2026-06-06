export type MathExplainKey =
  | "sparge.acidRequired"
  | "sparge.finalAlkalinity"
  | "sparge.ionsAfterSalts"
  | "sparge.ionsAfterSaltsAndAcid"
  | "sparge.alkalinityHeuristic"
  | "mash.acidRequired"
  | "mash.finalAlkalinity"
  | "mash.ionsAfterSalts"
  | "mash.overallSnapshot"
  | "boil.ionsAfterSalts"
  | "boil.overallSnapshot"
  | "waterHub.mergedWaterRecap"
  | "waterHub.mergedIons";

export type MathExplainEntry = {
  titleKey: string;
  bodyKey: string;
};

export const mathExplain: Record<MathExplainKey, MathExplainEntry> = {
  "sparge.acidRequired": {
    titleKey: "sparge.acidRequired.title",
    bodyKey: "sparge.acidRequired.body",
  },
  "sparge.finalAlkalinity": {
    titleKey: "sparge.finalAlkalinity.title",
    bodyKey: "sparge.finalAlkalinity.body",
  },
  "sparge.ionsAfterSalts": {
    titleKey: "sparge.ionsAfterSalts.title",
    bodyKey: "sparge.ionsAfterSalts.body",
  },
  "sparge.ionsAfterSaltsAndAcid": {
    titleKey: "sparge.ionsAfterSaltsAndAcid.title",
    bodyKey: "sparge.ionsAfterSaltsAndAcid.body",
  },
  "sparge.alkalinityHeuristic": {
    titleKey: "sparge.alkalinityHeuristic.title",
    bodyKey: "sparge.alkalinityHeuristic.body",
  },
  "mash.acidRequired": {
    titleKey: "mash.acidRequired.title",
    bodyKey: "mash.acidRequired.body",
  },
  "mash.finalAlkalinity": {
    titleKey: "mash.finalAlkalinity.title",
    bodyKey: "mash.finalAlkalinity.body",
  },
  "mash.ionsAfterSalts": {
    titleKey: "mash.ionsAfterSalts.title",
    bodyKey: "mash.ionsAfterSalts.body",
  },
  "mash.overallSnapshot": {
    titleKey: "mash.overallSnapshot.title",
    bodyKey: "mash.overallSnapshot.body",
  },
  "boil.ionsAfterSalts": {
    titleKey: "boil.ionsAfterSalts.title",
    bodyKey: "boil.ionsAfterSalts.body",
  },
  "boil.overallSnapshot": {
    titleKey: "boil.overallSnapshot.title",
    bodyKey: "boil.overallSnapshot.body",
  },
  "waterHub.mergedWaterRecap": {
    titleKey: "waterHub.mergedWaterRecap.title",
    bodyKey: "waterHub.mergedWaterRecap.body",
  },
  "waterHub.mergedIons": {
    titleKey: "waterHub.mergedIons.title",
    bodyKey: "waterHub.mergedIons.body",
  },
};

