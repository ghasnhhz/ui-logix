"use client";

import { useTranslations } from "next-intl";
import { isError, post } from "@/lib/ui/api-client";
import { createQuote } from "@/lib/ui/quote-request";
import { useTmaApp } from "./app-provider";
import { useTelegram } from "./telegram-provider";

// The mobile comp's timing, 100ms under the web's floor. A parameter rather
// than a second helper, so one module still decides what a rate fetch feels
// like on both surfaces.
const TMA_FETCH_MS = 1500;

type Account = { id: string; email: string; company: string; phone: string | null };

/**
 * The two async paths behind Telegram's MainButton.
 *
 * The order in `submitSignup` is the product promise and nothing may be
 * reordered out of it: the account exists, then the session exists, then the
 * quote is in Postgres — and only then does a price reach the screen. A quote
 * that died on refresh would break the very thing the gate asks for.
 */
export function useQuoteFlow() {
  const { state, dispatch } = useTmaApp();
  const { app } = useTelegram();
  const tc = useTranslations("common");

  async function runQuote() {
    const quote = await createQuote(state.spec, tc("genericError"), TMA_FETCH_MS);
    if (isError(quote)) {
      dispatch({ type: "fetchFailed", error: quote.error });
      return;
    }
    dispatch({ type: "fetchDone", quoteId: quote.data.id, quotes: quote.data.results });
  }

  async function startFetch() {
    dispatch({ type: "fetchStart" });
    await runQuote();
  }

  async function submitSignup() {
    // The mock and any plain browser carry no initData (D-050), so there is
    // nothing for the server to verify and no account to be had.
    const initData = app?.initData;
    if (!initData) {
      dispatch({
        type: "submitFailed",
        error: { message: "No Telegram initData", code: "telegramRejected" },
      });
      return;
    }

    dispatch({ type: "submitStart" });

    const account = await post<Account>(
      "/api/auth/telegram/signup",
      {
        initData,
        company: state.gateForm.company.trim(),
        phone: state.gateForm.phone.trim() || undefined,
      },
      tc("genericError")
    );
    if (isError(account)) {
      dispatch({ type: "submitFailed", error: account.error });
      return;
    }

    dispatch({ type: "signedIn", account: account.data });
    dispatch({ type: "fetchStart" });
    await runQuote();
  }

  return { startFetch, submitSignup };
}
