import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import type { Locale } from "@/i18n/routing";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  return <PlaceholderScreen title={t("title")} />;
}
