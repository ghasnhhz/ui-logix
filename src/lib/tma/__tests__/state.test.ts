import { describe, expect, it } from "vitest";
import { STEP_COUNT } from "@/lib/wizard/spec";
import {
  headKey,
  initialState,
  reduce,
  showBackButton,
  type TmaState,
} from "@/lib/tma/state";

const at = (patch: Partial<TmaState>): TmaState => ({
  ...initialState(true, "2026-09-11"),
  ...patch,
});

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
    expect(reduce(state, { type: "fetchDone" }).fetching).toBe(false);
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
