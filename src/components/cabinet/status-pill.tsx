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

export function StatusPill({ status }: { status: RecordStatus }) {
  const t = useTranslations("status");

  return (
    <span
      className={`inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold ${TONE[status]}`}
    >
      <span className="size-[6px] flex-none rounded-full bg-current" aria-hidden="true" />
      {t(status)}
    </span>
  );
}
