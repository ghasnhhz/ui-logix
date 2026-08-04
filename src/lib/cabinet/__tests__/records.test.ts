import { describe, expect, it } from "vitest";
import { savingOf, toRecord, toRecords } from "../records";
import { bookingRow, NOW, quoteRow } from "./fixtures";

describe("toRecord", () => {
  it("renders an unexpired quote without a booking as quoted", () => {
    const record = toRecord(quoteRow(), NOW);

    expect(record.status).toBe("quoted");
    expect(record.booked).toBe(false);
    expect(record.bookingReference).toBeNull();
  });

  it("renders a quote past its 48 hours as expired", () => {
    const record = toRecord(
      quoteRow({ expiresAt: new Date("2026-08-03T12:00:00.000Z") }),
      NOW,
    );

    expect(record.status).toBe("expired");
  });

  it("takes an unbooked amount from the cheapest carrier in the requested mode", () => {
    const record = toRecord(quoteRow(), NOW);

    // CMA/FCL is cheaper at 900, but the shipment was requested as LTL.
    expect(record.mode).toBe("LTL");
    expect(record.carrierId).toBe("MSK");
    expect(record.allIn).toBe(1800);
  });

  it("takes a booked row's money and carrier from the booking, never the quote", () => {
    const record = toRecord(
      quoteRow({ booking: bookingRow({ carrierId: "CMA", mode: "FCL", allIn: 950 }) }),
      NOW,
    );

    expect(record.carrierId).toBe("CMA");
    expect(record.mode).toBe("FCL");
    expect(record.allIn).toBe(950);
    expect(record.booked).toBe(true);
  });

  it("renders a booked row at the booking's status", () => {
    for (const status of ["booked", "transit", "delivered"]) {
      expect(toRecord(quoteRow({ booking: bookingRow({ status }) }), NOW).status).toBe(status);
    }
  });

  it("falls back to booked for a status the product does not know", () => {
    const record = toRecord(quoteRow({ booking: bookingRow({ status: "cancelled" }) }), NOW);

    expect(record.status).toBe("booked");
  });

  it("survives a quote whose stored results are missing", () => {
    const record = toRecord(quoteRow({ results: null }), NOW);

    expect(record.allIn).toBe(0);
    expect(record.carrierId).toBeNull();
  });

  it("builds a re-quote link that lands on step 5 and announces itself", () => {
    const { requoteHref } = toRecord(quoteRow(), NOW);
    const params = new URLSearchParams(requoteHref.split("?")[1]);

    expect(requoteHref.startsWith("/quote?")).toBe(true);
    expect(params.get("step")).toBe("5");
    expect(params.get("requote")).toBe("1");
    expect(params.get("origin")).toBe("TAS");
    expect(params.get("dest")).toBe("ALA");
    expect(params.get("mode")).toBe("LTL");
    expect(params.get("weight")).toBe("850");
    expect(params.get("unit")).toBe("kg");
    expect(params.get("date")).toBe("2026-08-27");
  });

  it("measures a saving against the stored benchmark, not a recomputation", () => {
    const record = toRecord(quoteRow({ booking: bookingRow({ allIn: 1800 }) }), NOW);

    expect(savingOf(record)).toBe(200);
  });

  it("reports a negative saving when the shipper booked above market", () => {
    const record = toRecord(quoteRow({ booking: bookingRow({ allIn: 2300 }) }), NOW);

    expect(savingOf(record)).toBe(-300);
  });

  it("maps a list in order", () => {
    const records = toRecords([quoteRow({ id: "a" }), quoteRow({ id: "b" })], NOW);

    expect(records.map((record) => record.quoteId)).toEqual(["a", "b"]);
  });
});
