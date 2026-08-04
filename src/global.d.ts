import type messages from "./i18n/messages/en.json";
import type { routing } from "./i18n/routing";

// Makes t("…") keys and the locale union typechecked against en.json.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
