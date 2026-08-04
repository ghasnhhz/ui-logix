import { prisma } from "@/lib/db";
import { toRecords, type CabinetRecord } from "./records";

// One query, not two. The cabinet's rows are quotes left-joined to their at-most
// one booking (Booking.quoteId is unique), so the union is assembled in memory
// from a single ordered read rather than by merging two lists.
export async function loadRecords(userId: string, now = new Date()): Promise<CabinetRecord[]> {
  const rows = await prisma.quote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      origin: true,
      destination: true,
      shipDate: true,
      mode: true,
      cargoType: true,
      weightKg: true,
      pieces: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
      description: true,
      // The only heavy column. An unbooked row's amount comes out of it, so it
      // cannot be dropped — but nothing outside toRecord ever sees it.
      results: true,
      benchmarkMedian: true,
      expiresAt: true,
      createdAt: true,
      booking: {
        select: {
          reference: true,
          carrierId: true,
          mode: true,
          allIn: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return toRecords(rows, now);
}
