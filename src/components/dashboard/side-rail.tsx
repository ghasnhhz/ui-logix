import { Archive, FilePlus, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CarrierUsage } from "@/lib/cabinet/metrics";
import { TopCarriers } from "./top-carriers";

const ACTIONS = [
  { href: "/quote", Icon: FilePlus, title: "qaQuote", sub: "qaQuoteSub" },
  { href: "/cabinet", Icon: Archive, title: "qaCabinet", sub: "qaCabinetSub" },
] as const;

export function SideRail({ carriers }: { carriers: CarrierUsage[] }) {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col gap-[14px]">
      <section className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
        <h2 className="text-[13.5px] font-bold">{t("quickActions")}</h2>
        <div className="mt-[13px] flex flex-col gap-[9px]">
          {ACTIONS.map(({ href, Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex cursor-pointer items-center gap-[11px] rounded-control border border-border p-[11px] transition-colors duration-150 hover:border-blue hover:bg-selected"
            >
              <span className="flex size-[32px] flex-none items-center justify-center rounded-[8px] bg-info text-info-ink">
                <Icon className="size-[16px]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold">{t(title)}</span>
                <span className="block text-pretty text-[11px] leading-snug text-ink-500">
                  {t(sub)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Only shown once the user has actually booked something — an empty bar
          chart would be fabricated history. */}
      {carriers.length > 0 && <TopCarriers carriers={carriers} />}

      <section className="rounded-card border border-warning-ink/20 bg-warning p-[18px]">
        <h2 className="flex items-center gap-[7px] text-[13px] font-bold text-warning-ink-strong">
          <Lightbulb className="size-4 flex-none" aria-hidden="true" />
          {t("saveTip")}
        </h2>
        <p className="mt-[7px] text-pretty text-[12px] leading-relaxed text-ink-600">
          {t("saveTipBody")}
        </p>
      </section>
    </div>
  );
}
