import { describe, expect, it } from "vitest";
import { STEP_COUNT } from "@/lib/wizard/spec";
import { TONE, mainButtonFor, showTabs } from "@/lib/tma/main-button";
import { initialState, type TmaState } from "@/lib/tma/state";

const at = (patch: Partial<TmaState>): TmaState => ({
  ...initialState(true, "2026-09-11"),
  ...patch,
});

describe("mainButtonFor", () => {
  it("offers the amber try-it button on the start screen", () => {
    expect(mainButtonFor(at({ screen: "start" }))).toMatchObject({
      labelKey: "tryIt",
      tone: "amber",
      action: "startWizard",
    });
  });

  it("continues in blue through the wizard and turns amber on review", () => {
    expect(mainButtonFor(at({ screen: "wizard", step: 1 }))).toMatchObject({
      labelKey: "continue",
      tone: "blue",
      action: "next",
    });
    expect(mainButtonFor(at({ screen: "wizard", step: STEP_COUNT }))).toMatchObject({
      labelKey: "getQuotes",
      tone: "amber",
      action: "getQuotes",
    });
  });

  it("switches the sheet's button between signup and booking", () => {
    const open = { screen: "wizard", step: STEP_COUNT, gate: true } as const;
    expect(mainButtonFor(at({ ...open, guest: true }))?.action).toBe("signup");
    expect(mainButtonFor(at({ ...open, guest: false }))?.action).toBe("confirmBooking");
  });

  it("lets the open sheet own the button over the screen behind it", () => {
    const behind = at({ screen: "results", fetching: false, gate: true, guest: false });
    expect(mainButtonFor(behind)?.action).toBe("confirmBooking");
  });

  it("takes the button over while rates are fetching, with no action", () => {
    const spec = mainButtonFor(at({ screen: "results", fetching: true }));
    expect(spec).toMatchObject({ labelKey: "fetching", tone: "muted", progress: true });
    expect(spec?.action).toBeNull();
  });

  it("has nothing to offer on ready results or the cabinet", () => {
    expect(mainButtonFor(at({ screen: "results", fetching: false }))).toBeNull();
    expect(mainButtonFor(at({ screen: "ships", guest: false }))).toBeNull();
  });

  it("paints amber with amber-ink rather than the white the comp uses", () => {
    expect(TONE.amber).toEqual({ color: "#F5A623", textColor: "#3B2600" });
  });
});

describe("showTabs", () => {
  it("shows only for a member with no button and no sheet", () => {
    expect(showTabs(at({ screen: "ships", guest: false }))).toBe(true);
    expect(showTabs(at({ screen: "ships", guest: true }))).toBe(false);
    expect(showTabs(at({ screen: "ships", guest: false, gate: true }))).toBe(false);
    expect(showTabs(at({ screen: "home", guest: false }))).toBe(false);
  });
});
