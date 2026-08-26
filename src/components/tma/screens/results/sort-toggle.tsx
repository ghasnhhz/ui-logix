"use client";

import { useTranslations } from "next-intl";
import { SORT_KEYS, type SortKey } from "@/lib/pricing";

const LABELS: Record<SortKey, "sortPrice" | "sortFast" | "sortRated"> = {
  price: "sortPrice",
  fast: "sortFast",
  rated: "sortRated",
};

export function SortToggle({
  active,
  onPick,
}: {
  active: SortKey;
  onPick: (sort: SortKey) => void;
}) {
  const t = useTranslations("tma.results");
  const web = useTranslations("results");

  return (
    <div
      role="group"
      aria-label={web("sortBy")}
      className="mt-2 flex gap-1 rounded-[10px] bg-border p-1"
    >
      {SORT_KEYS.map((key) => {
        const on = key === active;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(key)}
            className={`min-h-10 flex-1 cursor-pointer rounded-[7px] py-[9px] text-[11px] font-semibold transition-colors duration-150 ${
              on ? "bg-surface text-ink" : "text-ink-500 hover:text-ink"
            }`}
          >
            {t(LABELS[key])}
          </button>
        );
      })}
    </div>
  );
}
