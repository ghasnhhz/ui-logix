"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { dashboardKpis } from "@/lib/cabinet/metrics";
import { recentRecords } from "@/lib/tma/selectors";
import { useTmaApp } from "../app-provider";
import { useRecords } from "../use-records";
import { EmptyNote } from "./cabinet/empty-note";
import { KpiPair } from "./cabinet/kpi-pair";
import { LoadFailed } from "./cabinet/load-failed";
import { RecordRow } from "./cabinet/record-row";
import { RecordSkeleton } from "./cabinet/record-skeleton";

/**
 * The comp's dashboard: two KPIs, one quick action, three recent rows. Every
 * figure comes from `dashboardKpis` over the rows the server returned, bucketed
 * against the server's own instant so the same account reads identically here
 * and on `/en/dashboard`.
 */
export function HomeScreen() {
  const { state, dispatch } = useTmaApp();
  const { reload } = useRecords();
  const t = useTranslations("tma.home");
  const web = useTranslations("dashboard");

  const records = state.records;
  const now = state.recordsAt ? new Date(state.recordsAt) : null;

  return (
    <div className="enter">
      {records && now ? (
        <KpiPair kpis={dashboardKpis(records, now)} />
      ) : (
        <div className="grid grid-cols-2 gap-2.5" aria-hidden="true">
          <div className="h-[112px] animate-pulse rounded-card bg-page-alt" />
          <div className="h-[112px] animate-pulse rounded-card bg-page-alt" />
        </div>
      )}

      {/* The MainButton carries the same action; the comp draws both, and on a
          screen the user lands on rather than walks to, the card is what says
          what the app is for. */}
      <button
        type="button"
        onClick={() => dispatch({ type: "goStep", step: 1 })}
        className="mt-3 flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-card border-[1.5px] border-blue bg-[#F5F9FF] p-3.5 text-left transition-colors duration-150 hover:bg-info"
      >
        <span
          className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-blue text-white"
          aria-hidden="true"
        >
          <Plus className="size-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold text-blue">{t("qaQuote")}</span>
          <span className="mt-[2px] block text-pretty text-[11px] leading-[1.4] text-ink-500">
            {t("qaQuoteSub")}
          </span>
        </span>
      </button>

      <div className="mb-2.5 mt-[18px] flex items-baseline justify-between gap-3">
        <h2 className="text-[13.5px] font-bold">{t("recentShipments")}</h2>
        <button
          type="button"
          onClick={() => dispatch({ type: "go", screen: "ships" })}
          className="relative flex cursor-pointer items-center gap-0.5 text-[11.5px] font-semibold text-blue transition-colors duration-150 after:absolute after:inset-x-0 after:-inset-y-[13px] after:content-[''] hover:text-blue-hover"
        >
          {t("viewAll")}
          <ChevronRight className="size-[13px]" aria-hidden="true" />
        </button>
      </div>

      {state.recordsError ? (
        <LoadFailed error={state.recordsError} onRetry={reload} />
      ) : records === null ? (
        <RecordSkeleton />
      ) : records.length === 0 ? (
        <EmptyNote title={web("emptyTitle")} body={web("emptyBody")} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {recentRecords(records).map((record) => (
            <RecordRow key={record.quoteId} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
