"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { EmptyState } from "./empty-state";
import { ExportButton } from "./export-button";
import { RecordsTable } from "./records-table";

type Tab = "all" | "shipments" | "quotes";

const TABS = [
  { tab: "all", label: "tabAll" },
  { tab: "shipments", label: "tabShipments" },
  { tab: "quotes", label: "tabQuotes" },
] as const satisfies readonly { tab: Tab; label: string }[];

const EMPTY_TAB = {
  shipments: "emptyTabShipments",
  quotes: "emptyTabQuotes",
} as const satisfies Record<Exclude<Tab, "all">, string>;

export function CabinetView({
  records,
  summary,
}: {
  records: CabinetRecord[];
  // Rendered on the server so the summary cards stay out of the client bundle.
  summary: React.ReactNode;
}) {
  const t = useTranslations("cabinet");
  const [tab, setTab] = useState<Tab>("all");

  const rows = useMemo(() => {
    if (tab === "shipments") return records.filter((record) => record.booked);
    if (tab === "quotes") return records.filter((record) => !record.booked);
    return records;
  }, [records, tab]);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-[18px]">
      <div>
        <h1 className="text-[24px] font-bold tracking-[-0.03em]">{t("title")}</h1>
        <p className="mt-[5px] text-pretty text-[13px] text-ink-500">{t("sub")}</p>
      </div>

      {summary}

      <section className="rounded-card border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-[18px] py-[14px]">
          <div role="tablist" className="flex flex-wrap gap-1 rounded-control bg-page-alt p-1">
            {TABS.map(({ tab: value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`cabinet-tab-${value}`}
                aria-selected={tab === value}
                aria-controls="cabinet-records"
                onClick={() => setTab(value)}
                className={`min-h-[34px] cursor-pointer rounded-[7px] px-[13px] text-[12.5px] font-semibold transition-colors duration-150 ${
                  tab === value ? "bg-surface text-ink shadow-[0_1px_2px_rgba(15,23,42,.06)]" : "text-ink-500 hover:text-ink"
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>

          <ExportButton disabled={records.length === 0} />
        </div>

        {/* The tab switch re-filters without a navigation, so the change is
            announced rather than happening silently. */}
        <div
          id="cabinet-records"
          role="tabpanel"
          aria-labelledby={`cabinet-tab-${tab}`}
          aria-live="polite"
        >
          {records.length === 0 ? (
            <div className="p-[18px]">
              <EmptyState title={t("emptyTitle")} body={t("emptyBody")} cta={t("emptyCta")} />
            </div>
          ) : rows.length === 0 && tab !== "all" ? (
            <div className="p-[18px]">
              <EmptyState title={t(EMPTY_TAB[tab])} />
            </div>
          ) : (
            <RecordsTable records={rows} />
          )}
        </div>

        <p className="text-pretty border-t border-page-alt px-[18px] py-[13px] text-[11.5px] leading-relaxed text-ink-500">
          {t("csvNote")}
        </p>
      </section>
    </div>
  );
}
