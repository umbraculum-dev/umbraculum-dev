import { z } from "zod";

import {
  IsoDateTimeStringSchema,
  NonEmptyStringSchema,
  QuantitySchema,
  UnitCodeSchema,
} from "./shared.js";

export const OperationTemplateSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: z.string().min(1).nullable(),
  defaultDurationMinutes: z.number().int().positive().nullable(),
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
});

export const OperationSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  sequence: z.number().int().positive(),
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: z.string().min(1).nullable(),
  plannedDurationMinutes: z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
});

export const ScheduleableOperationSchema = z.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: z.string().min(1).nullable(),
  plannedDurationMinutes: z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
});

export type OperationTemplate = z.infer<typeof OperationTemplateSchema>;
export type Operation = z.infer<typeof OperationSchema>;
export type ScheduleableOperation = z.infer<typeof ScheduleableOperationSchema>;

export function parseOperation(payload: unknown): Operation {
  return OperationSchema.parse(payload);
}

export function parseScheduleableOperation(payload: unknown): ScheduleableOperation {
  return ScheduleableOperationSchema.parse(payload);
}
