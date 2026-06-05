export type RecipeListItem = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  version?: number;
};

export type StyleListItem = { key: string; name: string; code: string; sortOrder: number };
