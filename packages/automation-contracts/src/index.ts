export {
  CONTRACT_VERSION,
  classifyContractVersionSkew,
  parseSemVer,
} from "./version.js";
export type { SemVer, VersionMismatchSeverity } from "./version.js";

export { FIRMWARE_VERSION_REGISTER_NAME, findMailboxEntry } from "./mailbox.js";
export type {
  MailboxEntry,
  MailboxSpec,
  ModbusEntryKind,
  ScalarType,
} from "./mailbox.js";

export { MAILBOX_SPEC } from "./mailbox-data.js";

export type {
  AdapterCapabilities,
  AdapterReadContext,
  AutomationAdapterDefinition,
  VesselSnapshot,
} from "./adapter.js";
