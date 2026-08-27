"use client";

import { StatusPill } from "@/components/cabinet/status-pill";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { CARRIERS } from "@/lib/pricing";
import { money } from "@/lib/ui/money";
import { MODE_UI } from "@/lib/ui/modes";
import { cityName } from "@/lib/ui/places";

const carrierName = (record: CabinetRecord) =>
  CARRIERS.find((carrier) => carrier.id === record.carrierId)?.name ?? null;

/**
 * One row of the quote-and-booking union, shared by home's recent list and the
 * cabinet. `action` is the cabinet's per-row button; home passes none.
 *
 * The identifier is the quote reference on every row, booked or not — it is what
 * the web cabinet's QUOTE ID column and the CSV's first column both carry, and a
 * booked row that read differently here would not be findable in the export the
 * shipper hands their accountant.
 */
export function RecordRow({
  record,
  action,
}: {
  record: CabinetRecord;
  action?: React.ReactNode;
}) {
  const carrier = carrierName(record);

  return (
    <article className="rounded-card border border-border bg-surface p-[13px]">
      <div className="flex items-center gap-[11px]">
        <span
          className={`flex-none rounded-[5px] px-1.5 py-[3px] font-mono text-[9px] font-semibold ${MODE_UI[record.mode].chip}`}
        >
          {record.mode}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold">
            {cityName(record.origin)} → {cityName(record.destination)}
          </p>
          {/* The separator is conditional: an unbooked row has no carrier yet,
              and the comp's em-dash placeholder would read as a carrier named
              "—" once these are real rows. */}
          <p className="mt-[2px] truncate font-mono text-[10px] text-ink-400">
            {carrier ? `${record.reference} · ${carrier}` : record.reference}
          </p>
        </div>

        <div className="flex-none text-right">
          <p className="font-mono text-[13px] font-semibold">{money(record.allIn)}</p>
          <div className="mt-[3px] flex justify-end">
            <StatusPill status={record.status} compact />
          </div>
        </div>
      </div>

      {action}
    </article>
  );
}
