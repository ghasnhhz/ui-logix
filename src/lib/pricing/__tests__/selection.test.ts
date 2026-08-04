import { describe, expect, it } from "vitest";

import { quoteAll } from "../engine";
import { bestValue, displayedQuotes, modeCounts, sortQuotes } from "../selection";
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

describe("modeCounts", () => {
  it("counts carriers on ALL and quotes per mode", () => {
    expect(modeCounts(quotes)).toEqual({ ALL: 6, AIR: 4, LTL: 5, FTL: 5, FCL: 4 });
  });

  it("does not size ALL off the full result set", () => {
    expect(quotes).toHaveLength(18);
    expect(modeCounts(quotes).ALL).toBe(6);
  });

  it("reports zero for a mode with no coverage", () => {
    expect(modeCounts(quotes.filter((q) => q.mode === "AIR")).FCL).toBe(0);
  });
});

describe("sortQuotes", () => {
  const shown = displayedQuotes(quotes, "ALL");

  it("orders by all-in cost ascending on price", () => {
    const order = sortQuotes(shown, "price").map((q) => q.allIn);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("orders by transit ascending on fast", () => {
    const order = sortQuotes(shown, "fast").map((q) => q.transitDays);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("orders by rating descending on rated", () => {
    expect(sortQuotes(shown, "rated").map((q) => q.carrierId)).toEqual([
      "DHL",
      "FDX",
      "MSK",
      "DBS",
      "KNL",
      "CMA",
    ]);
  });

  it("breaks every tie on price", () => {
    const tied: Quote[] = [
      { ...shown[0], carrierId: "DBS", allIn: 900, transitDays: 4, rating: 4.4 },
      { ...shown[0], carrierId: "MSK", allIn: 700, transitDays: 4, rating: 4.4 },
    ];
    expect(sortQuotes(tied, "fast").map((q) => q.carrierId)).toEqual(["MSK", "DBS"]);
    expect(sortQuotes(tied, "rated").map((q) => q.carrierId)).toEqual(["MSK", "DBS"]);
  });

  it("does not mutate its input", () => {
    const before = shown.map(key);
    sortQuotes(shown, "price");
    expect(shown.map(key)).toEqual(before);
  });
});

describe("bestValue", () => {
  it("is the cheapest quote in the displayed list", () => {
    const shown = displayedQuotes(quotes, "ALL");
    expect(bestValue(shown)?.carrierId).toBe("CMA");
  });

  // The ribbon must not travel when the user switches sort — it marks the
  // cheapest option, not the first row.
  it("is the same quote whatever the list order", () => {
    const shown = displayedQuotes(quotes, "ALL");
    for (const sort of ["price", "fast", "rated"] as const) {
      expect(bestValue(sortQuotes(shown, sort))?.carrierId).toBe("CMA");
    }
  });

  it("is null for an empty list", () => {
    expect(bestValue([])).toBeNull();
  });
});
