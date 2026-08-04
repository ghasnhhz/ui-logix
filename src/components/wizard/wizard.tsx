"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { STEP_COUNT } from "@/lib/wizard/spec";
import { StepCargo } from "./step-cargo";
import { StepMode } from "./step-mode";
import { StepRoute } from "./step-route";
import { Stepper } from "./stepper";
import { useWizard } from "./wizard-provider";

const CARD =
  "rounded-[13px] border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,42,.04)]";

export function Wizard() {
  const t = useTranslations("wizard");
  const tc = useTranslations("common");
  const router = useRouter();
  const { step, fromLanding, goStep } = useWizard();

  const last = step === STEP_COUNT;
  const showBack = step > 1 || fromLanding;

  const onBack = () => (step === 1 ? router.push("/") : goStep(step - 1));
  // Feature 4 replaces the gate with the real signup-and-price handoff.
  const onNext = () => (last ? router.push("/gate") : goStep(step + 1));

  return (
    <main className="enter mx-auto w-full max-w-[900px] px-4 pb-14 pt-[22px] sm:px-6">
      <h1 className="text-[25px] font-bold tracking-[-0.03em]">{t("title")}</h1>
      <p className="mt-[6px] text-pretty text-[13.5px] text-ink-500">{t("sub")}</p>

      <div className={`${CARD} mt-[18px] px-4 py-[18px] sm:px-5`}>
        <Stepper step={step} />
      </div>

      <div className={`${CARD} mt-[14px] p-4 sm:p-6`}>
        {step === 1 && <StepRoute />}
        {step === 2 && <StepMode />}
        {step === 3 && <StepCargo />}
      </div>

      <div className="mt-[18px] flex items-center gap-[14px]">
        <button
          type="button"
          onClick={onBack}
          className={`flex min-h-[46px] cursor-pointer items-center gap-[7px] rounded-control border border-border-strong bg-surface px-5 text-[13.5px] font-semibold text-ink-600 transition-colors duration-150 hover:bg-page ${
            showBack ? "" : "invisible"
          }`}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {tc("back")}
        </button>

        <div className="flex flex-1 items-center justify-center gap-[6px]" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, index) => index + 1).map((n) => (
            <span
              key={n}
              className={`h-[6px] rounded ${
                step === n ? "w-[22px] bg-blue" : step > n ? "w-[6px] bg-success-solid" : "w-[6px] bg-border-strong"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onNext}
          className={`flex min-h-[46px] cursor-pointer items-center gap-2 rounded-control px-[22px] text-[13.5px] font-semibold transition-[filter] duration-150 hover:brightness-105 ${
            last ? "bg-amber text-amber-ink" : "bg-blue text-white"
          }`}
        >
          {last ? t("getCarrierQuotes") : tc("continue")}
          {!last && <ChevronRight className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </main>
  );
}
