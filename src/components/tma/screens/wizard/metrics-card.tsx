"use client";

import { useTranslations } from "next-intl";
import { cargoMetrics } from "@/lib/pricing";
import type { WizardSpec } from "@/lib/wizard/spec";

// Formatting only. Every number here comes out of lib/pricing so the panel and
// the quotes can never disagree about what the shipment weighs or classes as.
// Fewer decimals than the web panel — four figures share a 380px card, and the
// comp drops them for the same reason.
export function MetricsCard({ spec }: { spec: WizardSpec }) {
  const t = useTranslations("tma.wizard");
  const web = useTranslations("wizard");
  const metrics = cargoMetrics(spec);

  const rows = [
    { label: t("volume"), value: `${metrics.volumeM3.toFixed(2)} m³`, tone: "" },
    { label: t("volWeight"), value: `${metrics.volWeightKg.toFixed(0)} kg`, tone: "" },
    {
      label: t("chargeable"),
      value: `${metrics.chargeableKg.toFixed(0)} kg`,
      tone: "text-blue",
    },
    {
      label: t("freightClass"),
      value: web("classValue", { n: metrics.freightClass }),
      tone: "text-success-ink",
    },
  ];

  return (
    <div aria-live="polite" className="mt-3.5 rounded-card border border-border bg-surface p-3.5">
      <p className="micro-label text-[10px] text-ink-500">{t("calcMetrics")}</p>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[10.5px] text-ink-500">{row.label}</dt>
            <dd className={`mt-[3px] font-mono text-[15px] font-semibold ${row.tone}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-[11px] text-pretty text-[11px] leading-[1.5] text-ink-500">
        {t("classNote")}
      </p>
    </div>
  );
}
