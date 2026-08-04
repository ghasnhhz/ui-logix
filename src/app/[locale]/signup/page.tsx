import { setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import type { Locale } from "@/i18n/routing";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthCard mode="signup" />;
}
