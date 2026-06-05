export function buildE2EPaleAleBeerJson(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app-e2e",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [
              {
                id: "e2e-grain-1",
                name: "Pale Ale Malt",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.037 } },
                color: { unit: "Lovi", value: 3.0 },
                amount: { unit: "kg", value: 4.5 },
              },
              {
                id: "e2e-grain-2",
                name: "Crystal 60L",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.034 } },
                color: { unit: "Lovi", value: 60 },
                amount: { unit: "kg", value: 0.3 },
              },
            ],
            hop_additions: [
              {
                name: "Cascade",
                alpha_acid: { unit: "%", value: 5.5 },
                amount: { unit: "g", value: 30 },
                timing: { use: "add_to_boil", duration: { unit: "min", value: 60 } },
              },
              {
                name: "Centennial",
                alpha_acid: { unit: "%", value: 9.0 },
                amount: { unit: "g", value: 20 },
                timing: { use: "add_to_boil", duration: { unit: "min", value: 15 } },
              },
            ],
            culture_additions: [
              {
                name: "Safale US-05",
                type: "ale",
                form: "dry",
                amount: { unit: "g", value: 11 },
                attenuation: { unit: "%", value: 78 },
              },
            ],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}


