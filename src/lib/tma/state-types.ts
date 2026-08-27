import type { CabinetRecord } from "@/lib/cabinet/records";
import type { Quote, QuoteKey } from "@/lib/pricing";
import type { ApiError } from "@/lib/ui/api-client";
import type { WizardSpec } from "@/lib/wizard/spec";

// The shape of the one state object the Mini App runs on. Split from the reducer
// so neither file outgrows the 200-line rule; `state.ts` re-exports all of it, so
// every call site still imports from there.

export type Screen = "start" | "wizard" | "results" | "home" | "ships" | "done";

/** The sheet's fields. Telegram supplies none of them. Signup ignores `email`. */
export type GateForm = { company: string; phone: string; email: string };

/** The cabinet's three tabs, matching the web cabinet's own filter. */
export type CabTab = "all" | "shipments" | "quotes";

/** Keys under `tma.toast`. The nonce lets the same message fire twice. */
export type ToastKey = "csv" | "requote";

/** What the server said the account is, once it has verified `initData`. */
export type TmaAccount = { email: string; company: string; phone: string | null };

export type TmaState = {
  screen: Screen;
  step: number;
  guest: boolean;
  /** The gate sheet. Signup for a guest, booking confirm for a member. */
  gate: boolean;
  fetching: boolean;
  /** The sheet's request is in flight — it stays up and shows progress. */
  submitting: boolean;
  error: ApiError | null;
  spec: WizardSpec;
  gateForm: GateForm;
  account: TmaAccount | null;
  // Prices only exist here once the server has persisted them, so a guest has
  // no way to hold one: the account, the session and the row all come first.
  quoteId: string | null;
  quotes: Quote[];
  /** The card the user tapped Book on. */
  selected: QuoteKey | null;
  bookedRef: string | null;
  // The cabinet's rows, loaded once per session from `GET /api/cabinet`. `null`
  // means not loaded rather than empty — an account with no history is a real
  // state with its own screen, and the two must not render the same.
  records: CabinetRecord[] | null;
  /** The server's instant, so the KPI windows bucket as they do on the web. */
  recordsAt: string | null;
  recordsLoading: boolean;
  recordsError: ApiError | null;
  cabTab: CabTab;
  toast: { key: ToastKey; nonce: number } | null;
};

export type TmaAction =
  | { type: "go"; screen: Screen }
  | { type: "goStep"; step: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "openGate" }
  | { type: "closeGate" }
  | { type: "selectQuote"; quote: QuoteKey }
  | { type: "patchGate"; patch: Partial<GateForm> }
  | { type: "submitStart" }
  | { type: "submitFailed"; error: ApiError }
  | { type: "fetchStart" }
  | { type: "fetchDone"; quoteId: string; quotes: Quote[] }
  | { type: "fetchFailed"; error: ApiError }
  | { type: "booked"; reference: string }
  | { type: "patchSpec"; patch: Partial<WizardSpec> }
  | { type: "signedIn"; account?: TmaAccount }
  | { type: "recordsStart" }
  | { type: "recordsDone"; records: CabinetRecord[]; now: string }
  | { type: "recordsFailed"; error: ApiError }
  | { type: "setCabTab"; tab: CabTab }
  | { type: "flash"; key: ToastKey }
  | { type: "dismissToast" };
