import { describe, expect, it } from "vitest";
import {
  CONTRACT_VERSION,
  MAILBOX_SPEC,
  VesselSnapshotSchema,
  type AdapterReadContext,
} from "@brewery/automation-contracts";

import { MOCK_ADAPTER_KIND, createMockAdapter } from "./mockAdapter.js";

const fixedNow = (): number => Date.parse("2026-05-19T12:00:00.000Z");

const baseContext: AdapterReadContext = {
  mailbox: MAILBOX_SPEC,
  contractVersion: CONTRACT_VERSION,
};

describe("createMockAdapter", () => {
  it("advertises read-only capabilities at the active contract version", () => {
    const adapter = createMockAdapter({ vesselCodes: [], now: fixedNow });
    expect(adapter.kind).toBe(MOCK_ADAPTER_KIND);
    expect(adapter.protocol).toBe("mock");
    expect(adapter.capabilities).toEqual({
      readSnapshot: true,
      applyCommand: false,
      subscribeAlarms: false,
    });
    expect(adapter.requiresContractVersion).toBe(CONTRACT_VERSION);
  });

  it("returns one snapshot per configured vessel code", async () => {
    const adapter = createMockAdapter({
      vesselCodes: ["K1", "FV-1", "FV-2"],
      now: fixedNow,
    });
    const snapshots = await adapter.readSnapshot(baseContext);
    expect(snapshots).toHaveLength(3);
    expect(snapshots.map((s) => s.vesselCode)).toEqual(["K1", "FV-1", "FV-2"]);
  });

  it("emits snapshots that parse cleanly under VesselSnapshotSchema", async () => {
    const adapter = createMockAdapter({
      vesselCodes: ["K1", "FV-1"],
      now: fixedNow,
    });
    const snapshots = await adapter.readSnapshot(baseContext);
    for (const s of snapshots) {
      expect(() => VesselSnapshotSchema.parse(s)).not.toThrow();
    }
  });

  it("is deterministic — same code → same temperature across reads", async () => {
    const adapter = createMockAdapter({ vesselCodes: ["K1"], now: fixedNow });
    const first = await adapter.readSnapshot(baseContext);
    const second = await adapter.readSnapshot(baseContext);
    expect(first[0]?.currentTempC).toBe(second[0]?.currentTempC);
    expect(first[0]?.targetTempC).toBe(second[0]?.targetTempC);
  });

  it("uses the injected `now()` for capturedAt", async () => {
    const adapter = createMockAdapter({ vesselCodes: ["K1"], now: fixedNow });
    const [snap] = await adapter.readSnapshot(baseContext);
    expect(snap?.capturedAt).toBe("2026-05-19T12:00:00.000Z");
  });
});
