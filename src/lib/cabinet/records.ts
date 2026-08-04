import {
  bestValue,
  displayedQuotes,
  type CargoType,
  type CarrierId,
  type Mode,
  type PlaceCode,
  type Quote,
} from "@/lib/pricing";
import { specToParams } from "@/lib/wizard/spec";

export type RecordStatus = "quoted" | "expired" | "booked" | "transit" | "delivered";

// The cabinet is a union of quotes and bookings, not a fourth table
// (ARCHITECTURE.md § Data model): a quote without a booking renders quoted or
// expired, a quote with one renders at the booking's status.
export type CabinetRecord = {
  quoteId: string;
  reference: string;
  bookingReference: string | null;
  origin: PlaceCode;
  destination: PlaceCode;
  mode: Mode;
  status: RecordStatus;
  booked: boolean;
  carrierId: CarrierId | null;
  allIn: number;
  benchmarkMedian: number;
  shipDate: string;
  createdAt: string;
  bookedAt: string | null;
  requoteHref: string;
};

export type QuoteRow = {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  shipDate: Date;
  mode: string;
  cargoType: string;
  weightKg: number;
  pieces: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  description: string | null;
  results: unknown;
  benchmarkMedian: number;
  expiresAt: Date;
  createdAt: Date;
  booking: BookingRow | null;
};

export type BookingRow = {
  reference: string;
  carrierId: string;
  mode: string;
  allIn: number;
  status: string;
  createdAt: Date;
};

const BOOKING_STATUSES: RecordStatus[] = ["booked", "transit", "delivered"];

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

// An unbooked quote still needs an amount in the table's AMOUNT column. It is
// the cheapest carrier for the mode the shipper actually asked for — the row
// they would have booked — not a re-price and not the cheapest across modes.
function indicative(row: QuoteRow) {
  const results = Array.isArray(row.results) ? (row.results as Quote[]) : [];
  const best =
    bestValue(displayedQuotes(results, row.mode as Mode)) ??
    bestValue(displayedQuotes(results, "ALL"));
  return { carrierId: best?.carrierId ?? null, allIn: best?.allIn ?? 0 };
}

function statusOf(row: QuoteRow, now: Date): RecordStatus {
  if (!row.booking) return row.expiresAt <= now ? "expired" : "quoted";
  const status = row.booking.status as RecordStatus;
  return BOOKING_STATUSES.includes(status) ? status : "booked";
}

// Feature 3's URL is the wizard's only state-transfer mechanism (D-024), so
// re-quote is a plain link into it rather than a second path.
function requoteHref(row: QuoteRow) {
  const params = specToParams(
    {
      origin: row.origin as PlaceCode,
      destination: row.destination as PlaceCode,
      date: isoDate(row.shipDate),
      mode: row.mode as Mode,
      cargoType: row.cargoType as CargoType,
      weight: row.weightKg,
      unit: "kg",
      pieces: row.pieces,
      lengthCm: row.lengthCm,
      widthCm: row.widthCm,
      heightCm: row.heightCm,
      description: row.description ?? "",
    },
    { step: "5", requote: "1" },
  );
  return `/quote?${params}`;
}

export function toRecord(row: QuoteRow, now: Date): CabinetRecord {
  const booking = row.booking;
  const fallback = booking ? null : indicative(row);

  return {
    quoteId: row.id,
    reference: row.reference,
    bookingReference: booking?.reference ?? null,
    origin: row.origin as PlaceCode,
    destination: row.destination as PlaceCode,
    // A booking copies its own mode off the selected quote row (D-034), and it
    // can differ from the mode the shipment was requested as.
    mode: (booking?.mode ?? row.mode) as Mode,
    status: statusOf(row, now),
    booked: booking !== null,
    carrierId: (booking?.carrierId ?? fallback?.carrierId ?? null) as CarrierId | null,
    allIn: booking?.allIn ?? fallback?.allIn ?? 0,
    benchmarkMedian: row.benchmarkMedian,
    shipDate: isoDate(row.shipDate),
    createdAt: row.createdAt.toISOString(),
    bookedAt: booking?.createdAt.toISOString() ?? null,
    requoteHref: requoteHref(row),
  };
}

export const toRecords = (rows: QuoteRow[], now: Date) => rows.map((row) => toRecord(row, now));

// Positive means the shipper paid less than the benchmark they were shown.
export const savingOf = (record: CabinetRecord) => record.benchmarkMedian - record.allIn;
