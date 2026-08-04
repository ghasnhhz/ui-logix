import { describe, expect, it } from "vitest";
import { csvFilename, toCsv, CSV_COLUMNS, type CsvLabels } from "../csv";
import { toRecords, type RecordStatus } from "../records";
import { bookingRow, NOW, quoteRow } from "./fixtures";

const LABELS = Object.fromEntries(
  CSV_COLUMNS.map((column) => [column, column]),
) as CsvLabels;

const statusLabel = (status: RecordStatus) => status;

const lines = (csv: string) => csv.replace(/^\uFEFF/, "").trimEnd().split("\r\n");

describe("toCsv", () => {
  it("starts with a UTF-8 BOM so Excel reads Cyrillic", () => {
    expect(toCsv([], LABELS, statusLabel).startsWith("\uFEFF")).toBe(true);
  });

  it("writes the nine columns from ARCHITECTURE.md § CSV export", () => {
    const [header] = lines(toCsv([], LABELS, statusLabel));

    expect(header.split(",")).toEqual([
      "quoteId",
      "origin",
      "destination",
      "mode",
      "carrier",
      "status",
      "allIn",
      "benchmark",
      "saving",
    ]);
  });

  it("writes a booked row with its carrier, amount and saving", () => {
    const records = toRecords(
      [quoteRow({ benchmarkMedian: 2000, booking: bookingRow({ allIn: 1800 }) })],
      NOW,
    );
    const [, row] = lines(toCsv(records, LABELS, statusLabel));

    expect(row).toBe("ULQ-2026-000001,Tashkent,Almaty,LTL,Maersk Line,booked,1800,2000,200");
  });

  it("writes an unbooked row at its best in-mode price", () => {
    const [, row] = lines(toCsv(toRecords([quoteRow()], NOW), LABELS, statusLabel));

    expect(row).toBe("ULQ-2026-000001,Tashkent,Almaty,LTL,Maersk Line,quoted,1800,2000,200");
  });

  it("quotes a field that carries a separator", () => {
    const csv = toCsv(
      toRecords([quoteRow()], NOW),
      { ...LABELS, status: 'Status, "as sent"' },
      statusLabel,
    );

    expect(lines(csv)[0]).toContain('"Status, ""as sent"""');
  });

  it("ends every line with CRLF, including the last", () => {
    expect(toCsv(toRecords([quoteRow()], NOW), LABELS, statusLabel).endsWith("\r\n")).toBe(true);
  });
});

describe("csvFilename", () => {
  it("dates the file", () => {
    expect(csvFilename(NOW)).toBe("ulogix-cabinet-2026-08-04.csv");
  });
});
