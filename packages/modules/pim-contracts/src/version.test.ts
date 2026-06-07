import { describe, expect, it } from "vitest";
import {
  CONTRACT_VERSION,
  classifyContractVersionSkew,
  parseSemVer,
} from "./version.js";

describe("CONTRACT_VERSION", () => {
  it("is a parseable semver string", () => {
    expect(parseSemVer(CONTRACT_VERSION)).not.toBeNull();
  });
});

describe("classifyContractVersionSkew", () => {
  it("returns match for CONTRACT_VERSION", () => {
    expect(classifyContractVersionSkew(CONTRACT_VERSION)).toBe("match");
  });
});
