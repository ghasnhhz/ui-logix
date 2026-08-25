import { describe, expect, it } from "vitest";
import { verifyInitData } from "../telegram";
import {
  initData,
  TEST_AUTH_DATE as AUTH_DATE,
  TEST_BOT_TOKEN as TOKEN,
  TEST_USER as USER,
  VALID_FIELDS as VALID,
} from "./init-data";

const NOW = AUTH_DATE * 1000 + 60_000;
const HOUR = 60 * 60 * 1000;

describe("verifyInitData", () => {
  it("accepts initData signed with the bot token", () => {
    const result = verifyInitData(initData(VALID), TOKEN, NOW);

    expect(result).toEqual({
      ok: true,
      identity: {
        telegramId: "99281",
        firstName: "Alisher",
        lastName: "Nazarov",
        username: "anazarov",
        languageCode: "ru",
        authDate: AUTH_DATE,
      },
    });
  });

  // A frozen vector, computed once from the spec. It fails if the data-check
  // string, the key derivation or the digest encoding is ever changed — which
  // self-signed cases above would not catch, because they would change together.
  it("matches a known signature", () => {
    const params = new URLSearchParams(VALID);
    params.set(
      "hash",
      "c16a030de92e5a58009fdcf4a0e76de224e9356c691c7d4951f267523b389960"
    );

    expect(verifyInitData(params.toString(), TOKEN, NOW).ok).toBe(true);
  });

  it("rejects a tampered hash", () => {
    const params = new URLSearchParams(initData(VALID));
    const hash = params.get("hash")!;
    params.set("hash", (hash[0] === "a" ? "b" : "a") + hash.slice(1));

    expect(verifyInitData(params.toString(), TOKEN, NOW)).toEqual({
      ok: false,
      reason: "badHash",
    });
  });

  it("rejects a tampered field the hash no longer covers", () => {
    const params = new URLSearchParams(initData(VALID));
    params.set("user", JSON.stringify({ id: 1, first_name: "Someone else" }));

    expect(verifyInitData(params.toString(), TOKEN, NOW)).toEqual({
      ok: false,
      reason: "badHash",
    });
  });

  it("rejects initData signed with a different bot token", () => {
    const foreign = initData(VALID, "654321:SOMEONE-ELSES-BOT");

    expect(verifyInitData(foreign, TOKEN, NOW)).toEqual({
      ok: false,
      reason: "badHash",
    });
  });

  it("rejects a hash of the wrong length", () => {
    const params = new URLSearchParams(initData(VALID));
    params.set("hash", params.get("hash")!.slice(0, 40));

    expect(verifyInitData(params.toString(), TOKEN, NOW)).toEqual({
      ok: false,
      reason: "badHash",
    });
  });

  it("rejects an auth_date older than 24 hours", () => {
    expect(verifyInitData(initData(VALID), TOKEN, AUTH_DATE * 1000 + 25 * HOUR)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("accepts an auth_date just inside the window", () => {
    const almost = AUTH_DATE * 1000 + 24 * HOUR - 60_000;

    expect(verifyInitData(initData(VALID), TOKEN, almost).ok).toBe(true);
  });

  it.each([
    ["an empty string", ""],
    ["no hash", new URLSearchParams(VALID).toString()],
  ])("rejects %s as malformed", (_label, raw) => {
    expect(verifyInitData(raw, TOKEN, NOW)).toEqual({ ok: false, reason: "malformed" });
  });

  it("rejects a missing bot token", () => {
    expect(verifyInitData(initData(VALID), "", NOW)).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  // These are signed correctly and still rejected: a valid signature over an
  // incomplete payload is a real case, not a tampering one.
  it.each([
    ["auth_date", { query_id: VALID.query_id, user: USER }],
    ["user", { auth_date: VALID.auth_date, query_id: VALID.query_id }],
  ])("rejects signed initData missing %s", (_label, fields) => {
    expect(verifyInitData(initData(fields), TOKEN, NOW)).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it.each([
    ["unparseable user JSON", "{not json"],
    ["a user with no id", JSON.stringify({ first_name: "Alisher" })],
    ["a user with no first_name", JSON.stringify({ id: 99281 })],
  ])("rejects %s", (_label, user) => {
    expect(verifyInitData(initData({ ...VALID, user }), TOKEN, NOW)).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("keeps a Telegram id as a string, never a number", () => {
    const big = JSON.stringify({ id: 7999999999, first_name: "Alisher" });
    const result = verifyInitData(initData({ ...VALID, user: big }), TOKEN, NOW);

    expect(result.ok && result.identity.telegramId).toBe("7999999999");
  });
});
