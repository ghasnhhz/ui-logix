import { CARRIERS, type CarrierId } from "@/lib/pricing";
import { cityName } from "@/lib/ui/places";
import { savingOf, type CabinetRecord, type RecordStatus } from "./records";

// Excel decides a file's encoding from its first bytes. Without the BOM it opens
// a UTF-8 CSV as the system codepage and every Cyrillic city and status becomes
// mojibake (ARCHITECTURE.md § CSV export).
const BOM = "\uFEFF";

export const CSV_COLUMNS = [
  "quoteId",
  "origin",
  "destination",
  "mode",
  "carrier",
  "status",
  "allIn",
  "benchmark",
  "saving",
] as const;

export type CsvLabels = Record<(typeof CSV_COLUMNS)[number], string>;

const carrierName = (id: CarrierId | null) =>
  id === null ? "" : (CARRIERS.find((carrier) => carrier.id === id)?.name ?? id);

// Money leaves as a bare integer, not "$1,651" — the column is for arithmetic in
// a spreadsheet, and a currency symbol would make it text.
const amount = (value: number) => String(Math.round(value));

const escape = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const line = (cells: string[]) => cells.map(escape).join(",");

export function toCsv(
  records: CabinetRecord[],
  labels: CsvLabels,
  statusLabel: (status: RecordStatus) => string,
) {
  const rows = records.map((record) =>
    line([
      record.reference,
      cityName(record.origin),
      cityName(record.destination),
      record.mode,
      carrierName(record.carrierId),
      statusLabel(record.status),
      amount(record.allIn),
      amount(record.benchmarkMedian),
      amount(savingOf(record)),
    ]),
  );

  // CRLF: Excel is the target reader and it is the only one fussy about it.
  return BOM + [line(CSV_COLUMNS.map((column) => labels[column])), ...rows].join("\r\n") + "\r\n";
}

export const csvFilename = (now: Date) =>
  `ulogix-cabinet-${now.toISOString().slice(0, 10)}.csv`;
