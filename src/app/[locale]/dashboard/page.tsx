import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { AppShell } from "@/components/shell/app-shell";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/server";
import { dashboardKpis, topCarriers } from "@/lib/cabinet/metrics";
import { loadRecords } from "@/lib/cabinet/query";

const RECENT_LIMIT = 5;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale });

  // One read of the user's own rows; every figure on the screen is derived from
  // it, so nothing on this page can disagree with anything else on it.
  const now = new Date();
  const records = await loadRecords(user.id, now);
  const t = await getTranslations("nav");

  return (
    <AppShell crumb={t("crumbDashboard")} active="dashboard">
      <DashboardView
        kpis={dashboardKpis(records, now)}
        recent={records.slice(0, RECENT_LIMIT)}
        carriers={topCarriers(records)}
        hasRecords={records.length > 0}
      />
    </AppShell>
  );
}
