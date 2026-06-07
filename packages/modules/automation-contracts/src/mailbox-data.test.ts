import { describe, expect, it } from "vitest";
import {
  CONTRACT_VERSION,
  FIRMWARE_VERSION_REGISTER_NAME,
  MAILBOX_SPEC,
  classifyContractVersionSkew,
  findMailboxEntry,
} from "./index.js";

describe("MAILBOX_SPEC mirror", () => {
  it("loads and validates without throwing", () => {
    expect(MAILBOX_SPEC).toBeDefined();
    expect(MAILBOX_SPEC.entries.length).toBeGreaterThan(0);
  });

  it("contractVersion matches the package CONTRACT_VERSION (lockstep guarantee)", () => {
    expect(MAILBOX_SPEC.contractVersion).toBe(CONTRACT_VERSION);
  });

  it("contractVersion classifies as a clean match against itself", () => {
    expect(classifyContractVersionSkew(MAILBOX_SPEC.contractVersion)).toBe(
      "match",
    );
  });

  it("contains the PI_FIRMWARE_VERSION register", () => {
    const entry = findMailboxEntry(MAILBOX_SPEC, FIRMWARE_VERSION_REGISTER_NAME);
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("holding_register");
    expect(entry?.scalar).toBe("uint16");
    expect(entry?.writable).toBe(false);
  });

  it("preserves the sister-repo schema marker", () => {
    expect(MAILBOX_SPEC.schemaMarker).toBe("v2");
  });

  it("populates the integrated-release-tag rail", () => {
    expect(MAILBOX_SPEC.integratedReleaseTag).toBe(MAILBOX_SPEC.contractVersion);
  });

  it("populates the plcVersion rail", () => {
    expect(typeof MAILBOX_SPEC.plcVersion).toBe("string");
    expect(MAILBOX_SPEC.plcVersion).toBeTruthy();
  });

  it("entries all carry PI_* names", () => {
    for (const entry of MAILBOX_SPEC.entries) {
      expect(entry.name.startsWith("PI_")).toBe(true);
    }
  });

  it("has no duplicate PI_* names", () => {
    const names = MAILBOX_SPEC.entries.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has no duplicate addresses within a kind", () => {
    const seen = new Map<string, string>();
    for (const e of MAILBOX_SPEC.entries) {
      const key = `${e.kind}:${e.address}`;
      const prior = seen.get(key);
      expect(prior, `duplicate ${e.kind} address ${e.address}: ${prior} vs ${e.name}`).toBeUndefined();
      seen.set(key, e.name);
    }
  });

  it("addresses are non-negative integers", () => {
    for (const e of MAILBOX_SPEC.entries) {
      expect(Number.isInteger(e.address)).toBe(true);
      expect(e.address).toBeGreaterThanOrEqual(0);
    }
  });

  it("known QX bit -> Modbus coil arithmetic spot-check (PI_Q_ColdPumpDemandRaw -> coil 888)", () => {
    const entry = findMailboxEntry(MAILBOX_SPEC, "PI_Q_ColdPumpDemandRaw");
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("coil");
    expect(entry?.address).toBe(888);
  });

  it("known QW word -> Modbus holding register spot-check (PI_AI_ColdTankTempDeciC -> hr 208)", () => {
    const entry = findMailboxEntry(MAILBOX_SPEC, "PI_AI_ColdTankTempDeciC");
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("holding_register");
    expect(entry?.address).toBe(208);
  });

  it("writability classification mirrors the sister-repo prefix rule", () => {
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_M_AnyAlarmLatched")?.writable).toBe(false);
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_AI_F1TempDeciC")?.writable).toBe(false);
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_SVC_ColdLowBypassReq")?.writable).toBe(true);
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_CFG_F1PriorityCode")?.writable).toBe(true);
    // Echo / status sub-pattern under CFG_* is read-only from outside.
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_CFG_F1AppliedPriorityCode")?.writable).toBe(false);
    expect(findMailboxEntry(MAILBOX_SPEC, "PI_CFG_F1MailboxStatus")?.writable).toBe(false);
  });

  it("MAILBOX_SPEC is frozen at the top level", () => {
    expect(Object.isFrozen(MAILBOX_SPEC)).toBe(true);
  });
});
