import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/cabinet/empty-state";
import { RecordsTable } from "@/components/cabinet/records-table";
import { Link } from "@/i18n/navigation";
import type { CarrierUsage, DashboardKpis } from "@/lib/cabinet/metrics";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { KpiRow } from "./kpi-row";
import { SideRail } from "./side-rail";

export function DashboardView({
  kpis,
  recent,
  carriers,
  hasRecords,
}: {
  kpis: DashboardKpis;
  recent: CabinetRecord[];
  carriers: CarrierUsage[];
  hasRecords: boolean;
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-[18px]">
      {/* Zeros are the honest reading of an account with no history, so the row
          renders either way and only the table below it changes. */}
      <KpiRow kpis={kpis} />

      <div className="grid gap-[18px] xl:grid-cols-[1fr_300px]">
        <section className="min-w-0 rounded-card border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,42,.04)]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-[18px] py-[15px]">
            <div className="min-w-0">
              <h2 className="text-[14px] font-bold">{t("recentShipments")}</h2>
              <p className="mt-[2px] text-pretty text-[11.5px] text-ink-500">
                {t("recentShipmentsSub")}
              </p>
            </div>
            {hasRecords && (
              <Link
                href="/cabinet"
                className="flex-none cursor-pointer text-[12.5px] font-semibold text-blue transition-colors duration-150 hover:text-blue-hover"
              >
                {tc("viewAll")}
              </Link>
            )}
          </div>

          {hasRecords ? (
            <RecordsTable records={recent} />
          ) : (
            <div className="p-[18px]">
              <EmptyState title={t("emptyTitle")} body={t("emptyBody")} cta={t("emptyCta")} />
            </div>
          )}
        </section>

        <SideRail carriers={carriers} />
      </div>
    </div>
  );
}
