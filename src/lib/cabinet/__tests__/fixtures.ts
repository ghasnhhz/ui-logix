import type { Quote } from "@/lib/pricing";
import type { BookingRow, QuoteRow } from "../records";

export const NOW = new Date("2026-08-04T12:00:00.000Z");

const quote = (carrierId: Quote["carrierId"], mode: Quote["mode"], allIn: number): Quote => ({
  carrierId,
  name: carrierId,
  mode,
  rating: 4.5,
  reviews: 100,
  onTimePct: 90,
  base: allIn * 0.8,
  fuel: allIn * 0.1,
  insurance: allIn * 0.05,
  thc: allIn * 0.05,
  allIn,
  transitDays: 10,
});

// Two modes so a test can prove the indicative amount comes from the mode the
// shipment was requested as, not from the cheapest row overall.
export const RESULTS: Quote[] = [
  quote("MSK", "LTL", 1800),
  quote("DHL", "LTL", 2400),
  quote("CMA", "FCL", 900),
];

export function quoteRow(overrides: Partial<QuoteRow> = {}): QuoteRow {
  return {
    id: "q1",
    reference: "ULQ-2026-000001",
    origin: "TAS",
    destination: "ALA",
    shipDate: new Date("2026-08-27T00:00:00.000Z"),
    mode: "LTL",
    cargoType: "textiles",
    weightKg: 850,
    pieces: 12,
    lengthCm: 120,
    widthCm: 80,
    heightCm: 95,
    description: null,
    results: RESULTS,
    benchmarkMedian: 2000,
    expiresAt: new Date("2026-08-06T12:00:00.000Z"),
    createdAt: new Date("2026-08-04T09:00:00.000Z"),
    booking: null,
    ...overrides,
  };
}

export function bookingRow(overrides: Partial<BookingRow> = {}): BookingRow {
  return {
    reference: "ULQ-2026-900001",
    carrierId: "MSK",
    mode: "LTL",
    allIn: 1800,
    status: "booked",
    createdAt: new Date("2026-08-04T10:00:00.000Z"),
    ...overrides,
  };
}
