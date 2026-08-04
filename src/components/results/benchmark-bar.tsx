"use client";

import { useTranslations } from "next-intl";
import { money } from "@/lib/ui/money";

export function BenchmarkBar({ median, saving }: { median: number; saving: number }) {
  const t = useTranslations("results");

  return (
    <div className="min-w-[230px] flex-none rounded-card border border-[#A7F3D0] bg-[#ECFDF5] px-[18px] py-[14px]">
      <p className="micro-label text-[9.5px] font-normal tracking-[0.1em] text-success-ink">
        {t("marketBenchmark")}
      </p>
      <p className="mt-[6px] font-mono text-[24px] font-semibold tracking-[-0.02em] text-success-ink">
        {money(median)}
      </p>
      <p className="mt-1 text-pretty text-[11.5px] text-success-ink">
        {t("benchSaveUpTo", { amount: money(saving) })}
      </p>
    </div>
  );
}
