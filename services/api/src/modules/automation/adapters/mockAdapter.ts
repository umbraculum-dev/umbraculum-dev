import {
  CONTRACT_VERSION,
  type AdapterReadContext,
  type AutomationAdapterDefinition,
  type VesselSnapshot,
} from "@brewery/automation-contracts";

/**
 * Phase B-2 mock adapter — deterministic `AutomationAdapterDefinition`
 * implementation with no real Modbus traffic.
 *
 * Purpose: lets the canonical `automation` module ship the read path
 * (vessels list + vessel state routes + AI tools) end-to-end against an
 * adapter whose output is predictable in tests. Real adapter wiring
 * (`brewery.openplc.v1` over Modbus TCP / RTU) lands in Phase C.
 *
 * The adapter speaks the project's active `CONTRACT_VERSION` so the
 * version-handshake skew classifier (§12.2 of the design doc) returns
 * `none` against the in-repo mailbox.
 *
 * Snapshot determinism: the adapter does NOT include `Date.now()` in
 * its output — `capturedAt` is supplied by the caller (the service
 * layer) so test runs can pin timestamps via fake timers if needed.
 */
export const MOCK_ADAPTER_KIND = "automation.mock.v0";

export interface MockAdapterOptions {
  /**
   * Vessel codes the mock will report on every read. The mock returns
   * one snapshot per code, with deterministic temperatures derived from
   * the code string (so tests can assert on stable values without
   * depending on call order).
   */
  readonly vesselCodes: readonly string[];
  /**
   * `Date.now()` injection so tests can pin `capturedAt`. Defaults to
   * the standard `Date.now()` reading in production.
   */
  readonly now?: () => number;
}

function deterministicTempC(vesselCode: string, base: number): number {
  let hash = 0;
  for (let i = 0; i < vesselCode.length; i += 1) {
    hash = (hash * 31 + vesselCode.charCodeAt(i)) | 0;
  }
  const jitter = (Math.abs(hash) % 21) / 10;
  return base + jitter;
}

export function createMockAdapter(
  options: MockAdapterOptions,
): AutomationAdapterDefinition {
  const now = options.now ?? Date.now;
  const codes = [...options.vesselCodes];

  return {
    kind: MOCK_ADAPTER_KIND,
    displayName: "Mock automation adapter (deterministic, Phase B-2)",
    protocol: "mock",
    requiresContractVersion: CONTRACT_VERSION,
    capabilities: {
      readSnapshot: true,
      applyCommand: false,
      subscribeAlarms: false,
    },
    async readSnapshot(_ctx: AdapterReadContext): Promise<readonly VesselSnapshot[]> {
      const capturedAt = new Date(now()).toISOString();
      return codes.map((code) => ({
        vesselCode: code,
        mode: "idle",
        currentTempC: deterministicTempC(code, 20),
        targetTempC: deterministicTempC(code, 22),
        alarmActive: false,
        capturedAt,
      }));
    },
  };
}
