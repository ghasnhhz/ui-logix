import { useTranslations } from "next-intl";
import type { CarrierUsage } from "@/lib/cabinet/metrics";
import { CARRIERS } from "@/lib/pricing";
import { CARRIER_MARK } from "@/lib/ui/carriers";

const nameOf = (id: string) => CARRIERS.find((carrier) => carrier.id === id)?.name ?? id;

export function TopCarriers({ carriers }: { carriers: CarrierUsage[] }) {
  const t = useTranslations("dashboard");

  return (
    <section className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
      <h2 className="text-[13.5px] font-bold">{t("topCarriers")}</h2>

      <ul className="mt-[14px] flex flex-col gap-[13px]">
        {carriers.map(({ carrierId, count, sharePct }) => (
          <li key={carrierId}>
            <div className="flex items-center gap-[9px]">
              <span
                className={`flex size-[26px] flex-none items-center justify-center rounded-[7px] text-[9px] font-bold ${CARRIER_MARK[carrierId]}`}
                aria-hidden="true"
              >
                {carrierId}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                {nameOf(carrierId)}
              </span>
              <span className="flex-none font-mono text-[12px] font-semibold text-ink-600">
                {count}
              </span>
            </div>
            {/* Decorative: the count beside it already carries the number, so the
                bar is not given its own progressbar semantics. */}
            <div className="mt-[7px] h-[6px] overflow-hidden rounded-full bg-page-alt">
              <div className="h-full rounded-full bg-blue" style={{ width: `${sharePct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
