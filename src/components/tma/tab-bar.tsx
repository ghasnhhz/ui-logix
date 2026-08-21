"use client";

import { Archive, FilePlus, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Screen } from "@/lib/tma/state";
import { useTmaApp } from "./app-provider";
import { useTelegram } from "./telegram-provider";

// Ours, not Telegram's — so it yields to the MainButton and only appears once
// the user has an account (D-047).
const TABS = [
  { screen: "home", Icon: LayoutDashboard, key: "home" },
  { screen: "wizard", Icon: FilePlus, key: "quote" },
  { screen: "ships", Icon: Archive, key: "ships" },
] as const satisfies readonly { screen: Screen; Icon: unknown; key: string }[];

export function TabBar() {
  const { state, dispatch } = useTmaApp();
  const { viewport } = useTelegram();
  const t = useTranslations("tma.tabs");

  return (
    <nav
      className="flex flex-none border-t border-border bg-surface px-2.5 pt-2"
      style={{ paddingBottom: `${8 + viewport.safeBottom}px` }}
    >
      {TABS.map(({ screen, Icon, key }) => {
        const on = state.screen === screen;
        return (
          <button
            key={screen}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() =>
              screen === "wizard"
                ? dispatch({ type: "goStep", step: 1 })
                : dispatch({ type: "go", screen })
            }
            className={`flex min-h-[48px] flex-1 cursor-pointer flex-col items-center gap-1 py-1.5 transition-colors duration-150 ${
              on ? "text-blue" : "text-ink-400 hover:text-ink-500"
            }`}
          >
            <Icon className="size-[17px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">{t(key)}</span>
          </button>
        );
      })}
    </nav>
  );
}
