"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

// Every switcher now sits on navy — the guest bar and the sidebar.
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // usePathname strips the locale prefix but drops the query, and the wizard
  // keeps its whole shipment there — switching language must not reset it.
  // Read at click time rather than through useSearchParams, which would opt
  // every page carrying this switcher out of static rendering.
  const href = () => `${pathname}${window.location.search}`;

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex gap-[3px] rounded-[8px] bg-navy-hover p-[3px]"
    >
      {locales.map((locale) => {
        const on = locale === active;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={on ? "true" : undefined}
            onClick={() => router.replace(href(), { locale: locale as Locale })}
            className={`cursor-pointer rounded-[6px] px-[10px] py-[5px] text-[11px] font-bold uppercase transition-colors duration-150 ${
              on ? "bg-blue text-white" : "text-navy-muted hover:text-white"
            }`}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
