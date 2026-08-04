"use client";

import { ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Quote } from "@/lib/pricing";
import { CARRIER_MARK } from "@/lib/ui/carriers";
import { money } from "@/lib/ui/money";
import { MODE_UI } from "@/lib/ui/modes";
import { Stars } from "./stars";

export function QuoteCard({
  quote,
  quoteId,
  vsPct,
  best,
}: {
  quote: Quote;
  quoteId: string;
  vsPct: number;
  best: boolean;
}) {
  const t = useTranslations("results");
  const tc = useTranslations("common");

  const breakdown = [
    { label: t("baseRate"), value: money(quote.base) },
    { label: t("fuelSurcharge"), value: money(quote.fuel) },
    { label: t("insurance"), value: money(quote.insurance) },
    { label: t("transit"), value: `${quote.transitDays} ${tc("days")}` },
  ];

  return (
    <article
      className={`overflow-hidden rounded-[13px] bg-surface shadow-[0_1px_2px_rgba(15,23,42,.04)] ${
        best ? "border-[1.5px] border-amber" : "border border-border"
      }`}
    >
      {best && (
        <p className="flex w-fit items-center gap-[6px] rounded-br-[8px] bg-amber px-[14px] py-[5px] text-[10.5px] font-bold tracking-[0.04em] text-amber-ink">
          <Star className="size-[12px] fill-current" aria-hidden="true" />
          {t("bestValue")}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-[14px] px-[18px] py-4">
        <span
          className={`flex size-[46px] flex-none items-center justify-center rounded-[9px] text-[12.5px] font-bold tracking-[0.02em] ${CARRIER_MARK[quote.carrierId]}`}
          aria-hidden="true"
        >
          {quote.carrierId}
        </span>

        <div className="min-w-[150px] flex-1">
          <div className="flex flex-wrap items-center gap-[9px]">
            <h3 className="text-[15px] font-bold">{quote.name}</h3>
            <span
              className={`rounded-[5px] px-[6px] py-[3px] font-mono text-[9.5px] font-semibold ${MODE_UI[quote.mode].chip}`}
            >
              {quote.mode}
            </span>
          </div>
          <p className="mt-[5px] flex items-center gap-2">
            <Stars rating={quote.rating} />
            <span className="text-[12px] font-semibold text-ink-600">
              {quote.rating.toFixed(1)}
            </span>
          </p>
          <p className="mt-1 text-[11.5px] text-ink-500">
            {quote.reviews.toLocaleString("en-US")} {tc("reviews")} · {quote.onTimePct}%{" "}
            {tc("onTime")}
          </p>
        </div>

        <div className="flex-none text-right">
          <p
            className={`font-mono text-[23px] font-semibold tracking-[-0.03em] ${
              best ? "text-amber-ink" : "text-ink"
            }`}
          >
            {money(quote.allIn)}
          </p>
          <p className="mt-px text-[11px] text-ink-500">{t("allInTotal")}</p>
          <p
            className={`mt-1 text-[11.5px] font-semibold ${
              vsPct <= 0 ? "text-success-ink" : "text-warning-ink-strong"
            }`}
          >
            {Math.abs(vsPct)}% {vsPct <= 0 ? t("belowMarket") : t("aboveMarket")}
          </p>
        </div>
      </div>

      {/* Stacks below 640px so the four figures never squeeze (DESIGN.md
          § Responsive). */}
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3 border-t border-page-alt bg-[#FCFDFE] px-[18px] py-[13px]">
        {breakdown.map(({ label, value }) => (
          <div key={label}>
            <p className="micro-label text-[9.5px] font-normal tracking-[0.08em] text-ink-500">
              {label}
            </p>
            <p className="mt-[3px] font-mono text-[13px] font-semibold">{value}</p>
          </div>
        ))}

        <div className="flex-1" />

        {/* Feature 5 builds the booking screen; the selection travels in the
            URL so it does not need new plumbing when it does. */}
        <Link
          href={`/booking?quote=${quoteId}&carrier=${quote.carrierId}&mode=${quote.mode}`}
          className={`flex min-h-[44px] flex-none cursor-pointer items-center gap-2 rounded-control px-5 text-[13px] font-semibold transition-[filter] duration-150 hover:brightness-110 ${
            best ? "bg-amber text-amber-ink" : "bg-navy text-white"
          }`}
        >
          {t("bookNow")}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
