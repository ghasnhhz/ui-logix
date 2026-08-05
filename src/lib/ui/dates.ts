import type { useFormatter } from "next-intl";

// Ship dates travel as ISO strings — the wizard URL, `<input type="date">` and
// Quote.shipDate all need that form — so they are formatted only for display.
// The formatter is passed in rather than hooked here so one helper serves both
// server and client components. It is pinned to UTC in i18n/request.ts.
export const shipDateLabel = (format: ReturnType<typeof useFormatter>, iso: string) =>
  format.dateTime(new Date(iso), { day: "numeric", month: "long", year: "numeric" });
