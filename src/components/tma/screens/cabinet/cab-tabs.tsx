"use client";

import { useTranslations } from "next-intl";
import type { CabTab } from "@/lib/tma/state";

const TABS: { tab: CabTab; key: "tabAll" | "tabShipments" | "tabQuotes" }[] = [
  { tab: "all", key: "tabAll" },
  { tab: "shipments", key: "tabShipments" },
  { tab: "quotes", key: "tabQuotes" },
];

// Same segmented control as the results sort, at TMA.md's 44px floor rather than
// the comp's 40 — the same correction Feature 10 made to the mode chips.
export function CabTabs({
  active,
  onPick,
}: {
  active: CabTab;
  onPick: (tab: CabTab) => void;
}) {
  const t = useTranslations("tma.ships");
  const web = useTranslations("cabinet");

  return (
    <div
      role="group"
      aria-label={web("title")}
      className="mb-3 flex gap-1 rounded-[10px] bg-border p-1"
    >
      {TABS.map(({ tab, key }) => {
        const on = tab === active;
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(tab)}
            className={`min-h-11 flex-1 cursor-pointer rounded-[7px] py-[9px] text-[11.5px] font-semibold transition-colors duration-150 ${
              on ? "bg-surface text-ink" : "text-ink-500 hover:text-ink"
            }`}
          >
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
