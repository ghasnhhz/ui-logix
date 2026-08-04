import { setRequestLocale } from "next-intl/server";
import { GuestBar } from "@/components/shell/guest-bar";
import { Wizard } from "@/components/wizard/wizard";
import { WizardProvider } from "@/components/wizard/wizard-provider";
import type { Locale } from "@/i18n/routing";
import { clampStep, specFromParams } from "@/lib/wizard/spec";

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const step = clampStep(Array.isArray(query.step) ? query.step[0] : query.step);

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <GuestBar />
      <WizardProvider
        initialSpec={specFromParams(query)}
        initialStep={step}
        fromLanding={query.from === "landing"}
      >
        <Wizard />
      </WizardProvider>
    </div>
  );
}
