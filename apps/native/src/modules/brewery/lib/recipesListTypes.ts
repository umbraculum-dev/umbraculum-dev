export type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

export function buildMinimalBeerJson(name: string): unknown {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [],
            hop_additions: [],
            culture_additions: [],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}
