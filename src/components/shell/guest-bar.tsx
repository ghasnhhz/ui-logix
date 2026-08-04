import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function GuestBar() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 flex min-h-[60px] flex-none flex-wrap items-center gap-x-[14px] gap-y-2 bg-navy px-4 py-2 sm:px-6">
      <Link href="/" className="flex cursor-pointer items-center gap-[10px]">
        <span className="flex size-[30px] flex-none items-center justify-center rounded-[8px] bg-amber">
          <Truck className="size-[15px] text-amber-ink" aria-hidden="true" />
        </span>
        <span className="text-left">
          <span className="block text-[13px] font-bold tracking-[0.03em] text-white">
            U LOGIX
          </span>
          <span className="micro-label block text-[8px] font-normal text-navy-muted">
            FREIGHT PLATFORM
          </span>
        </span>
      </Link>

      {/* Reassurance, not navigation — first thing to go when width runs out. */}
      <p className="hidden items-center gap-[7px] rounded-full bg-[#1C2B4A] px-[11px] py-[5px] text-[11.5px] font-semibold text-[#34D399] md:flex">
        <span className="size-[6px] flex-none rounded-full bg-[#34D399]" />
        {t("landing.guestMode")}
      </p>

      <div className="flex-1" />

      <LocaleSwitcher />

      <Link
        href="/login"
        className="flex min-h-[38px] cursor-pointer items-center rounded-[8px] border border-[#33456B] px-[15px] text-[12.5px] font-semibold text-white transition-colors duration-150 hover:bg-navy-hover"
      >
        {t("auth.signIn")}
      </Link>
    </header>
  );
}
