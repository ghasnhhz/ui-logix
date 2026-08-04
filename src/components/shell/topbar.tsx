import { Archive, FilePlus, LayoutDashboard, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { initials } from "@/lib/ui/user";
import type { Section, ShellUser } from "./sidebar";

const COMPACT = [
  { section: "dashboard", href: "/dashboard", Icon: LayoutDashboard, key: "dashboard" },
  { section: "quote", href: "/quote", Icon: FilePlus, key: "quote" },
  { section: "cabinet", href: "/cabinet", Icon: Archive, key: "cabinet" },
] as const satisfies readonly { section: Section; href: string; Icon: unknown; key: string }[];

export async function Topbar({
  user,
  crumb,
  active,
}: {
  user: ShellUser;
  crumb: string;
  active?: Section;
}) {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-30 flex min-h-[56px] flex-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-surface px-4 py-2 sm:px-6">
      <span className="font-mono text-[12.5px] font-semibold text-[#334155]">U Logix</span>
      <span className="text-[12px] text-border-strong" aria-hidden="true">
        ›
      </span>
      <span className="min-w-0 truncate text-[13.5px] text-ink-600">{crumb}</span>

      <div className="flex-1" />

      {/* The rail is hidden below 1024px, so its destinations reappear here as
          icon buttons rather than disappearing entirely. */}
      <nav className="flex items-center gap-1 lg:hidden">
        {COMPACT.map(({ section, href, Icon, key }) => (
          <Link
            key={section}
            href={href}
            aria-label={t(key)}
            aria-current={section === active ? "page" : undefined}
            className={`flex size-9 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 hover:bg-page ${
              section === active ? "bg-info text-info-ink" : "text-ink-500"
            }`}
          >
            <Icon className="size-[17px]" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <Link
        href="/quote"
        className="flex min-h-[40px] cursor-pointer items-center gap-[7px] rounded-control bg-blue px-[17px] text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-blue-hover"
      >
        <Plus className="size-4" aria-hidden="true" />
        <span className="whitespace-nowrap">{t("getQuote")}</span>
      </Link>

      <span className="flex size-[34px] flex-none items-center justify-center rounded-full bg-blue text-[11.5px] font-bold text-white">
        {initials(user.company, user.email)}
      </span>
    </header>
  );
}
