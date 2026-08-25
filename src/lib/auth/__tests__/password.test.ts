import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("verifyPassword", () => {
  it("accepts the password it was hashed from", async () => {
    const hash = await hashPassword("UlogixDemo2026!");

    expect(await verifyPassword("UlogixDemo2026!", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("UlogixDemo2026!");

    expect(await verifyPassword("ulogixdemo2026!", hash)).toBe(false);
  });

  // A Telegram account has no password (D-046) and neither does a row that does
  // not exist. Both must be false, and neither may throw.
  it("rejects a null hash", async () => {
    expect(await verifyPassword("anything at all", null)).toBe(false);
  });

  it("rejects a null hash even for an empty password", async () => {
    expect(await verifyPassword("", null)).toBe(false);
  });
});
