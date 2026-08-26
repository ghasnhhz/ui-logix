"use client";

import { useTranslations } from "next-intl";
import { money } from "@/lib/ui/money";

/**
 * The market line, recomputed over whatever is on screen — switching the mode
 * filter moves it, because the benchmark is only meaningful against the set the
 * shipper is actually comparing.
 */
export function BenchmarkStrip({ median, saving }: { median: number; saving: number }) {
  const t = useTranslations("tma.results");

  return (
    <div className="flex items-start justify-between gap-2.5 rounded-card border border-[#A7F3D0] bg-[#ECFDF5] p-3.5">
      <div>
        <p className="micro-label text-[9px] text-success-ink">{t("marketBenchmark")}</p>
        <p className="mt-[5px] font-mono text-[21px] font-semibold tracking-[-0.02em] text-success-ink">
          {money(median)}
        </p>
      </div>
      {/* #059669 in the comp, which is 3.8:1 on this fill. success-ink is the
          design system's text colour on it and reads 5.3:1. */}
      <p className="max-w-[130px] text-right text-[10.5px] leading-[1.45] text-success-ink">
        {t("benchLine", { amount: money(saving) })}
      </p>
    </div>
  );
}
