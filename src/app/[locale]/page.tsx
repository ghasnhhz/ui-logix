import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { QuoteCard } from "@/components/landing/quote-card";
import { GuestBar } from "@/components/shell/guest-bar";
import type { Locale } from "@/i18n/routing";
import { defaultShipDate } from "@/lib/wizard/spec";

// The default ship date is relative to today, so the prerender has to be
// refreshed or it freezes at build time. Computing it here rather than in the
// card keeps the page static and keeps the server and the client on one string.
export const revalidate = 86400;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <GuestBar />
      <main className="flex-1 px-4 py-10 sm:px-6">
        {/* Two columns from 900px, as the old split screen did — a 1024 viewport
            carries a scrollbar, so Tailwind's own lg: would stack there. */}
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-14">
          <Hero />
          <QuoteCard initialDate={defaultShipDate()} />
        </div>
      </main>
    </div>
  );
}
