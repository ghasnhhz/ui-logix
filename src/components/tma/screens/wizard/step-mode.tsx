"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { OptionCard, RadioDot } from "@/components/wizard/option-card";
import type { Mode } from "@/lib/pricing";
import { MODE_UI } from "@/lib/ui/modes";
import { MODES } from "@/lib/wizard/spec";
import type { StepProps } from "../../fields";

export function StepMode({ spec, set }: StepProps) {
  const t = useTranslations("tma");
  // Transit ranges are the same figures on both surfaces, so they stay one key.
  const web = useTranslations("wizard");

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {MODES.map((mode) => {
        const { Icon, key, chip } = MODE_UI[mode];
        const short = mode.toLowerCase() as Lowercase<Mode>;
        const checked = spec.mode === mode;

        return (
          <OptionCard
            key={mode}
            name="tma-mode"
            value={mode}
            checked={checked}
            onSelect={() => set("mode", mode)}
            className="flex min-h-16 items-start gap-3"
          >
            <Icon className="mt-px size-[19px] flex-none text-ink-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-[7px]">
                <span className="text-[14px] font-bold">{t(`mode.${short}Title`)}</span>
                <span
                  className={`rounded-chip px-[5px] py-[2px] font-mono text-[9px] font-semibold ${chip}`}
                >
                  {mode}
                </span>
              </div>
              <p className="mt-1 text-pretty text-[11.5px] leading-[1.45] text-ink-500">
                {t(`mode.${short}Desc`)}
              </p>
              <p className="mt-1.5 flex items-center gap-1 font-mono text-[10.5px] text-ink-500">
                <Clock className="size-3 flex-none" aria-hidden="true" />
                {web(`mode${key}Days`)} {t("units.days")}
              </p>
            </div>
            <RadioDot checked={checked} />
          </OptionCard>
        );
      })}
    </div>
  );
}
