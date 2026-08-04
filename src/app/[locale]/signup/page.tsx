import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import type { Locale } from "@/i18n/routing";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return <PlaceholderScreen title={t("createAccount")} />;
}
