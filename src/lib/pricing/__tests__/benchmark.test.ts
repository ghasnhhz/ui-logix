import { describe, expect, it } from "vitest";

import { benchmark, benchmarkMedian, displayedQuotes, vsMarketPct } from "../benchmark";
import { quoteAll } from "../engine";
import type { Quote } from "../types";
import { COMP_DEFAULT } from "./fixtures";

const quotes = quoteAll(COMP_DEFAULT);
const key = (q: Quote) => `${q.carrierId}/${q.mode}`;

describe("displayedQuotes", () => {
  it("shows each carrier's cheapest mode on ALL", () => {
    const shown = displayedQuotes(quotes, "ALL");
    expect(shown).toHaveLength(6);
    expect(shown.map(key)).toEqual([
      "MSK/FTL",
      "DBS/FTL",
      "FDX/FTL",
      "DHL/LTL",
      "KNL/FTL",
      "CMA/FTL",
    ]);
  });

  it("shows every carrier serving the selected mode", () => {
    expect(displayedQuotes(quotes, "LTL")).toHaveLength(5);
    expect(displayedQuotes(quotes, "AIR")).toHaveLength(4);
    expect(displayedQuotes(quotes, "FTL")).toHaveLength(5);
    expect(displayedQuotes(quotes, "FCL")).toHaveLength(4);
  });

  it("returns nothing for a mode no carrier serves", () => {
    const airOnly = quotes.filter((q) => q.mode === "AIR");
    expect(displayedQuotes(airOnly, "FCL")).toEqual([]);
  });
});

// The whole point: the benchmark is recomputed over what is on screen, so
// switching the mode filter moves the market line with it.
describe("benchmarkMedian recomputes over the displayed subset", () => {
  const medians = {
    ALL: 1475.6589680400953,
    AIR: 5928.303987938462,
    LTL: 1838.2982101981775,
    FTL: 1338.72981648,
    FCL: 2068.0227004,
  } as const;

  it.each(Object.entries(medians))("%s matches the comp", (filter, expected) => {
    const shown = displayedQuotes(quotes, filter as keyof typeof medians);
    expect(benchmarkMedian(shown)).toBeCloseTo(expected, 6);
  });

  it("is not the median over the full result set", () => {
    const fullSet = benchmarkMedian(quotes);
    expect(fullSet).toBeCloseTo(2659.4692714858184, 6);
    for (const median of Object.values(medians)) {
      expect(median).not.toBeCloseTo(fullSet, 6);
    }
  });

  it("lifts the displayed average by 16%", () => {
    const shown = displayedQuotes(quotes, "LTL");
    const average = shown.reduce((sum, q) => sum + q.allIn, 0) / shown.length;
    expect(benchmarkMedian(shown)).toBeCloseTo(average * 1.16, 9);
  });

  it("returns zero for an empty list rather than NaN", () => {
    expect(benchmarkMedian([])).toBe(0);
  });
});

describe("vsMarketPct", () => {
  it("is negative below the market line and positive above it", () => {
    expect(vsMarketPct(80, 100)).toBe(-20);
    expect(vsMarketPct(130, 100)).toBe(30);
  });

  it("is zero on the line", () => {
    expect(vsMarketPct(100, 100)).toBe(0);
  });

  it("rounds to whole percent", () => {
    expect(vsMarketPct(104.4, 100)).toBe(4);
    expect(vsMarketPct(104.6, 100)).toBe(5);
  });

  it("flags the comp default's cheapest ALL quote as below market", () => {
    const shown = displayedQuotes(quotes, "ALL");
    const cheapest = [...shown].sort((a, b) => a.allIn - b.allIn)[0];
    expect(cheapest.carrierId).toBe("CMA");
    expect(benchmark(cheapest.allIn, shown).vsPct).toBeLessThan(0);
  });
});
