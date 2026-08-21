import { locales, routing, type Locale } from "@/i18n/routing";

// There is no locale segment in the Mini App's URL and no session to hang a
// choice on while the user is still a guest, so an explicit pick has to live in
// the browser (D-049).
export const LOCALE_STORAGE_KEY = "ulx.tma.locale";

export const isLocale = (value: string | null | undefined): value is Locale =>
  locales.includes(value as Locale);

/**
 * Telegram sends an IETF tag — "ru", "uz", "en-GB". Anything we do not ship
 * falls to English, which is also what the web app does for an unknown prefix.
 */
export function fromLanguageCode(languageCode: string | undefined): Locale {
  const base = languageCode?.slice(0, 2).toLowerCase();
  return isLocale(base) ? base : routing.defaultLocale;
}

export function storedLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Private modes and embedded webviews can throw on access, not just return
    // null. A blocked store means no preference, never a broken app.
    return null;
  }
}

export function storeLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignored: the switcher still applies for this session.
  }
}

/** An explicit pick outranks Telegram's guess — that is the point of the pills. */
export const resolveLocale = (languageCode: string | undefined): Locale =>
  storedLocale() ?? fromLanguageCode(languageCode);
