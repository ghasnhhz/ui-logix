// ULQ-YYYY-NNNNNN, the format the comp shows on every quote and booking row.
// Random rather than a counter: a sequence table would need its own row lock on
// every insert, and on serverless Neon that is more moving parts than a demo
// earns. Callers retry on a unique-constraint violation instead.
export function newReference(year = new Date().getFullYear()) {
  const serial = Math.floor(Math.random() * 1_000_000);
  return `ULQ-${year}-${String(serial).padStart(6, "0")}`;
}

const UNIQUE_VIOLATION = "P2002";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === UNIQUE_VIOLATION;

// Six random digits collide about once in a million, so three attempts is
// generous. A fourth failure is a real fault and should surface, not loop.
export async function withReference<T>(create: (reference: string) => Promise<T>, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await create(newReference());
    } catch (error) {
      if (attempt >= attempts || !isUniqueViolation(error)) throw error;
    }
  }
}
