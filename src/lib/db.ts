import { PrismaClient } from "@prisma/client";

// Dev hot-reload re-evaluates modules on every save; without the global cache
// each reload opens a new pool and Neon starts refusing connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
