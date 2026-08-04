import { getTranslations, setRequestLocale } from "next-intl/server";
import { GateCard } from "@/components/gate/gate-card";
import { GuestBar } from "@/components/shell/guest-bar";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { specFromParams, specToParams } from "@/lib/wizard/spec";

export default async function GatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const spec = specFromParams(await searchParams);

  // The gate only exists to convert a guest. Someone already signed in prices
  // straight from step 5 instead (DESIGN.md § Wizard).
  if (await getSession()) {
    redirect({ href: `/quote?${specToParams(spec, { step: "5" })}`, locale });
  }

  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <GuestBar />
      <main className="enter flex flex-1 flex-col items-center justify-center px-6 py-10">
        <GateCard spec={spec} />

        <p className="mt-[22px] max-w-[404px] text-center text-[12px] leading-normal text-ink-500">
          {t("termsPrefix")}{" "}
          <a href="#" className="cursor-pointer underline">
            {t("termsOfService")}
          </a>{" "}
          {t("and")}{" "}
          <a href="#" className="cursor-pointer underline">
            {t("privacyPolicy")}
          </a>
        </p>
      </main>
    </div>
  );
}
