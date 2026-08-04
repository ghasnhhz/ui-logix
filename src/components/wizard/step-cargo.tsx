"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { CARGO_BASE_CLASS } from "@/lib/pricing";
import { CARGO_UI } from "@/lib/ui/cargo";
import { CARGO_TYPES } from "@/lib/wizard/spec";
import { OptionCard } from "./option-card";
import { useWizard } from "./wizard-provider";

export function StepCargo() {
  const t = useTranslations("wizard");
  const { spec, set } = useWizard();

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-[-0.02em]">{t("s3Title")}</h2>
      <p className="mt-[6px] text-pretty text-[13px] text-ink-500">{t("s3Sub")}</p>

      <div className="mt-[18px] grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CARGO_TYPES.map((cargoType) => {
          const { Icon, key } = CARGO_UI[cargoType];
          const checked = spec.cargoType === cargoType;

          return (
            <OptionCard
              key={cargoType}
              name="cargoType"
              value={cargoType}
              checked={checked}
              onSelect={() => set("cargoType", cargoType)}
              className="block min-h-24"
            >
              <Icon className="size-[19px] text-ink-600" aria-hidden="true" />
              <p className="mt-2 text-[13px] font-bold">{t(`cargo${key}Label`)}</p>
              <p className="mt-1 text-pretty text-[11.5px] leading-snug text-ink-500">
                {t(`cargo${key}Hint`)}
              </p>
              <p
                className={`mt-2 font-mono text-[10.5px] font-semibold ${
                  checked ? "text-blue" : "text-ink-400"
                }`}
              >
                {t("approxClass", { n: CARGO_BASE_CLASS[cargoType] })}
              </p>
            </OptionCard>
          );
        })}
      </div>

      <div className="mt-[14px] flex items-start gap-[11px] rounded-[11px] border border-border bg-page px-4 py-[14px]">
        <Tag className="mt-px size-[15px] flex-none text-ink-500" aria-hidden="true" />
        <p className="text-pretty text-[12.5px] leading-relaxed text-ink-600">{t("classNote")}</p>
      </div>
    </div>
  );
}
