import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IBM_Plex_Mono, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

// Plus Jakarta Sans ships cyrillic-ext but not cyrillic, so it cannot render
// the basic Russian alphabet (U+0400–045F) — and ru is a launch locale.
// Manrope sits behind it in the stack: Latin still resolves to Jakarta, and
// Cyrillic falls through to a matching geometric sans instead of a system font.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "U Logix",
  description:
    "Compare freight rates across six carriers, benchmark against the market, and book in one click.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // The app ships its own en/uz/ru. Chrome translates on a locale mismatch — an
  // English browser on /ru — and rewrites the DOM before hydration, which React
  // then fails to reconcile.
  return (
    <html lang={locale} translate="no">
      <body
        className={`${jakarta.variable} ${manrope.variable} ${plexMono.variable}`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
