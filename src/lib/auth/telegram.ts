import { createHmac, timingSafeEqual } from "node:crypto";

// TMA.md § Auth. Telegram signs the initData query string with a key derived
// from the bot token; verifying it is the only thing that makes a Telegram user
// trustworthy. `initDataUnsafe` on the client is the same payload unverified —
// never let it reach the database.

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type TelegramIdentity = {
  /** A string, matching the nullable `User.telegramId` column. */
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  authDate: number;
};

export type VerifyFailure = "malformed" | "badHash" | "expired";

export type VerifyResult =
  | { ok: true; identity: TelegramIdentity }
  | { ok: false; reason: VerifyFailure };

const fail = (reason: VerifyFailure): VerifyResult => ({ ok: false, reason });

// Every pair but `hash`, sorted by key, joined with newlines. URLSearchParams
// hands back decoded values, which is what Telegram signed.
function dataCheckString(params: URLSearchParams) {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function hashMatches(expected: string, actual: string) {
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(actual, "hex");
  // timingSafeEqual throws on a length mismatch, and a wrong-length hash is
  // wrong regardless — the length is public, so checking it first leaks nothing.
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function identity(params: URLSearchParams, authDate: number): TelegramIdentity | null {
  const raw = params.get("user");
  if (!raw) return null;

  let user: Record<string, unknown>;
  try {
    user = JSON.parse(raw);
  } catch {
    return null;
  }

  const id = user.id;
  const firstName = user.first_name;
  if (typeof id !== "number" && typeof id !== "string") return null;
  if (typeof firstName !== "string" || !firstName) return null;

  const optional = (value: unknown) =>
    typeof value === "string" && value ? value : undefined;

  return {
    telegramId: String(id),
    firstName,
    lastName: optional(user.last_name),
    username: optional(user.username),
    languageCode: optional(user.language_code),
    authDate,
  };
}

/**
 * The order matters: nothing inside `initData` may be believed before the hash
 * checks out, so `auth_date` and the user are only read afterwards.
 *
 * `botToken` is a parameter rather than an environment read so this module stays
 * testable and the secret stays a route's concern.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  now = Date.now()
): VerifyResult {
  if (!initData || !botToken) return fail("malformed");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return fail("malformed");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret)
    .update(dataCheckString(params))
    .digest("hex");

  if (!hashMatches(expected, hash)) return fail("badHash");

  const authDate = Number(params.get("auth_date"));
  if (!Number.isInteger(authDate) || authDate <= 0) return fail("malformed");
  if (now - authDate * 1000 > MAX_AGE_MS) return fail("expired");

  const found = identity(params, authDate);
  return found ? { ok: true, identity: found } : fail("malformed");
}
