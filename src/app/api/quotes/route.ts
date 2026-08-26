import { fail, failValidation, ok } from "@/lib/api";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { benchmarkMedian, displayedQuotes, priceShipment } from "@/lib/pricing";
import { withReference } from "@/lib/reference";
import { quoteRequestSchema } from "@/lib/validation/quote";

const QUOTE_TTL_MS = 48 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to price a shipment", 401);

  const parsed = quoteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const spec = parsed.data;
  // All arithmetic stays in lib/pricing — this handler only persists what it is
  // given (CLAUDE.md rule 5).
  const { metrics, quotes } = priceShipment(spec);

  const quote = await withReference((reference) =>
    prisma.quote.create({
      data: {
        reference,
        userId: session.sub,
        origin: spec.origin,
        destination: spec.destination,
        shipDate: new Date(spec.date),
        mode: spec.mode,
        cargoType: spec.cargoType,
        // Stored in kg whatever the form used, so history never depends on the
        // unit toggle the shipper happened to leave set.
        weightKg: metrics.weightKg,
        pieces: metrics.pieces,
        lengthCm: spec.lengthCm,
        widthCm: spec.widthCm,
        heightCm: spec.heightCm,
        description: spec.description,
        volumeM3: metrics.volumeM3,
        chargeableKg: metrics.chargeableKg,
        freightClass: metrics.freightClass,
        results: quotes,
        benchmarkMedian: benchmarkMedian(displayedQuotes(quotes, "ALL")),
        expiresAt: new Date(Date.now() + QUOTE_TTL_MS),
      },
      // The stored rows come back with the id (D-055). The Mini App has no
      // server-rendered results page to read them from, and handing back what
      // was persisted means no surface can render a price the database does not
      // already hold.
      select: { id: true, reference: true, results: true },
    }),
  );

  return ok(quote, 201);
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Sign in to see your quotes", 401);

  const quotes = await prisma.quote.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      origin: true,
      destination: true,
      mode: true,
      shipDate: true,
      benchmarkMedian: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return ok(quotes);
}
