import { z } from "zod";

import { IsoDateTimeStringSchema } from "./shared.js";

export const CategorySchema = z.object({
  id: z.string().min(1, "id required"),
  workspaceId: z.string().min(1, "workspaceId required"),
  code: z.string().min(1, "code required"),
  label: z.string().min(1, "label required"),
  parentId: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const CategoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = z.lazy(() =>
  CategorySchema.extend({
    children: z.array(CategoryTreeNodeSchema),
  }),
);

export interface CategoryTreeNode extends z.infer<typeof CategorySchema> {
  readonly children: readonly CategoryTreeNode[];
}

export const CategoryListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(CategorySchema),
  tree: z.array(CategoryTreeNodeSchema),
});

export const CategoryGetResponseSchema = z.object({
  ok: z.literal(true),
  item: CategorySchema,
});

export type Category = z.infer<typeof CategorySchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
export type CategoryGetResponse = z.infer<typeof CategoryGetResponseSchema>;
