import { describe, expect, it } from "vitest";
import { STEP_COUNT } from "@/lib/wizard/spec";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { headKey, recordsForTab, showBackButton } from "@/lib/tma/selectors";
import {
  initialState,
  reduce,
  type TmaAccount,
  type TmaState,
} from "@/lib/tma/state";

const at = (patch: Partial<TmaState>): TmaState => ({
  ...initialState(true, "2026-09-11"),
  ...patch,
});

const QUOTES = [{ carrierId: "MSK", mode: "LTL" }] as unknown as TmaState["quotes"];

const ACCOUNT: TmaAccount = {
  email: "tg-999000111@telegram.u-logix.invalid",
  company: "Nazarov Trading LLC",
  phone: "+998901234567",
};

describe("initialState", () => {
  it("starts a guest on the welcome screen with the comp's shipment", () => {
    const state = initialState(true, "2026-09-11");
    expect(state).toMatchObject({ screen: "start", step: 1, guest: true, gate: false });
    expect(state.spec).toMatchObject({ origin: "TAS", destination: "ALA", mode: "LTL" });
    expect(state.spec.date).toBe("2026-09-11");
  });
});

describe("reduce", () => {
  it("advances the wizard and stops at the last step", () => {
    expect(reduce(at({ screen: "wizard", step: 2 }), { type: "next" }).step).toBe(3);
    expect(reduce(at({ screen: "wizard", step: STEP_COUNT }), { type: "next" }).step).toBe(
      STEP_COUNT
    );
  });

  it("only advances on the wizard screen", () => {
    const home = at({ screen: "home", step: 3 });
    expect(reduce(home, { type: "next" })).toBe(home);
  });

  it("clamps a jump to a step that does not exist", () => {
    expect(reduce(at({}), { type: "goStep", step: 99 }).step).toBe(STEP_COUNT);
    expect(reduce(at({}), { type: "goStep", step: 0 }).step).toBe(1);
  });

  it("closes the sheet before anything else on back", () => {
    const next = reduce(at({ screen: "wizard", step: 5, gate: true }), { type: "back" });
    expect(next).toMatchObject({ gate: false, screen: "wizard", step: 5 });
  });

  it("walks back through the wizard and out to the start screen", () => {
    const step1 = reduce(at({ screen: "wizard", step: 2 }), { type: "back" });
    expect(step1).toMatchObject({ screen: "wizard", step: 1 });
    expect(reduce(step1, { type: "back" }).screen).toBe("start");
  });

  it("returns from results to the review step, and from done to the cabinet", () => {
    expect(reduce(at({ screen: "results" }), { type: "back" })).toMatchObject({
      screen: "wizard",
      step: STEP_COUNT,
    });
    expect(reduce(at({ screen: "done" }), { type: "back" }).screen).toBe("ships");
  });

  it("sends a member home from the cabinet and a guest back to the wizard", () => {
    expect(reduce(at({ screen: "ships", guest: false }), { type: "back" }).screen).toBe("home");
    expect(reduce(at({ screen: "ships", guest: true }), { type: "back" }).screen).toBe("wizard");
  });

  it("goes nowhere back from the start screen", () => {
    const start = at({ screen: "start" });
    expect(reduce(start, { type: "back" })).toBe(start);
  });

  it("moves to results and clears the sheet when a fetch starts", () => {
    const state = reduce(at({ screen: "wizard", gate: true }), { type: "fetchStart" });
    expect(state).toMatchObject({ screen: "results", fetching: true, gate: false });
  });

  it("drops the previous quote when a new fetch starts", () => {
    const state = reduce(
      at({ quoteId: "q_old", quotes: QUOTES, selected: QUOTES[0] }),
      { type: "fetchStart" }
    );
    expect(state).toMatchObject({ quoteId: null, quotes: [], selected: null });
  });

  it("carries the persisted quote onto the results screen", () => {
    const state = reduce(at({ screen: "results", fetching: true }), {
      type: "fetchDone",
      quoteId: "q_1",
      quotes: QUOTES,
    });
    expect(state).toMatchObject({ fetching: false, quoteId: "q_1", quotes: QUOTES });
  });

  // The account exists by the time a fetch can fail, so review's button reads
  // "Get carrier quotes" and retrying costs one tap.
  it("returns a failed fetch to the review step with the error", () => {
    const state = reduce(at({ screen: "results", fetching: true }), {
      type: "fetchFailed",
      error: { message: "nope" },
    });
    expect(state).toMatchObject({
      screen: "wizard",
      step: STEP_COUNT,
      fetching: false,
      error: { message: "nope" },
    });
  });

  it("keeps the sheet open on a failed signup and clears the error on retry", () => {
    const failed = reduce(at({ gate: true, submitting: true }), {
      type: "submitFailed",
      error: { message: "nope" },
    });
    expect(failed).toMatchObject({ gate: true, submitting: false, error: { message: "nope" } });
    expect(reduce(failed, { type: "submitStart" })).toMatchObject({
      submitting: true,
      error: null,
    });
  });

  it("patches one gate field at a time", () => {
    const state = reduce(at({}), { type: "patchGate", patch: { company: "Nazarov" } });
    expect(state.gateForm).toEqual({ company: "Nazarov", phone: "", email: "" });
  });

  it("patches the shipment without replacing it", () => {
    const state = reduce(at({}), { type: "patchSpec", patch: { destination: "RTM" } });
    expect(state.spec).toMatchObject({ origin: "TAS", destination: "RTM", weight: 850 });
  });

  it("signing in drops guest and the sheet together", () => {
    expect(reduce(at({ gate: true }), { type: "signedIn" })).toMatchObject({
      guest: false,
      gate: false,
    });
  });

  // The booking sheet asks for what the account already holds, so it arrives
  // filled — but never with the synthetic address (D-054) in the email field.
  it("seeds the sheet from the account it signs in with", () => {
    const state = reduce(at({}), { type: "signedIn", account: ACCOUNT });
    expect(state.account).toEqual(ACCOUNT);
    expect(state.gateForm).toEqual({
      company: "Nazarov Trading LLC",
      phone: "+998901234567",
      email: "",
    });
  });

  it("keeps a typed phone when the account has none", () => {
    const typed = at({ gateForm: { company: "", phone: "+998901112233", email: "" } });
    const state = reduce(typed, { type: "signedIn", account: { ...ACCOUNT, phone: null } });
    expect(state.gateForm.phone).toBe("+998901112233");
  });

  it("keeps the booked row on screen so the done screen can render it", () => {
    const state = reduce(
      at({ gate: true, submitting: true, quotes: QUOTES, selected: QUOTES[0] }),
      { type: "booked", reference: "ULQ-2026-213587" }
    );
    expect(state).toMatchObject({
      screen: "done",
      gate: false,
      submitting: false,
      bookedRef: "ULQ-2026-213587",
      quotes: QUOTES,
      selected: QUOTES[0],
    });
  });

  it("drops a stale reference when the next request starts", () => {
    const state = reduce(at({ bookedRef: "ULQ-2026-213587" }), { type: "fetchStart" });
    expect(state.bookedRef).toBeNull();
  });
});

