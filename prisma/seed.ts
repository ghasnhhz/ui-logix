import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import {
  benchmarkMedian,
  displayedQuotes,
  priceShipment,
  type CargoType,
  type CarrierId,
  type Mode,
  type PlaceCode,
  type Quote,
} from "../src/lib/pricing";
import { withReference } from "../src/lib/reference";

// Credentials never live in this file. The password is required from the
// environment so a tracked script can create a demo account without carrying
// one; the running credentials are written down in harness/PASS.md, which is
// gitignored.
const EMAIL = process.env.DEMO_EMAIL ?? "demo@ulogix.uz";
const PASSWORD = process.env.DEMO_PASSWORD;
const COMPANY = process.env.DEMO_COMPANY ?? "Silk Road Textiles";
const PHONE = "+998 90 123 45 67";

type Seed = {
  daysAgo: number;
  origin: PlaceCode;
  destination: PlaceCode;
  mode: Mode;
  cargoType: CargoType;
  weight: number;
  pieces: number;
  dims: [number, number, number];
  // Absent means the quote was never booked — it renders quoted or expired
  // depending on its own 48-hour window.
  book?: { carrierId: CarrierId; status: "booked" | "transit" | "delivered" };
};

// Ten weeks of history: seven deliveries, two shipments in transit, two just
// booked, and four quotes that were never taken up. Offsets are relative to the
// run, so the dashboard's week and month windows stay populated whenever it is
// seeded. Every carrier below serves the mode it is booked on.
const SEEDS: Seed[] = [
  { daysAgo: 70, origin: "TAS", destination: "ALA", mode: "LTL", cargoType: "textiles", weight: 850, pieces: 12, dims: [120, 80, 95], book: { carrierId: "MSK", status: "delivered" } },
  { daysAgo: 63, origin: "TAS", destination: "IST", mode: "AIR", cargoType: "electronics", weight: 240, pieces: 6, dims: [60, 40, 40], book: { carrierId: "DHL", status: "delivered" } },
  { daysAgo: 56, origin: "SKD", destination: "RTM", mode: "FCL", cargoType: "furniture", weight: 9800, pieces: 40, dims: [120, 100, 110], book: { carrierId: "CMA", status: "delivered" } },
  { daysAgo: 49, origin: "TAS", destination: "PVG", mode: "FTL", cargoType: "machinery", weight: 4200, pieces: 8, dims: [150, 120, 100], book: { carrierId: "KNL", status: "delivered" } },
  { daysAgo: 42, origin: "TAS", destination: "FRA", mode: "AIR", cargoType: "electronics", weight: 310, pieces: 9, dims: [70, 50, 45], book: { carrierId: "DBS", status: "delivered" } },
  { daysAgo: 35, origin: "ALA", destination: "HAM", mode: "FCL", cargoType: "textiles", weight: 12000, pieces: 52, dims: [120, 100, 120], book: { carrierId: "MSK", status: "delivered" } },
  { daysAgo: 28, origin: "TAS", destination: "ICN", mode: "AIR", cargoType: "electronics", weight: 180, pieces: 4, dims: [55, 40, 35], book: { carrierId: "FDX", status: "delivered" } },
  { daysAgo: 21, origin: "TAS", destination: "IST", mode: "LTL", cargoType: "food", weight: 1600, pieces: 20, dims: [110, 80, 90], book: { carrierId: "KNL", status: "transit" } },
  { daysAgo: 20, origin: "TAS", destination: "PVG", mode: "FCL", cargoType: "machinery", weight: 15000, pieces: 60, dims: [120, 100, 115] },
  { daysAgo: 9, origin: "SKD", destination: "BER", mode: "FTL", cargoType: "furniture", weight: 5200, pieces: 14, dims: [140, 110, 105], book: { carrierId: "DBS", status: "transit" } },
  { daysAgo: 5, origin: "ALA", destination: "IST", mode: "LTL", cargoType: "food", weight: 2100, pieces: 24, dims: [115, 85, 95] },
  { daysAgo: 3, origin: "SKD", destination: "IST", mode: "LTL", cargoType: "textiles", weight: 1450, pieces: 18, dims: [110, 80, 90], book: { carrierId: "KNL", status: "booked" } },
  { daysAgo: 2, origin: "TAS", destination: "IST", mode: "FTL", cargoType: "machinery", weight: 5400, pieces: 12, dims: [140, 110, 100], book: { carrierId: "MSK", status: "booked" } },
  { daysAgo: 0.6, origin: "TAS", destination: "LAX", mode: "AIR", cargoType: "textiles", weight: 420, pieces: 10, dims: [80, 60, 50] },
  { daysAgo: 0.2, origin: "TAS", destination: "ALA", mode: "FTL", cargoType: "furniture", weight: 3400, pieces: 11, dims: [130, 95, 100] },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const QUOTE_TTL_MS = 48 * 60 * 60 * 1000;

const prisma = new PrismaClient();

async function main() {
  if (!PASSWORD) {
    throw new Error("Set DEMO_PASSWORD before seeding. See harness/PASS.md for the demo login.");
  }

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    // Scoped to the demo account only — re-seeding never touches a real user.
    await prisma.booking.deleteMany({ where: { userId: existing.id } });
    await prisma.quote.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      password: await hashPassword(PASSWORD),
      company: COMPANY,
      phone: PHONE,
    },
  });

  const now = Date.now();

  for (const seed of SEEDS) {
    const spec = {
      origin: seed.origin,
      destination: seed.destination,
      cargoType: seed.cargoType,
      weight: seed.weight,
      unit: "kg" as const,
      pieces: seed.pieces,
      lengthCm: seed.dims[0],
      widthCm: seed.dims[1],
      heightCm: seed.dims[2],
    };

    // Priced by the real engine, so every seeded figure agrees with what the
    // calculator would produce for the same shipment today.
    const { metrics, quotes } = priceShipment(spec);
    const createdAt = new Date(now - seed.daysAgo * DAY_MS);

    const quote = await withReference((reference) =>
      prisma.quote.create({
        data: {
          reference,
          userId: user.id,
          origin: seed.origin,
          destination: seed.destination,
          shipDate: new Date(createdAt.getTime() + 5 * DAY_MS),
          mode: seed.mode,
          cargoType: seed.cargoType,
          weightKg: metrics.weightKg,
          pieces: metrics.pieces,
          lengthCm: seed.dims[0],
          widthCm: seed.dims[1],
          heightCm: seed.dims[2],
          volumeM3: metrics.volumeM3,
          chargeableKg: metrics.chargeableKg,
          freightClass: metrics.freightClass,
          results: quotes,
          benchmarkMedian: benchmarkMedian(displayedQuotes(quotes, "ALL")),
          expiresAt: new Date(createdAt.getTime() + QUOTE_TTL_MS),
          createdAt,
        },
        select: { id: true },
      }),
    );

    const book = seed.book;
    if (!book) continue;

    const selected = quotes.find(
      (row: Quote) => row.carrierId === book.carrierId && row.mode === seed.mode,
    );
    if (!selected) throw new Error(`${book.carrierId} does not serve ${seed.mode}`);

    await withReference((reference) =>
      prisma.booking.create({
        data: {
          reference,
          quoteId: quote.id,
          userId: user.id,
          // Copied off the stored quote, exactly as POST /api/bookings does
          // (D-034) — a seeded booking must not be priced differently to a real
          // one.
          carrierId: selected.carrierId,
          mode: selected.mode,
          allIn: selected.allIn,
          transitDays: selected.transitDays,
          contactName: "Dilnoza Karimova",
          company: COMPANY,
          email: EMAIL,
          phone: PHONE,
          status: book.status,
          createdAt,
        },
        select: { id: true },
      }),
    );
  }

  const bookings = SEEDS.filter((seed) => seed.book).length;
  console.log(`Seeded ${EMAIL}: ${SEEDS.length} quotes, ${bookings} bookings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
