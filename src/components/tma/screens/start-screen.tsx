"use client";

import { BarChart3, Package, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTelegram } from "../telegram-provider";

const FEATURES = [
  { Icon: Zap, title: "featCompareTitle", sub: "featCompareSub" },
  { Icon: BarChart3, title: "featBenchmarkTitle", sub: "featBenchmarkSub" },
  { Icon: Package, title: "featManageTitle", sub: "featManageSub" },
] as const;

/**
 * The welcome screen, full-bleed navy from the header to the bottom edge.
 * Telegram's MainButton is the only way forward — nothing here is tappable.
 */
export function StartScreen() {
  const t = useTranslations("tma.hero");
  const { viewport } = useTelegram();

  return (
    <div
      className="enter flex min-h-full flex-col bg-navy px-[18px] pt-[22px]"
      // The frame hands the whole body to this screen, so the bottom inset is
      // ours to respect here rather than in the padding it usually applies.
      style={{ paddingBottom: `${24 + viewport.safeBottom}px` }}
    >
      <h1 className="text-[29px] font-bold leading-[1.12] tracking-[-0.03em] text-white">
        {t("line1")}
        <br />
        {t("line1b")}
      </h1>

      {/* Amber reaches 7.3:1 on navy, so the comp's amber kicker stays — the
          web's version drops to ink because there it sits on the page fill. */}
      <p className="mt-[9px] text-[16px] font-bold tracking-[-0.01em] text-amber">{t("line2")}</p>

      <p className="mt-[13px] text-pretty text-[13px] leading-[1.6] text-navy-muted">{t("sub")}</p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {FEATURES.map(({ Icon, title, sub }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-[11px] bg-navy-hover px-[15px] py-[14px]"
          >
            <span className="flex size-[30px] flex-none items-center justify-center rounded-control bg-navy-active">
              <Icon className="size-4 text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold leading-[1.3] text-white">{t(title)}</p>
              <p className="mt-1 text-pretty text-[11px] leading-[1.5] text-navy-muted">
                {t(sub)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      <p className="mt-[18px] text-pretty text-[11px] text-navy-muted">{t("trustLine")}</p>
    </div>
  );
}
