"use client";

import { useTranslations } from "next-intl";
import { selectedQuote } from "@/lib/tma/selectors";
import { isError, post } from "@/lib/ui/api-client";
import { useTmaApp } from "./app-provider";
import { useTelegram } from "./telegram-provider";

/**
 * The third path behind Telegram's MainButton, and the whole of booking on this
 * surface — the comp has no booking screen (TMA.md § Screens).
 *
 * `POST /api/bookings` is the web's handler, unchanged: the carrier and mode go
 * up as identifiers only and the money is read server-side off the stored quote
 * row, so the shipper is charged the number the card showed them.
 */
export function useBooking() {
  const { state, dispatch } = useTmaApp();
  const { user } = useTelegram();
  const tc = useTranslations("common");

  async function confirmBooking() {
    const quote = selectedQuote(state);
    if (!state.quoteId || !quote) {
      dispatch({
        type: "submitFailed",
        error: { message: "No quote selected", code: "carrierUnavailable" },
      });
      return;
    }

    const company = state.gateForm.company.trim();
    // D-057. The carrier needs a person to call for; Telegram's display name is
    // the only one this surface has, and the sheet shows it above the fields so
    // it is never a surprise. It is contact detail, not an identity claim —
    // nothing is authorised by it.
    const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

    dispatch({ type: "submitStart" });

    const booking = await post<{ reference: string }>(
      "/api/bookings",
      {
        quoteId: state.quoteId,
        carrierId: quote.carrierId,
        mode: quote.mode,
        contactName: displayName.length >= 2 ? displayName : company,
        company,
        phone: state.gateForm.phone.trim(),
        // Blank falls back to the account's synthetic address (D-054), which is
        // what a booking would have carried before this field existed.
        email: state.gateForm.email.trim() || state.account?.email,
      },
      tc("genericError")
    );

    if (isError(booking)) {
      dispatch({ type: "submitFailed", error: booking.error });
      return;
    }

    dispatch({ type: "booked", reference: booking.data.reference });
  }

  return { confirmBooking };
}
