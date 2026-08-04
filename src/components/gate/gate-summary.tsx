import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cargoMetrics, PLACES } from "@/lib/pricing";
import type { WizardSpec } from "@/lib/wizard/spec";

// The user's work, made visible so it reads as unlost — and deliberately no
// number that hints at a price. DESIGN.md § Gate: not partially, not blurred.
export function GateSummary({ spec }: { spec: WizardSpec }) {
  const t = useTranslations("gate");
  const tw = useTranslations("wizard");
  const metrics = cargoMetrics(spec);

  const chips = [
    spec.mode,
    `${Math.round(metrics.weightKg)} kg`,
    `${metrics.volumeM3.toFixed(2)} m³`,
    tw("classValue", { n: metrics.freightClass }),
  ];

  return (
    <div className="mb-[22px]">
      <p className="inline-flex items-center gap-[7px] rounded-full bg-[#FEF3C7] px-[11px] py-[5px] text-[11px] font-bold tracking-[0.03em] text-[#92400E]">
        <Lock className="size-[13px] flex-none" aria-hidden="true" />
        {t("oneStepLeft")}
      </p>

      <h1 className="mt-[14px] text-pretty text-[20px] font-bold tracking-[-0.025em]">
        {t("title")}
      </h1>
      <p className="mt-2 text-pretty text-[12.5px] leading-relaxed text-ink-500">{t("sub")}</p>

      <div className="mt-4 rounded-[11px] border border-border bg-page p-[14px]">
        <p className="micro-label text-[9.5px] font-normal tracking-[0.1em] text-ink-500">
          {t("summary")}
        </p>
        <p className="mt-[6px] text-[13px] font-bold">
          {PLACES[spec.origin]} → {PLACES[spec.destination]}
        </p>
        <ul className="mt-2 flex flex-wrap items-center gap-[10px]">
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-[5px] border border-border bg-surface px-[7px] py-[3px] font-mono text-[10.5px] font-semibold text-ink-600"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
