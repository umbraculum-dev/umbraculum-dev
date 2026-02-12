export type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number; // SO4 ppm
  chloride: number; // Cl ppm
  bicarbonate: number; // HCO3 ppm
};

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";

export type SaltAddition = { saltKey: SaltKey; grams: number };

type SaltDefinition = {
  key: SaltKey;
  displayName: string;
  molarMass_gPerMol: number;
  // per mole of salt, how many moles of the ion group are contributed
  stoich: Partial<Record<keyof IonProfilePpm, number>>;
};

// Atomic / group molar masses (g/mol)
const MASS = {
  Ca: 40.078,
  Mg: 24.305,
  Na: 22.99,
  Cl: 35.45,
  SO4: 32.065 + 4 * 15.999, // 96.061
  HCO3: 1.008 + 12.011 + 3 * 15.999, // 61.016
  H2O: 2 * 1.008 + 15.999, // 18.015
};

const SALTS: Record<SaltKey, SaltDefinition> = {
  gypsum: {
    key: "gypsum",
    displayName: "Gypsum (CaSO4·2H2O)",
    molarMass_gPerMol: MASS.Ca + MASS.SO4 + 2 * MASS.H2O, // ~172.17
    stoich: { calcium: 1, sulfate: 1 },
  },
  calcium_chloride: {
    key: "calcium_chloride",
    displayName: "Calcium chloride (CaCl2·2H2O)",
    molarMass_gPerMol: MASS.Ca + 2 * MASS.Cl + 2 * MASS.H2O, // ~147.01
    stoich: { calcium: 1, chloride: 2 },
  },
  epsom: {
    key: "epsom",
    displayName: "Epsom (MgSO4·7H2O)",
    molarMass_gPerMol: MASS.Mg + MASS.SO4 + 7 * MASS.H2O, // ~246.47
    stoich: { magnesium: 1, sulfate: 1 },
  },
  table_salt: {
    key: "table_salt",
    displayName: "Table salt (NaCl)",
    molarMass_gPerMol: MASS.Na + MASS.Cl, // ~58.44
    stoich: { sodium: 1, chloride: 1 },
  },
  baking_soda: {
    key: "baking_soda",
    displayName: "Baking soda (NaHCO3)",
    molarMass_gPerMol: MASS.Na + MASS.HCO3, // ~84.01
    stoich: { sodium: 1, bicarbonate: 1 },
  },
};

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

function ionMass_gPerMol(ion: keyof IonProfilePpm) {
  switch (ion) {
    case "calcium":
      return MASS.Ca;
    case "magnesium":
      return MASS.Mg;
    case "sodium":
      return MASS.Na;
    case "chloride":
      return MASS.Cl;
    case "sulfate":
      return MASS.SO4;
    case "bicarbonate":
      return MASS.HCO3;
  }
}

export type SaltAdditionsResult = {
  baseProfile: IonProfilePpm;
  resultingProfile: IonProfilePpm;
  deltasPpm: IonProfilePpm;
  breakdown: Array<{
    saltKey: SaltKey;
    grams: number;
    deltasPpm: Partial<IonProfilePpm>;
  }>;
};

export function applySaltAdditions(baseProfile: IonProfilePpm, volumeLiters: number, additions: SaltAddition[]) {
  assertFinite(volumeLiters, "volumeLiters");
  if (!(volumeLiters > 0)) throw new Error("volumeLiters must be > 0");

  for (const [k, v] of Object.entries(baseProfile)) {
    assertFinite(v as number, `baseProfile.${k}`);
  }

  const baseMgTotal: IonProfilePpm = {
    calcium: baseProfile.calcium * volumeLiters,
    magnesium: baseProfile.magnesium * volumeLiters,
    sodium: baseProfile.sodium * volumeLiters,
    sulfate: baseProfile.sulfate * volumeLiters,
    chloride: baseProfile.chloride * volumeLiters,
    bicarbonate: baseProfile.bicarbonate * volumeLiters,
  };

  const breakdown: SaltAdditionsResult["breakdown"] = [];
  const addMgTotal: IonProfilePpm = {
    calcium: 0,
    magnesium: 0,
    sodium: 0,
    sulfate: 0,
    chloride: 0,
    bicarbonate: 0,
  };

  for (const a of additions) {
    if (!a || typeof a.saltKey !== "string") throw new Error("Invalid salt addition");
    const salt = SALTS[a.saltKey as SaltKey];
    if (!salt) throw new Error(`Unknown saltKey: ${String(a.saltKey)}`);
    if (typeof a.grams !== "number" || !Number.isFinite(a.grams) || a.grams < 0) {
      throw new Error(`Invalid grams for ${salt.key}`);
    }

    const mol = a.grams / salt.molarMass_gPerMol;
    const saltDeltaMg: Partial<IonProfilePpm> = {};

    (Object.keys(salt.stoich) as Array<keyof IonProfilePpm>).forEach((ion) => {
      const sto = salt.stoich[ion];
      if (!sto) return;
      const gIon = mol * sto * ionMass_gPerMol(ion);
      const mgIon = gIon * 1000;
      addMgTotal[ion] += mgIon;
      saltDeltaMg[ion] = (saltDeltaMg[ion] ?? 0) + mgIon / volumeLiters;
    });

    breakdown.push({ saltKey: salt.key, grams: a.grams, deltasPpm: saltDeltaMg });
  }

  const resultingMgTotal: IonProfilePpm = {
    calcium: baseMgTotal.calcium + addMgTotal.calcium,
    magnesium: baseMgTotal.magnesium + addMgTotal.magnesium,
    sodium: baseMgTotal.sodium + addMgTotal.sodium,
    sulfate: baseMgTotal.sulfate + addMgTotal.sulfate,
    chloride: baseMgTotal.chloride + addMgTotal.chloride,
    bicarbonate: baseMgTotal.bicarbonate + addMgTotal.bicarbonate,
  };

  const resultingProfile: IonProfilePpm = {
    calcium: resultingMgTotal.calcium / volumeLiters,
    magnesium: resultingMgTotal.magnesium / volumeLiters,
    sodium: resultingMgTotal.sodium / volumeLiters,
    sulfate: resultingMgTotal.sulfate / volumeLiters,
    chloride: resultingMgTotal.chloride / volumeLiters,
    bicarbonate: resultingMgTotal.bicarbonate / volumeLiters,
  };

  const deltasPpm: IonProfilePpm = {
    calcium: resultingProfile.calcium - baseProfile.calcium,
    magnesium: resultingProfile.magnesium - baseProfile.magnesium,
    sodium: resultingProfile.sodium - baseProfile.sodium,
    sulfate: resultingProfile.sulfate - baseProfile.sulfate,
    chloride: resultingProfile.chloride - baseProfile.chloride,
    bicarbonate: resultingProfile.bicarbonate - baseProfile.bicarbonate,
  };

  const result: SaltAdditionsResult = {
    baseProfile,
    resultingProfile,
    deltasPpm,
    breakdown,
  };
  return result;
}

