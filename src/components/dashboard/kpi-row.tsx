import { DollarSign, FileText, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DashboardKpis } from "@/lib/cabinet/metrics";
import { money, signedMoney } from "@/lib/ui/money";
import { vsMarketTone } from "@/lib/ui/vs-market";
import { KpiCard, type KpiPill } from "./kpi-card";

const signed = (delta: number) => (delta > 0 ? `+${delta}` : String(delta));

export function KpiRow({ kpis }: { kpis: DashboardKpis }) {
  const t = useTranslations("dashboard");

  // A null delta means there is no earlier period to compare against, and the
  // pill is dropped rather than invented (DESIGN.md § Dashboard).
  const deltaPill = (delta: number | null, key: "kpiActivePill" | "kpiQuotesPill"): KpiPill | undefined =>
    delta === null
      ? undefined
      : { text: t(key, { delta: signed(delta) }), tone: delta >= 0 ? "success" : "neutral" };

  const savedPill: KpiPill | undefined =
    kpis.savedPct === null
      ? undefined
      : {
          text: t("kpiSavedPill", { pct: Math.abs(kpis.savedPct).toFixed(1) }),
          tone: kpis.savedPct <= 0 ? "success" : "warning",
          Icon: kpis.savedPct <= 0 ? TrendingDown : TrendingUp,
        };

  return (
    <div className="grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        Icon={Truck}
        tile="bg-info text-info-ink"
        value={String(kpis.activeCount)}
        label={t("kpiActive")}
        sub={t("kpiActiveSub", { transit: kpis.inTransit, pending: kpis.pending })}
        pill={deltaPill(kpis.activeDelta, "kpiActivePill")}
      />
      <KpiCard
        Icon={FileText}
        tile="bg-page-alt text-ink-600"
        value={String(kpis.quotesThisMonth)}
        label={t("kpiQuotes")}
        sub={t("kpiQuotesSub", { n: kpis.convertedThisMonth })}
        pill={deltaPill(kpis.quotesDelta, "kpiQuotesPill")}
      />
      <KpiCard
        Icon={TrendingUp}
        tile="bg-success text-success-ink"
        value={signedMoney(kpis.savedThisMonth)}
        valueClass={vsMarketTone(kpis.savedThisMonth)}
        label={t("kpiSaved")}
        sub={t("kpiSavedSub")}
        pill={savedPill}
      />
      <KpiCard
        Icon={DollarSign}
        tile="bg-warning text-warning-ink"
        value={money(kpis.spendYtd)}
        label={t("kpiSpend")}
        sub={t("kpiSpendSub", { n: kpis.bookingsYtd })}
        pill={{ text: t("kpiSpendPill"), tone: "neutral" }}
      />
    </div>
  );
}
