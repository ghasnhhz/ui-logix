import { describe, expect, it } from "vitest";
import { STEP_COUNT } from "@/lib/wizard/spec";
import { TONE, bookingReady, mainButtonFor, showTabs } from "@/lib/tma/main-button";
import { initialState, type TmaAccount, type TmaState } from "@/lib/tma/state";

const at = (patch: Partial<TmaState>): TmaState => ({
  ...initialState(true, "2026-09-11"),
  ...patch,
});

const ACCOUNT: TmaAccount = {
  email: "tg-999000111@telegram.u-logix.invalid",
  company: "Nazarov Trading LLC",
  phone: "+998901234567",
};

/** A member with the sheet open on a form the booking schema would accept. */
const bookable = (patch: Partial<TmaState> = {}): TmaState =>
  at({
    screen: "results",
    gate: true,
    guest: false,
    account: ACCOUNT,
    gateForm: { company: ACCOUNT.company, phone: ACCOUNT.phone!, email: "" },
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
    const filled = { company: "Nazarov Trading LLC", phone: "", email: "" };
    expect(mainButtonFor(at({ ...open, guest: true, gateForm: filled }))?.action).toBe("signup");
    expect(mainButtonFor(bookable({ ...open }))?.action).toBe("confirmBooking");
  });

  // Telegram's button is the sheet's only submit control, so it carries the
  // form's readiness — there is no in-page button to grey out instead.
  it("disables signup until a company is typed, and spins while it submits", () => {
    const open = { screen: "wizard", step: STEP_COUNT, gate: true, guest: true } as const;
    expect(mainButtonFor(at({ ...open }))?.action).toBeNull();
    expect(mainButtonFor(at({ ...open, gateForm: { company: " N ", phone: "", email: "" } }))?.action)
      .toBeNull();

    const submitting = mainButtonFor(
      at({
        ...open,
        gateForm: { company: "Nazarov Trading LLC", phone: "", email: "" },
        submitting: true,
      })
    );
    expect(submitting).toMatchObject({ progress: true, tone: "amber" });
    expect(submitting?.action).toBeNull();
  });

  it("lets the open sheet own the button over the screen behind it", () => {
    expect(mainButtonFor(bookable({ fetching: false }))?.action).toBe("confirmBooking");
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

describe("bookingReady", () => {
  it("wants a company and a phone, even though signup let the phone go", () => {
    expect(bookingReady(bookable())).toBe(true);
    expect(bookingReady(bookable({ gateForm: { company: "N", phone: "+998901234567", email: "" } }))).toBe(false);
    expect(bookingReady(bookable({ gateForm: { company: "Nazarov", phone: "+998", email: "" } }))).toBe(false);
  });

  it("treats a blank email as the account's own address", () => {
    expect(bookingReady(bookable({ gateForm: { company: "Nazarov", phone: "+998901234567", email: "  " } }))).toBe(true);
    // No account to fall back to — the dev mock, and nothing in production.
    expect(bookingReady(bookable({ account: null }))).toBe(false);
  });

  it("rejects an unfinished address and accepts a real one", () => {
    const form = { company: "Nazarov", phone: "+998901234567" };
    expect(bookingReady(bookable({ gateForm: { ...form, email: "alisher@" } }))).toBe(false);
    expect(bookingReady(bookable({ gateForm: { ...form, email: "alisher@nazarov.uz" } }))).toBe(true);
  });

  it("stays false while the booking is in flight", () => {
    expect(bookingReady(bookable({ submitting: true }))).toBe(false);
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
