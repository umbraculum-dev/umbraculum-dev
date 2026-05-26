import { describe, expect, it } from "vitest";
import {
  CONTRACT_VERSION,
  classifyContractVersionSkew,
  parseSemVer,
} from "./index.js";

describe("CONTRACT_VERSION", () => {
  it("is a parseable semver string", () => {
    expect(parseSemVer(CONTRACT_VERSION)).not.toBeNull();
  });
});

describe("parseSemVer", () => {
  it("parses MAJOR.MINOR.PATCH", () => {
    expect(parseSemVer("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it("parses MAJOR.MINOR.PATCH-prerelease", () => {
    expect(parseSemVer("0.0.0-dev")).toEqual({
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: "dev",
    });
  });

  it("returns null on garbage input", () => {
    expect(parseSemVer("not-a-version")).toBeNull();
    expect(parseSemVer("1.2")).toBeNull();
    expect(parseSemVer("1.2.3.4")).toBeNull();
  });
});

describe("classifyContractVersionSkew (mismatch policy per design §12.2)", () => {
  it("returns 'match' on identical versions", () => {
    expect(classifyContractVersionSkew("1.2.3", "1.2.3")).toBe("match");
  });

  it("returns 'patch' when only patch differs", () => {
    expect(classifyContractVersionSkew("1.2.4", "1.2.3")).toBe("patch");
  });

  it("returns 'minor' when minor differs", () => {
    expect(classifyContractVersionSkew("1.3.0", "1.2.3")).toBe("minor");
  });

  it("returns 'major' when major differs (adapter refuses to connect)", () => {
    expect(classifyContractVersionSkew("2.0.0", "1.2.3")).toBe("major");
  });

  it("returns 'unparseable' on garbage input", () => {
    expect(classifyContractVersionSkew("not-a-version", "1.2.3")).toBe("unparseable");
    expect(classifyContractVersionSkew("1.2.3", "not-a-version")).toBe("unparseable");
  });

  it("defaults the expected version to CONTRACT_VERSION", () => {
    expect(classifyContractVersionSkew(CONTRACT_VERSION)).toBe("match");
  });
});
