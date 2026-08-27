"use client";

import { TrendingDown, TrendingUp, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DashboardKpis } from "@/lib/cabinet/metrics";
import { signedMoney } from "@/lib/ui/money";
import { vsMarketTone } from "@/lib/ui/vs-market";

/**
 * The comp's two cards, not the web's four — a 360px phone has room for a pair.
 * Both figures come from `dashboardKpis` over the user's own rows; the comp
 * hardcodes $2,140 in the second card and DESIGN.md § Dashboard is explicit that
 * a brand-new account shows zeros, never fabricated history.
 *
 * The label and the pill are the web dashboard's own keys, so the market framing
 * and the green/amber tone are literally the same strings on both surfaces
 * rather than a second translation that could drift (D-042).
 */
export function KpiPair({ kpis }: { kpis: DashboardKpis }) {
  const t = useTranslations("tma.home");
  const web = useTranslations("dashboard");

  const below = kpis.savedPct !== null && kpis.savedPct <= 0;
  const Trend = below ? TrendingDown : TrendingUp;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Card
        Icon={Truck}
        tile="bg-info text-info-ink"
        value={String(kpis.activeCount)}
        label={t("kpiActive")}
      />
      <Card
        Icon={Trend}
        tile={below ? "bg-success text-success-ink" : "bg-page-alt text-ink-600"}
        value={signedMoney(kpis.savedThisMonth)}
        valueTone={vsMarketTone(kpis.savedThisMonth)}
        label={web("kpiSaved")}
        // D-037: a percentage with no bookings behind it is not a result, so the
        // pill goes rather than reading 0.0%.
        pill={
          kpis.savedPct === null
            ? undefined
            : web(below ? "kpiSavedPillBelow" : "kpiSavedPillAbove", {
                pct: Math.abs(kpis.savedPct).toFixed(1),
              })
        }
        pillTone={below ? "bg-success text-success-ink" : "bg-warning text-warning-ink"}
      />
    </div>
  );
}

function Card({
  Icon,
  tile,
  value,
  valueTone = "",
  label,
  pill,
  pillTone = "",
}: {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tile: string;
  value: string;
  valueTone?: string;
  label: string;
  pill?: string;
  pillTone?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-3.5">
      <span
        className={`flex size-[30px] items-center justify-center rounded-[8px] ${tile}`}
        aria-hidden="true"
      >
        <Icon className="size-[15px]" />
      </span>

      <p
        className={`mt-2.5 font-mono text-[21px] font-semibold tracking-[-0.02em] ${valueTone}`}
      >
        {value}
      </p>
      <p className="mt-[3px] text-pretty text-[11.5px] font-semibold leading-[1.3] text-ink-600">
        {label}
      </p>
      {pill && (
        <p
          className={`mt-2 w-fit rounded-chip px-[7px] py-[3px] text-[9.5px] font-semibold ${pillTone}`}
        >
          {pill}
        </p>
      )}
    </div>
  );
}
