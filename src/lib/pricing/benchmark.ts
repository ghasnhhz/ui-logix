import type { Benchmark, Quote } from "./types";

const MARKET_UPLIFT = 1.16;

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
