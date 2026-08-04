import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingView } from "@/components/booking/booking-view";
import { AppShell } from "@/components/shell/app-shell";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import type { Quote } from "@/lib/pricing";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale });

  const id = one(query.quote);
  const quote = await prisma.quote.findFirst({
    where: id ? { id, userId: user.id } : { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { booking: { select: { reference: true } } },
  });
  if (!quote || !Array.isArray(quote.results)) return redirect({ href: "/quote", locale });

  // Booking a second time against the same quote is a 409 at the API, so the
  // screen sends a returning user to the confirmation they already have.
  if (quote.booking) {
    return redirect({ href: `/confirmed?ref=${quote.booking.reference}`, locale });
  }

  const carrier = one(query.carrier);
  const mode = one(query.mode);
  const selected = (quote.results as unknown as Quote[]).find(
    (row) => row.carrierId === carrier && row.mode === mode,
  );

  // An expired quote or a carrier that is not in it means the selection is stale
  // — back to the results, which will price or explain it.
  if (!selected || quote.expiresAt <= new Date()) {
    return redirect({ href: `/results?id=${quote.id}`, locale });
  }

  const t = await getTranslations("nav");

  return (
    <AppShell crumb={t("crumbBooking")}>
      <BookingView
        quote={selected}
        quoteId={quote.id}
        backHref={`/results?id=${quote.id}`}
        account={{ company: user.company, email: user.email, phone: user.phone ?? "" }}
      />
    </AppShell>
  );
}
