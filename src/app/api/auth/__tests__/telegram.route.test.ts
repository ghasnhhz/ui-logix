import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  freshFields,
  initData,
  TEST_BOT_TOKEN,
  VALID_FIELDS,
} from "@/lib/auth/__tests__/init-data";

const findUnique = vi.fn();
const setSessionCookie = vi.fn();

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } } }));
vi.mock("@/lib/auth/server", () => ({
  setSessionCookie: (...args: unknown[]) => setSessionCookie(...args),
}));

const { POST } = await import("../telegram/route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/auth/telegram", { method: "POST", body: JSON.stringify(body) }));

const MEMBER = {
  id: "usr_tg_1",
  email: "tg99281@ulogix.uz",
  company: "Silk Road Textiles",
  phone: "+998901234567",
};

// The route reads the token at call time, so it can be swapped per test. It is
// never returned, logged, or named in a response.
const originalToken = process.env.BOT_TOKEN;

beforeEach(() => {
  findUnique.mockReset();
  setSessionCookie.mockReset();
  process.env.BOT_TOKEN = TEST_BOT_TOKEN;
});

afterEach(() => {
  if (originalToken === undefined) delete process.env.BOT_TOKEN;
  else process.env.BOT_TOKEN = originalToken;
});

describe("POST /api/auth/telegram", () => {
  it("issues a session for a telegram account that exists", async () => {
    findUnique.mockResolvedValue(MEMBER);

    const response = await post({ initData: initData(freshFields()) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { authenticated: true, user: MEMBER } });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { telegramId: "99281" } })
    );
    expect(setSessionCookie).toHaveBeenCalledWith("usr_tg_1", "tg99281@ulogix.uz");
  });

  // A verified Telegram user with no row yet is a guest, not a failure — the
  // signup sheet in Feature 10 creates the account.
  it("reports a guest and sets no cookie when no account matches", async () => {
    findUnique.mockResolvedValue(null);

    const response = await post({ initData: initData(freshFields()) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { authenticated: false } });
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects a tampered hash without querying for a user", async () => {
    const params = new URLSearchParams(initData(freshFields()));
    params.set("hash", "0".repeat(64));

    const response = await post({ initData: params.toString() });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { message: "Invalid Telegram sign-in" } });
    expect(findUnique).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects initData signed with another bot's token", async () => {
    const response = await post({
      initData: initData(freshFields(), "654321:SOMEONE-ELSES-BOT"),
    });

    expect(response.status).toBe(401);
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects an expired auth_date", async () => {
    const stale = freshFields({
      auth_date: String(Math.floor(Date.now() / 1000) - 25 * 60 * 60),
    });

    const response = await post({ initData: initData(stale) });

    expect(response.status).toBe(401);
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  // VALID_FIELDS carries a fixed auth_date so the unit tests can pin a clock.
  // The route reads the real one, so a year-old signature is correctly expired.
  it("rejects a correctly signed but long-stale auth_date", async () => {
    const response = await post({ initData: initData(VALID_FIELDS) });

    expect(response.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects an empty initData before verifying anything", async () => {
    const response = await post({ initData: "" });

    expect(response.status).toBe(422);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("refuses to verify when the bot token is missing", async () => {
    delete process.env.BOT_TOKEN;

    const response = await post({ initData: initData(freshFields()) });

    expect(response.status).toBe(500);
    expect(findUnique).not.toHaveBeenCalled();
  });
});
