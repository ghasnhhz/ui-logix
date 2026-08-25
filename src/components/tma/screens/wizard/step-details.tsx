"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { NumberInput } from "@/components/wizard/number-input";
import { FIELD, MicroLabel, type StepProps } from "./fields";
import { MetricsCard } from "./metrics-card";

const DIMENSIONS = [
  ["lengthCm", "length"],
  ["widthCm", "width"],
  ["heightCm", "height"],
] as const;

export function StepDetails({ spec, set }: StepProps) {
  const t = useTranslations("tma.wizard");
  const web = useTranslations("wizard");

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-[11px]">
        <div>
          <MicroLabel htmlFor="tma-weight">{t("totalWeight")}</MicroLabel>
          <NumberInput
            id="tma-weight"
            control={FIELD}
            value={spec.weight}
            onCommit={(next) => set("weight", next)}
          />
        </div>
        <div>
          <MicroLabel htmlFor="tma-pieces">{t("pieces")}</MicroLabel>
          <NumberInput
            id="tma-pieces"
            min={1}
            control={FIELD}
            value={spec.pieces}
            onCommit={(next) => set("pieces", next)}
          />
        </div>
      </div>

      <div className="mt-[13px]">
        <p className="micro-label mb-[7px] text-[10px] text-ink-500">{t("dims")}</p>
        {/* The comp writes the three boxes as L × W × H with no labels. The
            multiplication signs are decorative; each box keeps a real one. */}
        <div className="flex items-center gap-[7px]">
          {DIMENSIONS.map(([key, label], index) => (
            <Fragment key={key}>
              {index > 0 && (
                <span className="flex-none text-[12px] text-ink-400" aria-hidden="true">
                  ×
                </span>
              )}
              <div className="min-w-0 flex-1">
                <label htmlFor={`tma-${key}`} className="sr-only">
                  {web(label)}
                </label>
                <NumberInput
                  id={`tma-${key}`}
                  control={FIELD}
                  value={spec[key]}
                  onCommit={(next) => set(key, next)}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <MetricsCard spec={spec} />
    </div>
  );
}
