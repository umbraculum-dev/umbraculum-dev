import { z } from "zod";
import type { DocumentTemplate } from "@umbraculum/module-sdk";

export const BREWERY_BEERJSON_EXPORT_TEMPLATE_REF = "brewery:beerjson-export@v1";

export const BeerJsonExportDocumentSchema = z
  .object({
    beerjson: z.unknown(),
  })
  .passthrough();

export const breweryDocumentTemplates: readonly DocumentTemplate<unknown>[] = [
  {
    kind: "json",
    ref: BREWERY_BEERJSON_EXPORT_TEMPLATE_REF,
    schema: BeerJsonExportDocumentSchema,
    maxSyncBytes: 2 * 1024 * 1024,
    async render(data) {
      const document = BeerJsonExportDocumentSchema.parse(data);
      return Promise.resolve(new TextEncoder().encode(JSON.stringify(document)));
    },
  },
];
