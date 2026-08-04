import type { Mode, ModeFilter, Quote } from "./types";

export type SortKey = "price" | "fast" | "rated";

export const SORT_KEYS: readonly SortKey[] = ["price", "fast", "rated"];

// On ALL, one row per carrier — their cheapest mode. On a specific mode, every
// carrier that serves it. Carrier order follows CARRIERS, not price; sorting is
// a separate step so the caller can pick either.
export function displayedQuotes(quotes: Quote[], filter: ModeFilter): Quote[] {
  if (filter !== "ALL") return quotes.filter((q) => q.mode === filter);

  const cheapest = new Map<string, Quote>();
  for (const q of quotes) {
    const held = cheapest.get(q.carrierId);
    if (!held || q.allIn < held.allIn) cheapest.set(q.carrierId, q);
  }
  return [...cheapest.values()];
}

// Price breaks every tie, so two carriers with the same transit or the same
// rating still list cheapest first.
const COMPARATORS: Record<SortKey, (a: Quote, b: Quote) => number> = {
  price: (a, b) => a.allIn - b.allIn,
  fast: (a, b) => a.transitDays - b.transitDays || a.allIn - b.allIn,
  rated: (a, b) => b.rating - a.rating || a.allIn - b.allIn,
};

export function sortQuotes(quotes: Quote[], sort: SortKey): Quote[] {
  return [...quotes].sort(COMPARATORS[sort]);
}

// ALL counts carriers, not quotes — it is the length of the collapsed list, so
// the chip reads "6" rather than the 18 rows the engine actually returns.
export function modeCounts(quotes: Quote[]): Record<ModeFilter, number> {
  const counts = { ALL: displayedQuotes(quotes, "ALL").length } as Record<ModeFilter, number>;
  for (const mode of ["AIR", "LTL", "FTL", "FCL"] satisfies Mode[]) {
    counts[mode] = quotes.filter((q) => q.mode === mode).length;
  }
  return counts;
}

// Taken over the displayed list before it is sorted, so the best-value ribbon
// stays on the same card when the user switches to fastest or highest rated.
export function bestValue(displayed: Quote[]): Quote | null {
  return displayed.reduce<Quote | null>(
    (best, q) => (!best || q.allIn < best.allIn ? q : best),
    null,
  );
}

// Carrier plus mode identifies a row: the engine returns each pair once. Taking
// the pick rather than the whole quote lets a caller match against a selection
// that only carries those two fields, such as a booking request.
export type QuoteKey = Pick<Quote, "carrierId" | "mode">;

export const isSameQuote = (a: QuoteKey, b: QuoteKey) =>
  a.carrierId === b.carrierId && a.mode === b.mode;
