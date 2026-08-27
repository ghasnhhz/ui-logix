import { DEFAULT_SPEC, STEP_COUNT, defaultShipDate } from "@/lib/wizard/spec";
import type { GateForm, TmaAccount, TmaAction, TmaState } from "./state-types";

// The Mini App is one route with a state machine, not a route per screen — that
// is how the comp models it and it is what Telegram's BackButton expects. There
// is no URL to mirror: Telegram owns the chrome, and a webview has no address
// bar for a user to read or share.

export type {
  CabTab,
  GateForm,
  Screen,
  TmaAccount,
  TmaAction,
  TmaState,
  ToastKey,
} from "./state-types";

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
    records: null,
    recordsAt: null,
    recordsLoading: false,
    recordsError: null,
    cabTab: "all",
    toast: null,
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

// The booking sheet asks for what the account already holds, so those arrive
// filled. `email` stays empty: the account's address is the synthetic
// `tg-…@telegram.u-logix.invalid` one (D-054), which would read as a real inbox.
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
        // Back from the done screen lands on the cabinet, which must not show
        // the row set from before this booking existed.
        records: null,
        recordsAt: null,
        recordsError: null,
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
    case "recordsStart":
      return { ...state, recordsLoading: true, recordsError: null };
    case "recordsDone":
      return {
        ...state,
        recordsLoading: false,
        records: action.records,
        recordsAt: action.now,
      };
    case "recordsFailed":
      return { ...state, recordsLoading: false, recordsError: action.error };
    case "setCabTab":
      return { ...state, cabTab: action.tab };
    // The nonce, not the key, is what makes a repeat re-announce: exporting the
    // CSV twice in a row must show the toast twice.
    case "flash":
      return { ...state, toast: { key: action.key, nonce: (state.toast?.nonce ?? 0) + 1 } };
    case "dismissToast":
      return { ...state, toast: null };
  }
}
