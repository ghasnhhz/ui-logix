import { getTranslations, setRequestLocale } from "next-intl/server";
import { Confirmation } from "@/components/booking/confirmation";
import { AppShell } from "@/components/shell/app-shell";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { CARRIERS, PLACES, type CarrierId, type PlaceCode } from "@/lib/pricing";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function ConfirmedPage({
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

  const reference = one(query.ref);
  const booking = await prisma.booking.findFirst({
    where: reference ? { reference, userId: user.id } : { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { quote: { select: { origin: true, destination: true, shipDate: true } } },
  });
  if (!booking) return redirect({ href: "/dashboard", locale });

  const t = await getTranslations("nav");
  const carrier = CARRIERS.find((c) => c.id === (booking.carrierId as CarrierId));

  return (
    <AppShell crumb={t("crumbConfirmed")}>
      <Confirmation
        data={{
          reference: booking.reference,
          // Carrier names are constants in code, not a table (D-003), so the
          // stored id is resolved here rather than joined.
          carrierName: carrier?.name ?? booking.carrierId,
          mode: booking.mode,
          origin: PLACES[booking.quote.origin as PlaceCode],
          destination: PLACES[booking.quote.destination as PlaceCode],
          shipDate: booking.quote.shipDate.toISOString().slice(0, 10),
          transitDays: booking.transitDays,
          allIn: booking.allIn,
        }}
      />
    </AppShell>
  );
}
