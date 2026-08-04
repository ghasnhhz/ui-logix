"use client";

import { Calendar, Flag, MapPin, Package, Ruler, Scale, Tag, Truck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cargoMetrics, PLACES } from "@/lib/pricing";
import { CARGO_UI } from "@/lib/ui/cargo";
import { useWizard } from "./wizard-provider";

export function StepReview() {
  const t = useTranslations("wizard");
  const { spec } = useWizard();
  const metrics = cargoMetrics(spec);

  const cards = [
    { Icon: MapPin, label: t("lOrigin"), value: PLACES[spec.origin] },
    { Icon: Flag, label: t("lDest"), value: PLACES[spec.destination] },
    { Icon: Calendar, label: t("lShipDate"), value: spec.date },
    { Icon: Truck, label: t("lMode"), value: spec.mode },
    {
      Icon: Package,
      label: t("lCargo"),
      value: t(`cargo${CARGO_UI[spec.cargoType].key}Label`),
    },
    { Icon: Tag, label: t("lClass"), value: t("classValue", { n: metrics.freightClass }) },
    { Icon: Scale, label: t("lWeight"), value: `${spec.weight} ${spec.unit}` },
    {
      Icon: Ruler,
      label: t("lDims"),
      value: `${spec.lengthCm}×${spec.widthCm}×${spec.heightCm} cm`,
    },
  ];

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-[-0.02em]">{t("s5Title")}</h2>

      <dl className="mt-[18px] grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {cards.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-[11px] bg-page px-[15px] py-[13px]"
          >
            <Icon className="mt-px size-[15px] flex-none text-ink-500" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="micro-label text-[9.5px] text-ink-400">{label}</dt>
              <dd className="mt-1 text-[13px] font-semibold">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-[14px] flex items-start gap-[11px] rounded-[11px] border border-[#FDE68A] bg-warning px-[17px] py-[15px]">
        <Zap className="mt-px size-[15px] flex-none text-[#92400E]" aria-hidden="true" />
        <div>
          <p className="text-[13.5px] font-bold text-[#92400E]">{t("readyTitle")}</p>
          <p className="mt-1 text-pretty text-[12.5px] leading-relaxed text-[#A16207]">
            {t("readyBody")}
          </p>
        </div>
      </div>
    </div>
  );
}
