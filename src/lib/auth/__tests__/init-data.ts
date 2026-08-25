import { createHmac } from "node:crypto";

// The signing side, written from TMA.md § Auth rather than by calling the module
// under test — a test that signs with the same helper it verifies with would
// pass on any two matching implementations, including two wrong ones.

export const TEST_BOT_TOKEN = "123456:TEST-TOKEN-abcdefghijklmnopqrstuvwxyz";
export const TEST_AUTH_DATE = 1756137600;

export const TEST_USER = JSON.stringify({
  id: 99281,
  first_name: "Alisher",
  last_name: "Nazarov",
  username: "anazarov",
  language_code: "ru",
});

export const VALID_FIELDS = {
  auth_date: String(TEST_AUTH_DATE),
  query_id: "AAHdF6IQAAAAAN0Xoh",
  user: TEST_USER,
};

export function sign(fields: Record<string, string>, token = TEST_BOT_TOKEN) {
  const checkString = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  return createHmac("sha256", secret).update(checkString).digest("hex");
}

export function initData(fields: Record<string, string>, token = TEST_BOT_TOKEN) {
  const params = new URLSearchParams(fields);
  params.set("hash", sign(fields, token));
  return params.toString();
}

// The route reads the clock itself, so anything exercising it has to be signed
// now — VALID_FIELDS carries a fixed auth_date and is a year stale by design.
export const freshFields = (overrides: Record<string, string> = {}) => ({
  ...VALID_FIELDS,
  auth_date: String(Math.floor(Date.now() / 1000)),
  ...overrides,
});
