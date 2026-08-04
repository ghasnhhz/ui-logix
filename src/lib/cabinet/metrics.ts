import type { CarrierId } from "@/lib/pricing";
import { savingOf, type CabinetRecord } from "./records";

// Every window is UTC so a KPI does not shift with the server's timezone, and so
// the same record set always produces the same figure.
const monthStart = (date: Date, offset = 0) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));

const yearStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

const daysBefore = (date: Date, days: number) =>
  new Date(date.getTime() - days * 24 * 60 * 60 * 1000);

const within = (iso: string | null, from: Date, to?: Date) => {
  if (!iso) return false;
  const at = new Date(iso);
  return at >= from && (to === undefined || at < to);
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const booked = (records: CabinetRecord[]) => records.filter((record) => record.booked);

// Mean of each booking's own distance from its stored benchmark. Negative means
// the shipper paid under market. Averaged per booking rather than over the
// totals so one large shipment does not swallow the rest.
function averageVsMarketPct(records: CabinetRecord[]) {
  const usable = records.filter((record) => record.benchmarkMedian > 0);
  if (usable.length === 0) return null;
  const ratios = usable.map((record) => (record.allIn / record.benchmarkMedian - 1) * 100);
  return sum(ratios) / usable.length;
}

export type DashboardKpis = {
  activeCount: number;
  inTransit: number;
  pending: number;
  activeDelta: number | null;
  quotesThisMonth: number;
  convertedThisMonth: number;
  quotesDelta: number | null;
  savedThisMonth: number;
  savedPct: number | null;
  spendYtd: number;
  bookingsYtd: number;
};

export function dashboardKpis(records: CabinetRecord[], now: Date): DashboardKpis {
  const active = records.filter(
    (record) => record.status === "booked" || record.status === "transit",
  );

  const thisMonth = monthStart(now);
  const lastMonth = monthStart(now, -1);
  const quotesThisMonth = records.filter((record) => within(record.createdAt, thisMonth));
  const quotesLastMonth = records.filter((record) =>
    within(record.createdAt, lastMonth, thisMonth),
  );

  const week = daysBefore(now, 7);
  const priorWeek = daysBefore(now, 14);
  const bookedThisWeek = records.filter((record) => within(record.bookedAt, week));
  const bookedPriorWeek = records.filter((record) => within(record.bookedAt, priorWeek, week));

  const bookedThisMonth = records.filter((record) => within(record.bookedAt, thisMonth));
  const bookedYtd = records.filter((record) => within(record.bookedAt, yearStart(now)));

  return {
    activeCount: active.length,
    inTransit: active.filter((record) => record.status === "transit").length,
    pending: active.filter((record) => record.status === "booked").length,
    // A delta with no baseline period is not a delta — the caller hides the pill
    // rather than showing a growth figure against zero history.
    activeDelta: bookedPriorWeek.length === 0 ? null : bookedThisWeek.length - bookedPriorWeek.length,
    quotesThisMonth: quotesThisMonth.length,
    convertedThisMonth: quotesThisMonth.filter((record) => record.booked).length,
    quotesDelta: quotesLastMonth.length === 0 ? null : quotesThisMonth.length - quotesLastMonth.length,
    savedThisMonth: sum(bookedThisMonth.map(savingOf)),
    savedPct: averageVsMarketPct(bookedThisMonth),
    spendYtd: sum(bookedYtd.map((record) => record.allIn)),
    bookingsYtd: bookedYtd.length,
  };
}

export type CabinetTotals = {
  spendYtd: number;
  bookingsYtd: number;
  savedTotal: number;
  savedPct: number | null;
  quotesThisMonth: number;
};

export function cabinetTotals(records: CabinetRecord[], now: Date): CabinetTotals {
  const bookedYtd = records.filter((record) => within(record.bookedAt, yearStart(now)));
  const allBooked = booked(records);

  return {
    spendYtd: sum(bookedYtd.map((record) => record.allIn)),
    bookingsYtd: bookedYtd.length,
    savedTotal: sum(allBooked.map(savingOf)),
    savedPct: averageVsMarketPct(allBooked),
    quotesThisMonth: records.filter((record) => within(record.createdAt, monthStart(now))).length,
  };
}

export type CarrierUsage = { carrierId: CarrierId; count: number; sharePct: number };

// Usage bars are a share of the user's own bookings, so the leader is always at
// 100% and the rest read against it.
export function topCarriers(records: CabinetRecord[], limit = 4): CarrierUsage[] {
  const counts = new Map<CarrierId, number>();
  for (const record of booked(records)) {
    if (record.carrierId) counts.set(record.carrierId, (counts.get(record.carrierId) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const leader = ranked[0]?.[1] ?? 0;

  return ranked.map(([carrierId, count]) => ({
    carrierId,
    count,
    sharePct: leader === 0 ? 0 : Math.round((count / leader) * 100),
  }));
}
