"use client";

import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTmaApp } from "./app-provider";
import { SignupBody } from "./gate/signup-body";
import { useTelegram } from "./telegram-provider";

/**
 * One sheet, two modes — the comp's biggest structural difference from the web
 * build (TMA.md § Screens). A guest gets signup; a member gets the booking
 * confirm, which Feature 11 fills in. It is mounted only while open, so the
 * focus move below runs once per opening.
 */
export function GateSheet() {
  const { state, dispatch } = useTmaApp();
  const { viewport } = useTelegram();
  const t = useTranslations("tma.gate");
  const heading = useRef<HTMLHeadingElement>(null);

  const close = () => dispatch({ type: "closeGate" });

  useEffect(() => {
    heading.current?.focus();
  }, []);

  // Telegram's BackButton closes the sheet in a real client; a keyboard needs
  // the same way out of a modal.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch({ type: "closeGate" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const signup = state.guest;

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-[rgba(15,23,42,.45)]">
      <button
        type="button"
        onClick={close}
        aria-label={t(signup ? "keepComparing" : "backToRates")}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tma-gate-title"
        className="sheet-in relative max-h-[88%] w-full overflow-y-auto rounded-t-[18px] bg-surface px-4 pt-4"
        style={{ paddingBottom: `${26 + viewport.safeBottom}px` }}
      >
        <span
          className="mx-auto mb-3.5 block h-1 w-[38px] rounded-[3px] bg-border-strong"
          aria-hidden="true"
        />

        <p className="flex w-fit items-center gap-[7px] rounded-full bg-[#FEF3C7] px-[11px] py-[5px] text-[10px] font-bold tracking-[0.03em] text-[#92400E]">
          <Lock className="size-[11px] flex-none" aria-hidden="true" />
          {t("oneStepLeft")}
        </p>

        <h2
          id="tma-gate-title"
          ref={heading}
          tabIndex={-1}
          className="mt-3 text-pretty text-[18px] font-bold tracking-[-0.025em] outline-none"
        >
          {t(signup ? "title" : "titleBook")}
        </h2>
        <p className="mt-1.5 text-pretty text-[12px] leading-[1.55] text-ink-500">
          {t(signup ? "subSignup" : "subBook")}
        </p>

        {signup ? <SignupBody /> : <BookingScaffold />}

        <button
          type="button"
          onClick={close}
          className="mt-3.5 min-h-11 w-full cursor-pointer text-[11.5px] font-semibold text-ink-400 transition-colors duration-150 hover:text-ink-500"
        >
          {t(signup ? "keepComparing" : "backToRates")}
        </button>
      </div>
    </div>
  );
}

// The booking half of the sheet is Feature 11 — the same placeholder convention
// the screens use, so it is never mistaken for finished work.
function BookingScaffold() {
  return (
    <div className="mt-3.5 rounded-card border border-dashed border-border-strong bg-surface p-4 font-mono text-xs text-ink-500">
      <div className="text-ink">sheet · booking</div>
      <div className="mt-1">feature-11</div>
    </div>
  );
}
