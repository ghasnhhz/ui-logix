import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/app-shell";
import { GuestBar } from "@/components/shell/guest-bar";
import { Wizard } from "@/components/wizard/wizard";
import { WizardProvider } from "@/components/wizard/wizard-provider";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
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
  // This page already renders on demand for searchParams, so reading the cookie
  // costs nothing — and step 5 needs to know whether to gate or to price.
  const signedIn = (await getSession()) !== null;
  const t = await getTranslations("nav");

  const wizard = (
    <WizardProvider
      initialSpec={specFromParams(query)}
      initialStep={step}
      fromLanding={query.from === "landing"}
    >
      <Wizard signedIn={signedIn} />
    </WizardProvider>
  );

  if (signedIn) {
    return (
      <AppShell crumb={t("crumbQuote")} active="quote">
        {wizard}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <GuestBar />
      <main className="enter flex-1 px-4 pb-14 pt-[22px] sm:px-6">{wizard}</main>
    </div>
  );
}
