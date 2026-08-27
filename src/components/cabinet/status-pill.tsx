"use client";

import { useTranslations } from "next-intl";
import type { RecordStatus } from "@/lib/cabinet/records";

// MASTER.md § 5: text only, no fill. Quoted, booked and in-transit blue,
// delivered green, expired red.
const TONE: Record<RecordStatus, string> = {
  quoted: "text-info-ink",
  booked: "text-info-ink",
  transit: "text-info-ink",
  delivered: "text-success-ink",
  expired: "text-danger-ink",
};

/**
 * Shared by the web cabinet and the Mini App's record rows. `compact` is the
 * mobile comp's smaller pair — the colour rule and the strings stay one
 * implementation, because a status that read blue on one surface and green on
 * the other would be the same class of drift as a price that disagreed.
 */
export function StatusPill({
  status,
  compact = false,
}: {
  status: RecordStatus;
  compact?: boolean;
}) {
  const t = useTranslations("status");

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-semibold ${
        compact ? "gap-[5px] text-[10px]" : "gap-[6px] text-[12px]"
      } ${TONE[status]}`}
    >
      <span
        className={`${compact ? "size-[5px]" : "size-[6px]"} flex-none rounded-full bg-current`}
        aria-hidden="true"
      />
      {t(status)}
    </span>
  );
}
