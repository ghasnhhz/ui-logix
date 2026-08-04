"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { CARRIER_MARK } from "@/lib/ui/carriers";
import { money } from "@/lib/ui/money";
import { MODE_UI } from "@/lib/ui/modes";
import { cityName } from "@/lib/ui/places";
import { StatusPill } from "./status-pill";

const HEAD = ["thQuoteId", "thRoute", "thMode", "thStatus", "thAmount", "thCarrier"] as const;

const CELL = "px-[14px] py-[13px] align-middle";

// Seven columns do not fit 375px at a readable size, so the table scrolls inside
// its own container rather than pushing the page sideways.
export function RecordsTable({ records }: { records: CabinetRecord[] }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("cabinet");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {HEAD.map((key) => (
              <th
                key={key}
                scope="col"
                className={`micro-label ${CELL} text-[9.5px] font-normal tracking-[0.1em] text-ink-500`}
              >
                {t(key)}
              </th>
            ))}
            <th
              scope="col"
              className={`micro-label ${CELL} text-right text-[9.5px] font-normal tracking-[0.1em] text-ink-500`}
            >
              {t("thAction")}
            </th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.quoteId} className="border-b border-page-alt last:border-0">
              <td className={`${CELL} font-mono text-[12px] font-semibold`}>{record.reference}</td>
              <td className={`${CELL} whitespace-nowrap text-[13px]`}>
                {cityName(record.origin)} → {cityName(record.destination)}
              </td>
              <td className={CELL}>
                <span
                  className={`rounded-chip px-[6px] py-[3px] font-mono text-[9.5px] font-semibold ${MODE_UI[record.mode].chip}`}
                >
                  {record.mode}
                </span>
              </td>
              <td className={CELL}>
                <StatusPill status={record.status} />
              </td>
              <td className={`${CELL} whitespace-nowrap font-mono text-[13px] font-semibold`}>
                {money(record.allIn)}
              </td>
              <td className={CELL}>
                {record.carrierId && (
                  <span
                    className={`inline-flex size-[30px] items-center justify-center rounded-[7px] text-[10px] font-bold ${CARRIER_MARK[record.carrierId]}`}
                  >
                    {record.carrierId}
                  </span>
                )}
              </td>
              <td className={`${CELL} text-right`}>
                {record.booked && record.bookingReference ? (
                  <Link
                    href={`/confirmed?ref=${record.bookingReference}`}
                    className="inline-flex min-h-[36px] cursor-pointer items-center rounded-control border border-border px-[13px] text-[12.5px] font-semibold transition-colors duration-150 hover:border-border-strong"
                  >
                    {tc("track")}
                  </Link>
                ) : (
                  <Link
                    href={record.requoteHref}
                    className="inline-flex min-h-[36px] cursor-pointer items-center rounded-control border border-border px-[13px] text-[12.5px] font-semibold text-blue transition-colors duration-150 hover:border-blue"
                  >
                    {tc("requote")}
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
