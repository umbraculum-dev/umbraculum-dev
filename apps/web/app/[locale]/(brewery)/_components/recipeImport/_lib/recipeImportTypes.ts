export const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
export const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

export type ImportFormat = "beerjson" | "beerxml";

export type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

export type ImportWarning = { code?: unknown; message?: unknown };

export type BulkPreviewItem = {
  index?: number;
  name?: string;
  resolvedStyleCode?: string;
  resolvedStyleName?: string;
  warnings?: ImportWarning[];
};

export type BulkCreatedItem = {
  recipeId: string;
  name?: string;
  style?: string;
};

export type BulkFailedItem = {
  index?: number;
  name?: string;
  error?: string;
};

export type RecipeImportPreview = {
  name: string;
  notes: string | null;
  warnings: ImportWarning[];
};

export type RecipeImportBulkResult = {
  created: BulkCreatedItem[];
  failed: BulkFailedItem[];
};

export function apiErrorMessage(resData: unknown): string {
  const errData = resData as { error?: { code?: string; message?: string } } | undefined;
  return (
    errData?.error?.message ??
    (typeof resData === "string" ? resData : JSON.stringify(resData))
  );
}

export const BREWERY_RECIPES_API_BASE = "/api/recipes";

export function isFileTooLargeError(msg: string | null): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return lower.includes("file too large") || lower.includes("file troppo grande");
}

export interface RecipeImportFormProps {
  apiBasePath: string;
  workspaceId?: string | null;
  accountId?: string | null;
  canCall: boolean;
  onSingleImportSuccess?: (recipeId: string) => void;
  showImportExportPanel?: boolean;
}
