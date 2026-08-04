import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResultsView } from "@/components/results/results-view";
import { AppShell } from "@/components/shell/app-shell";
import { Toast } from "@/components/ui/toast";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { PLACES, type CargoType, type Mode, type PlaceCode, type Quote } from "@/lib/pricing";
import { specToParams } from "@/lib/wizard/spec";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale });

  // Scoped to the owner, so a guessed id reveals nothing. Without an id we fall
  // back to the newest quote, which is what a bare /results should show.
  const quote = await prisma.quote.findFirst({
    where: id ? { id, userId: user.id } : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Nothing priced yet — send them to the calculator rather than an empty shell.
  if (!quote || !Array.isArray(quote.results)) return redirect({ href: "/quote", locale });

  const t = await getTranslations("nav");
  const tt = await getTranslations("toast");

  const backHref = `/quote?${specToParams({
    origin: quote.origin as PlaceCode,
    destination: quote.destination as PlaceCode,
    date: isoDate(quote.shipDate),
    mode: quote.mode as Mode,
    cargoType: quote.cargoType as CargoType,
    weight: quote.weightKg,
    unit: "kg",
    pieces: quote.pieces,
    lengthCm: quote.lengthCm,
    widthCm: quote.widthCm,
    heightCm: quote.heightCm,
    description: quote.description ?? "",
  }, { step: "5" })}`;

  return (
    <AppShell crumb={t("crumbResults")}>
      <ResultsView
        data={{
          id: quote.id,
          lane: `${PLACES[quote.origin as PlaceCode]} → ${PLACES[quote.destination as PlaceCode]}`,
          shipDate: isoDate(quote.shipDate),
          backHref,
          // Stored as computed at request time, so a coefficient change later
          // never rewrites a quote the customer has already been shown (D-013).
          quotes: quote.results as unknown as Quote[],
        }}
      />
      {query.welcome === "1" && <Toast message={tt("welcome")} />}
    </AppShell>
  );
}
