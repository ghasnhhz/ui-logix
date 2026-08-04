"use client";

import { useTranslations } from "next-intl";
import { FieldLabel, TextareaField } from "@/components/ui/fields";
import type { WeightUnit } from "@/lib/pricing";
import { MetricsPanel } from "./metrics-panel";
import { NumberInput } from "./number-input";
import { useWizard } from "./wizard-provider";

const DIMENSIONS = [
  ["lengthCm", "length"],
  ["widthCm", "width"],
  ["heightCm", "height"],
] as const;

export function StepDetails() {
  const t = useTranslations("wizard");
  const { spec, set } = useWizard();

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-[-0.02em]">{t("s4Title")}</h2>
      <p className="mt-[6px] text-pretty text-[13px] text-ink-500">{t("s4Sub")}</p>

      <div className="mt-[18px] grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="weight">{t("totalWeight")}</FieldLabel>
          <div className="flex gap-[10px]">
            <NumberInput
              id="weight"
              value={spec.weight}
              onCommit={(next) => set("weight", next)}
            />
            <label htmlFor="unit" className="sr-only">
              {t("weightUnit")}
            </label>
            <select
              id="unit"
              value={spec.unit}
              onChange={(event) => set("unit", event.target.value as WeightUnit)}
              className="min-h-[48px] w-[74px] flex-none cursor-pointer rounded-control border border-border-strong bg-page px-[10px] py-3 text-[14px] transition-colors duration-150 hover:border-blue"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="pieces">{t("pieces")}</FieldLabel>
          <NumberInput
            id="pieces"
            min={1}
            value={spec.pieces}
            onCommit={(next) => set("pieces", next)}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="micro-label mb-[10px] text-[10.5px] text-ink-500">{t("dims")}</p>
        <div className="grid grid-cols-3 gap-3">
          {DIMENSIONS.map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="mb-[6px] block text-[11.5px] text-ink-400">
                {t(label)}
              </label>
              <NumberInput
                id={key}
                value={spec[key]}
                onCommit={(next) => set(key, next)}
              />
            </div>
          ))}
        </div>
      </div>

      <MetricsPanel spec={spec} />

      <TextareaField
        id="cargo-description"
        label={t("cargoDesc")}
        className="mt-4"
        placeholder={t("cargoDescPh")}
        value={spec.description}
        onChange={(event) => set("description", event.target.value)}
      />
    </div>
  );
}
