import { DEFAULT_SPEC, STEP_COUNT, defaultShipDate, type WizardSpec } from "@/lib/wizard/spec";

// The Mini App is one route with a state machine, not a route per screen — that
// is how the comp models it and it is what Telegram's BackButton expects. There
// is no URL to mirror: Telegram owns the chrome, and a webview has no address
// bar for a user to read or share.

export type Screen = "start" | "wizard" | "results" | "home" | "ships" | "done";

export type TmaState = {
  screen: Screen;
  step: number;
  guest: boolean;
  /** The gate sheet. Signup for a guest, booking confirm for a member. */
  gate: boolean;
  fetching: boolean;
  spec: WizardSpec;
};

export type TmaAction =
  | { type: "go"; screen: Screen }
  | { type: "goStep"; step: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "openGate" }
  | { type: "closeGate" }
  | { type: "fetchStart" }
  | { type: "fetchDone" }
  | { type: "patchSpec"; patch: Partial<WizardSpec> }
  | { type: "signedIn" };

export function initialState(guest: boolean, date = defaultShipDate()): TmaState {
  return {
    screen: "start",
    step: 1,
    guest,
    gate: false,
    fetching: false,
    spec: { ...DEFAULT_SPEC, date },
  };
}

const clamp = (step: number) => Math.min(STEP_COUNT, Math.max(1, step));

// Back order, from the comp: close the sheet, else step back in the wizard, else
// leave the wizard, else return to where the screen came from.
function back(state: TmaState): TmaState {
  if (state.gate) return { ...state, gate: false };
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

export function reduce(state: TmaState, action: TmaAction): TmaState {
  switch (action.type) {
    case "go":
      return { ...state, screen: action.screen, gate: false };
    case "goStep":
      return { ...state, screen: "wizard", step: clamp(action.step), gate: false };
    case "next":
      return state.screen === "wizard" && state.step < STEP_COUNT
        ? { ...state, step: state.step + 1 }
        : state;
    case "back":
      return back(state);
    case "openGate":
      return { ...state, gate: true };
    case "closeGate":
      return { ...state, gate: false };
    case "fetchStart":
      return { ...state, screen: "results", gate: false, fetching: true };
    case "fetchDone":
      return { ...state, fetching: false };
    case "patchSpec":
      return { ...state, spec: { ...state.spec, ...action.patch } };
    case "signedIn":
      return { ...state, guest: false, gate: false };
  }
}

/** Telegram's BackButton is hidden only on the first screen, as in the comp. */
export const showBackButton = (state: TmaState) =>
  state.gate || state.screen !== "start";

/** The header's per-screen title and subtitle both come from the `tma.head` keys. */
export const headKey = (state: TmaState) =>
  state.screen === "wizard" ? "calc" : state.screen === "start" ? "start" : state.screen;
