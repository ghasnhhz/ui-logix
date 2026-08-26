"use client";

import { useTranslations } from "next-intl";
import type { ModeFilter } from "@/lib/pricing";

// ALL first, then the comp's order. The counts come from `modeCounts`, which
// counts carriers on ALL and quotes on a mode — the chip reads 6, not 18.
const FILTERS = [
  { value: "ALL", key: "allModes" },
  { value: "AIR", key: "airFreight" },
  { value: "LTL", key: "ltlTrucking" },
  { value: "FTL", key: "ftlTrucking" },
  { value: "FCL", key: "fclOcean" },
] as const satisfies readonly { value: ModeFilter; key: string }[];

export function ModeChips({
  active,
  counts,
  onPick,
}: {
  active: ModeFilter;
  counts: Record<ModeFilter, number>;
  onPick: (filter: ModeFilter) => void;
}) {
  const t = useTranslations("tma.results");

  return (
    <div
      role="group"
      aria-label={t("allModes")}
      className="-mx-3.5 flex gap-1.5 overflow-x-auto px-3.5 pb-1 pt-3"
    >
      {FILTERS.map(({ value, key }) => {
        const on = value === active;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(value)}
            className={`flex min-h-10 flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-control border px-3 py-2 text-[11.5px] font-semibold transition-colors duration-150 ${
              on
                ? "border-[1.5px] border-blue bg-info text-blue-hover"
                : "border-border bg-surface text-ink-600 hover:border-border-strong"
            }`}
          >
            {t(key)}
            <span className="font-mono opacity-55">{counts[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
