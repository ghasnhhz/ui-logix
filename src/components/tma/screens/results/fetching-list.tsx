"use client";

import { useTranslations } from "next-intl";

// The comp's own widths — five rows of unequal length so the block reads as
// content arriving rather than as a loading graphic.
const SKELETONS = [
  { title: "54%", meta: "34%" },
  { title: "44%", meta: "40%" },
  { title: "60%", meta: "28%" },
  { title: "38%", meta: "44%" },
  { title: "50%", meta: "32%" },
];

export function FetchingList() {
  const t = useTranslations("tma.main");

  return (
    <div className="enter">
      <div
        className="flex items-center gap-[11px] rounded-card border border-border bg-surface p-[15px]"
        role="status"
      >
        <span
          className="size-[18px] flex-none animate-spin rounded-full border-2 border-mode-air border-t-blue"
          aria-hidden="true"
        />
        <span className="text-pretty text-[13.5px] font-bold tracking-[-0.01em]">
          {t("fetching")}
        </span>
      </div>

      <div className="mt-[9px] flex flex-col gap-[9px]" aria-hidden="true">
        {SKELETONS.map((row) => (
          <div
            key={row.title}
            className="flex animate-pulse items-center gap-[11px] rounded-card border border-page-alt bg-surface p-3.5"
          >
            <span className="size-10 flex-none rounded-[9px] bg-page-alt" />
            <span className="flex-1">
              <span className="block h-2.5 rounded-[4px] bg-page-alt" style={{ width: row.title }} />
              <span
                className="mt-1.5 block h-2 rounded-[4px] bg-page"
                style={{ width: row.meta }}
              />
            </span>
            <span className="h-[18px] w-14 flex-none rounded-[5px] bg-page-alt" />
          </div>
        ))}
      </div>
    </div>
  );
}
