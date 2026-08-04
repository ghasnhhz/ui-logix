"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

// Dark sits on the navy guest bar, light sits inside the landing card.
type Variant = "dark" | "light";

const TRACK: Record<Variant, string> = {
  dark: "bg-navy-hover",
  light: "bg-[#EEF2F7]",
};

const ITEM: Record<Variant, { on: string; off: string }> = {
  dark: { on: "bg-blue text-white", off: "text-navy-muted hover:text-white" },
  light: { on: "bg-surface text-navy", off: "text-ink-500 hover:text-ink" },
};

export function LocaleSwitcher({ variant = "dark" }: { variant?: Variant }) {
  const t = useTranslations("common");
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // usePathname strips the locale prefix but drops the query, and the wizard
  // keeps its whole shipment there — switching language must not reset it.
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`flex gap-[3px] rounded-[8px] p-[3px] ${TRACK[variant]}`}
    >
      {locales.map((locale) => {
        const on = locale === active;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={on ? "true" : undefined}
            onClick={() => router.replace(href, { locale: locale as Locale })}
            className={`cursor-pointer rounded-[6px] px-[10px] py-[5px] text-[11px] font-bold uppercase transition-colors duration-150 ${
              on ? ITEM[variant].on : ITEM[variant].off
            }`}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
