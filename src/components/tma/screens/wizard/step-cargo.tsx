"use client";

import { useTranslations } from "next-intl";
import { OptionCard } from "@/components/wizard/option-card";
import { CARGO_BASE_CLASS } from "@/lib/pricing";
import { CARGO_UI } from "@/lib/ui/cargo";
import { CARGO_TYPES } from "@/lib/wizard/spec";
import type { StepProps } from "./fields";

export function StepCargo({ spec, set }: StepProps) {
  const t = useTranslations("tma.cargo");
  const web = useTranslations("wizard");

  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      {CARGO_TYPES.map((cargoType) => {
        const { Icon } = CARGO_UI[cargoType];
        const checked = spec.cargoType === cargoType;

        return (
          <OptionCard
            key={cargoType}
            name="tma-cargo"
            value={cargoType}
            checked={checked}
            onSelect={() => set("cargoType", cargoType)}
            className="block min-h-[104px]"
          >
            <Icon className="size-[18px] text-ink-600" aria-hidden="true" />
            <p className="mt-2 text-[12.5px] font-bold leading-[1.25]">{t(`${cargoType}Label`)}</p>
            <p className="mt-1 text-pretty text-[10.5px] leading-[1.4] text-ink-500">
              {t(`${cargoType}Hint`)}
            </p>
            <p
              className={`mt-[7px] font-mono text-[10px] font-semibold ${
                checked ? "text-blue" : "text-ink-500"
              }`}
            >
              {web("approxClass", { n: CARGO_BASE_CLASS[cargoType] })}
            </p>
          </OptionCard>
        );
      })}
    </div>
  );
}
