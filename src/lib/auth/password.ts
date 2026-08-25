import bcrypt from "bcryptjs";

const ROUNDS = 10;

// A bcrypt hash of a random string, compared against when there is no real hash
// to compare against. It exists purely to spend the same ~60ms bcrypt would:
// without it, "no such account" and "Telegram account, no password" both answer
// measurably faster than "wrong password", and that timing gap is enough to
// enumerate which emails exist and which of them are Telegram-only.
const DECOY_HASH = "$2b$10$odPvNDJjRBE/fKcLltAD1OhXWRe2n/smEInul7S6jdBSLSuD7STyG";

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

/** `null` is a Telegram account (D-046) or no account at all. Both are false. */
export async function verifyPassword(plain: string, hash: string | null) {
  const matches = await bcrypt.compare(plain, hash ?? DECOY_HASH);
  return hash !== null && matches;
}
