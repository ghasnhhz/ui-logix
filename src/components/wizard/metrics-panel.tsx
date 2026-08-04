"use client";

import { useTranslations } from "next-intl";
import { cargoMetrics } from "@/lib/pricing";
import type { WizardSpec } from "@/lib/wizard/spec";

// Formatting only. Every number here comes out of lib/pricing so the panel and
// the quotes can never disagree about what the shipment weighs or classes as.
export function MetricsPanel({ spec }: { spec: WizardSpec }) {
  const t = useTranslations("wizard");
  const metrics = cargoMetrics(spec);

  const rows = [
    { label: t("volume"), value: `${metrics.volumeM3.toFixed(3)} m³`, tone: "" },
    { label: t("volWeight"), value: `${metrics.volWeightKg.toFixed(1)} kg`, tone: "" },
    {
      label: t("chargeable"),
      value: `${metrics.chargeableKg.toFixed(1)} kg`,
      tone: "text-blue",
    },
    {
      label: t("freightClass"),
      value: t("classValue", { n: metrics.freightClass }),
      tone: "text-success-ink",
    },
  ];

  return (
    <div
      aria-live="polite"
      className="mt-4 rounded-[11px] border border-border bg-page p-[15px]"
    >
      <p className="micro-label text-[10.5px] text-ink-500">{t("calcMetrics")}</p>
      <dl className="mt-3 grid grid-cols-2 gap-[14px] sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[11.5px] text-ink-500">{row.label}</dt>
            <dd className={`mt-1 font-mono text-[15px] font-semibold ${row.tone}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
