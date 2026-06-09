import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  AdapterCapabilitiesSchema,
  VesselListResponseSchema,
  VesselSnapshotSchema,
  VesselStateResponseSchema,
  VesselStateSchema,
} from "./adapter.js";

describe("AdapterCapabilitiesSchema", () => {
  it("parses a well-formed capabilities object", () => {
    const value = AdapterCapabilitiesSchema.parse({
      readSnapshot: true,
      applyCommand: false,
      subscribeAlarms: false,
    });
    expect(value.readSnapshot).toBe(true);
    expect(value.applyCommand).toBe(false);
    expect(value.subscribeAlarms).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(() =>
      AdapterCapabilitiesSchema.parse({ readSnapshot: true }),
    ).toThrow(ZodError);
  });
});

describe("VesselSnapshotSchema", () => {
  const baseSnapshot = {
    vesselCode: "K1",
    alarmActive: false,
    capturedAt: "2026-05-19T12:00:00.000Z",
  };

  it("parses a minimal valid snapshot", () => {
    const value = VesselSnapshotSchema.parse(baseSnapshot);
    expect(value.vesselCode).toBe("K1");
    expect(value.alarmActive).toBe(false);
  });

  it("accepts optional temperatures + mode + raw map", () => {
    const value = VesselSnapshotSchema.parse({
      ...baseSnapshot,
      mode: "fermenter",
      currentTempC: 20.5,
      targetTempC: 22.0,
      raw: { PI_TEMP_RAW: 205, PI_ALARM: true },
    });
    expect(value.mode).toBe("fermenter");
    expect(value.raw?.["PI_TEMP_RAW"]).toBe(205);
  });

  it("rejects an empty vesselCode", () => {
    expect(() =>
      VesselSnapshotSchema.parse({ ...baseSnapshot, vesselCode: "" }),
    ).toThrow(ZodError);
  });

  it("rejects a malformed capturedAt", () => {
    expect(() =>
      VesselSnapshotSchema.parse({ ...baseSnapshot, capturedAt: "not-a-date" }),
    ).toThrow(ZodError);
  });
});

describe("VesselStateSchema", () => {
  const baseState = {
    id: "vessel-1",
    workspaceId: "ws-1",
    code: "K1",
    displayName: "Kettle 1",
    vesselKind: "kettle",
    equipmentProfileId: null,
    adapterConnectionId: null,
    mode: null,
    currentTempC: null,
    targetTempC: null,
    alarmActive: false,
    lastSeenAt: null,
  };

  it("parses a vessel-state row with all nullable fields null", () => {
    expect(VesselStateSchema.parse(baseState)).toEqual(baseState);
  });

  it("preserves non-null temperatures + mode + lastSeenAt", () => {
    const value = VesselStateSchema.parse({
      ...baseState,
      mode: "fermenter",
      currentTempC: 20.5,
      targetTempC: 22.0,
      lastSeenAt: "2026-05-19T12:00:00.000Z",
    });
    expect(value.currentTempC).toBe(20.5);
    expect(value.lastSeenAt).toBe("2026-05-19T12:00:00.000Z");
  });

  it("rejects a missing code", () => {
    const r = { ...baseState, code: "" };
    expect(() => VesselStateSchema.parse(r)).toThrow(ZodError);
  });
});

describe("VesselListResponseSchema", () => {
  it("requires ok: true literal", () => {
    expect(() =>
      VesselListResponseSchema.parse({ ok: false, vessels: [] }),
    ).toThrow(ZodError);
  });

  it("accepts an empty vessels array", () => {
    const value = VesselListResponseSchema.parse({ ok: true, vessels: [] });
    expect(value.vessels).toEqual([]);
  });
});

describe("VesselStateResponseSchema", () => {
  it("requires both ok: true and vessel", () => {
    expect(() => VesselStateResponseSchema.parse({ ok: true })).toThrow(
      ZodError,
    );
  });
});
