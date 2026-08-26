"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Stars } from "@/components/results/stars";
import type { Quote } from "@/lib/pricing";
import { CARRIER_MARK } from "@/lib/ui/carriers";
import { MODE_UI } from "@/lib/ui/modes";
import { money } from "@/lib/ui/money";

export function TmaQuoteCard({
  quote,
  vsPct,
  best,
  onBook,
}: {
  quote: Quote;
  vsPct: number;
  best: boolean;
  onBook: () => void;
}) {
  const t = useTranslations("tma.results");
  const units = useTranslations("tma.units");

  // The comp shows base, fuel and transit only — insurance and THC are in the
  // all-in figure but there is no room for five columns at 380px.
  const breakdown = [
    { label: t("baseRate"), value: money(quote.base) },
    { label: t("fuelSurcharge"), value: money(quote.fuel) },
    { label: t("transit"), value: `${quote.transitDays}${units("days")}` },
  ];

  return (
    <article
      className={`overflow-hidden rounded-card bg-surface ${
        best ? "border-[1.5px] border-amber" : "border border-border"
      }`}
    >
      {best && (
        <p className="flex w-fit items-center gap-1.5 rounded-br-[8px] bg-amber px-3 py-[5px] text-[9px] font-bold tracking-[0.05em] text-amber-ink">
          <Star className="size-[10px] fill-current" aria-hidden="true" />
          {t("bestValue")}
        </p>
      )}

      <div className="p-[13px]">
        <div className="flex items-start gap-[11px]">
          <span
            className={`flex size-10 flex-none items-center justify-center rounded-[9px] text-[11px] font-bold ${CARRIER_MARK[quote.carrierId]}`}
            aria-hidden="true"
          >
            {quote.carrierId}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[7px]">
              <h3 className="truncate text-[13.5px] font-bold">{quote.name}</h3>
              <span
                className={`flex-none rounded-chip px-[5px] py-[2px] font-mono text-[9px] font-semibold ${MODE_UI[quote.mode].chip}`}
              >
                {quote.mode}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <Stars rating={quote.rating} />
              <span className="text-[11px] font-semibold text-ink-600">
                {quote.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-[3px] text-[10.5px] text-ink-400">
              {quote.reviews.toLocaleString("en-US")} {units("reviews")} · {quote.onTimePct}%{" "}
              {units("onTime")}
            </p>
          </div>

          <div className="flex-none text-right">
            {/* The comp paints the winning price #F5A623, about 2:1 on white.
                The web card takes amber-ink for the same figure and so does
                this one — same trade as D-027 and D-031. */}
            <p
              className={`font-mono text-[18px] font-semibold tracking-[-0.02em] ${
                best ? "text-amber-ink" : ""
              }`}
            >
              {money(quote.allIn)}
            </p>
            <p className="text-[9.5px] text-ink-400">{t("allInTotal")}</p>
            <p
              className={`mt-[3px] text-[10.5px] font-semibold ${
                vsPct <= 0 ? "text-success-ink" : "text-warning-ink-strong"
              }`}
            >
              {Math.abs(vsPct)}% {vsPct <= 0 ? t("belowMarket") : t("aboveMarket")}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3.5 border-t border-page-alt pt-[11px]">
          {breakdown.map((cell) => (
            <div key={cell.label}>
              <p className="micro-label text-[8.5px] text-ink-400">{cell.label}</p>
              <p className="mt-[2px] font-mono text-[12px] font-semibold">{cell.value}</p>
            </div>
          ))}

          <button
            type="button"
            onClick={onBook}
            className={`ml-auto min-h-[42px] flex-none cursor-pointer whitespace-nowrap rounded-control px-[15px] text-[12px] font-bold transition-[filter] duration-150 hover:brightness-110 ${
              best ? "bg-amber text-amber-ink" : "bg-navy text-white"
            }`}
          >
            {t("book")}
          </button>
        </div>
      </div>
    </article>
  );
}
