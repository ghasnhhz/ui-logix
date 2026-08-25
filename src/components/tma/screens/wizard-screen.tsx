"use client";

import { useCallback, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { STEP_COUNT, type WizardSpec } from "@/lib/wizard/spec";
import { useTmaApp } from "../app-provider";
import type { SetSpec } from "./wizard/fields";
import { StepCargo } from "./wizard/step-cargo";
import { StepDetails } from "./wizard/step-details";
import { StepMode } from "./wizard/step-mode";
import { StepReview } from "./wizard/step-review";
import { StepRoute } from "./wizard/step-route";

const TITLES = ["s1Title", "s2Title", "s3Title", "s4Title", "s5Title"] as const;
const SUBS = ["s1Sub", "s2Sub", "s3Sub", "s4Sub", "s5Sub"] as const;

const STEPS = Array.from({ length: STEP_COUNT }, (_, index) => index + 1);

/**
 * Five steps in one screen. There is no stepper here and no in-page Continue —
 * the bar of segments is the whole progress indicator and Telegram's MainButton
 * is the only way forward (D-047).
 */
export function WizardScreen() {
  const t = useTranslations("tma.wizard");
  const { state, dispatch } = useTmaApp();
  const { spec, step } = state;
  const root = useRef<HTMLDivElement>(null);

  // Step 4 is taller than the viewport, so a step change has to return to the
  // top — the parent is the frame's scrolling body, and it is not remounted.
  useEffect(() => {
    root.current?.parentElement?.scrollTo({ top: 0 });
  }, [step]);

  const set = useCallback<SetSpec>(
    (key, value) => dispatch({ type: "patchSpec", patch: { [key]: value } as Partial<WizardSpec> }),
    [dispatch]
  );

  const goStep = useCallback(
    (next: number) => dispatch({ type: "goStep", step: next }),
    [dispatch]
  );

  return (
    <div ref={root} className="enter">
      {state.guest && (
        <p className="mb-3 flex w-fit items-center gap-[7px] rounded-full bg-[#ECFDF5] px-[11px] py-[6px] text-[10.5px] font-bold text-success-ink">
          <Check className="size-[13px] flex-none" aria-hidden="true" />
          {t("freeNoSignup")}
        </p>
      )}

      <div className="flex gap-[5px]" aria-hidden="true">
        {STEPS.map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-[3px] ${step >= n ? "bg-blue" : "bg-border"}`}
          />
        ))}
      </div>

      <p className="micro-label mt-3.5 text-[10px] text-ink-500">{t("stepCounter", { step })}</p>
      <h2 className="mt-[5px] text-pretty text-[20px] font-bold leading-[1.2] tracking-[-0.025em]">
        {t(TITLES[step - 1])}
      </h2>
      <p className="mt-1.5 text-pretty text-[12.5px] leading-[1.5] text-ink-500">
        {t(SUBS[step - 1])}
      </p>

      {/* Keyed so each step fades in on its own, as the comp does — the
          progress bar and the counter above it stay put. */}
      <div key={step} className="enter">
        {step === 1 && <StepRoute spec={spec} set={set} />}
        {step === 2 && <StepMode spec={spec} set={set} />}
        {step === 3 && <StepCargo spec={spec} set={set} />}
        {step === 4 && <StepDetails spec={spec} set={set} />}
        {step === 5 && <StepReview spec={spec} goStep={goStep} />}
      </div>
    </div>
  );
}
