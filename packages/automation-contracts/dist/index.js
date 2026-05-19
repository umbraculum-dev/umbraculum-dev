// src/version.ts
var CONTRACT_VERSION = "0.0.0-dev";
function parseSemVer(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === void 0) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}
function classifyContractVersionSkew(runtime, expected = CONTRACT_VERSION) {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}

// src/mailbox.ts
var FIRMWARE_VERSION_REGISTER_NAME = "PI_FIRMWARE_VERSION";
function findMailboxEntry(spec, name) {
  return spec.entries.find((entry) => entry.name === name);
}
export {
  CONTRACT_VERSION,
  FIRMWARE_VERSION_REGISTER_NAME,
  classifyContractVersionSkew,
  findMailboxEntry,
  parseSemVer
};
