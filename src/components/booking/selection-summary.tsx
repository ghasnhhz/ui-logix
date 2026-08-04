import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Quote } from "@/lib/pricing";
import { CARRIER_MARK } from "@/lib/ui/carriers";
import { money } from "@/lib/ui/money";
import { MODE_UI } from "@/lib/ui/modes";

// Every figure comes off the quote the shipper was shown, and the four lines add
// up to the total — terminal handling is in the all-in price, so hiding it would
// leave a breakdown that does not reconcile.
export function SelectionSummary({ quote, children }: { quote: Quote; children: React.ReactNode }) {
  const t = useTranslations("booking");
  const tr = useTranslations("results");
  const tc = useTranslations("common");

  const rows = [
    { label: tr("baseRate"), value: money(quote.base) },
    { label: tr("fuelSurcharge"), value: money(quote.fuel) },
    { label: tr("insurance"), value: money(quote.insurance) },
    { label: t("terminalHandling"), value: money(quote.thc) },
  ];

  return (
    <aside className="lg:sticky lg:top-[22px] lg:self-start">
      <div className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <p className="micro-label text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
          {t("selection")}
        </p>

        <div className="mt-3 flex items-start gap-[12px]">
          <span
            className={`flex size-[42px] flex-none items-center justify-center rounded-[9px] text-[12px] font-bold tracking-[0.02em] ${CARRIER_MARK[quote.carrierId]}`}
            aria-hidden="true"
          >
            {quote.carrierId}
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold">{quote.name}</p>
            <p className="mt-[5px] flex flex-wrap items-center gap-2">
              <span
                className={`rounded-[5px] px-[6px] py-[3px] font-mono text-[9.5px] font-semibold ${MODE_UI[quote.mode].chip}`}
              >
                {quote.mode}
              </span>
              <span className="text-[11.5px] text-ink-500">
                {quote.transitDays} {tc("days")}
              </span>
            </p>
          </div>
        </div>

        <dl className="mt-4 flex flex-col gap-[9px] border-t border-page-alt pt-4">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-[12px] text-ink-500">{label}</dt>
              <dd className="font-mono text-[13px] font-semibold">{value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-500">{t("trackingUpdates")}</dt>
            <dd className="flex items-center gap-[5px] text-[12.5px] font-semibold text-success-ink">
              <Check className="size-[13px]" aria-hidden="true" />
              {tc("free")}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-page-alt pt-3">
            <dt className="text-[13px] font-bold">{tc("total")}</dt>
            <dd className="font-mono text-[21px] font-semibold tracking-[-0.03em]">
              {money(quote.allIn)}
            </dd>
          </div>
        </dl>

        <div className="mt-[18px]">{children}</div>
      </div>
    </aside>
  );
}
