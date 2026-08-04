import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getLocale } from "next-intl/server";
import { Sidebar, type Section } from "./sidebar";
import { Topbar } from "./topbar";

// Every screen inside this shell is session-only. Middleware already guards the
// routes; this is the second lock, so a shell can never render without a user.
export async function AppShell({
  crumb,
  active,
  children,
}: {
  crumb: string;
  active?: Section;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  return (
    <div className="flex min-h-screen bg-page-alt">
      <Sidebar user={user} active={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} crumb={crumb} active={active} />
        <main className="enter flex-1 px-4 pb-14 pt-[22px] sm:px-6">{children}</main>
      </div>
    </div>
  );
}
