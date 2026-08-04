import type { Quote, ShipmentSpec } from "../types";

// The comp's `state.f` initializer, verbatim. Every golden number in these tests
// was produced by running the comp's own cargo() and computeQuotes() against
// this spec — not by re-deriving it from the formulas, which would only prove
// the engine agrees with itself.
export const COMP_DEFAULT: ShipmentSpec = {
  origin: "TAS",
  destination: "ALA",
  cargoType: "textiles",
  weight: 850,
  unit: "kg",
  pieces: 12,
  lengthCm: 120,
  widthCm: 80,
  heightCm: 95,
};

export function find(quotes: Quote[], carrierId: string, mode: string) {
  const quote = quotes.find((q) => q.carrierId === carrierId && q.mode === mode);
  if (!quote) throw new Error(`no quote for ${carrierId}/${mode}`);
  return quote;
}
