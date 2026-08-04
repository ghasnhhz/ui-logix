import type { Benchmark, ModeFilter, Quote } from "./types";

const MARKET_UPLIFT = 1.16;

// On ALL, one row per carrier — their cheapest mode. On a specific mode, every
// carrier that serves it. Carrier order follows CARRIERS, not price; sorting is
// the results page's job.
export function displayedQuotes(quotes: Quote[], filter: ModeFilter): Quote[] {
  if (filter !== "ALL") return quotes.filter((q) => q.mode === filter);

  const cheapest = new Map<string, Quote>();
  for (const q of quotes) {
    const held = cheapest.get(q.carrierId);
    if (!held || q.allIn < held.allIn) cheapest.set(q.carrierId, q);
  }
  return [...cheapest.values()];
}

// Named "median" throughout the product; it is an arithmetic mean of the
// displayed quotes lifted 16% to stand in for an untendered market rate. Kept as
// designed — every screenshot in the comp is calibrated against it.
export function benchmarkMedian(quotes: Quote[]) {
  if (quotes.length === 0) return 0;
  return (quotes.reduce((sum, q) => sum + q.allIn, 0) / quotes.length) * MARKET_UPLIFT;
}

// Negative or zero reads green, positive reads amber.
export function vsMarketPct(allIn: number, median: number) {
  if (median === 0) return 0;
  return Math.round(((allIn - median) / median) * 100);
}

export function benchmark(allIn: number, displayed: Quote[]): Benchmark {
  const median = benchmarkMedian(displayed);
  return { median, vsPct: vsMarketPct(allIn, median) };
}
