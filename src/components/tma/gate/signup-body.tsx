"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cargoMetrics } from "@/lib/pricing";
import { resolveError } from "@/lib/ui/form-error";
import { cityName } from "@/lib/ui/places";
import { useTmaApp } from "../app-provider";
import { ContactFields } from "./contact-fields";
import { TelegramRow } from "./telegram-row";

const BENEFITS = ["benefitRates", "benefitSaved", "benefitBook"] as const;

const FIELDS = ["company", "phone"] as const;

/**
 * No password and no email: Telegram has already identified the user, and the
 * server proves it by verifying the signed `initData` this sheet re-posts.
 * There is no submit button either — Telegram's MainButton is the only one
 * (D-047), and it disables itself until the company reads as filled in.
 */
export function SignupBody() {
  const { state } = useTmaApp();
  const t = useTranslations("tma.gate");
  const web = useTranslations("wizard");
  const te = useTranslations("errors");

  const metrics = cargoMetrics(state.spec);
  const lane = `${cityName(state.spec.origin)} → ${cityName(state.spec.destination)}`;
  const chips = [
    state.spec.mode,
    `${Math.round(metrics.weightKg)} kg`,
    `${metrics.volumeM3.toFixed(2)} m³`,
    web("classValue", { n: metrics.freightClass }),
  ];

  // The account and the shipment go up together, so a rejected cargo value can
  // come back named after a field four wizard steps away.
  const shown = resolveError(state.error, {
    fields: FIELDS,
    t: te,
    foreign: te("cargoDetails"),
  });

  return (
    <>
      <div className="mt-3.5 rounded-card border border-border bg-page p-[13px]">
        <p className="micro-label text-[9px] text-ink-400">{t("yourShipment")}</p>
        <p className="mt-[5px] text-[12.5px] font-bold">{lane}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-[5px] border border-border bg-surface px-1.5 py-[3px] font-mono text-[10px] font-semibold text-ink-600"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <TelegramRow />

      <ContactFields shown={shown} />

      {shown && !shown.field && (
        <p role="alert" className="mt-3 text-[11.5px] text-danger-ink">
          {shown.message}
        </p>
      )}

      <ul className="mt-3.5 flex flex-col gap-2">
        {BENEFITS.map((key) => (
          <li key={key} className="flex items-start gap-[9px] text-[11.5px] leading-[1.5] text-ink-600">
            <Check className="mt-[2px] size-[13px] flex-none text-success-ink" aria-hidden="true" />
            <span className="text-pretty">{t(key)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
