import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { freshFields, initData, TEST_BOT_TOKEN } from "@/lib/auth/__tests__/init-data";

const findUnique = vi.fn();
const create = vi.fn();
const setSessionCookie = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));
vi.mock("@/lib/auth/server", () => ({
  setSessionCookie: (...args: unknown[]) => setSessionCookie(...args),
}));

const { POST } = await import("../telegram/signup/route");

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/auth/telegram/signup", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

const SIGNUP = { company: "Nazarov Trading LLC", phone: "+998901234567" };

const CREATED = {
  id: "usr_tg_1",
  email: "tg-99281@telegram.u-logix.invalid",
  company: SIGNUP.company,
  phone: SIGNUP.phone,
};

const originalToken = process.env.BOT_TOKEN;

beforeEach(() => {
  findUnique.mockReset().mockResolvedValue(null);
  create.mockReset().mockResolvedValue(CREATED);
  setSessionCookie.mockReset();
  process.env.BOT_TOKEN = TEST_BOT_TOKEN;
});

afterEach(() => {
  if (originalToken === undefined) delete process.env.BOT_TOKEN;
  else process.env.BOT_TOKEN = originalToken;
});

describe("POST /api/auth/telegram/signup", () => {
  it("creates a passwordless account keyed to the verified telegram id", async () => {
    const response = await post({ initData: initData(freshFields()), ...SIGNUP });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ data: CREATED });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          telegramId: "99281",
          email: "tg-99281@telegram.u-logix.invalid",
          company: SIGNUP.company,
          phone: SIGNUP.phone,
        },
      })
    );
    expect(setSessionCookie).toHaveBeenCalledWith("usr_tg_1", CREATED.email);
  });

  // D-056. The identity is proven, so a double submit is the same person.
  it("signs in an existing telegram account instead of failing", async () => {
    findUnique.mockResolvedValue(CREATED);

    const response = await post({ initData: initData(freshFields()), ...SIGNUP });

    expect(response.status).toBe(200);
    expect(create).not.toHaveBeenCalled();
    expect(setSessionCookie).toHaveBeenCalledWith("usr_tg_1", CREATED.email);
  });

  it("keeps the phone optional", async () => {
    await post({ initData: initData(freshFields()), company: SIGNUP.company });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: undefined }) })
    );
  });

  it("rejects a tampered hash without touching the database", async () => {
    const params = new URLSearchParams(initData(freshFields()));
    params.set("hash", "0".repeat(64));

    const response = await post({ initData: params.toString(), ...SIGNUP });

    expect(response.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects an expired auth_date", async () => {
    const stale = freshFields({
      auth_date: String(Math.floor(Date.now() / 1000) - 25 * 60 * 60),
    });

    const response = await post({ initData: initData(stale), ...SIGNUP });

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a company that is too short before verifying anything", async () => {
    const response = await post({ initData: initData(freshFields()), company: "A" });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { field: "company" } });
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses to verify when the bot token is missing", async () => {
    delete process.env.BOT_TOKEN;

    const response = await post({ initData: initData(freshFields()), ...SIGNUP });

    expect(response.status).toBe(500);
    expect(create).not.toHaveBeenCalled();
  });
});
