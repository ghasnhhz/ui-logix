import { describe, expect, it } from "vitest";
import { defaultShipDate, SHIP_LEAD_DAYS, specFromParams } from "../spec";

const at = (iso: string) => new Date(iso);

describe("defaultShipDate", () => {
  it("lands SHIP_LEAD_DAYS after the given day", () => {
    expect(SHIP_LEAD_DAYS).toBe(21);
    expect(defaultShipDate(at("2026-08-05T00:00:00.000Z"))).toBe("2026-08-26");
  });

  it("rolls over a month and a year", () => {
    expect(defaultShipDate(at("2026-08-20T00:00:00.000Z"))).toBe("2026-09-10");
    expect(defaultShipDate(at("2026-12-20T00:00:00.000Z"))).toBe("2027-01-10");
  });

  it("crosses a leap day", () => {
    expect(defaultShipDate(at("2028-02-20T00:00:00.000Z"))).toBe("2028-03-12");
  });

  // The value goes straight into a URL and into Quote.shipDate, so a late-evening
  // request must not report the following day.
  it("reads the same on either side of local midnight", () => {
    expect(defaultShipDate(at("2026-08-05T23:59:59.000Z"))).toBe("2026-08-26");
    expect(defaultShipDate(at("2026-08-05T00:00:01.000Z"))).toBe("2026-08-26");
  });

  it("does not mutate the date it was given", () => {
    const now = at("2026-08-05T00:00:00.000Z");
    defaultShipDate(now);
    expect(now.toISOString()).toBe("2026-08-05T00:00:00.000Z");
  });
});

describe("specFromParams", () => {
  it("falls back to the supplied date when the param is absent", () => {
    expect(specFromParams({}, "2026-09-01").date).toBe("2026-09-01");
  });

  it("prefers a well-formed date param over the fallback", () => {
    expect(specFromParams({ date: "2026-10-14" }, "2026-09-01").date).toBe("2026-10-14");
  });

  it("rejects a malformed date param", () => {
    expect(specFromParams({ date: "14/10/2026" }, "2026-09-01").date).toBe("2026-09-01");
    expect(specFromParams({ date: "" }, "2026-09-01").date).toBe("2026-09-01");
  });

  it("computes its own fallback when none is supplied", () => {
    expect(specFromParams({}).date).toBe(defaultShipDate());
  });

  it("leaves the other defaults alone", () => {
    expect(specFromParams({}, "2026-09-01")).toMatchObject({
      origin: "TAS",
      destination: "ALA",
      mode: "LTL",
      cargoType: "textiles",
      weight: 850,
    });
  });
});
