import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    // Ship dates are date-only values held at UTC midnight. Left unset the
    // formatter uses whatever zone it runs in, so the server and a UTC+5 browser
    // would render different days for the same value and hydration would fail.
    timeZone: "UTC",
  };
});
