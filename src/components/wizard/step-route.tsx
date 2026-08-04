"use client";

import { useTranslations } from "next-intl";
import { DateField, SelectField } from "@/components/ui/fields";
import { laneDistanceKm, type PlaceCode } from "@/lib/pricing";
import { formatKm, PLACE_OPTIONS } from "@/lib/ui/places";
import { useWizard } from "./wizard-provider";

export function StepRoute() {
  const t = useTranslations("wizard");
  const { spec, set } = useWizard();

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-[-0.02em]">{t("s1Title")}</h2>

      <div className="mt-[18px] grid gap-4 sm:grid-cols-2">
        <SelectField
          id="origin"
          label={t("origin")}
          options={PLACE_OPTIONS}
          value={spec.origin}
          onChange={(event) => set("origin", event.target.value as PlaceCode)}
        />
        <SelectField
          id="destination"
          label={t("destination")}
          options={PLACE_OPTIONS}
          value={spec.destination}
          onChange={(event) => set("destination", event.target.value as PlaceCode)}
        />
      </div>

      <DateField
        id="ship-date"
        label={t("shipDate")}
        className="mt-4 max-w-[320px]"
        value={spec.date}
        onChange={(event) => set("date", event.target.value)}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[10px] bg-page px-[15px] py-[13px]">
        <p className="micro-label text-[10.5px] text-ink-500">{t("laneDistance")}</p>
        <p className="font-mono text-[14px] font-semibold">
          {formatKm(laneDistanceKm(spec.origin, spec.destination))}
        </p>
        <div className="flex-1" />
        <p className="text-[12px] text-ink-500">{t("coverage")}</p>
      </div>
    </div>
  );
}
