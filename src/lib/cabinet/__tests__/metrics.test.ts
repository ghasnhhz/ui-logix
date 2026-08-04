import { describe, expect, it } from "vitest";
import { cabinetTotals, dashboardKpis, topCarriers } from "../metrics";
import { toRecords } from "../records";
import { bookingRow, NOW, quoteRow } from "./fixtures";

const at = (iso: string) => new Date(iso);

const records = (rows: Parameters<typeof toRecords>[0]) => toRecords(rows, NOW);

describe("dashboardKpis", () => {
  it("shows zeros and no delta pills for a brand-new account", () => {
    const kpis = dashboardKpis([], NOW);

    expect(kpis).toMatchObject({
      activeCount: 0,
      quotesThisMonth: 0,
      savedThisMonth: 0,
      spendYtd: 0,
      bookingsYtd: 0,
    });
    expect(kpis.activeDelta).toBeNull();
    expect(kpis.quotesDelta).toBeNull();
    expect(kpis.savedPct).toBeNull();
  });

  it("counts booked and in-transit rows as active and delivered ones as not", () => {
    const kpis = dashboardKpis(
      records([
        quoteRow({ id: "a", booking: bookingRow({ status: "booked" }) }),
        quoteRow({ id: "b", booking: bookingRow({ status: "transit" }) }),
        quoteRow({ id: "c", booking: bookingRow({ status: "delivered" }) }),
      ]),
      NOW,
    );

    expect(kpis.activeCount).toBe(2);
    expect(kpis.inTransit).toBe(1);
    expect(kpis.pending).toBe(1);
  });

  it("hides the week delta when the previous week has no bookings to compare against", () => {
    const kpis = dashboardKpis(
      records([quoteRow({ booking: bookingRow({ createdAt: at("2026-08-03T10:00:00Z") }) })]),
      NOW,
    );

    expect(kpis.activeDelta).toBeNull();
  });

  it("shows the week delta once a previous week exists", () => {
    const kpis = dashboardKpis(
      records([
        quoteRow({ id: "a", booking: bookingRow({ createdAt: at("2026-08-03T10:00:00Z") }) }),
        quoteRow({ id: "b", booking: bookingRow({ createdAt: at("2026-08-02T10:00:00Z") }) }),
        quoteRow({ id: "c", booking: bookingRow({ createdAt: at("2026-07-25T10:00:00Z") }) }),
      ]),
      NOW,
    );

    expect(kpis.activeDelta).toBe(1);
  });

  it("hides the month delta with no previous month and shows it with one", () => {
    const thisMonth = quoteRow({ id: "a", createdAt: at("2026-08-02T10:00:00Z") });
    const lastMonth = quoteRow({ id: "b", createdAt: at("2026-07-02T10:00:00Z") });

    expect(dashboardKpis(records([thisMonth]), NOW).quotesDelta).toBeNull();
    expect(dashboardKpis(records([thisMonth, lastMonth]), NOW).quotesDelta).toBe(0);
  });

  it("counts this month's conversions", () => {
    const kpis = dashboardKpis(
      records([
        quoteRow({ id: "a", booking: bookingRow() }),
        quoteRow({ id: "b" }),
        quoteRow({ id: "c", createdAt: at("2026-06-02T10:00:00Z") }),
      ]),
      NOW,
    );

    expect(kpis.quotesThisMonth).toBe(2);
    expect(kpis.convertedThisMonth).toBe(1);
  });

  it("sums this month's saving from each booking's own stored benchmark", () => {
    const kpis = dashboardKpis(
      records([
        quoteRow({ id: "a", benchmarkMedian: 2000, booking: bookingRow({ allIn: 1800 }) }),
        quoteRow({ id: "b", benchmarkMedian: 1000, booking: bookingRow({ allIn: 900 }) }),
      ]),
      NOW,
    );

    expect(kpis.savedThisMonth).toBe(300);
    // -10% on both bookings, averaged per booking rather than over the totals.
    expect(kpis.savedPct).toBeCloseTo(-10, 10);
  });

  it("counts spend only from the current year", () => {
    const kpis = dashboardKpis(
      records([
        quoteRow({ id: "a", booking: bookingRow({ allIn: 1800 }) }),
        quoteRow({
          id: "b",
          createdAt: at("2025-11-02T10:00:00Z"),
          booking: bookingRow({ allIn: 5000, createdAt: at("2025-11-02T10:00:00Z") }),
        }),
      ]),
      NOW,
    );

    expect(kpis.spendYtd).toBe(1800);
    expect(kpis.bookingsYtd).toBe(1);
  });
});

describe("cabinetTotals", () => {
  it("totals savings across every booking, not just this month", () => {
    const totals = cabinetTotals(
      records([
        quoteRow({ id: "a", benchmarkMedian: 2000, booking: bookingRow({ allIn: 1800 }) }),
        quoteRow({
          id: "b",
          benchmarkMedian: 2000,
          createdAt: at("2026-05-02T10:00:00Z"),
          booking: bookingRow({ allIn: 1600, createdAt: at("2026-05-02T10:00:00Z") }),
        }),
      ]),
      NOW,
    );

    expect(totals.savedTotal).toBe(600);
    expect(totals.spendYtd).toBe(3400);
    expect(totals.quotesThisMonth).toBe(1);
  });

  it("has no average to state without a booking", () => {
    expect(cabinetTotals(records([quoteRow()]), NOW).savedPct).toBeNull();
  });
});

describe("topCarriers", () => {
  it("ranks by booking count and scales the bars against the leader", () => {
    const usage = topCarriers(
      records([
        quoteRow({ id: "a", booking: bookingRow({ carrierId: "MSK" }) }),
        quoteRow({ id: "b", booking: bookingRow({ carrierId: "MSK" }) }),
        quoteRow({ id: "c", booking: bookingRow({ carrierId: "DHL" }) }),
        quoteRow({ id: "d" }),
      ]),
    );

    expect(usage).toEqual([
      { carrierId: "MSK", count: 2, sharePct: 100 },
      { carrierId: "DHL", count: 1, sharePct: 50 },
    ]);
  });

  it("is empty without bookings", () => {
    expect(topCarriers(records([quoteRow()]))).toEqual([]);
  });
});
