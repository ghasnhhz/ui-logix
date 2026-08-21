import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LOCALE_STORAGE_KEY,
  fromLanguageCode,
  resolveLocale,
  storeLocale,
  storedLocale,
} from "@/lib/tma/locale";

const withStorage = (storage: Partial<Storage>) => {
  vi.stubGlobal("window", { localStorage: storage as Storage });
};

afterEach(() => vi.unstubAllGlobals());

describe("fromLanguageCode", () => {
  it("maps the locales we ship and falls back to English", () => {
    expect(fromLanguageCode("ru")).toBe("ru");
    expect(fromLanguageCode("uz")).toBe("uz");
    expect(fromLanguageCode("en-GB")).toBe("en");
    expect(fromLanguageCode("de")).toBe("en");
    expect(fromLanguageCode(undefined)).toBe("en");
  });
});

describe("storedLocale", () => {
  it("reads a stored locale and ignores a value we do not ship", () => {
    withStorage({ getItem: () => "ru" });
    expect(storedLocale()).toBe("ru");
    withStorage({ getItem: () => "de" });
    expect(storedLocale()).toBeNull();
  });

  it("survives a storage that throws, which private modes do", () => {
    withStorage({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(storedLocale()).toBeNull();
    expect(() => storeLocale("uz")).not.toThrow();
  });
});

describe("resolveLocale", () => {
  it("prefers an explicit pick over the Telegram language", () => {
    withStorage({ getItem: () => "uz" });
    expect(resolveLocale("ru")).toBe("uz");
  });

  it("falls back to the Telegram language when nothing is stored", () => {
    withStorage({ getItem: () => null });
    expect(resolveLocale("ru")).toBe("ru");
  });

  it("writes the pick under a namespaced key", () => {
    const setItem = vi.fn();
    withStorage({ setItem });
    storeLocale("ru");
    expect(setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, "ru");
  });
});
