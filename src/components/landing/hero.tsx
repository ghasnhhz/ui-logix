import { BarChart3, Package, Truck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURES = [
  { Icon: Zap, title: "featCompareTitle", sub: "featCompareSub" },
  { Icon: BarChart3, title: "featBenchmarkTitle", sub: "featBenchmarkSub" },
  { Icon: Package, title: "featManageTitle", sub: "featManageSub" },
] as const;

export function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="flex flex-col bg-navy px-6 pb-[30px] pt-[34px] min-[900px]:w-1/2 min-[900px]:min-w-[400px] min-[900px]:flex-none min-[900px]:px-[34px]">
      <div className="flex items-center gap-[11px]">
        <span className="flex size-[34px] flex-none items-center justify-center rounded-control bg-amber">
          <Truck className="size-4 text-amber-ink" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-[14px] font-bold tracking-[0.03em] text-white">
            U LOGIX
          </span>
          <span className="micro-label block text-[8.5px] font-normal text-navy-muted">
            FREIGHT PLATFORM
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-9">
        <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-white sm:text-[40px]">
          {t("heroLine1")}
          <br />
          {t("heroLine1b")}
        </h1>
        <p className="mt-[10px] text-[20px] font-bold leading-[1.2] tracking-[-0.02em] text-amber sm:text-[22px]">
          {t("heroLine2")}
        </p>
        <p className="mt-4 max-w-[430px] text-pretty text-[14.5px] leading-relaxed text-[#A7B4CC]">
          {t("heroSub")}
        </p>

        <ul className="mt-7 flex max-w-[430px] flex-col gap-[11px]">
          {FEATURES.map(({ Icon, title, sub }) => (
            <li
              key={title}
              className="flex items-start gap-[14px] rounded-[10px] bg-[#1C2B4A] px-[17px] py-[15px]"
            >
              <Icon className="mt-px size-[17px] flex-none text-amber" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-white">{t(title)}</p>
                <p className="mt-1 text-pretty text-[12px] leading-normal text-ink-400">
                  {t(sub)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[12px] text-[#5F7093]">{t("trustLine")}</p>
    </section>
  );
}
