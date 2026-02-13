import { describe, expect, it } from "vitest";
import { mashPhEstimateV0 } from "./mashPhEstimateV0.js";

describe("mashPhEstimateV0", () => {
  it("increases estimated mash pH as alkalinity increases", () => {
    const base = {
      volumeLiters: 10,
      grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" as const }],
    };
    const low = mashPhEstimateV0({ ...base, alkalinityPpmCaCO3: 0 });
    const high = mashPhEstimateV0({ ...base, alkalinityPpmCaCO3: 200 });
    expect(high.estimatedMashPhRoomTemp).toBeGreaterThan(low.estimatedMashPhRoomTemp);
  });

  it("decreases estimated mash pH as alkalinity decreases (holding grist constant)", () => {
    const base = {
      volumeLiters: 10,
      grist: [{ amountKg: 5, colorLovibond: 2, maltClass: "base" as const }],
    };
    const a = mashPhEstimateV0({ ...base, alkalinityPpmCaCO3: 200 });
    const b = mashPhEstimateV0({ ...base, alkalinityPpmCaCO3: 50 });
    expect(b.estimatedMashPhRoomTemp).toBeLessThan(a.estimatedMashPhRoomTemp);
  });
});

