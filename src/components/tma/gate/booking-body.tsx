"use client";

import { useTranslations } from "next-intl";
import { selectedQuote } from "@/lib/tma/state";
import { CARRIER_MARK } from "@/lib/ui/carriers";
import { resolveError } from "@/lib/ui/form-error";
import { money } from "@/lib/ui/money";
import { cityName } from "@/lib/ui/places";
import { useTmaApp } from "../app-provider";
import { ContactFields } from "./contact-fields";
import { TelegramRow } from "./telegram-row";

const FIELDS = ["company", "phone", "email"] as const;

/**
 * The sheet's second mode, and the whole of booking on this surface — the comp
 * has no booking screen (TMA.md § Screens). Nothing here prices anything: the
 * carrier, the total and the transit are read off the row the server persisted
 * and the card rendered.
 */
export function BookingBody() {
  const { state } = useTmaApp();
  const notes = useTranslations("tma.notes");
  const units = useTranslations("tma.units");
  const te = useTranslations("errors");

  const quote = selectedQuote(state);

  // Expiry, ownership and a double-book all come back named after no field, so
  // they land as the form-level line under the inputs.
  const shown = resolveError(state.error, { fields: FIELDS, t: te, foreign: te("invalid") });

  return (
    <>
      {quote && (
        <div className="mt-3.5 flex items-center gap-[11px] rounded-card border border-border bg-page p-3">
          <span
            className={`flex size-[38px] flex-none items-center justify-center rounded-[9px] text-[11px] font-bold ${CARRIER_MARK[quote.carrierId]}`}
            aria-hidden="true"
          >
            {quote.carrierId}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold">{quote.name}</p>
            <p className="mt-[2px] truncate text-[10.5px] text-ink-500">
              {cityName(state.spec.origin)} → {cityName(state.spec.destination)}
            </p>
          </div>
          <div className="flex-none text-right">
            {/* The comp paints this total #F5A623, about 2:1 on the card. Same
                trade as the quote card behind it (D-027, D-031). */}
            <p className="font-mono text-[15px] font-semibold text-amber-ink">
              {money(quote.allIn)}
            </p>
            <p className="text-[10px] text-ink-400">
              {quote.transitDays}
              {units("days")}
            </p>
          </div>
        </div>
      )}

      <TelegramRow />

      <ContactFields shown={shown} withEmail />

      {shown && !shown.field && (
        <p role="alert" className="mt-3 text-[11.5px] text-danger-ink">
          {shown.message}
        </p>
      )}

      <p className="mt-3.5 rounded-control bg-page p-3 text-pretty text-[11.5px] leading-[1.55] text-ink-500">
        {notes("settle")}
      </p>
    </>
  );
}
