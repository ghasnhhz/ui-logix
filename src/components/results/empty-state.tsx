"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function EmptyState({ onReset }: { onReset: () => void }) {
  const t = useTranslations("results");

  return (
    <div className="rounded-[13px] border border-dashed border-border-strong bg-surface p-[34px] text-center">
      <Search className="mx-auto size-6 text-ink-500" aria-hidden="true" />
      <p className="mt-3 text-[15px] font-bold">{t("noQuotesTitle")}</p>
      <p className="mx-auto mt-[7px] max-w-[420px] text-pretty text-[13px] leading-relaxed text-ink-500">
        {t("noQuotesBody")}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 min-h-[44px] cursor-pointer rounded-control bg-blue px-[18px] py-[11px] text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-blue-hover"
      >
        {t("showAllModes")}
      </button>
    </div>
  );
}
