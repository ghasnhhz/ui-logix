"use client";

import { useTranslations } from "next-intl";
import type { SortKey } from "@/lib/pricing";

const OPTIONS = [
  { value: "price", key: "sortPrice" },
  { value: "fast", key: "sortFast" },
  { value: "rated", key: "sortRated" },
] as const satisfies readonly { value: SortKey; key: string }[];

export function SortControl({
  active,
  onPick,
}: {
  active: SortKey;
  onPick: (sort: SortKey) => void;
}) {
  const t = useTranslations("results");

  return (
    <div className="rounded-[13px] border border-border bg-surface p-[14px]">
      <p className="micro-label mb-[10px] text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
        {t("sortBy")}
      </p>
      <div className="flex flex-col gap-[3px]" role="radiogroup" aria-label={t("sortBy")}>
        {OPTIONS.map(({ value, key }) => {
          const on = value === active;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(value)}
              className={`flex min-h-[40px] w-full cursor-pointer items-center gap-[9px] rounded-[8px] px-[11px] py-[9px] text-left transition-colors duration-150 hover:bg-page ${
                on ? "bg-info" : ""
              }`}
            >
              <span
                className={`size-[7px] flex-none rounded-full ${on ? "bg-blue" : "bg-border-strong"}`}
                aria-hidden="true"
              />
              <span
                className={`min-w-0 text-pretty text-[12.5px] font-semibold leading-tight ${
                  on ? "text-info-ink" : "text-ink-600"
                }`}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
