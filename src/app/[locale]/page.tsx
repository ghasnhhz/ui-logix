import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { QuoteCard } from "@/components/landing/quote-card";
import type { Locale } from "@/i18n/routing";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-page-alt min-[900px]:flex-row">
      <Hero />
      <main className="flex flex-1 items-center justify-center px-6 py-[30px] min-[900px]:px-[34px]">
        <QuoteCard />
      </main>
    </div>
  );
}
