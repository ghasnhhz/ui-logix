import { describe, expect, it } from "vitest";
import { SYNTHETIC_EMAIL_DOMAIN, syntheticEmail } from "../telegram-email";

describe("syntheticEmail", () => {
  it("builds an address from the telegram id", () => {
    expect(syntheticEmail("99281")).toBe("tg-99281@telegram.u-logix.invalid");
  });

  // The whole guarantee: `.invalid` is reserved, so this address can never
  // collide with one a real person owns and nothing will ever deliver to it.
  it("stays on the reserved .invalid domain", () => {
    expect(SYNTHETIC_EMAIL_DOMAIN.endsWith(".invalid")).toBe(true);
    expect(syntheticEmail("1")).toMatch(/@[\w.-]+\.invalid$/);
  });

  it("is unique per telegram id", () => {
    expect(syntheticEmail("1")).not.toBe(syntheticEmail("2"));
  });
});
