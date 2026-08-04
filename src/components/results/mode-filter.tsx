"use client";

import { useTranslations } from "next-intl";
import type { ModeFilter as Filter } from "@/lib/pricing";
import { MODE_UI } from "@/lib/ui/modes";

const OPTIONS = [
  { value: "ALL", chip: "bg-mode-all text-mode-all-ink", key: "allModes" },
  { value: "AIR", chip: MODE_UI.AIR.chip, key: "airFreight" },
  { value: "LTL", chip: MODE_UI.LTL.chip, key: "ltlTrucking" },
  { value: "FTL", chip: MODE_UI.FTL.chip, key: "ftlTrucking" },
  { value: "FCL", chip: MODE_UI.FCL.chip, key: "fclOcean" },
] as const satisfies readonly { value: Filter; chip: string; key: string }[];

export function ModeFilter({
  active,
  counts,
  onPick,
}: {
  active: Filter;
  counts: Record<Filter, number>;
  onPick: (filter: Filter) => void;
}) {
  const t = useTranslations("results");

  return (
    <div className="rounded-[13px] border border-border bg-surface p-[14px]">
      <p className="micro-label mb-[10px] text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
        {t("transportMode")}
      </p>
      <div className="flex flex-col gap-[3px]">
        {OPTIONS.map(({ value, chip, key }) => {
          const on = value === active;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(value)}
              className={`flex min-h-[40px] w-full cursor-pointer items-center gap-[9px] rounded-[8px] px-[11px] py-[9px] text-left transition-colors duration-150 hover:bg-page ${
                on ? "bg-info" : ""
              }`}
            >
              <span
                className={`min-w-[30px] flex-none rounded-chip px-[5px] py-[2px] text-center font-mono text-[9.5px] font-semibold ${chip}`}
              >
                {value}
              </span>
              {/* Wraps rather than truncates: "LTL yuk mashinasi" and "Все
                  способы" both outrun the 200px rail, and a clipped filter
                  label is a filter the user cannot read. */}
              <span
                className={`min-w-0 flex-1 text-pretty text-[12.5px] font-semibold leading-tight ${
                  on ? "text-info-ink" : "text-ink-600"
                }`}
              >
                {t(key)}
              </span>
              <span className="flex-none font-mono text-[10.5px] text-ink-500">
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
