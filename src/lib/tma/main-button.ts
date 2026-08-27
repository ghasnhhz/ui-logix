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

// The shared schemas' own minimums — signupSchema for the company, and
// bookingRequestSchema for the phone. Telegram's button is the sheet's only
// submit control, so an incomplete form has to disable that rather than an
// in-page one.
const MIN_COMPANY = 2;
const MIN_PHONE = 6;

// Deliberately loose. `z.email()` on the server is the real check and its
// `invalidEmail` code renders on the field; this only stops the button
// enabling on something obviously unfinished.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking asks for a phone even though signup did not, because the booking
 * schema requires one. The email is optional: left blank it falls back to the
 * account address — so it is only required when there is no account to fall
 * back to, which is the dev mock and nothing else.
 */
export function bookingReady(state: TmaState) {
  const { company, phone, email } = state.gateForm;
  const typed = email.trim();
  const emailOk = typed ? EMAIL.test(typed) : state.account !== null;

  return (
    !state.submitting &&
    company.trim().length >= MIN_COMPANY &&
    phone.trim().length >= MIN_PHONE &&
    emailOk
  );
}

export function mainButtonFor(state: TmaState): MainButtonSpec | null {
  // The sheet is modal, so its button owns the bottom of the screen whatever is
  // behind it.
  if (state.gate) {
    if (!state.guest) {
      return {
        labelKey: "confirmBook",
        tone: "amber",
        action: bookingReady(state) ? "confirmBooking" : null,
        progress: state.submitting,
      };
    }

    const ready = state.gateForm.company.trim().length >= MIN_COMPANY && !state.submitting;
    return {
      labelKey: "createAndSee",
      tone: "amber",
      action: ready ? "signup" : null,
      progress: state.submitting,
    };
  }

  if (state.screen === "start") {
    return { labelKey: "tryIt", tone: "amber", action: "startWizard", progress: false };
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
