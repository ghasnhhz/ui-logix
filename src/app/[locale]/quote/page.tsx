import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import type { Locale } from "@/i18n/routing";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wizard");
  return <PlaceholderScreen title={t("title")} />;
}
