import { Archive, FilePlus, LayoutDashboard, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { initials } from "@/lib/ui/user";
import { LocaleSwitcher } from "./locale-switcher";
import { LogoutButton } from "./logout-button";

export type Section = "dashboard" | "quote" | "cabinet";

export type ShellUser = { company: string; email: string };

const ITEMS = [
  { section: "dashboard", href: "/dashboard", Icon: LayoutDashboard, key: "dashboard" },
  { section: "quote", href: "/quote", Icon: FilePlus, key: "quote" },
  { section: "cabinet", href: "/cabinet", Icon: Archive, key: "cabinet" },
] as const satisfies readonly { section: Section; href: string; Icon: unknown; key: string }[];

// Hidden below 1024px per DESIGN.md § Responsive — the top bar carries the same
// three destinations there.
export async function Sidebar({ user, active }: { user: ShellUser; active?: Section }) {
  const t = await getTranslations("nav");

  return (
    <aside className="sticky top-0 hidden h-screen w-[200px] flex-none flex-col bg-navy lg:flex">
      <Link
        href="/dashboard"
        className="flex cursor-pointer items-center gap-[10px] border-b border-navy-active px-4 py-[18px]"
      >
        <span className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-amber">
          <Truck className="size-[17px] text-amber-ink" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold tracking-[0.03em] text-white">
            U LOGIX
          </span>
          <span className="micro-label block text-[8px] font-normal text-navy-muted">
            FREIGHT PLATFORM
          </span>
        </span>
      </Link>

      <p className="micro-label px-3 pb-2 pt-4 text-[9.5px] font-normal tracking-[0.16em] text-navy-muted">
        {t("navigation")}
      </p>

      <nav className="flex flex-col gap-[3px] px-2">
        {ITEMS.map(({ section, href, Icon, key }) => (
          <Link
            key={section}
            href={href}
            aria-current={section === active ? "page" : undefined}
            className={`flex min-h-[42px] cursor-pointer items-center gap-[11px] rounded-[9px] px-3 py-[11px] text-[13.5px] font-semibold transition-colors duration-150 hover:bg-navy-hover hover:text-white ${
              section === active ? "bg-navy-active text-white" : "text-navy-muted"
            }`}
          >
            <Icon className="size-4 flex-none" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{t(key)}</span>
            {section === "quote" && (
              <span className="micro-label flex-none rounded-chip bg-amber px-[5px] py-[2px] text-[8.5px] font-bold tracking-[0.06em] text-amber-ink">
                {t("newBadge")}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="p-3">
        <LocaleSwitcher />
        <div className="mt-[10px] flex items-center gap-[10px] rounded-[11px] bg-navy-hover p-[11px]">
          <span className="flex size-8 flex-none items-center justify-center rounded-full bg-blue text-[11.5px] font-bold text-white">
            {initials(user.company, user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-white">
              {user.company}
            </span>
            <span className="block truncate text-[10.5px] text-navy-muted">{user.email}</span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
