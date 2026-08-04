"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { MODE_UI } from "@/lib/ui/modes";
import { MODES } from "@/lib/wizard/spec";
import { OptionCard, RadioDot } from "./option-card";
import { useWizard } from "./wizard-provider";

export function StepMode() {
  const t = useTranslations("wizard");
  const tc = useTranslations("common");
  const { spec, set } = useWizard();

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-[-0.02em]">{t("s2Title")}</h2>
      <p className="mt-[6px] text-pretty text-[13px] text-ink-500">{t("s2Sub")}</p>

      <div className="mt-[18px] grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => {
          const { Icon, key, chip } = MODE_UI[mode];
          const checked = spec.mode === mode;

          return (
            <OptionCard
              key={mode}
              name="mode"
              value={mode}
              checked={checked}
              onSelect={() => set("mode", mode)}
              className="flex min-h-24 items-start gap-3 p-[15px]"
            >
              <Icon className="mt-px size-5 flex-none text-ink-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-[7px]">
                  <span className="text-[14px] font-bold">{t(`mode${key}Title`)}</span>
                  <span
                    className={`rounded-[5px] px-[6px] py-[3px] font-mono text-[9.5px] font-semibold ${chip}`}
                  >
                    {mode}
                  </span>
                </div>
                <p className="mt-[5px] text-pretty text-[12px] leading-snug text-ink-500">
                  {t(`mode${key}Desc`)}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[11.5px] text-ink-500">
                  <span className="flex items-center gap-1">
                    <Clock className="size-[13px] flex-none" aria-hidden="true" />
                    {t(`mode${key}Days`)} {tc("days")}
                  </span>
                  <span>{t(`mode${key}Note`)}</span>
                </p>
              </div>
              <RadioDot checked={checked} />
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}
