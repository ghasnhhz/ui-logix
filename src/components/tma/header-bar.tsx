"use client";

import { ChevronLeft, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { headKey, showBackButton } from "@/lib/tma/state";
import { cityName } from "@/lib/ui/places";
import { useTmaApp } from "./app-provider";
import { useTmaLocale } from "./messages-provider";
import { useTelegram } from "./telegram-provider";

export function HeaderBar() {
  const { state, dispatch } = useTmaApp();
  const { viewport, mock } = useTelegram();
  const t = useTranslations("tma.head");
  const common = useTranslations("common");
  const { locale, setLocale } = useTmaLocale();

  const lane = `${cityName(state.spec.origin)} → ${cityName(state.spec.destination)}`;
  const logo = state.screen === "start" || (state.screen === "wizard" && state.step === 1);

  const sub = () => {
    switch (state.screen) {
      case "start":
        return t("startSub");
      case "wizard":
        return state.guest ? t("calcGuest") : lane;
      case "results":
        return `${lane} · ${state.spec.mode}`;
      case "done":
        return lane;
      default:
        // Feature 12 fills these with the company and the record count.
        return "";
    }
  };

  return (
    <header
      className="flex flex-none items-center gap-2.5 bg-navy px-3.5 pb-3"
      style={{ paddingTop: `${12 + viewport.safeTop}px` }}
    >
      {/* Telegram draws the real back control outside the webview; the mock has
          no chrome of its own, so the browser gets one here. */}
      {mock && showBackButton(state) && (
        <button
          type="button"
          onClick={() => dispatch({ type: "back" })}
          aria-label={common("back")}
          className="flex size-[30px] flex-none cursor-pointer items-center justify-center rounded-[8px] text-white transition-colors duration-150 hover:bg-navy-hover"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      )}

      {logo && (
        <span className="flex size-[30px] flex-none items-center justify-center rounded-[8px] bg-amber text-amber-ink">
          <Truck className="size-4" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold tracking-[-0.01em] text-white">
          {t(headKey(state))}
        </div>
        <div className="truncate text-[10.5px] text-navy-muted">{sub()}</div>
      </div>

      <div
        role="group"
        aria-label={common("language")}
        className="flex flex-none gap-[3px] rounded-[7px] bg-navy-hover p-[3px]"
      >
        {locales.map((option) => {
          const on = option === locale;
          return (
            <button
              key={option}
              type="button"
              lang={option}
              aria-current={on ? "true" : undefined}
              onClick={() => setLocale(option as Locale)}
              // The pill is the comp's size; the touch target is not. The
              // pseudo-element takes the tappable area to 44px tall without
              // growing a header that Telegram already crowds from above.
              className={`relative cursor-pointer rounded-[5px] px-[9px] py-[4px] text-[10px] font-bold uppercase transition-colors duration-150 after:absolute after:inset-x-0 after:-inset-y-[11px] after:content-[''] ${
                on ? "bg-blue text-white" : "text-navy-muted hover:text-white"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </header>
  );
}
