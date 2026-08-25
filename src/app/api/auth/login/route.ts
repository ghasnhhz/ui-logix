import { fail, failValidation, ok } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, company: true, phone: true, password: true },
  });

  // Three failures, one answer: no such account, wrong password, and a
  // Telegram-only account with no password at all (D-046). The compare runs even
  // when there is no hash, so they cost the same too — telling an attacker which
  // emails exist, or which of them sign in through Telegram, is free enumeration.
  const valid = await verifyPassword(password, user?.password ?? null);
  if (!user || !valid) {
    return fail("Incorrect email or password", 401);
  }

  await setSessionCookie(user.id, user.email);
  return ok({
    id: user.id,
    email: user.email,
    company: user.company,
    phone: user.phone,
  });
}
