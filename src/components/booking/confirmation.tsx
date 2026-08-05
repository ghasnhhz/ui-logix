import { CircleCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { shipDateLabel } from "@/lib/ui/dates";
import { money } from "@/lib/ui/money";

export type ConfirmationData = {
  reference: string;
  carrierName: string;
  mode: string;
  origin: string;
  destination: string;
  shipDate: string;
  transitDays: number;
  allIn: number;
};

export function Confirmation({ data }: { data: ConfirmationData }) {
  const t = useTranslations("confirmed");
  const tc = useTranslations("common");
  const tr = useTranslations("results");
  const tw = useTranslations("wizard");
  const format = useFormatter();

  const rows = [
    { label: t("carrier"), value: data.carrierName },
    { label: tw("lMode"), value: data.mode },
    { label: tw("lOrigin"), value: data.origin },
    { label: tw("lDest"), value: data.destination },
    { label: tw("lShipDate"), value: shipDateLabel(format, data.shipDate) },
    { label: tr("transit"), value: `${data.transitDays} ${tc("days")}` },
    { label: tc("total"), value: money(data.allIn) },
  ];

  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="rounded-card border border-border bg-surface p-[26px] text-center shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <CircleCheck className="mx-auto size-[46px] text-success-ink" aria-hidden="true" />
        <h1 className="mt-[14px] text-pretty text-[24px] font-bold tracking-[-0.03em]">
          {t("title")}
        </h1>
        <p className="mt-2 text-pretty text-[13px] leading-relaxed text-ink-500">{t("sub")}</p>

        <div className="mt-[18px] rounded-[11px] border border-border bg-page p-[14px]">
          <p className="micro-label text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
            {t("bookingRef")}
          </p>
          <p className="mt-[6px] font-mono text-[22px] font-semibold tracking-[-0.02em]">
            {data.reference}
          </p>
        </div>

        <dl className="mt-[18px] flex flex-col gap-[10px] text-left">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-page-alt pb-[10px] last:border-0 last:pb-0"
            >
              <dt className="micro-label text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
                {label}
              </dt>
              <dd className="text-[13px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Phase 1 has no payment rail, and the demo says so rather than implying
            money has moved (ARCHITECTURE.md § Deferred to Phase 2). */}
        <p className="mt-[18px] text-pretty text-[11.5px] leading-relaxed text-ink-500">
          {t("settleNote")}
        </p>

        <div className="mt-[18px] flex flex-wrap justify-center gap-[10px]">
          <Link
            href="/dashboard"
            className="flex min-h-[46px] min-w-[160px] flex-1 cursor-pointer items-center justify-center rounded-control border border-border px-5 text-[13px] font-semibold transition-colors duration-150 hover:border-border-strong"
          >
            {t("backToDash")}
          </Link>
          <Link
            href="/cabinet"
            className="flex min-h-[46px] min-w-[160px] flex-1 cursor-pointer items-center justify-center rounded-control bg-navy px-5 text-[13px] font-semibold text-white transition-[filter] duration-150 hover:brightness-110"
          >
            {t("openCabinet")}
          </Link>
        </div>
      </div>
    </div>
  );
}