describe("chrome derivations", () => {
  it("hides the back button only on the bare start screen", () => {
    expect(showBackButton(at({ screen: "start" }))).toBe(false);
    expect(showBackButton(at({ screen: "start", gate: true }))).toBe(true);
    expect(showBackButton(at({ screen: "wizard" }))).toBe(true);
  });

  it("maps every screen to a head key", () => {
    expect(headKey(at({ screen: "wizard" }))).toBe("calc");
    expect(headKey(at({ screen: "start" }))).toBe("start");
    expect(headKey(at({ screen: "ships" }))).toBe("ships");
  });
});

describe("the cabinet slice", () => {
  const RECORDS = [
    { quoteId: "q1", booked: true },
    { quoteId: "q2", booked: false },
  ] as unknown as CabinetRecord[];

  it("keeps null and empty apart", () => {
    expect(at({}).records).toBeNull();
    const loaded = reduce(at({ recordsLoading: true }), {
      type: "recordsDone",
      records: [],
      now: "2026-08-27T00:00:00.000Z",
    });
    expect(loaded.records).toEqual([]);
    expect(loaded.recordsLoading).toBe(false);
    expect(loaded.recordsAt).toBe("2026-08-27T00:00:00.000Z");
  });

  it("clears the error when a retry starts", () => {
    const failed = reduce(at({}), {
      type: "recordsFailed",
      error: { message: "nope" },
    });
    expect(failed.recordsError).not.toBeNull();
    expect(reduce(failed, { type: "recordsStart" }).recordsError).toBeNull();
  });

  it("drops the loaded rows when a booking lands, so the cabinet re-reads", () => {
    const loaded = at({ records: RECORDS, recordsAt: "2026-08-27T00:00:00.000Z" });
    const booked = reduce(loaded, { type: "booked", reference: "ULQ-2026-810850" });
    expect(booked.records).toBeNull();
    expect(booked.recordsAt).toBeNull();
  });

  it("filters the union by tab", () => {
    expect(recordsForTab(RECORDS, "all")).toHaveLength(2);
    expect(recordsForTab(RECORDS, "shipments")).toEqual([RECORDS[0]]);
    expect(recordsForTab(RECORDS, "quotes")).toEqual([RECORDS[1]]);
  });

  it("re-announces a repeated toast through the nonce", () => {
    const once = reduce(at({}), { type: "flash", key: "csv" });
    const twice = reduce(once, { type: "flash", key: "csv" });
    expect(twice.toast?.nonce).toBeGreaterThan(once.toast!.nonce);
    expect(reduce(twice, { type: "dismissToast" }).toast).toBeNull();
  });
});
