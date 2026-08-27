import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth/server";
import { loadRecords } from "@/lib/cabinet/query";

// The Mini App is a client-side webview and cannot server-render, so the cabinet
// reaches it as JSON rather than as a rendered page. `CabinetRecord` is already
// flat and date-serialised, and the heavy `results` column never leaves
// `toRecord`, so the rows cross the wire as they are.
//
// `now` travels with them: `dashboardKpis` buckets its windows in UTC off a
// single instant, and a phone with a skewed clock must not be able to move a KPI
// that the web dashboard renders differently for the same rows.
export async function GET() {
  const session = await getSession();
  if (!session) return fail("Sign in to see your records", 401);

  const now = new Date();
  const records = await loadRecords(session.sub, now);

  return ok({ records, now: now.toISOString() });
}
