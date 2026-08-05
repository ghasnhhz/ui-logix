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
    // Every date in the app is a date-only value held at UTC midnight. Nothing
    // formats one through Intl today — see lib/ui/dates.ts for why — but left
    // unset next-intl adopts whatever zone it runs in, so anything that starts
    // would silently render a different day on the server than in the browser.
    timeZone: "UTC",
  };
});
