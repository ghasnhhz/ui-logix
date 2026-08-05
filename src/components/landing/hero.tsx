import { BarChart3, Check, Package, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURES = [
  { Icon: Zap, title: "featCompareTitle", sub: "featCompareSub" },
  { Icon: BarChart3, title: "featBenchmarkTitle", sub: "featBenchmarkSub" },
  { Icon: Package, title: "featManageTitle", sub: "featManageSub" },
] as const;

export function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <p className="flex w-fit items-center gap-[7px] rounded-full bg-[#ECFDF5] px-[11px] py-[6px] text-[11px] font-bold text-success-ink">
        <Check className="size-[13px] flex-none" aria-hidden="true" />
        {t("freeNoSignup")}
      </p>

      <h1 className="mt-[18px] text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[40px]">
        {t("heroLine1")}
        <br />
        {t("heroLine1b")}
      </h1>

      {/* Amber reads at 1.9:1 on the page fill, and this screen's one amber
          action is the card's CTA — so the kicker carries its weight by size,
          not by colour. */}
      <p className="mt-[10px] text-[17px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink-600">
        {t("heroLine2")}
      </p>

      <p className="mt-4 max-w-[480px] text-pretty text-[14.5px] leading-relaxed text-ink-500">
        {t("heroSub")}
      </p>

      <ul className="mt-7 flex max-w-[480px] flex-col gap-[11px]">
        {FEATURES.map(({ Icon, title, sub }) => (
          <li
            key={title}
            className="flex items-start gap-[14px] rounded-card border border-border bg-surface px-[17px] py-[15px]"
          >
            <span className="flex size-[34px] flex-none items-center justify-center rounded-control bg-info">
              <Icon className="size-[17px] text-blue" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-ink">{t(title)}</p>
              <p className="mt-1 text-pretty text-[12.5px] leading-normal text-ink-500">
                {t(sub)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-7 text-[12.5px] text-ink-500">{t("trustLine")}</p>
    </section>
  );
}
