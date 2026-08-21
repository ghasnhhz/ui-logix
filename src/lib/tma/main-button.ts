import { STEP_COUNT } from "@/lib/wizard/spec";
import type { TmaState } from "./state";

// D-047: one label/colour/action triple recomputed per state, rendered by
// Telegram itself. Nothing in the page duplicates it.

export type MainButtonTone = "amber" | "blue" | "navy" | "muted";

export type MainButtonAction =
  | "startWizard"
  | "next"
  | "getQuotes"
  | "signup"
  | "confirmBooking"
  | "goShips"
  | "newRequest";

/** Keys under the `tma.main` namespace — a union so `t()` stays typechecked. */
export type MainLabelKey =
  | "tryIt"
  | "continue"
  | "getQuotes"
  | "fetching"
  | "createAndSee"
  | "confirmBook"
  | "newRequest"
  | "trackShipment";

export type MainButtonSpec = {
  labelKey: MainLabelKey;
  tone: MainButtonTone;
  action: MainButtonAction | null;
  progress: boolean;
};

// MASTER § 5: a primary button is an amber fill with amber-ink text. The comp
// paints the label white, which reaches about 2:1 on that fill — we keep the
// fill and take the design system's text colour.
export const TONE: Record<MainButtonTone, { color: string; textColor: string }> = {
  amber: { color: "#F5A623", textColor: "#3B2600" },
  blue: { color: "#2563EB", textColor: "#FFFFFF" },
  navy: { color: "#16233F", textColor: "#FFFFFF" },
  muted: { color: "#94A3B8", textColor: "#FFFFFF" },
};

export function mainButtonFor(state: TmaState): MainButtonSpec | null {
  if (state.screen === "start") {
    return { labelKey: "tryIt", tone: "amber", action: "startWizard", progress: false };
  }

  if (state.gate) {
    return state.guest
      ? { labelKey: "createAndSee", tone: "amber", action: "signup", progress: false }
      : { labelKey: "confirmBook", tone: "amber", action: "confirmBooking", progress: false };
  }

  if (state.screen === "wizard") {
    return state.step === STEP_COUNT
      ? { labelKey: "getQuotes", tone: "amber", action: "getQuotes", progress: false }
      : { labelKey: "continue", tone: "blue", action: "next", progress: false };
  }

  // Fetching owns the button so the user cannot leave mid-request; Telegram
  // renders the spinner itself.
  if (state.screen === "results" && state.fetching) {
    return { labelKey: "fetching", tone: "muted", action: null, progress: true };
  }

  if (state.screen === "done") {
    return { labelKey: "trackShipment", tone: "navy", action: "goShips", progress: false };
  }

  if (state.screen === "home") {
    return { labelKey: "newRequest", tone: "navy", action: "newRequest", progress: false };
  }

  return null;
}

/**
 * The tab bar is ours, and it yields to Telegram's button: it shows only when
 * nothing else owns the bottom of the screen and the user has an account.
 */
export const showTabs = (state: TmaState) =>
  !mainButtonFor(state) && !state.gate && !state.guest;
