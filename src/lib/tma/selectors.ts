import { isSameQuote, type Quote } from "@/lib/pricing";
import type { CabinetRecord } from "@/lib/cabinet/records";
import type { CabTab, TmaState } from "./state";

// Derived reads over the one state object. Nothing here computes a figure —
// `lib/cabinet/metrics.ts` owns every KPI, on both surfaces.

/**
 * The tapped card, found in the array the server persisted (D-055) — the same
 * match `POST /api/bookings` makes against the same rows, so nothing on screen
 * can be a row the handler would reject.
 */
export function selectedQuote(state: TmaState): Quote | null {
  const key = state.selected;
  if (!key) return null;
  return state.quotes.find((quote) => isSameQuote(quote, key)) ?? null;
}

/** Telegram's BackButton is hidden only on the first screen, as in the comp. */
export const showBackButton = (state: TmaState) => state.gate || state.screen !== "start";

/** The header's per-screen title and subtitle both come from the `tma.head` keys. */
export const headKey = (state: TmaState) =>
  state.screen === "wizard" ? "calc" : state.screen === "start" ? "start" : state.screen;

// The cabinet's own union is already assembled server-side, so a tab is a filter
// over it rather than a second query.
export const recordsForTab = (records: CabinetRecord[], tab: CabTab) =>
  tab === "all" ? records : records.filter((record) => record.booked === (tab === "shipments"));

// The comp shows three. It filters to shipments; we keep the union, because a
// new account that has only ever run quotes would otherwise read as empty on a
// dashboard that just told it how many quotes it has.
export const RECENT_LIMIT = 3;

export const recentRecords = (records: CabinetRecord[]) => records.slice(0, RECENT_LIMIT);
