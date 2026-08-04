import { fail, failValidation, ok } from "@/lib/api";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { isSameQuote, type Quote as PricedQuote } from "@/lib/pricing";
import { withReference } from "@/lib/reference";
import { bookingRequestSchema } from "@/lib/validation/booking";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to book a shipment", 401);

  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const input = parsed.data;

  // Scoped to the owner, so booking against someone else's quote is a 403 and
  // not a leak of whether that id exists at all.
  const quote = await prisma.quote.findFirst({
    where: { id: input.quoteId, userId: session.sub },
  });
  if (!quote) return fail("That quote is not yours to book", 403, undefined, "notYourQuote");

  if (quote.expiresAt <= new Date()) {
    return fail("That quote has expired", 410, undefined, "quoteExpired");
  }

  const selected = (quote.results as unknown as PricedQuote[]).find((row) =>
    isSameQuote(row, input),
  );
  if (!selected) {
    return fail("That carrier is not in this quote", 422, undefined, "carrierUnavailable");
  }

  if (await prisma.booking.findUnique({ where: { quoteId: quote.id }, select: { id: true } })) {
    return fail("That quote is already booked", 409, undefined, "alreadyBooked");
  }

  try {
    const booking = await withReference((reference) =>
      prisma.booking.create({
        data: {
          reference,
          quoteId: quote.id,
          userId: session.sub,
          // Copied off the stored quote row, never recomputed: the shipper books
          // the number they were shown, whatever the engine would say today.
          carrierId: selected.carrierId,
          mode: selected.mode,
          allIn: selected.allIn,
          transitDays: selected.transitDays,
          contactName: input.contactName,
          company: input.company,
          email: input.email,
          phone: input.phone,
          taxId: input.taxId,
          notes: input.notes,
        },
        select: { id: true, reference: true },
      }),
    );

    return ok(booking, 201);
  } catch (error) {
    // quoteId is unique, so two confirmations racing lose here rather than in the
    // pre-check above.
    if (isUniqueViolation(error)) {
      return fail("That quote is already booked", 409, undefined, "alreadyBooked");
    }
    throw error;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Sign in to see your bookings", 401);

  const bookings = await prisma.booking.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      quoteId: true,
      carrierId: true,
      mode: true,
      allIn: true,
      transitDays: true,
      status: true,
      createdAt: true,
      quote: { select: { origin: true, destination: true, shipDate: true } },
    },
  });

  return ok(bookings);
}
