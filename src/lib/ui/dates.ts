import type { useTranslations } from "next-intl";

type Common = ReturnType<typeof useTranslations<"common">>;

// Literal keys, because next-intl typechecks them against en.json.
const MONTHS = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"] as const;

// Intl is not usable here. Chrome ships no Uzbek month names — it renders
// "2026 M08 26" where Node renders "26-avgust, 2026", and even the numeric
// pattern differs — so any client-side ICU formatting mismatches on hydration.
// The month names and the pattern are ours, so both environments agree.
//
// Ship dates travel as ISO strings — the wizard URL, `<input type="date">` and
// Quote.shipDate all need that form — so this is display only. The year is
// passed as a string to keep ICU from grouping it into "2,026".
export function shipDateLabel(t: Common, iso: string) {
  const [year, month, day] = iso.split("-");
  return t("dateFmt", {
    d: String(Number(day)),
    month: t(MONTHS[Number(month) - 1]),
    y: year,
  });
}
