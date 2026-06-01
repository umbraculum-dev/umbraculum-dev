import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IntegrationTokenParamsSchema,
  TiltIngestBodySchema,
  TiltIngestResponseSchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";
import { IntegrationsService } from "../services/integrationsService.js";

function readString(o: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") {
      const s = v.trim();
      if (s) return s;
    }
  }
  return null;
}

function readNumber(o: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) continue;
      const n = Number.parseFloat(s);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function integrationsTiltIngestRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new IntegrationsService(app.prisma);

  zodApp.post(
    "/integrations/tilt/:token",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationTokenParamsSchema,
        body: TiltIngestBodySchema,
        response: {
          200: TiltIngestResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { token } = req.params;
      const integration = await svc.requireActiveIntegrationByToken({ token, kind: "tilt" });

      const rawBody = req.body;

      const uuid = readString(rawBody, ["uuid", "UUID"]);
      const mac = readString(rawBody, ["mac", "MAC", "macid", "macId", "macID"]);
      const color = readString(rawBody, ["Color", "color"]);
      const beer = readString(rawBody, ["Beer", "beer"]);

      const deviceKey = uuid ? `uuid:${uuid}` : mac ? `mac:${mac}` : color ? `color:${color}` : "";
      if (!deviceKey) {
        throw new BadRequestError("invalid_device_identity", "Body must include uuid, mac, or Color");
      }

      const metadataJson = {
        ...(uuid ? { uuid } : {}),
        ...(mac ? { mac } : {}),
        ...(color ? { color } : {}),
        ...(beer ? { beer } : {}),
      };

      const deviceRes = await svc.upsertDevice({
        integrationId: integration.id,
        deviceKey,
        displayName: color ?? null,
        metadataJson: Object.keys(metadataJson).length ? metadataJson : null,
      });

      const tempF = readNumber(rawBody, ["Temp", "temp"]);
      const tempC = tempF !== null ? svc.fahrenheitToCelsius(tempF) : null;
      const gravitySg = readNumber(rawBody, ["SG", "sg", "ferm"]);
      const recordedAt = svc.parseOptionalRecordedAt(readString(rawBody, ["timestamp", "Timestamp", "recordedAt"]));

      const readingRes = await svc.createReading({
        deviceId: deviceRes.device.id,
        recordedAt,
        temperatureC: tempC,
        gravitySg,
        rawJson: rawBody,
      });

      return TiltIngestResponseSchema.parse({
        ok: true,
        integrationId: integration.id,
        deviceId: deviceRes.device.id,
        readingId: readingRes.reading.id,
        brewSessionId: readingRes.reading.brewSessionId,
      });
    },
  );
}
