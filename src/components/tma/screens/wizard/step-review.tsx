"use client";

import { Calendar, Flag, MapPin, Package, Ruler, Scale, Tag, Truck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cargoMetrics, PLACES } from "@/lib/pricing";
import { shipDateLabel } from "@/lib/ui/dates";
import type { WizardSpec } from "@/lib/wizard/spec";

/**
 * Unlike the web review, every row here is a shortcut back to the step that
 * owns it. There is no visible stepper on a phone to tap, so this list is the
 * only way back into the middle of the wizard without walking the BackButton.
 */
export function StepReview({
  spec,
  goStep,
}: {
  spec: WizardSpec;
  goStep: (step: number) => void;
}) {
  const t = useTranslations("tma.wizard");
  const labels = useTranslations("tma.review");
  const cargo = useTranslations("tma.cargo");
  const web = useTranslations("wizard");
  const common = useTranslations("common");
  const metrics = cargoMetrics(spec);

  const rows = [
    { Icon: MapPin, label: labels("origin"), value: PLACES[spec.origin], step: 1 },
    { Icon: Flag, label: labels("dest"), value: PLACES[spec.destination], step: 1 },
    { Icon: Calendar, label: labels("shipDate"), value: shipDateLabel(common, spec.date), step: 1 },
    { Icon: Truck, label: labels("mode"), value: spec.mode, step: 2 },
    {
      Icon: Package,
      label: labels("cargo"),
      value: cargo(`${spec.cargoType}Label`),
      step: 3,
    },
    {
      Icon: Tag,
      label: labels("freightClass"),
      value: web("classValue", { n: metrics.freightClass }),
      step: 3,
    },
    { Icon: Scale, label: labels("weight"), value: `${Math.round(metrics.weightKg)} kg`, step: 4 },
    {
      Icon: Ruler,
      label: labels("dims"),
      value: `${spec.lengthCm}×${spec.widthCm}×${spec.heightCm} cm`,
      step: 4,
    },
  ];

  return (
    <div className="mt-4">
      <ul className="overflow-hidden rounded-card border border-border bg-surface">
        {rows.map(({ Icon, label, value, step }) => (
          <li key={label} className="border-b border-page-alt last:border-b-0">
            <button
              type="button"
              onClick={() => goStep(step)}
              className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 px-[14px] py-[13px] text-left transition-colors duration-150 hover:bg-page"
            >
              <Icon className="size-[15px] flex-none text-ink-500" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="micro-label block text-[9px] text-ink-400">{label}</span>
                <span className="mt-[3px] block text-[13px] font-semibold">{value}</span>
              </span>
              <span className="flex-none text-[11.5px] font-semibold text-blue">{t("edit")}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-start gap-2.5 rounded-card border border-[#FDE68A] bg-warning px-[14px] py-[13px]">
        <Zap className="mt-px size-[14px] flex-none text-[#92400E]" aria-hidden="true" />
        <div>
          <p className="text-[12.5px] font-bold text-[#92400E]">{t("readyTitle")}</p>
          <p className="mt-[3px] text-pretty text-[11px] leading-[1.5] text-[#A16207]">
            {t("readyBody")}
          </p>
        </div>
      </div>
    </div>
  );
}
