import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { STEP_COUNT } from "@/lib/wizard/spec";

export const STEP_LABELS = [
  "stepRoute",
  "stepMode",
  "stepCargo",
  "stepDetails",
  "stepReview",
] as const;

export function Stepper({ step }: { step: number }) {
  const t = useTranslations("wizard");

  return (
    <ol
      aria-label={t("stepOf", { current: step, total: STEP_COUNT })}
      className="flex items-start"
    >
      {STEP_LABELS.map((label, index) => {
        const n = index + 1;
        const done = step > n;
        const current = step === n;
        const last = n === STEP_COUNT;

        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`flex min-w-0 items-center ${last ? "flex-none" : "flex-1"}`}
          >
            <div className="flex w-[56px] flex-none flex-col items-center gap-[6px] sm:w-[74px]">
              <span
                className={`flex size-7 items-center justify-center rounded-full font-mono text-[12px] font-semibold ${
                  done
                    ? "bg-success-solid text-white"
                    : current
                      ? "bg-blue text-white"
                      : "bg-border text-ink-400"
                }`}
              >
                {done ? <Check className="size-[15px]" aria-hidden="true" /> : n}
              </span>
              <span
                className={`break-words text-center text-[9px] leading-tight sm:text-[10.5px] ${
                  current
                    ? "font-bold text-blue"
                    : done
                      ? "font-medium text-[#334155]"
                      : "font-medium text-ink-400"
                }`}
              >
                {t(label)}
              </span>
            </div>
            {!last && (
              <span
                aria-hidden="true"
                className={`mb-5 h-[2px] min-w-[6px] flex-1 ${done ? "bg-success-solid" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
