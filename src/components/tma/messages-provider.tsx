"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { resolveLocale, storeLocale } from "@/lib/tma/locale";

type Messages = typeof import("@/i18n/messages/en.json");

// One chunk per locale, loaded on demand. A Mini App opens on a phone data
// connection, so shipping all three would be two locales of dead weight.
const LOADERS: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("@/i18n/messages/en.json"),
  uz: () => import("@/i18n/messages/uz.json") as Promise<{ default: Messages }>,
  ru: () => import("@/i18n/messages/ru.json") as Promise<{ default: Messages }>,
};

type LocaleValue = { locale: Locale | null; setLocale: (locale: Locale) => void };

const LocaleContext = createContext<LocaleValue>({ locale: null, setLocale: () => {} });

export const useTmaLocale = () => useContext(LocaleContext);

export function MessagesProvider({
  languageCode,
  children,
}: {
  languageCode: string | undefined;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale | null>(null);
  const [messages, setMessages] = useState<Messages | null>(null);

  // Telegram's language_code arrives with initData, one tick after mount.
  useEffect(() => {
    setLocale((current) => current ?? resolveLocale(languageCode));
  }, [languageCode]);

  useEffect(() => {
    if (!locale) return;
    let cancelled = false;
    LOADERS[locale]().then((module) => {
      if (!cancelled) setMessages(module.default);
    });
    document.documentElement.lang = locale;
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const pick = useCallback((next: Locale) => {
    storeLocale(next);
    setLocale(next);
  }, []);

  // Telegram's own splash covers the app until it calls ready(), so there is
  // nothing to show here — and a half-translated first paint would be worse.
  if (!locale || !messages) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale: pick }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
