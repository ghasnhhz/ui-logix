import { describe, expect, it } from "vitest";
import { vsMarketTone } from "../vs-market";

// The seeded history is ocean- and road-heavy, so a negative month does not occur
// naturally and the amber branch cannot be reached by clicking through the demo.
describe("vsMarketTone", () => {
  it("is green below market", () => {
    expect(vsMarketTone(1369)).toBe("text-success-ink");
    expect(vsMarketTone(1)).toBe("text-success-ink");
  });

  it("is amber above market", () => {
    expect(vsMarketTone(-412)).toBe("text-warning-ink-strong");
    expect(vsMarketTone(-1)).toBe("text-warning-ink-strong");
  });

  // Zero is no bookings, not a result — D-037's rule against inventing a reading.
  it("leaves zero in ink", () => {
    expect(vsMarketTone(0)).toBe("");
  });
});
