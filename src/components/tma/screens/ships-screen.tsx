"use client";

import { useTranslations } from "next-intl";
import { recordsForTab } from "@/lib/tma/selectors";
import { useTmaApp } from "../app-provider";
import { useRecords } from "../use-records";
import { useRequote } from "../use-requote";
import { CabTabs } from "./cabinet/cab-tabs";
import { EmptyNote } from "./cabinet/empty-note";
import { ExportButton } from "./cabinet/export-button";
import { LoadFailed } from "./cabinet/load-failed";
import { RecordRow } from "./cabinet/record-row";
import { RecordSkeleton } from "./cabinet/record-skeleton";

const EMPTY_TAB = {
  shipments: "emptyTabShipments",
  quotes: "emptyTabQuotes",
} as const;

/**
 * The cabinet: the same quote-and-booking union the web cabinet shows, filtered
 * by the comp's three tabs. No summary cards — the mobile comp drops the web's
 * trio, and the header carries the record count instead.
 *
 * A booked row gets no action. There is no tracking screen and no carrier
 * integration in Phase 2 (D-038), and the done screen renders from a quote this
 * session priced, which a historical row does not have — so the row shows its
 * booking reference and stops there rather than offering a button that does
 * nothing.
 */
export function ShipsScreen() {
  const { state, dispatch } = useTmaApp();
  const { reload } = useRecords();
  const requote = useRequote();
  const t = useTranslations("tma.ships");
  const web = useTranslations("cabinet");
  const notes = useTranslations("tma.notes");

  const records = state.records;
  const rows = records ? recordsForTab(records, state.cabTab) : [];

  const body = () => {
    if (state.recordsError) return <LoadFailed error={state.recordsError} onRetry={reload} />;
    if (records === null) return <RecordSkeleton rows={4} />;
    if (records.length === 0) {
      return <EmptyNote title={web("emptyTitle")} body={web("emptyBody")} />;
    }
    if (rows.length === 0 && state.cabTab !== "all") {
      return <EmptyNote title={web(EMPTY_TAB[state.cabTab])} />;
    }

    return (
      <div className="flex flex-col gap-2.5">
        {rows.map((record) => (
          <RecordRow
            key={record.quoteId}
            record={record}
            action={
              record.booked ? undefined : (
                <button
                  type="button"
                  onClick={() => requote(record)}
                  className="mt-[11px] min-h-11 w-full cursor-pointer rounded-[9px] border border-border text-[11.5px] font-semibold text-blue transition-colors duration-150 hover:bg-info"
                >
                  {t("requote")}
                </button>
              )
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="enter">
      <CabTabs active={state.cabTab} onPick={(tab) => dispatch({ type: "setCabTab", tab })} />
      {/* The list re-filters in place, so the change has to be announced. */}
      <div aria-live="polite">{body()}</div>

      <ExportButton disabled={!records || records.length === 0} />
      <p className="mt-[11px] text-pretty text-[10.5px] leading-[1.5] text-ink-400">
        {notes("csv")}
      </p>
    </div>
  );
}
