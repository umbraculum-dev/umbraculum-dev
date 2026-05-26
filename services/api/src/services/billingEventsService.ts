import type { BillingEventProvider, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

export class BillingEventsService {
  constructor(private readonly prisma: PrismaClient) {}

  async recordEvent(input: {
    provider: BillingEventProvider;
    externalEventId?: string | null;
    userId?: string | null;
    workspaceId?: string | null;
    payloadJson: unknown;
  }) {
    const externalEventId = input.externalEventId?.trim() ? input.externalEventId.trim() : null;
    const payloadJson = input.payloadJson as Prisma.InputJsonValue;

    // If an externalEventId exists, make recording idempotent.
    if (externalEventId) {
      await this.prisma.billingEvent.upsert({
        where: { externalEventId },
        create: {
          provider: input.provider,
          externalEventId,
          userId: input.userId ?? null,
          workspaceId: input.workspaceId ?? null,
          payloadJson,
        },
        update: {
          provider: input.provider,
          userId: input.userId ?? null,
          workspaceId: input.workspaceId ?? null,
          payloadJson,
        },
        select: { id: true },
      });
      return;
    }

    await this.prisma.billingEvent.create({
      data: {
        provider: input.provider,
        externalEventId: null,
        userId: input.userId ?? null,
        workspaceId: input.workspaceId ?? null,
        payloadJson,
      },
      select: { id: true },
    });
  }
}

