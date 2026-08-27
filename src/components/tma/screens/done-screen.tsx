"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLACES } from "@/lib/pricing";
import { selectedQuote } from "@/lib/tma/selectors";
import { money } from "@/lib/ui/money";
import { useTmaApp } from "../app-provider";

/**
 * The confirmation, rendered from the row that was booked rather than from a
 * second copy of the same numbers — `Booking.allIn` was itself copied off that
 * row server-side (D-034), so the three figures cannot drift apart.
 */
export function DoneScreen() {
  const { state } = useTmaApp();
  const t = useTranslations("tma.done");
  const review = useTranslations("tma.review");
  const results = useTranslations("tma.results");
  const notes = useTranslations("tma.notes");
  const units = useTranslations("tma.units");

  const quote = selectedQuote(state);
  // Only reachable through a booking that succeeded, so this is a guard, not a
  // state with a design.
  if (!state.bookedRef || !quote) return null;

  const rows = [
    { label: review("carrier"), value: quote.name },
    { label: review("mode"), value: quote.mode },
    { label: review("origin"), value: PLACES[state.spec.origin] },
    { label: review("dest"), value: PLACES[state.spec.destination] },
    { label: results("transit"), value: `${quote.transitDays}${units("days")}` },
    { label: review("total"), value: money(quote.allIn) },
  ];

  return (
    <div className="enter pt-3">
      <span
        className="flex size-12 items-center justify-center rounded-full bg-success text-success-ink"
        aria-hidden="true"
      >
        <Check className="size-6" strokeWidth={2.5} />
      </span>

      <h2 className="mt-4 text-pretty text-[22px] font-bold tracking-[-0.03em]">{t("title")}</h2>
      <p className="mt-2 text-pretty text-[13px] leading-[1.55] text-ink-500">{t("sub")}</p>

      <div className="mt-[18px] overflow-hidden rounded-card border border-border bg-surface">
        <div className="border-b border-border bg-page p-3.5">
          <p className="micro-label text-[9.5px] text-ink-500">{t("bookingRef")}</p>
          <p className="mt-[3px] font-mono text-[17px] font-semibold tracking-[0.04em]">
            {state.bookedRef}
          </p>
        </div>

        <dl className="flex flex-col gap-2.5 p-3.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3 text-[12px]">
              <dt className="text-ink-500">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-3 rounded-card border border-border bg-surface p-3.5 text-pretty text-[11px] leading-[1.55] text-ink-500">
        {notes("settle")}
      </p>
      {/* The bot is the whole point of shipping this inside Telegram — the
          shipper never opens an app to hear that the truck left. */}
      <p className="mt-[11px] rounded-card bg-[#EFF6FF] p-3.5 text-pretty text-[11px] leading-[1.55] text-[#1D4ED8]">
        {notes("tgNotify")}
      </p>
    </div>
  );
}
