import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/auth/password";

// The first route tests in the repo. Both dependencies have to be replaced:
// Prisma would open a connection, and lib/auth/server reaches for next/headers,
// which only exists inside a request.
const findUnique = vi.fn();
const setSessionCookie = vi.fn();

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } } }));
vi.mock("@/lib/auth/server", () => ({
  setSessionCookie: (...args: unknown[]) => setSessionCookie(...args),
}));

const { POST } = await import("../login/route");

const PASSWORD = "UlogixDemo2026!";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/auth/login", { method: "POST", body: JSON.stringify(body) }));

const account = async (overrides: Record<string, unknown> = {}) => ({
  id: "usr_1",
  email: "demo@ulogix.uz",
  company: "Silk Road Textiles",
  phone: "+998901234567",
  password: await hashPassword(PASSWORD),
  ...overrides,
});

beforeEach(() => {
  findUnique.mockReset();
  setSessionCookie.mockReset();
});

describe("POST /api/auth/login", () => {
  it("signs in a web account", async () => {
    findUnique.mockResolvedValue(await account());

    const response = await post({ email: "demo@ulogix.uz", password: PASSWORD });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { id: "usr_1", email: "demo@ulogix.uz", company: "Silk Road Textiles", phone: "+998901234567" },
    });
    expect(setSessionCookie).toHaveBeenCalledWith("usr_1", "demo@ulogix.uz");
  });

  // The point of the feature: a Telegram-only account must be indistinguishable
  // from a wrong password and from an email nobody has registered. A different
  // status, body or field would let someone enumerate Telegram accounts.
  it("rejects a telegram-only account exactly like a wrong password", async () => {
    findUnique.mockResolvedValue(await account({ password: null, email: "tg@ulogix.uz" }));
    const telegramOnly = await post({ email: "tg@ulogix.uz", password: PASSWORD });
    const telegramBody = await telegramOnly.json();

    findUnique.mockResolvedValue(await account());
    const wrongPassword = await post({ email: "demo@ulogix.uz", password: "wrong-password" });

    findUnique.mockResolvedValue(null);
    const noAccount = await post({ email: "nobody@ulogix.uz", password: PASSWORD });

    expect(telegramOnly.status).toBe(401);
    expect(telegramBody).toEqual({ error: { message: "Incorrect email or password" } });
    expect(wrongPassword.status).toBe(401);
    expect(await wrongPassword.json()).toEqual(telegramBody);
    expect(noAccount.status).toBe(401);
    expect(await noAccount.json()).toEqual(telegramBody);
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("never throws on a null password", async () => {
    findUnique.mockResolvedValue(await account({ password: null }));

    await expect(post({ email: "tg@ulogix.uz", password: PASSWORD })).resolves.toBeDefined();
  });

  it("validates the body before touching the database", async () => {
    const response = await post({ email: "not-an-email", password: PASSWORD });

    expect(response.status).toBe(422);
    expect(findUnique).not.toHaveBeenCalled();
  });
});
