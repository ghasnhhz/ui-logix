import { describe, expect, it } from "vitest";

import { CARRIERS } from "../carriers";
import { quoteAll } from "../engine";
import type { Mode } from "../types";
import { COMP_DEFAULT, find } from "./fixtures";

// [carrierId, mode, allIn, transitDays] straight out of the comp's
// computeQuotes() for the default shipment. Eighteen rows — six carriers across
// the modes each one serves.
const COMP_QUOTES: [string, Mode, number, number][] = [
  ["MSK", "FCL", 1733.47106, 15],
  ["MSK", "LTL", 1389.8349387952176, 6],
  ["MSK", "FTL", 1088.7435600000001, 4],
  ["DBS", "FTL", 1212.6526199999998, 4],
  ["DBS", "LTL", 1552.2556867806522, 5],
  ["DBS", "AIR", 4844.159687384616, 2],
  ["DBS", "FCL", 1914.2638699999998, 13],
  ["FDX", "LTL", 1640.8488220454349, 5],
  ["FDX", "AIR", 5134.829358769232, 2],
  ["FDX", "FTL", 1280.23938, 3],
  ["DHL", "AIR", 5861.50353723077, 2],
  ["DHL", "LTL", 1862.3316602073912, 4],
  ["KNL", "FCL", 1832.0853200000001, 16],
  ["KNL", "FTL", 1156.33032, 4],
  ["KNL", "AIR", 4601.93496123077, 2],
  ["KNL", "LTL", 1478.4280740600002, 6],
  ["CMA", "FCL", 1651.2925100000002, 19],
  ["CMA", "FTL", 1032.42126, 5],
];

describe("quoteAll — the comp's default shipment", () => {
  const quotes = quoteAll(COMP_DEFAULT);

  it("returns one quote per carrier per mode served", () => {
    expect(quotes).toHaveLength(COMP_QUOTES.length);
    expect(quotes).toHaveLength(CARRIERS.reduce((n, c) => n + c.modes.length, 0));
  });

  it.each(COMP_QUOTES)("%s %s matches the comp", (carrierId, mode, allIn, days) => {
    const q = find(quotes, carrierId, mode);
    expect(q.allIn).toBeCloseTo(allIn, 6);
    expect(q.transitDays).toBe(days);
  });

  it("breaks the all-in down into base, fuel, insurance and THC", () => {
    const q = find(quotes, "MSK", "LTL");
    expect(q.base).toBeCloseTo(1074.3104389130435, 6);
    expect(q.fuel).toBeCloseTo(150.40346144782612, 6);
    expect(q.insurance).toBeCloseTo(45.12103843434783, 6);
    expect(q.thc).toBe(120);
    expect(q.allIn).toBeCloseTo(q.base + q.fuel + q.insurance + q.thc, 9);
  });

  it("charges air a higher fuel rate and a higher THC", () => {
    const air = find(quotes, "DHL", "AIR");
    expect(air.fuel).toBeCloseTo(air.base * 0.17, 9);
    expect(air.thc).toBe(145);
    expect(find(quotes, "MSK", "FCL").thc).toBe(320);
    expect(find(quotes, "MSK", "FTL").thc).toBe(120);
  });

  it("carries the read-only carrier rating through onto the quote", () => {
    const q = find(quotes, "DHL", "AIR");
    expect(q.rating).toBe(4.7);
    expect(q.reviews).toBe(4100);
    expect(q.onTimePct).toBe(95);
  });
});

// A full truckload buys the truck, so nothing about the cargo may move the
// price. This is spec (ARCHITECTURE.md § Rate by mode), not an oversight.
describe("FTL ignores weight and volume", () => {
  const baseline = quoteAll(COMP_DEFAULT).filter((q) => q.mode === "FTL");

  const variants = {
    "much heavier": { ...COMP_DEFAULT, weight: 40_000 },
    "one tiny piece": { ...COMP_DEFAULT, pieces: 1, lengthCm: 10, widthCm: 10, heightCm: 10 },
    "a different cargo class": { ...COMP_DEFAULT, cargoType: "furniture" as const },
    "weighed in pounds": { ...COMP_DEFAULT, unit: "lb" as const },
  };

  it.each(Object.entries(variants))("is unchanged by %s", (_label, spec) => {
    const ftl = quoteAll(spec).filter((q) => q.mode === "FTL");
    expect(ftl).toEqual(baseline);
  });

  it("still moves with distance", () => {
    const longer = quoteAll({ ...COMP_DEFAULT, destination: "BER" }).filter(
      (q) => q.mode === "FTL",
    );
    expect(longer[0].allIn).toBeGreaterThan(baseline[0].allIn);
  });

  it("does move the other modes, so the invariance above means something", () => {
    const heavier = quoteAll({ ...COMP_DEFAULT, weight: 40_000 });
    expect(find(heavier, "MSK", "LTL").allIn).toBeGreaterThan(
      find(quoteAll(COMP_DEFAULT), "MSK", "LTL").allIn,
    );
  });
});

describe("mode floors", () => {
  const tiny = {
    ...COMP_DEFAULT,
    destination: "SKD" as const,
    weight: 1,
    pieces: 1,
    lengthCm: 1,
    widthCm: 1,
    heightCm: 1,
  };

  it("never prices AIR below the 340 floor, before carrier factors", () => {
    expect(find(quoteAll(tiny), "DBS", "AIR").base).toBeCloseTo(340 * 0.97, 9);
  });

  // LTL's own 280 floor can never engage: the formula opens at a flat 380 and
  // every other term is non-negative (cm bottoms out at 1.0 when freight class
  // is 50). Asserted so the dead floor is documented rather than mistaken for
  // active behaviour.
  it("never actually reaches LTL's 280 floor", () => {
    expect(find(quoteAll(tiny), "MSK", "LTL").base).toBeGreaterThan(380 * 0.86);
  });

  it("never returns a transit of less than one day", () => {
    for (const q of quoteAll(tiny)) expect(q.transitDays).toBeGreaterThanOrEqual(1);
  });
});
