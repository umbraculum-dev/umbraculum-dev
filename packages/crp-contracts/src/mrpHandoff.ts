import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema, QuantitySchema } from "./shared.js";

export const CrpScheduleableOperationSchema = z.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: z.string().min(1).nullable(),
  plannedDurationMinutes: z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: NonEmptyStringSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  preferredResourceId: z.string().min(1).nullable(),
  schedulingNotes: z.array(z.string().min(1)),
});

export const MrpHandoffBatchSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  sourceModule: z.literal("mrp"),
  operations: z.array(CrpScheduleableOperationSchema),
});

export const MrpHandoffBatchResponseSchema = z.object({
  ok: z.literal(true),
  item: MrpHandoffBatchSchema,
});

export type CrpScheduleableOperation = z.infer<typeof CrpScheduleableOperationSchema>;
export type MrpHandoffBatch = z.infer<typeof MrpHandoffBatchSchema>;
export type MrpHandoffBatchResponse = z.infer<typeof MrpHandoffBatchResponseSchema>;

export function parseCrpScheduleableOperation(payload: unknown): CrpScheduleableOperation {
  return CrpScheduleableOperationSchema.parse(payload);
}

export function parseMrpHandoffBatch(payload: unknown): MrpHandoffBatch {
  return MrpHandoffBatchSchema.parse(payload);
}

export function parseMrpHandoffBatchResponse(payload: unknown): MrpHandoffBatchResponse {
  return MrpHandoffBatchResponseSchema.parse(payload);
}
