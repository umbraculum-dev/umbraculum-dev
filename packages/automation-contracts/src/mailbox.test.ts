import { describe, expect, it } from "vitest";
import {
  FIRMWARE_VERSION_REGISTER_NAME,
  findMailboxEntry,
  type MailboxSpec,
} from "./index.js";

const fixture: MailboxSpec = {
  contractVersion: "0.0.0-dev",
  entries: [
    {
      name: "PI_K1_CURRENT_TEMP_C_X10",
      address: 100,
      kind: "holding_register",
      scalar: "int16",
      scale: 0.1,
      unit: "degC",
      writable: false,
      description: "Fermenter K1 current temperature, fixed-point x10.",
    },
    {
      name: FIRMWARE_VERSION_REGISTER_NAME,
      address: 0,
      kind: "input_register",
      scalar: "uint16",
      writable: false,
      description: "Runtime firmware version (informational).",
    },
  ],
};

describe("findMailboxEntry", () => {
  it("returns the entry by its PI_* name", () => {
    const entry = findMailboxEntry(fixture, "PI_K1_CURRENT_TEMP_C_X10");
    expect(entry?.address).toBe(100);
    expect(entry?.unit).toBe("degC");
  });

  it("locates the reserved firmware version register by name", () => {
    const entry = findMailboxEntry(fixture, FIRMWARE_VERSION_REGISTER_NAME);
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("input_register");
  });

  it("returns undefined for an unknown name", () => {
    expect(findMailboxEntry(fixture, "PI_DOES_NOT_EXIST")).toBeUndefined();
  });
});
