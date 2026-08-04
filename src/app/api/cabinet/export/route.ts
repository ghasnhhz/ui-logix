import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { fail } from "@/lib/api";
import { getSession } from "@/lib/auth/server";
import { csvFilename, toCsv, CSV_COLUMNS, type CsvLabels } from "@/lib/cabinet/csv";
import { loadRecords } from "@/lib/cabinet/query";
import type { RecordStatus } from "@/lib/cabinet/records";

// The API has no locale of its own, so the download link carries one. Anything
// unrecognised falls back rather than failing — a bad query string should still
// produce the accountant's file.
const localeOf = (raw: string | null): Locale =>
  routing.locales.includes(raw as Locale) ? (raw as Locale) : routing.defaultLocale;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to export your records", 401);

  const locale = localeOf(new URL(request.url).searchParams.get("locale"));
  const [tc, ts] = await Promise.all([
    getTranslations({ locale, namespace: "csv" }),
    getTranslations({ locale, namespace: "status" }),
  ]);

  const now = new Date();
  const records = await loadRecords(session.sub, now);
  const labels = Object.fromEntries(
    CSV_COLUMNS.map((column) => [column, tc(column)]),
  ) as CsvLabels;

  return new Response(toCsv(records, labels, (status: RecordStatus) => ts(status)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(now)}"`,
      "Cache-Control": "no-store",
    },
  });
}
