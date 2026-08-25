"use client";

import { useTranslations } from "next-intl";
import { laneDistanceKm, type PlaceCode } from "@/lib/pricing";
import { formatKm, PLACE_OPTIONS } from "@/lib/ui/places";
import { FIELD, MicroLabel, type StepProps } from "./fields";

export function StepRoute({ spec, set }: StepProps) {
  const t = useTranslations("tma.wizard");

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div>
        <MicroLabel htmlFor="tma-origin">{t("origin")}</MicroLabel>
        <select
          id="tma-origin"
          value={spec.origin}
          onChange={(event) => set("origin", event.target.value as PlaceCode)}
          className={`${FIELD} cursor-pointer`}
        >
          {PLACE_OPTIONS.map((place) => (
            <option key={place.value} value={place.value}>
              {place.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <MicroLabel htmlFor="tma-destination">{t("destination")}</MicroLabel>
        <select
          id="tma-destination"
          value={spec.destination}
          onChange={(event) => set("destination", event.target.value as PlaceCode)}
          className={`${FIELD} cursor-pointer`}
        >
          {PLACE_OPTIONS.map((place) => (
            <option key={place.value} value={place.value}>
              {place.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <MicroLabel htmlFor="tma-ship-date">{t("shipDate")}</MicroLabel>
        <input
          id="tma-ship-date"
          type="date"
          value={spec.date}
          onChange={(event) => set("date", event.target.value)}
          className={`${FIELD} cursor-pointer`}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-control border border-border bg-surface px-[14px] py-3">
        <p className="micro-label text-[10px] text-ink-500">{t("laneDistance")}</p>
        <p className="font-mono text-[14px] font-semibold">
          {formatKm(laneDistanceKm(spec.origin, spec.destination))}
        </p>
      </div>
    </div>
  );
}
