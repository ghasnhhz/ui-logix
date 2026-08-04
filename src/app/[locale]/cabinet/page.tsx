import { getTranslations, setRequestLocale } from "next-intl/server";
import { CabinetView } from "@/components/cabinet/cabinet-view";
import { SummaryCards } from "@/components/cabinet/summary-cards";
import { AppShell } from "@/components/shell/app-shell";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/server";
import { cabinetTotals } from "@/lib/cabinet/metrics";
import { loadRecords } from "@/lib/cabinet/query";

export default async function CabinetPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale });

  const now = new Date();
  const records = await loadRecords(user.id, now);
  const totals = cabinetTotals(records, now);
  const t = await getTranslations("nav");

  return (
    <AppShell crumb={t("crumbCabinet")} active="cabinet">
      <CabinetView records={records} summary={<SummaryCards totals={totals} />} />
    </AppShell>
  );
}
