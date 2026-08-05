import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { QuoteCard } from "@/components/landing/quote-card";
import { GuestBar } from "@/components/shell/guest-bar";
import type { Locale } from "@/i18n/routing";

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
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          <Hero />
          <QuoteCard />
        </div>
      </main>
    </div>
  );
}
