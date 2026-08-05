import { describe, expect, it } from "vitest";
import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";
import uz from "@/i18n/messages/uz.json";
import { shipDateLabel } from "../dates";

// A stand-in for next-intl's `t` over the real message files, so these assert the
// shipped strings rather than fixtures. Only the placeholder substitution that
// `dateFmt` uses is reproduced.
const translator = (common: Record<string, string>) =>
  ((key: string, values?: Record<string, string>) =>
    common[key].replace(/\{(\w+)\}/g, (_, name: string) =>
      values ? values[name] : "",
    )) as unknown as Parameters<typeof shipDateLabel>[0];

describe("shipDateLabel", () => {
  it("renders each locale's own pattern and month name", () => {
    expect(shipDateLabel(translator(en.common), "2026-08-26")).toBe("August 26, 2026");
    expect(shipDateLabel(translator(ru.common), "2026-08-26")).toBe("26 августа 2026 г.");
    expect(shipDateLabel(translator(uz.common), "2026-08-26")).toBe("26-avgust, 2026");
  });

  it("drops the leading zero from the day", () => {
    expect(shipDateLabel(translator(en.common), "2026-08-05")).toBe("August 5, 2026");
  });

  it("leaves the year ungrouped", () => {
    expect(shipDateLabel(translator(en.common), "2026-01-01")).toContain("2026");
    expect(shipDateLabel(translator(en.common), "2026-01-01")).not.toContain("2,026");
  });

  it("maps every month", () => {
    const months = Array.from({ length: 12 }, (_, index) =>
      shipDateLabel(translator(en.common), `2026-${String(index + 1).padStart(2, "0")}-01`),
    );
    expect(months[0]).toBe("January 1, 2026");
    expect(months[11]).toBe("December 1, 2026");
    expect(new Set(months).size).toBe(12);
  });
});
