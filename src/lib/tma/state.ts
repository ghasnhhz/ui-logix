import type { Quote, QuoteKey } from "@/lib/pricing";
import type { ApiError } from "@/lib/ui/api-client";
import { DEFAULT_SPEC, STEP_COUNT, defaultShipDate, type WizardSpec } from "@/lib/wizard/spec";

// The Mini App is one route with a state machine, not a route per screen — that
// is how the comp models it and it is what Telegram's BackButton expects. There
// is no URL to mirror: Telegram owns the chrome, and a webview has no address
// bar for a user to read or share.

export type Screen = "start" | "wizard" | "results" | "home" | "ships" | "done";

/** The sheet's fields. Telegram supplies none of them. Signup ignores `email`. */
export type GateForm = { company: string; phone: string; email: string };

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
  | { type: "signedIn"; account?: TmaAccount };

export function initialState(guest: boolean, date = defaultShipDate()): TmaState {
  return {
    screen: "start",
    step: 1,
    guest,
    gate: false,
    fetching: false,
    submitting: false,
    error: null,
    spec: { ...DEFAULT_SPEC, date },
    gateForm: { company: "", phone: "", email: "" },
    account: null,
    quoteId: null,
    quotes: [],
    selected: null,
    bookedRef: null,
  };
}

const clamp = (step: number) => Math.min(STEP_COUNT, Math.max(1, step));

// Back order, from the comp: close the sheet, else step back in the wizard, else
// leave the wizard, else return to where the screen came from.
function back(state: TmaState): TmaState {
  if (state.gate) return { ...state, gate: false, error: null };
  switch (state.screen) {
    case "wizard":
      return state.step > 1
        ? { ...state, step: state.step - 1 }
        : { ...state, screen: "start" };
    case "results":
      return { ...state, screen: "wizard", step: STEP_COUNT };
    case "done":
      return { ...state, screen: "ships" };
    case "start":
      return state;
    default:
      return { ...state, screen: state.guest ? "wizard" : "home" };
  }
}

// The booking sheet asks for the same two fields the account already holds, so
// they arrive filled. `email` stays empty on purpose: the account's address is
// the synthetic `tg-…@telegram.u-logix.invalid` one (D-054) and showing it in a
// field would read as a real inbox.
function seedGate(form: GateForm, account: TmaAccount | undefined): GateForm {
  if (!account) return form;
  return { ...form, company: account.company, phone: account.phone ?? form.phone };
}

export function reduce(state: TmaState, action: TmaAction): TmaState {
  switch (action.type) {
    case "go":
      return { ...state, screen: action.screen, gate: false };
    case "goStep":
      return { ...state, screen: "wizard", step: clamp(action.step), gate: false, error: null };
    case "next":
      return state.screen === "wizard" && state.step < STEP_COUNT
        ? { ...state, step: state.step + 1 }
        : state;
    case "back":
      return back(state);
    case "openGate":
      return { ...state, gate: true, error: null };
    case "closeGate":
      return { ...state, gate: false, error: null };
    case "selectQuote":
      return { ...state, selected: action.quote };
    case "patchGate":
      return { ...state, gateForm: { ...state.gateForm, ...action.patch } };
    case "submitStart":
      return { ...state, submitting: true, error: null };
    case "submitFailed":
      return { ...state, submitting: false, error: action.error };
    case "fetchStart":
      // The old quote goes with the old request: a second run must not leave
      // last run's prices on screen while this one is still in flight.
      return {
        ...state,
        screen: "results",
        gate: false,
        fetching: true,
        submitting: false,
        error: null,
        quoteId: null,
        quotes: [],
        selected: null,
        bookedRef: null,
      };
    case "fetchDone":
      return { ...state, fetching: false, quoteId: action.quoteId, quotes: action.quotes };
    // The account already exists by now, so the review step's button reads
    // "Get carrier quotes" and retrying is one tap.
    case "fetchFailed":
      return {
        ...state,
        fetching: false,
        screen: "wizard",
        step: STEP_COUNT,
        error: action.error,
      };
    // `selected` and `quotes` survive: the done screen renders the booked row
    // out of them rather than being handed a second copy of the same numbers.
    case "booked":
      return {
        ...state,
        submitting: false,
        gate: false,
        error: null,
        screen: "done",
        bookedRef: action.reference,
      };
    case "patchSpec":
      return { ...state, spec: { ...state.spec, ...action.patch }, error: null };
    case "signedIn":
      return {
        ...state,
        guest: false,
        gate: false,
        submitting: false,
        account: action.account ?? state.account,
        gateForm: seedGate(state.gateForm, action.account),
      };
  }
}

/** Telegram's BackButton is hidden only on the first screen, as in the comp. */
export const showBackButton = (state: TmaState) =>
  state.gate || state.screen !== "start";

/** The header's per-screen title and subtitle both come from the `tma.head` keys. */
export const headKey = (state: TmaState) =>
  state.screen === "wizard" ? "calc" : state.screen === "start" ? "start" : state.screen;
