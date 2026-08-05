"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LaneChips } from "./lane-chips";
import { laneDistanceKm, type PlaceCode } from "@/lib/pricing";
import { formatKm, PLACE_OPTIONS } from "@/lib/ui/places";
import { DEFAULT_SPEC, specFromParams } from "@/lib/wizard/spec";

const ASSURANCES = ["assureNoCard", "assureFast", "assureCarriers"] as const;

const LABEL = "micro-label mb-[3px] block text-[9.5px] font-medium text-ink-500";
const VALUE =
  "min-h-[24px] w-full cursor-pointer border-none bg-transparent p-0 text-[15px] font-semibold text-ink";

// The date arrives from the server so that hydration compares two identical
// strings — computing it here would render one value on the prerender and
// another in the browser.
export function QuoteCard({ initialDate }: { initialDate: string }) {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const tw = useTranslations("wizard");

  const [origin, setOrigin] = useState<PlaceCode>(DEFAULT_SPEC.origin);
  const [destination, setDestination] = useState<PlaceCode>(DEFAULT_SPEC.destination);
  const [date, setDate] = useState(initialDate);

  // Coming back from wizard step 1 must not throw the route away. The page is
  // statically rendered, so the lane is read after mount from the URL the
  // wizard wrote — `useSearchParams` would opt / out of the prerender, and the
  // shell paints identically either way.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].length) return;

    const spec = specFromParams(params, initialDate);
    setOrigin(spec.origin);
    setDestination(spec.destination);
    setDate(spec.date);
  }, [initialDate]);

  // The route is already captured here, so the CTA lands on the mode step.
  const href = `/quote?step=2&from=landing&origin=${origin}&dest=${destination}&date=${date}`;

  return (
    <div className="w-full max-w-[420px] flex-none rounded-[14px] border border-border bg-surface p-[26px] shadow-[0_4px_24px_rgba(15,23,42,.06)]">
      <h2 className="text-[21px] font-bold tracking-[-0.025em]">{t("title")}</h2>
      <p className="mt-[6px] text-pretty text-[13px] leading-normal text-ink-500">{t("sub")}</p>

      <div className="mt-5 overflow-hidden rounded-card border border-border">
        <div className="flex items-center gap-3 px-[15px] py-[13px]">
          <div
            className="flex w-3 flex-none flex-col items-center gap-[3px]"
            aria-hidden="true"
          >
            <span className="size-[9px] rounded-full border-[2.5px] border-blue" />
            <span className="h-7 w-[2px] bg-gradient-to-b from-blue to-amber" />
            <span className="size-[9px] rounded-full bg-amber" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
            <div>
              <label htmlFor="landing-origin" className={LABEL}>
                {t("originLabel")}
              </label>
              <select
                id="landing-origin"
                value={origin}
                onChange={(event) => setOrigin(event.target.value as PlaceCode)}
                className={VALUE}
              >
                {PLACE_OPTIONS.map((place) => (
                  <option key={place.value} value={place.value}>
                    {place.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-px bg-page-alt" />
            <div>
              <label htmlFor="landing-dest" className={LABEL}>
                {t("destLabel")}
              </label>
              <select
                id="landing-dest"
                value={destination}
                onChange={(event) => setDestination(event.target.value as PlaceCode)}
                className={VALUE}
              >
                {PLACE_OPTIONS.map((place) => (
                  <option key={place.value} value={place.value}>
                    {place.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            aria-label={tc("swap")}
            onClick={() => {
              setOrigin(destination);
              setDestination(origin);
            }}
            className="flex size-[34px] flex-none cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-600 transition-colors duration-150 hover:border-blue hover:text-blue"
          >
            <ArrowUpDown className="size-[15px]" aria-hidden="true" />
          </button>
        </div>

        {/* Uzbek "JO‘NATISH SANASI" outgrows a fixed two-column split at 375px,
            so the pair stacks before it can clip. */}
        <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-[1fr_128px] sm:divide-x sm:divide-y-0">
          <div className="min-w-0 px-[15px] py-[11px]">
            <label htmlFor="landing-date" className={LABEL}>
              {t("dateLabel")}
            </label>
            <input
              id="landing-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`${VALUE} text-[14px]`}
            />
          </div>
          <div className="min-w-0 px-[15px] py-[11px]">
            <p className={LABEL}>{tw("laneDistance")}</p>
            <p className="flex min-h-[24px] items-center font-mono text-[14px] font-semibold">
              {formatKm(laneDistanceKm(origin, destination))}
            </p>
          </div>
        </div>
      </div>

      <LaneChips
        origin={origin}
        destination={destination}
        onPick={(from, to) => {
          setOrigin(from);
          setDestination(to);
        }}
      />

      <Link
        href={href}
        className="mt-[18px] flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-amber p-[14px] text-[14.5px] font-semibold text-amber-ink transition-[filter] duration-150 hover:brightness-105"
      >
        {t("ctaPrimary")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>

      <ul className="mt-[14px] flex flex-wrap items-center gap-x-[14px] gap-y-2">
        {ASSURANCES.map((key) => (
          <li key={key} className="flex items-center gap-[6px] text-[11.5px] text-ink-500">
            <Check className="size-[13px] flex-none text-success-ink" aria-hidden="true" />
            {t(key)}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-pretty text-[12px] leading-normal text-ink-500">{t("note")}</p>

      <p className="mt-4 border-t border-page-alt pt-4 text-center text-[12.5px] text-ink-500">
        {ta("haveAccount")}{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-blue hover:text-blue-hover">
          {ta("signInInstead")}
        </Link>
      </p>
    </div>
  );
}
